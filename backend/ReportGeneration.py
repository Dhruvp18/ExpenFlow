import google.generativeai as genai
import json
from docx import Document
from tabulate import tabulate
import yagmail

EXPENSE_POLICIES = {
    "Executive Level": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 1600000},
            "Local Transportation": {"min": 0, "max": 60000},
            "Mileage Reimbursement": {"min":0, "max":45000},
            "Parking Fees & Tolls": "Fully covered"
        },
        "Accommodation": {
            "Hotel Stays": {"min": 0, "max": 125000},
            "Rental Allowance": {"min": 0, "max": 600000},
            "Meals During Travel": {"min": 0, "max": 40000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Unlimited",
            "Home Office Setup": {"min":0, "max":800000}
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        },
        "Meals and Entertainment": {
            "Client Meetings": {"min": 0, "max": 4000000},
            "Team Outings": {"min": 0, "max": 1600000},
            "Daily Meal Allowance": {"min": 0, "max": 24000}
        }
    },
    "Senior Management": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 400000},
            "Local Transportation": {"min": 0, "max": 25000},
            "Mileage Reimbursement": {"min":0, "max":30000},
            "Parking Fees & Tolls": {"min": 0, "max": 10000}
        },
        "Accommodation": {
            "Hotel Stays": {"min": 0, "max": 80000},
            "Rental Allowance": {"min": 0, "max": 150000},
            "Meals During Travel": {"min": 0, "max": 24000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": {"min":0, "max":400000},
            "Home Office Setup": {"min":0, "max":400000}
        },
        "Meals and Entertainment": {
            "Client Meetings": {"min": 0, "max": 2400000},
            "Team Outings": {"min": 0, "max": 1200000}
        }
    },
    "Middle Management": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 560000},
            "Local Transportation": {"min": 0, "max": 20000},
            "Mileage Reimbursement": {"min":0, "max":25000}
        },
        "Accommodation": {
            "Rental Allowance": {"min": 0, "max": 90000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": {"min":0, "max":24000},
            "Home Office Setup": {"min":0, "max":24000}
        },
        "Meals and Entertainment": {
            "Client Meetings": {"min": 0, "max": 1600000}
        }
    },
    "Lower Management": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 400000},
            "Local Transportation": {"min": 0, "max": 15000},
            "Mileage Reimbursement": {"min":0, "max":20000}
        },
        "Accommodation": {
            "Rental Allowance": {"min": 0, "max": 50000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": {"min":0, "max":160000}
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    },
    "Team Leads & Supervisors": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 240000},
            "Local Transportation": {"min": 0, "max": 10000},
            "Mileage Reimbursement": {"min":0, "max":20000}
        },
        "Accommodation": {
            "Rental Allowance": {"min": 0, "max": 40000}
        },
        "Meals and Entertainment": {
            "Client Meetings": {"min": 0, "max": 800000}
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    },
    "Staff & Employees": {
        "Travel Expenses": {
            "Business Trips": {"min": 0, "max": 160000},
            "Local Transportation": {"min": 0, "max": 5000},
            "Mileage Reimbursement": {"min":0, "max":10000}
        },
        "Accommodation": {
            "Rental Allowance": {"min": 0, "max": 30000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": {"min":0, "max":80000}
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    }
}

def generate_expense_report(json_data, api_key):
    """
    Generate professional expense reports (for employees and HR) using Gemini API,
    export them as .html files, and send them via email using yagmail.
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

    # Process data (unchanged from the original code)
    for receipt in json_data:
        if not isinstance(receipt, dict):
            print(f"Skipping invalid receipt (not a dictionary): {receipt}")
            continue

        vendor_name = receipt.get("vendor", {}).get("name", "N/A") if isinstance(receipt.get("vendor"), dict) else "N/A"
        invoice_number = receipt.get("invoice_number", "N/A")
        total_amount = receipt.get("total", 0) or 0
        line_items = receipt.get("line_items", [])
        fraud_flags = receipt.get("meta", {}).get("fraud_flags", []) if isinstance(receipt.get("meta"), dict) else []
        employee_id = receipt.get("reference_number", "Unknown")

        if employee_id not in employee_breakdown:
            employee_breakdown[employee_id] = {cat: 0 for cat in expense_categories}
        if employee_id not in employee_non_reimbursable:
            employee_non_reimbursable[employee_id] = {
                cat: {"amount": 0, "violations": []} for cat in expense_categories
            }
        if employee_id not in violations_summary:
            violations_summary[employee_id] = []

        for item in line_items:
            if not isinstance(item, dict):
                print(f"Skipping invalid line item (not a dictionary): {item}")
                continue

            item_name = item.get("description", "Unknown Item")
            item_total = item.get("total", 0) or 0
            category = categorize_item(item_name)

            def detect_fraud(item_description, total_amount, vendor_name):
                model = genai.GenerativeModel('gemini-pro')
                prompt = f"""
                Analyze the following expense for potential fraud or policy violations:
                Item Description: {item_description}
                Total Amount: {total_amount}
                Vendor Name: {vendor_name}
                Return a JSON object without bold with the following keys:
                "is_fraud": true/false (whether this expense is potentially fraudulent)
                "reason": Explanation of why it might be fraudulent (if applicable)
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
    def generate_employee_report(report_data, employee_id):
        model = genai.GenerativeModel('gemini-pro')
        reimbursable = report_data['employee_breakdown'].get(employee_id, {})
        non_reimbursable = report_data['employee_non_reimbursable'].get(employee_id, {})
        violations = report_data['violations_summary'].get(employee_id, [])

        # Create HTML tables
        reimbursement_table = "<table border='1'><tr><th>Category</th><th>Amount</th></tr>"
        for category, amount in reimbursable.items():
            reimbursement_table += f"<tr><td>{category}</td><td>₹{amount}</td></tr>"
        reimbursement_table += "</table>"

        non_reimbursable_table = "<table border='1'><tr><th>Category</th><th>Amount</th><th>Violations</th></tr>"
        for category, details in non_reimbursable.items():
            non_reimbursable_table += f"<tr><td>{category}</td><td>₹{details['amount']}</td><td>{', '.join(details['violations'])}</td></tr>"
        non_reimbursable_table += "</table>"

        violations_table = "<table border='1'><tr><th>Violation</th><th>Policy</th></tr>"
        for violation in violations:
            policy = "Policy not found"
            for level, policies in EXPENSE_POLICIES.items():
                for category, limits in policies.items():
                    for key, value in limits.items():
                        if key.lower() in violation.lower():
                            policy = f"{key}: {value}"
                            break
            violations_table += f"<tr><td>{violation}</td><td>{policy}</td></tr>"
        violations_table += "</table>"

        # Generate textual summary
        prompt = f"""
        Generate a concise and professional expense report for an employee with ID {employee_id}.
        1. Reimbursable Amounts by Category:
        {reimbursement_table}
        2. Non-Reimbursable Amounts by Category:
        {non_reimbursable_table}
        3. Violations Detected:
        {violations_table}
        4. Personalized Feedback and Suggestions:
        Provide personalized feedback and suggestions to help the employee avoid similar issues in the future.
        Use a friendly and motivational tone.
        """
        response = model.generate_content(prompt)
        return response.text

    def generate_hr_report(report_data):
        model = genai.GenerativeModel('gemini-pro')

        # Create HTML tables
        total_reimbursement_table = "<table border='1'><tr><th>Category</th><th>Amount</th></tr>"
        for category, amount in report_data['total_reimbursement'].items():
            total_reimbursement_table += f"<tr><td>{category}</td><td>₹{amount}</td></tr>"
        total_reimbursement_table += "</table>"

        total_non_reimbursable_table = "<table border='1'><tr><th>Category</th><th>Amount</th></tr>"
        for category, amount in report_data['total_non_reimbursable'].items():
            total_non_reimbursable_table += f"<tr><td>{category}</td><td>₹{amount}</td></tr>"
        total_non_reimbursable_table += "</table>"

        employee_reimbursement_table = "<table border='1'><tr><th>Employee ID</th><th>Category</th><th>Amount</th></tr>"
        for employee_id, categories in report_data['employee_breakdown'].items():
            for category, amount in categories.items():
                employee_reimbursement_table += f"<tr><td>{employee_id}</td><td>{category}</td><td>₹{amount}</td></tr>"
        employee_reimbursement_table += "</table>"

        employee_non_reimbursable_table = "<table border='1'><tr><th>Employee ID</th><th>Category</th><th>Amount</th><th>Violations</th></tr>"
        for employee_id, categories in report_data['employee_non_reimbursable'].items():
            for category, details in categories.items():
                employee_non_reimbursable_table += f"<tr><td>{employee_id}</td><td>{category}</td><td>₹{details['amount']}</td><td>{', '.join(details['violations'])}</td></tr>"
        employee_non_reimbursable_table += "</table>"

        violations_table = "<table border='1'><tr><th>Employee ID</th><th>Violation</th><th>Policy</th></tr>"
        for employee_id, violations in report_data['violations_summary'].items():
            for violation in violations:
                policy = "Policy not found"
                for level, policies in EXPENSE_POLICIES.items():
                    for category, limits in policies.items():
                        for key, value in limits.items():
                            if key.lower() in violation.lower():
                                policy = f"{key}: {value}"
                                break
                violations_table += f"<tr><td>{employee_id}</td><td>{violation}</td><td>{policy}</td></tr>"
        violations_table += "</table>"

        # Generate textual summary
        prompt = f"""
        Generate a detailed and professional expense report for HR.
        1. Total Reimbursement by Category:
        {total_reimbursement_table}
        2. Total Non-Reimbursable Amounts by Category:
        {total_non_reimbursable_table}
        3. Employee-wise Breakdown of Reimbursable Amounts:
        {employee_reimbursement_table}
        4. Employee-wise Breakdown of Non-Reimbursable Amounts:
        {employee_non_reimbursable_table}
        5. Employee-wise Violations:
        {violations_table}
        6. Compliance Issues and Recommendations:
        Highlight compliance issues, flagged items, and provide actionable recommendations for improving expense management.
        Use a formal and detailed tone.
        """
        response = model.generate_content(prompt)
        return response.text

    # Generate reports
    employee_reports = {}
    for employee_id in employee_breakdown.keys():
        employee_reports[employee_id] = generate_employee_report(report_data, employee_id)

    hr_report_text = generate_hr_report(report_data)

    # Export reports to HTML format
    def export_to_html(report_text, filename):
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Expense Report</title>
        </head>
        <body>
            <h1>Expense Report</h1>
            {report_text}
        </body>
        </html>
        """
        with open(filename, "w", encoding="utf-8") as file:
            file.write(html_content)

    for employee_id, report_text in employee_reports.items():
        export_to_html(report_text, f"employee_report_{employee_id}.html")

    export_to_html(hr_report_text, "hr_report.html")

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
        attachment_path="hr_report.html"
    )

    # Send Employee reports
    for employee_id, report_text in employee_reports.items():
        send_email(
            sender_email="virajv2005@gmail.com",
            recipient_email="vrvora_b23@ce.vjti.ac.in",  # Replace with actual employee email logic
            subject="MONTHLY COMPANY EXPENSE REPORT FOR EMPLOYEE",
            body="Please find attached the monthly expense report for your review.",
            attachment_path=f"employee_report_{employee_id}.html"
        )

    print("\n--- Reports Generated and Sent Successfully ---\n")