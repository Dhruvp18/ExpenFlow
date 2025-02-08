import os
import google.generativeai as genai

# Set up Gemini API
GOOGLE_API_KEY = "AIzaSyCEbn8bq8qCFT3nl0_7ft1ub_V-qehNLlQ"  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)

# Define the sample data
data = {
    "results": [
        # Employee 1
        {
            "employee_id": "E001",
            "data": {
                "bill": {
                    "currency": "INR",
                    "date": "2024-12-15 00:00:00",
                    "invoice_number": "D271224-3723255",
                    "payment_mode": "",
                    "totalAmount": 114.99,
                    "totalTax": 11.99
                },
                "items": [
                    {
                        "discount": 0,
                        "name": "Diacraft Multicolor Rainbow Diya",
                        "quantity": 1.0,
                        "rate": 103.0,
                        "tax": 0,
                        "total": 103.0
                    },
                    {
                        "discount": 0,
                        "name": "Miscellaneous Charges",
                        "quantity": 1.0,
                        "rate": 11.99,
                        "tax": 0,
                        "total": 11.99
                    }
                ],
                "total_items": 2,
                "vendor": {
                    "category": "Gifts",
                    "name": "DS DROGHERIA SELLERS PRIVATE LIMITED",
                    "registration_number": ""
                }
            },
            "filename": "DOC-20241216-WA0008..pdf",
            "fraud_flags": []
        },
        # Employee 2
        {
            "employee_id": "E002",
            "data": {
                "bill": {
                    "currency": "INR",
                    "date": "2020-02-19 17:28:00",
                    "invoice_number": "533102007-004468",
                    "payment_mode": "cash",
                    "totalAmount": 393.0,
                    "totalTax": 26.2
                },
                "items": [
                    {
                        "discount": 0,
                        "name": "SYSKA 12W LED Bulb",
                        "quantity": 1.0,
                        "rate": 135.0,
                        "tax": 0,
                        "total": 135.0
                    },
                    {
                        "discount": 0,
                        "name": "LINC Blue Gel Pen",
                        "quantity": 1.0,
                        "rate": 30.8,
                        "tax": 0,
                        "total": 30.8
                    },
                    {
                        "discount": 0,
                        "name": "GOODKNIGHT GOLD -45ml",
                        "quantity": 1.0,
                        "rate": 128.0,
                        "tax": 0,
                        "total": 128.0
                    },
                    {
                        "discount": 0,
                        "name": "PAD LOCK 50M SPRAY C-",
                        "quantity": 1.0,
                        "rate": 99.0,
                        "tax": 0,
                        "total": 99.0
                    }
                ],
                "total_items": 4,
                "vendor": {
                    "category": "Stationery",
                    "name": "DMART KAKINADA",
                    "registration_number": "L51900MH2000PLC126473"
                }
            },
            "filename": "m_a0d9b30807ce-2020-02-19-20-04-07-000093.jpg",
            "fraud_flags": ["Duplicate invoice number detected: 533102007-004468"]
        },
        # Employee 3
        {
            "employee_id": "E003",
            "data": {
                "bill": {
                    "currency": "USD",
                    "date": "2018-01-01 10:35:00",
                    "invoice_number": "",
                    "payment_mode": "",
                    "totalAmount": 84.8,
                    "totalTax": 8.0
                },
                "items": [
                    {
                        "discount": 0,
                        "name": "Lorem Ipsum Items",
                        "quantity": 1.0,
                        "rate": 183.0,
                        "tax": 0,
                        "total": 183.0
                    }
                ],
                "total_items": 1,
                "vendor": {
                    "category": "Miscellaneous",
                    "name": "",
                    "registration_number": ""
                }
            },
            "filename": "360_F_182011806_mxcDzt9ckBYbGpxAne8o73DbyDHpXOe9.jpg",
            "fraud_flags": [
                "Missing or invalid invoice number",
                "Missing or invalid vendor name",
                "Invoice date is out of sequence"
            ]
        }
    ]
}

# Define expense categories
expense_categories = [
    "Flight", "Hotel", "Stationery", "Travel", "Accommodation",
    "Office Supplies and Equipment", "Training and Development",
    "Health and Wellness", "Miscellaneous"
]

