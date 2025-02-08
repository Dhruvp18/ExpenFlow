from flask import Flask, request, jsonify
import requests
import os
import json
from werkzeug.utils import secure_filename
import mimetypes
from datetime import datetime, timedelta

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

VERYFI_URL = "https://api.veryfi.com/api/v8/partner/documents"
HEADERS = {
    'Accept': 'application/json',
    'CLIENT-ID': 'vrfUf0oDw8PB7nVgBPfh0WUzmLHOiNE1pbn5pgf',
    'AUTHORIZATION': 'apikey pseudocause30:6ef1bd869175c48ca0461148218df858'
}

EXPENSE_POLICY_FILE = 'company_expense_policy.txt'
PROCESSED_INVOICES = set()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_expense_policy(policy_file):
    policy = {
        "prohibited_vendors": [],
        "category_limits": {},
        "tax_limit_percentage": 10,
        "tips_gratuity_limit_percentage": 20,
        "miscellaneous_rules": {}
    }
    with open(policy_file, 'r') as f:
        lines = f.readlines()
    current_section = None
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("##"):
            current_section = line.replace("##", "").strip().lower()
            continue
        if current_section == "vendor restrictions" and line.startswith("-"):
            vendor = line[2:].strip()
            if vendor:
                policy["prohibited_vendors"].append(vendor)
        if current_section == "category-specific limits" and ":" in line:
            category, limit = line.split(":", 1)
            category = category.strip().lower()
            limit = float(limit.strip().replace("$", "").replace(",", ""))
            policy["category_limits"][category] = limit
        if current_section == "tax rules" and ":" in line:
            key, value = line.split(":", 1)
            key = key.strip().lower()
            value = float(value.strip().replace("%", ""))
            if key == "maximum allowable tax percentage":
                policy["tax_limit_percentage"] = value
        if current_section == "miscellaneous rules" and ":" in line:
            key, value = line.split(":", 1)
            key = key.strip().lower()
            value = float(value.strip().replace("%", ""))
            if key == "tips or gratuities":
                policy["tips_gratuity_limit_percentage"] = value
    return policy

def extract_receipt_data(json_data):
    vendor_info = {
        "name": json_data["vendor"].get("name"),
        "category": json_data["vendor"].get("category"),
        "registration_number": json_data["vendor"].get("reg_number")
    }
    bill_info = {
        "date": json_data.get("date"),
        "invoice_number": json_data.get("invoice_number"),
        "currency": json_data.get("currency_code"),
        "payment_mode": json_data["payment"].get("display_name"),
        "totalAmount": json_data.get("total"),
        "totalTax": json_data.get("tax")
    }
    items = []
    for item in json_data.get("line_items", []):
        if item.get("type") == "discount":
            continue
        item_info = {
            "name": item.get("description"),
            "quantity": item.get("quantity"),
            "rate": item.get("price"),
            "tax": item.get("tax"),
            "discount": item.get("discount"),
            "total": item.get("total")
        }
        items.append(item_info)
    receipt_data = {
        "vendor": vendor_info,
        "bill": bill_info,
        "items": items,
        "total_items": len(items)
    }
    return receipt_data

