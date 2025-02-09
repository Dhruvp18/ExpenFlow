from datetime import datetime, timedelta

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

PROCESSED_INVOICES = set()

def fraud(receipt_data):
    flags = []
    
    if "bill" not in receipt_data or not isinstance(receipt_data["bill"], dict):
        flags.append("Violation: Missing or malformed 'bill' key in receipt data.")
        receipt_data["flags"] = flags
        receipt_data["status"] = "pending"
        return receipt_data
    
    bill = receipt_data["bill"]
    
    if "totalAmount" not in bill:
        flags.append("Violation: Missing 'totalAmount' in bill data.")
        receipt_data["flags"] = flags
        receipt_data["status"] = "pending"
        return receipt_data
    
    total_amount = 0
    if isinstance(bill["totalAmount"], (int, float)):
        total_amount = int(bill["totalAmount"])
    else:
        flags.append("Violation: Unexpected type for 'totalAmount'.")
    
    employee_level = receipt_data.get("employeeLevel", "Staff & Employees")
    vendor_category = receipt_data.get("vendor", {}).get("category", "")
    items = receipt_data.get("items", [])
    description_keywords = [item.get("name", "").lower() for item in items if isinstance(item, dict)]
    
    if employee_level not in EXPENSE_POLICIES:
        flags.append(f"Violation: Employee level '{employee_level}' not found in expense policies.")
        receipt_data["flags"] = flags
        receipt_data["status"] = "pending"
        return receipt_data
    
    policy = EXPENSE_POLICIES[employee_level]
    
    try:
        if "date" in bill and isinstance(bill["date"], str):
            bill_date = datetime.strptime(bill["date"], "%Y-%m-%d") 
            current_date = datetime.now()
            if current_date - bill_date > timedelta(days=30):
                flags.append(f"Violation: Bill date {bill_date.strftime('%Y-%m-%d')} is older than one month.")
    except Exception as e:
        flags.append("Violation: Missing or malformed 'date' in bill data.")

    invoice_number = bill.get("invoice_number", "")
    if invoice_number:
        if invoice_number in PROCESSED_INVOICES:
            flags.append(f"Violation: Duplicate invoice number detected: {invoice_number}.")
        else:
            PROCESSED_INVOICES.add(invoice_number)
    else:
        flags.append("Violation: Missing 'invoice_number' in bill data.")
    
    travel_expense_limits = policy.get("Travel Expenses", {})
    business_trip_limit = travel_expense_limits.get("Business Trips", {"min": 0, "max": 0})
    min_business_trip, max_business_trip = business_trip_limit["min"], business_trip_limit["max"]
    if total_amount < min_business_trip or total_amount > max_business_trip:
        flags.append(
            f"Violation: Total amount {total_amount} exceeds Business Trips policy limits ({min_business_trip} - {max_business_trip})."
        )
    
    local_transport_limit = travel_expense_limits.get("Local Transportation", {"min": 0, "max": 0})
    min_local, max_local = local_transport_limit["min"], local_transport_limit["max"]
    if "transport" in " ".join(description_keywords):
        if total_amount < min_local or total_amount > max_local:
            flags.append(
                f"Violation: Local transportation expense {total_amount} exceeds policy limits ({min_local} - {max_local})."
            )
    
    mileage_reimbursement = travel_expense_limits.get("Mileage Reimbursement", {"min": 0, "max": 0})
    mileage_max = mileage_reimbursement["max"]
    if "mileage" in " ".join(description_keywords):
        if total_amount > mileage_max:
            flags.append(
                f"Violation: Mileage reimbursement {total_amount} exceeds policy limit of {mileage_max}."
            )
    
    parking_tolls = travel_expense_limits.get("Parking Fees & Tolls", "Not covered")
    if parking_tolls != "Fully covered":
        if vendor_category.lower() == "parking" or "tolls" in " ".join(description_keywords):
            flags.append(f"Violation: Parking fees or tolls are not fully covered under policy.")
    
    if not flags:
        receipt_data["status"] = "Accepted"
    else:
        receipt_data["status"] = "pending"
    
    receipt_data["flags"] = flags
    return receipt_data

def detect_fraud(json_data):
    """
    Process a large JSON file containing multiple bills.
    Adds 'flags' and 'status' fields to each bill in the JSON.
    """
    if isinstance(json_data, list):  # If the input is a list of bills
        processed_data = []
        for bill in json_data:
            processed_bill = fraud(bill)
            processed_data.append(processed_bill)
        return processed_data
    elif isinstance(json_data, dict):  # If the input is a single bill
        return fraud(json_data)
    else:
        raise ValueError("Input JSON must be a dictionary or a list of dictionaries.")