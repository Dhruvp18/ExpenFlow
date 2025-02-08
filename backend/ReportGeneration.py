import google.generativeai as genai
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders
import pandas as pd
from docx import Document
from tabulate import tabulate

import json
import yagmail  # Install via `pip install yagmail`
from docx import Document


def generate_expense_report(json_data, api_key):
    """
    Generate two professional expense reports (for employees and HR) using Gemini API,
    export them as .docx files, and send them via email using yagmail.
    
    Args:
        json_data (dict or list): The JSON data for receipts.
        api_key (str): API key for the Gemini model.
    
    Returns:
        None: Prints both reports directly and sends them via email.
    """
    # Set up Gemini API
    genai.configure(api_key=api_key)

    # Define expense categories
    expense_categories = [
        "Flight", "Hotel", "Stationery", "Travel", "Accommodation",
        "Office Supplies and Equipment", "Training and Development",
        "Health and Wellness", "Miscellaneous"
    ]

    # Helper function to categorize items
    def categorize_item(item_name):
        item_name_lower = item_name.lower()
        if "flight" in item_name_lower:
            return "Flight"
        elif "hotel" in item_name_lower:
            return "Hotel"
        elif "pen" in item_name_lower or "notebook" in item_name_lower:
            return "Stationery"
        elif "travel" in item_name_lower:
            return "Travel"
        elif "laptop" in item_name_lower or "printer" in item_name_lower:
            return "Office Supplies and Equipment"
        elif "training" in item_name_lower or "course" in item_name_lower:
            return "Training and Development"
        elif "gym" in item_name_lower or "medical" in item_name_lower:
            return "Health and Wellness"
        else:
            return "Miscellaneous"

    # Initialize report structure
    total_reimbursement = {cat: 0 for cat in expense_categories}
    total_non_reimbursable = {cat: 0 for cat in expense_categories}
    employee_breakdown = {}
    employee_non_reimbursable = {}
    violations_summary = {}

    # Validate json_data structure
    if isinstance(json_data, dict):
        json_data = [json_data]  # Convert single dictionary to list
    elif not isinstance(json_data, list):
        raise ValueError("json_data must be a dictionary or a list of dictionaries.")

    # Process data
    for receipt in json_data:
        if not isinstance(receipt, dict):
            print(f"Skipping invalid receipt (not a dictionary): {receipt}")
            continue

        # Extract relevant fields with error handling
        vendor_name = receipt.get("vendor", {}).get("name", "N/A") if isinstance(receipt.get("vendor"), dict) else "N/A"
        invoice_number = receipt.get("invoice_number", "N/A")
        total_amount = receipt.get("total", 0) or 0  # Ensure it's not None
        line_items = receipt.get("line_items", [])
        fraud_flags = receipt.get("meta", {}).get("fraud_flags", []) if isinstance(receipt.get("meta"), dict) else []
        employee_id = receipt.get("reference_number", "Unknown")

        # Initialize employee breakdowns if not already present
        if employee_id not in employee_breakdown:
            employee_breakdown[employee_id] = {cat: 0 for cat in expense_categories}
        if employee_id not in employee_non_reimbursable:
            employee_non_reimbursable[employee_id] = {
                cat: {"amount": 0, "violations": []} for cat in expense_categories
            }
        if employee_id not in violations_summary:
            violations_summary[employee_id] = []

        # Process line items
        for item in line_items:
            if not isinstance(item, dict):
                print(f"Skipping invalid line item (not a dictionary): {item}")
                continue

            item_name = item.get("description", "Unknown Item")
            item_total = item.get("total", 0) or 0  # Ensure it's not None
            category = categorize_item(item_name)

            # Use Gemini API to detect fraud flags
            def detect_fraud(item_description, total_amount, vendor_name):
                model = genai.GenerativeModel('gemini-pro')
                prompt = f"""
                Analyze the following expense for potential fraud or policy violations:
                - Item Description: {item_description}
                - Total Amount: {total_amount}
                - Vendor Name: {vendor_name}
                
                Return a JSON object without bold with the following keys:
                - "is_fraud": true/false (whether this expense is potentially fraudulent)
                - "reason": Explanation of why it might be fraudulent (if applicable)
                """
                response = model.generate_content(prompt)
                try:
                    return json.loads(response.text)
                except json.JSONDecodeError:
                    return {"is_fraud": False, "reason": "Unable to determine fraud status."}

            fraud_analysis = detect_fraud(item_name, item_total, vendor_name)
            if fraud_analysis["is_fraud"]:
                fraud_flags.append(fraud_analysis["reason"])

            if fraud_flags:
                total_non_reimbursable[category] += item_total
                employee_non_reimbursable[employee_id][category]["amount"] += item_total
                employee_non_reimbursable[employee_id][category]["violations"].extend(fraud_flags)
                violations_summary[employee_id].extend(fraud_flags)
            else:
                total_reimbursement[category] += item_total
                employee_breakdown[employee_id][category] += item_total

    # Remove duplicate violations
    for employee_id in violations_summary:
        violations_summary[employee_id] = list(set(violations_summary[employee_id]))

    # Filter out zero-value categories
    def filter_zero_values(data_dict):
        return {k: v for k, v in data_dict.items() if v > 0}

    total_reimbursement = filter_zero_values(total_reimbursement)
    total_non_reimbursable = filter_zero_values(total_non_reimbursable)
    for employee_id in employee_breakdown:
        employee_breakdown[employee_id] = filter_zero_values(employee_breakdown[employee_id])
    for employee_id in employee_non_reimbursable:
        employee_non_reimbursable[employee_id] = {
            k: v for k, v in employee_non_reimbursable[employee_id].items() if v["amount"] > 0
        }

    # Prepare report data for summarization
    report_data = {
        "total_reimbursement": total_reimbursement,
        "total_non_reimbursable": total_non_reimbursable,
        "employee_breakdown": employee_breakdown,
        "employee_non_reimbursable": employee_non_reimbursable,
        "violations_summary": violations_summary
    }

    # Generate natural language summaries using Gemini API
    def generate_employee_report(report_data):
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Generate a concise and professional expense report for an employee based on the following data:
        - Total Reimbursement by Category: {report_data['total_reimbursement']}
        - Employee-wise Breakdown of Reimbursable Amounts: {report_data['employee_breakdown']}
        - Violations Summary: {report_data['violations_summary']}
        
        Include only essential details and avoid technical jargon.
        """
        response = model.generate_content(prompt)
        return response.text

    def generate_hr_report(report_data):
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Generate a detailed and professional expense report for HR based on the following data:
        - Total Reimbursement by Category: {report_data['total_reimbursement']}
        - Total Non-Reimbursable Amounts by Category: {report_data['total_non_reimbursable']}
        - Employee-wise Breakdown of Reimbursable Amounts: {report_data['employee_breakdown']}
        - Employee-wise Breakdown of Non-Reimbursable Amounts: {report_data['employee_non_reimbursable']}
        - Employee-wise Violations: {report_data['violations_summary']}
        
        Highlight any compliance issues, flagged items, and provide recommendations for future audits.
        """
        response = model.generate_content(prompt)
        return response.text

    # Generate reports
    employee_report_text = generate_employee_report(report_data)
    hr_report_text = generate_hr_report(report_data)

    # Export reports to .docx format
    def export_to_docx(report_text, filename):
        doc = Document()
        doc.add_heading("Expense Report", level=1)
        doc.add_paragraph(report_text)
        doc.save(filename)

    export_to_docx(employee_report_text, "employee_report.docx")
    export_to_docx(hr_report_text, "hr_report.docx")

    # Send emails with attachments using yagmail
    def send_email(sender_email, recipient_email, subject, body, attachment_path):
        # Initialize yagmail SMTP connection
        yag = yagmail.SMTP(sender_email, "btjr mnzc ozto ntcg")  # Replace with your App Password

        # Send email with attachment
        yag.send(
            to=recipient_email,
            subject=subject,
            contents=body,
            attachments=attachment_path
        )

    # Send HR report
    send_email(
        sender_email="virajv2005@gmail.com",
        recipient_email="vrvora_b23@ce.vjti.ac.in",
        subject="MONTHLY COMPANY EXPENSE REPORT FOR HR",
        body="Please find attached the monthly expense report for HR.",
        attachment_path="hr_report.docx"
    )

    # Send Employee report
    send_email(
        sender_email="virajv2005@gmail.com",
        recipient_email="knrambhia_b23@ce.vjti.ac.in",
        subject="MONTHLY COMPANY EXPENSE REPORT FOR EMPLOYEE",
        body="Please find attached the monthly expense report for your review.",
        attachment_path="employee_report.docx"
    )

    print("\n--- Reports Generated and Sent Successfully ---\n")