def detect_fraud(receipt_data, policy):
    issues = []
    vendor = receipt_data["vendor"]
    if vendor["name"] is None:
        issues.append("Vendor name is missing.")
    if vendor["category"] is None:
        issues.append("Vendor category is missing.")
    if vendor["registration_number"] is None:
        issues.append("Vendor registration number is missing.")
    if vendor["name"] in policy["prohibited_vendors"]:
        issues.append(f"Prohibited vendor detected: {vendor['name']}.")
    bill = receipt_data["bill"]
    if bill["invoice_number"] in PROCESSED_INVOICES:
        issues.append(f"Duplicate receipt detected: Invoice number {bill['invoice_number']}.")
    else:
        PROCESSED_INVOICES.add(bill["invoice_number"])
    if bill["date"] is not None:
        try:
            receipt_date = datetime.strptime(bill["date"], "%Y-%m-%d")
            five_months_ago = datetime.now() - timedelta(days=150)
            if receipt_date < five_months_ago:
                issues.append(f"Receipt date is older than 5 months: {bill['date']}.")
        except ValueError:
            issues.append("Invalid date format in receipt.")
    if bill["totalAmount"] is None or bill["totalAmount"] <= 0:
        issues.append("Total amount is zero or negative.")
    if bill["invoice_number"] is None:
        issues.append("Invoice number is missing.")
    if bill["currency"] is None:
        issues.append("Currency code is missing.")
    if bill["payment_mode"] is None:
        issues.append("Payment mode is missing.")
    if bill["totalTax"] is not None and bill["totalTax"] < 0:
        issues.append("Tax amount is negative.")
    if bill["totalAmount"] is not None and bill["totalAmount"] > policy.get("max_bill_amount", float('inf')):
        issues.append(f"Total bill amount exceeds the predefined limit: {bill['totalAmount']}.")
    if bill["totalTax"] is not None and bill["totalAmount"] is not None:
        if bill["totalTax"] > policy["tax_limit_percentage"] / 100 * bill["totalAmount"]:
            issues.append(f"Tax exceeds {policy['tax_limit_percentage']}% of the subtotal.")
    items = receipt_data["items"]
    total_line_items = 0
    tips_or_gratuities = 0
    similar_entries = {}
    for i, item in enumerate(items):
        if item["name"] is None:
            issues.append(f"Item {i + 1} description is missing.")
        if item["quantity"] is not None and item["quantity"] <= 0:
            issues.append(f"Item {i + 1} has zero or negative quantity.")
        if item["rate"] is not None and item["rate"] <= 0:
            issues.append(f"Item {i + 1} has zero or negative rate.")
        if item["tax"] is not None and item["tax"] < 0:
            issues.append(f"Item {i + 1} has negative tax.")
        if item["discount"] is not None and item["discount"] < 0:
            issues.append(f"Item {i + 1} has negative discount.")
        if item["total"] is not None and item["total"] <= 0:
            issues.append(f"Item {i + 1} has zero or negative total.")
        if item["total"] is not None:
            total_line_items += item["total"]
        if item["name"] is not None and ("tip" in item["name"].lower() or "gratuity" in item["name"].lower()):
            if item["total"] is not None:
                tips_or_gratuities += item["total"]
        if item["name"] is not None:
            if item["name"] in similar_entries:
                similar_entries[item["name"]] += 1
            else:
                similar_entries[item["name"]] = 1
    if bill["totalAmount"] is not None and abs(total_line_items - bill["totalAmount"]) > 0.01:
        issues.append("Sum of line items does not match total amount.")
    if bill["totalAmount"] is not None and tips_or_gratuities > policy["tips_gratuity_limit_percentage"] / 100 * bill["totalAmount"]:
        issues.append(f"Tips or gratuities exceed {policy['tips_gratuity_limit_percentage']}% of the total bill.")
    for item_name, count in similar_entries.items():
        if count > policy.get("max_similar_entries", 1):
            issues.append(f"Multiple similar entries detected for: {item_name} (count: {count}).")
    category_totals = {}
    for item in items:
        if item["name"] is not None:
            for category, limit in policy["category_limits"].items():
                if category in item["name"].lower():
                    category_totals[category] = category_totals.get(category, 0) + (item["total"] or 0)
    for category, total in category_totals.items():
        if total > policy["category_limits"][category]:
            issues.append(f"{category.capitalize()} limit exceeded (${policy['category_limits'][category]}).")
    return issues

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    files = request.files.getlist('file')
    if not files or all(file.filename == '' for file in files):
        return jsonify({'error': 'No files selected'}), 400
    try:
        policy = load_expense_policy(EXPENSE_POLICY_FILE)
    except Exception as e:
        return jsonify({'error': f'Failed to load expense policy: {str(e)}'}), 500
    results = []
    for file in files:
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed: {file.filename}'}), 400
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            mime_type, _ = mimetypes.guess_type(filepath)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            with open(filepath, 'rb') as uploaded_file:
                files_dict = {
                    'file': (filename, uploaded_file, mime_type)
                }
                response = requests.post(VERYFI_URL, headers=HEADERS, files=files_dict)
            os.remove(filepath)
            try:
                json_data = response.json()
            except ValueError as e:
                return jsonify({'error': 'Invalid JSON response from Veryfi API'}), 500
            if response.status_code not in [200, 201]:
                return jsonify({'error': 'OCR service error', 'details': response.text}), 500
            receipt_data = extract_receipt_data(json_data)
            if not receipt_data:
                return jsonify({'error': 'Failed to extract receipt data'}), 500
            fraud_issues = detect_fraud(receipt_data, policy)
            receipt_data["fraud_issues"] = fraud_issues
            results.append({
                'filename': filename,
                'data': receipt_data
            })
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True)