# Helper function to categorize items
def categorize_item(item_name):
    if "flight" in item_name.lower():
        return "Flight"
    elif "hotel" in item_name.lower():
        return "Hotel"
    elif "pen" in item_name.lower() or "notebook" in item_name.lower():
        return "Stationery"
    elif "travel" in item_name.lower():
        return "Travel"
    elif "laptop" in item_name.lower() or "printer" in item_name.lower():
        return "Office Supplies and Equipment"
    elif "training" in item_name.lower() or "course" in item_name.lower():
        return "Training and Development"
    elif "gym" in item_name.lower() or "medical" in item_name.lower():
        return "Health and Wellness"
    else:
        return "Miscellaneous"

# Initialize report structure
total_reimbursement = {cat: 0 for cat in expense_categories}
total_non_reimbursable = {cat: 0 for cat in expense_categories}
employee_breakdown = {}
employee_non_reimbursable = {}
violations_summary = {}

# Process data
for result in data["results"]:
    employee_id = result["employee_id"]
    bill = result["data"]["bill"]
    items = result["data"]["items"]
    fraud_flags = result["fraud_flags"]

    # Initialize employee breakdowns if not already present
    if employee_id not in employee_breakdown:
        employee_breakdown[employee_id] = {cat: 0 for cat in expense_categories}
    if employee_id not in employee_non_reimbursable:
        employee_non_reimbursable[employee_id] = {cat: {"amount": 0, "violations": []} for cat in expense_categories}
    if employee_id not in violations_summary:
        violations_summary[employee_id] = []

    for item in items:
        category = categorize_item(item["name"])
        if fraud_flags:
            total_non_reimbursable[category] += item["total"]
            employee_non_reimbursable[employee_id][category]["amount"] += item["total"]
            employee_non_reimbursable[employee_id][category]["violations"].extend(fraud_flags)
            violations_summary[employee_id].extend(fraud_flags)
        else:
            total_reimbursement[category] += item["total"]
            employee_breakdown[employee_id][category] += item["total"]

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
    employee_non_reimbursable[employee_id] = {k: v for k, v in employee_non_reimbursable[employee_id].items() if v["amount"] > 0}

# Generate natural language summary using Gemini API
def generate_natural_language_summary(report_data):
    model = genai.GenerativeModel('gemini-pro')
    prompt = f"""
    Generate a concise and professional summary of the following expense report data:
    Total Reimbursement by Category: {report_data['total_reimbursement']}
    Total Non-Reimbursable Amounts by Category: {report_data['total_non_reimbursable']}
    Employee-wise Breakdown of Reimbursable Amounts: {report_data['employee_breakdown']}
    Employee-wise Breakdown of Non-Reimbursable Amounts: {report_data['employee_non_reimbursable']}
    Employee-wise Violations: {report_data['violations_summary']}
    """
    response = model.generate_content(prompt)
    return response.text

# Prepare report data for summarization
report_data = {
    "total_reimbursement": total_reimbursement,
    "total_non_reimbursable": total_non_reimbursable,
    "employee_breakdown": employee_breakdown,
    "employee_non_reimbursable": employee_non_reimbursable,
    "violations_summary": violations_summary
}

# Generate natural language summary
natural_language_summary = generate_natural_language_summary(report_data)

# Print report
print("1. Total Reimbursement by Expense Type")
for category, amount in total_reimbursement.items():
    print(f"{category}: {amount}")

print("\n2. Employee-wise Breakdown of Reimbursable Amounts")
for employee_id, breakdown in employee_breakdown.items():
    print(f"Employee {employee_id}")
    for category, amount in breakdown.items():
        print(f"{category}: {amount}")

print("\n3. Total Non-Reimbursable Amounts by Category")
for category, amount in total_non_reimbursable.items():
    print(f"{category}: {amount}")

print("\n4. Employee-wise Breakdown of Non-Reimbursable Amounts")
for employee_id, breakdown in employee_non_reimbursable.items():
    print(f"Employee {employee_id}")
    for category, details in breakdown.items():
        print(f"{category}: {details['amount']} (Violations: {', '.join(details['violations'])})")

print("\n5. Overall Summary")
total_reimbursed = sum(total_reimbursement.values())
total_not_reimbursed = sum(total_non_reimbursable.values())
print(f"Total Reimbursed: {total_reimbursed}")
print(f"Total Not Reimbursed: {total_not_reimbursed}")

print("\n6. Employee-wise Violations")
for employee_id, violations in violations_summary.items():
    print(f"Employee {employee_id}: {', '.join(violations) if violations else 'No violations'}")

print("\n7. Overall Summary")
print(natural_language_summary)