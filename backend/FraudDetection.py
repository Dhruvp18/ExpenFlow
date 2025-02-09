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


def fraud(receipt_data):
    """
    Detect potential fraud for a single receipt by comparing it against company policies.
    Returns the receipt data with an added 'flags' field.
    """
    # Initialize flags list
    flags = []

    # Validate that 'bill' exists and has the required fields
    if "bill" not in receipt_data:
        flags.append("Violation: Missing 'bill' key in receipt data.")
        receipt_data["flags"] = flags
        return receipt_data

    bill = receipt_data["bill"]
    if "totalAmount" not in bill:
        flags.append("Violation: Missing 'totalAmount' in bill data.")
        receipt_data["flags"] = flags
        return receipt_data

    # Extract relevant fields from receipt data
    employee_level = receipt_data.get("employeeLevel", "Staff & Employees")
    total_amount = int(bill['totalAmount'].get("$numberInt", 0))  # Safely extract totalAmount
    vendor_category = receipt_data.get('vendor', {}).get('category', "")
    items = receipt_data.get('items', [])
    description_keywords = [item['name'].lower() for item in items]

    # Check if the employee level exists in the policies
    if employee_level not in EXPENSE_POLICIES:
        flags.append(f"Violation: Employee level '{employee_level}' not found in expense policies.")
        receipt_data["flags"] = flags
        return receipt_data

    policy = EXPENSE_POLICIES[employee_level]

    # Check the bill date (convert from milliseconds to datetime)
    try:
        bill_date_ms = bill['date']['$date']['$numberLong']
        bill_date = datetime.fromtimestamp(int(bill_date_ms) / 1000)
        current_date = datetime.now()
        if current_date - bill_date > timedelta(days=30):
            flags.append(f"Violation: Bill date {bill_date.strftime('%Y-%m-%d')} is older than one month.")
    except KeyError:
        flags.append("Violation: Missing or malformed 'date' in bill data.")

    # Check total amount against travel expenses policy
    travel_expense_limits = policy.get("Travel Expenses", {})
    business_trip_limit = travel_expense_limits.get("Business Trips", {"min": 0, "max": 0})
    min_business_trip, max_business_trip = business_trip_limit["min"], business_trip_limit["max"]

    if total_amount < min_business_trip or total_amount > max_business_trip:
        flags.append(
            f"Violation: Total amount {total_amount} exceeds Business Trips policy limits ({min_business_trip} - {max_business_trip})."
        )

    # Check local transportation expenses
    local_transport_limit = travel_expense_limits.get("Local Transportation", {"min": 0, "max": 0})
    min_local, max_local = local_transport_limit["min"], local_transport_limit["max"]

    if "transport" in " ".join(description_keywords):
        if total_amount < min_local or total_amount > max_local:
            flags.append(
                f"Violation: Local transportation expense {total_amount} exceeds policy limits ({min_local} - {max_local})."
            )

    # Check mileage reimbursement
    mileage_reimbursement = travel_expense_limits.get("Mileage Reimbursement", {"min": 0, "max": 0})
    mileage_max = mileage_reimbursement["max"]

    if "mileage" in " ".join(description_keywords):
        if total_amount > mileage_max:
            flags.append(
                f"Violation: Mileage reimbursement {total_amount} exceeds policy limit of {mileage_max}."
            )

    # Check parking fees and tolls
    parking_tolls = travel_expense_limits.get("Parking Fees & Tolls", "Not covered")

    if parking_tolls != "Fully covered":
        if vendor_category.lower() == "parking" or "tolls" in " ".join(description_keywords):
            flags.append(f"Violation: Parking fees or tolls are not fully covered under policy.")

    # Update status based on flags
    if not flags:
        receipt_data["status"] = "Accepted"
    else:
        receipt_data["status"] = "Rejected"

    # Add flags to the receipt_data
    receipt_data["flags"] = flags
    return receipt_data


def update_on_database(receipt):
    """
    Placeholder function to update the processed receipt data back to the database.
    Replace this with actual database update logic.
    """
    pass


def detect_fraud(json_data):
    """
    Process a large JSON file containing multiple bills.
    Adds bill-specific and product-specific violations to each bill in the JSON.
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