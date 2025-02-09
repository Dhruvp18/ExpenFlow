from datetime import datetime, timedelta

# Define expense policies for different employee levels
EXPENSE_POLICIES = {
    "Executive Level": {
        "Travel Expenses": {
            "Business Trips": "₹4,00,000 - ₹16,00,000 per month",
            "Local Transportation": "₹30,000 - ₹60,000 per month",
            "Mileage Reimbursement": "₹45,000 per month",
            "Parking Fees & Tolls": "Fully covered"
        },
        "Accommodation": {
            "Hotel Stays": "₹25,000 - ₹1,25,000 per night",
            "Rental Allowance": "₹2,50,000 - ₹6,00,000 per month",
            "Meals During Travel": "₹8,000 - ₹40,000 per day"
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Unlimited (as per requirement)",
            "Home Office Setup": "Up to ₹8,00,000"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        },
        "Meals and Entertainment": {
            "Client Meetings": "Up to ₹4,00,000 per month",
            "Team Outings": "Up to ₹1,60,000 per month",
            "Daily Meal Allowance": "₹8,000 - ₹24,000 per day"
        }
    },
    "Senior Management": {
        "Travel Expenses": {
            "Business Trips": "₹1,50,000 - ₹4,00,000 per month",
            "Local Transportation": "₹20,000 - ₹25,000 per month",
            "Mileage Reimbursement": "₹30,000 per month",
            "Parking Fees & Tolls": "Up to ₹10,000 per month"
        },
        "Accommodation": {
            "Hotel Stays": "₹16,000 - ₹80,000 per night",
            "Rental Allowance": "₹1,00,000 - ₹1,50,000 per month",
            "Meals During Travel": "₹6,000 - ₹24,000 per day"
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Up to ₹4,00,000 per year",
            "Home Office Setup": "Up to ₹4,00,000"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        },
        "Meals and Entertainment": {
            "Client Meetings": "Up to ₹2,40,000 per month",
            "Team Outings": "Up to ₹1,20,000 per month"
        }
    },
    "Middle Management": {
        "Travel Expenses": {
            "Business Trips": "₹1,60,000 - ₹5,60,000 per month",
            "Local Transportation": "₹16,000 - ₹20,000 per month",
            "Mileage Reimbursement": "₹25,000 per month"
        },
        "Accommodation": {
            "Rental Allowance": "₹80,000 - ₹90,000 per month"
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Up to ₹2,40,000 per year",
            "Home Office Setup": "Up to ₹2,40,000"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        },
        "Meals and Entertainment": {
            "Client Meetings": "Up to ₹1,60,000 per event"
        }
    },
    "Lower Management": {
        "Travel Expenses": {
            "Business Trips": "₹80,000 - ₹4,00,000 per trip",
            "Local Transportation": "₹12,000 - ₹15,000 per month",
            "Mileage Reimbursement": "₹20,000 per month"
        },
        "Accommodation": {
            "Rental Allowance": "₹40,000 - ₹50,000 per month"
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Up to ₹1,60,000 per year"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    },
    "Team Leads & Supervisors": {
        "Travel Expenses": {
            "Business Trips": "₹40,000 - ₹2,40,000 per trip",
            "Local Transportation": "₹8,000 - ₹10,000 per month",
            "Mileage Reimbursement": "₹15,000 per month"
        },
        "Accommodation": {
            "Rental Allowance": "₹30,000 - ₹40,000 per month"
        },
        "Meals and Entertainment": {
            "Client Meetings": "Up to ₹80,000 per event"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    },
    "Staff & Employees": {
        "Travel Expenses": {
            "Business Trips": "₹24,000 - ₹1,60,000 per trip",
            "Local Transportation": "Up to ₹5,000 per month",
            "Mileage Reimbursement": "₹10,000 per month"
        },
        "Accommodation": {
            "Rental Allowance": "₹15,000 - ₹30,000 per month"
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Up to ₹80,000 per year"
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        }
    }
}

def fraud(receipt_data):
    """
    Detect potential fraud for a single receipt by comparing it against company policies.
    Returns the receipt data with an added 'violations' field.
    """
    # Initialize violations list
    violations = []

    # Validate that 'bill' exists and has the required fields
    if "bill" not in receipt_data:
        violations.append("Violation: Missing 'bill' key in receipt data.")
        receipt_data["violations"] = violations
        return receipt_data

    bill = receipt_data["bill"]
    if "totalAmount" not in bill:
        violations.append("Violation: Missing 'totalAmount' in bill data.")
        receipt_data["violations"] = violations
        return receipt_data

    # Extract relevant fields from receipt data
    employee_level = receipt_data.get("employeeLevel", "Staff & Employees")
    total_amount = int(bill['totalAmount'].get("$numberInt", 0))  # Safely extract totalAmount
    vendor_category = receipt_data.get('vendor', {}).get('category', "")
    items = receipt_data.get('items', [])
    description_keywords = [item['name'].lower() for item in items]

    # Check if the employee level exists in the policies
    if employee_level not in EXPENSE_POLICIES:
        violations.append(f"Violation: Employee level '{employee_level}' not found in expense policies.")
        receipt_data["violations"] = violations
        return receipt_data

    policy = EXPENSE_POLICIES[employee_level]

    # Check the bill date (convert from milliseconds to datetime)
    try:
        bill_date_ms = bill['date']['$date']['$numberLong']
        bill_date = datetime.fromtimestamp(int(bill_date_ms) / 1000)
        current_date = datetime.now()

        if current_date - bill_date > timedelta(days=30):
            violations.append(f"Violation: Bill date {bill_date.strftime('%Y-%m-%d')} is older than one month.")
    except KeyError:
        violations.append("Violation: Missing or malformed 'date' in bill data.")

    # Check total amount against travel expenses policy
    travel_expense_limits = policy.get("Travel Expenses", {})
    business_trip_limit = travel_expense_limits.get("Business Trips", "₹0 - ₹0")
    min_business_trip, max_business_trip = map(
        lambda x: int(x.replace("₹", "").replace(",", "")), business_trip_limit.split(" - ")
    )
    if total_amount < min_business_trip or total_amount > max_business_trip:
        violations.append(
            f"Violation: Total amount {total_amount} exceeds Business Trips policy limits ({min_business_trip} - {max_business_trip})."
        )

    # Check local transportation expenses
    local_transport_limit = travel_expense_limits.get("Local Transportation", "₹0 - ₹0")
    min_local, max_local = map(lambda x: int(x.replace("₹", "").replace(",", "")), local_transport_limit.split(" - "))
    if "transport" in " ".join(description_keywords):
        if total_amount < min_local or total_amount > max_local:
            violations.append(
                f"Violation: Local transportation expense {total_amount} exceeds policy limits ({min_local} - {max_local})."
            )

    # Check mileage reimbursement
    mileage_reimbursement = travel_expense_limits.get("Mileage Reimbursement", "₹0")
    mileage_reimbursement = int(mileage_reimbursement.replace("₹", "").replace(",", ""))
    if "mileage" in " ".join(description_keywords):
        if total_amount > mileage_reimbursement:
            violations.append(
                f"Violation: Mileage reimbursement {total_amount} exceeds policy limit of {mileage_reimbursement}."
            )

    # Check parking fees and tolls
    parking_tolls = travel_expense_limits.get("Parking Fees & Tolls", "Not covered")
    if parking_tolls != "Fully covered":
        if vendor_category.lower() == "parking" or "tolls" in " ".join(description_keywords):
            violations.append(f"Violation: Parking fees or tolls are not fully covered under policy.")

    # Check accommodation expenses
    accommodation_policy = policy.get("Accommodation", {})
    hotel_stay_limit = accommodation_policy.get("Hotel Stays", "₹0 - ₹0")
    min_hotel, max_hotel = map(lambda x: int(x.replace("₹", "").replace(",", "")), hotel_stay_limit.split(" - "))
    if "hotel" in " ".join(description_keywords):
        if total_amount < min_hotel or total_amount > max_hotel:
            violations.append(
                f"Violation: Hotel stay expense {total_amount} exceeds policy limits ({min_hotel} - {max_hotel})."
            )

    rental_allowance = accommodation_policy.get("Rental Allowance", "₹0 - ₹0")
    min_rental, max_rental = map(lambda x: int(x.replace("₹", "").replace(",", "")), rental_allowance.split(" - "))
    if "rental" in " ".join(description_keywords):
        if total_amount < min_rental or total_amount > max_rental:
            violations.append(
                f"Violation: Rental allowance {total_amount} exceeds policy limits ({min_rental} - {max_rental})."
            )

    meals_during_travel = accommodation_policy.get("Meals During Travel", "₹0 - ₹0")
    min_meals, max_meals = map(lambda x: int(x.replace("₹", "").replace(",", "")), meals_during_travel.split(" - "))
    if "meals" in " ".join(description_keywords):
        if total_amount < min_meals or total_amount > max_meals:
            violations.append(
                f"Violation: Meals during travel expense {total_amount} exceeds policy limits ({min_meals} - {max_meals})."
            )

    # Check office supplies and equipment
    office_supplies_policy = policy.get("Office Supplies and Equipment", {})
    work_tools_limit = office_supplies_policy.get("Work Tools", "₹0 per year")
    work_tools_limit = int(work_tools_limit.replace("₹", "").replace(",", "").split(" ")[0])
    if "tools" in " ".join(description_keywords):
        if total_amount > work_tools_limit:
            violations.append(
                f"Violation: Work tools expense {total_amount} exceeds policy limit of {work_tools_limit} per year."
            )

    home_office_setup = office_supplies_policy.get("Home Office Setup", "₹0")
    home_office_setup = int(home_office_setup.replace("₹", "").replace(",", ""))
    if "home office" in " ".join(description_keywords):
        if total_amount > home_office_setup:
            violations.append(
                f"Violation: Home office setup expense {total_amount} exceeds policy limit of {home_office_setup}."
            )

    # Check communication expenses
    communication_policy = policy.get("Communication Expenses", {})
    mobile_internet = communication_policy.get("Mobile/Internet Bills", "Not covered")
    if mobile_internet != "Fully covered":
        if "mobile" in " ".join(description_keywords) or "internet" in " ".join(description_keywords):
            violations.append(f"Violation: Mobile/Internet bills are not fully covered under policy.")

    # Check meals and entertainment
    meals_entertainment_policy = policy.get("Meals and Entertainment", {})
    client_meetings_limit = meals_entertainment_policy.get("Client Meetings", "₹0 per month")
    client_meetings_limit = int(client_meetings_limit.replace("₹", "").replace(",", "").split(" ")[0])
    if "client meeting" in " ".join(description_keywords):
        if total_amount > client_meetings_limit:
            violations.append(
                f"Violation: Client meeting expense {total_amount} exceeds policy limit of {client_meetings_limit} per month."
            )

    team_outings_limit = meals_entertainment_policy.get("Team Outings", "₹0 per month")
    team_outings_limit = int(team_outings_limit.replace("₹", "").replace(",", "").split(" ")[0])
    if "team outing" in " ".join(description_keywords):
        if total_amount > team_outings_limit:
            violations.append(
                f"Violation: Team outing expense {total_amount} exceeds policy limit of {team_outings_limit} per month."
            )

    daily_meal_allowance = meals_entertainment_policy.get("Daily Meal Allowance", "₹0 - ₹0")
    min_meal, max_meal = map(lambda x: int(x.replace("₹", "").replace(",", "")), daily_meal_allowance.split(" - "))
    if "meal" in " ".join(description_keywords):
        if total_amount < min_meal or total_amount > max_meal:
            violations.append(
                f"Violation: Daily meal allowance {total_amount} exceeds policy limits ({min_meal} - {max_meal})."
            )

    # Add violations to the receipt_data
    receipt_data["violations"] = violations
    return receipt_data


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


