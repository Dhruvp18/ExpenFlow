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


# Example usage
if __name__ == "__main__":
    # Example large JSON file with multiple bills
    large_json = [
        {
            "_id": {"$oid": ""},
            "user": {"name": "Dhruv Panchal", "email": "dhruvp2005@gmail.com"},
            "bill": {
                "currency": "INR",
                "date": {"$date": {"$numberLong": "1708566840000"}},
                "invoice_number": "GA1232402AR87965",
                "payment_mode": {"$numberInt": "0"},
                "totalAmount": {"$numberInt": "14842"},
                "totalTax": {"$numberInt": "740"}
            },
            "items": [
                {
                    "discount": {"$numberInt": "0"},
                    "name": "Air Travel and related charges 996425",
                    "quantity": {"$numberInt": "1"},
                    "rate": {"$numberInt": "11768"},
                    "tax": {"$numberInt": "588"},
                    "total": {"$numberInt": "12356"},
                    "_id": {"$oid": ""}
                }
            ],
            "vendor": {"category": "Transportation", "name": "IndiGo", "registration_number": "L62100DL2004PLC129768"},
            "category": "Miscellaneous",
            "subcategory": "Other",
            "employeeLevel": "Executive Level",
            "status": "pending",
            "createdAt": {"$date": {"$numberLong": "1739051839336"}},
            "updatedAt": {"$date": {"$numberLong": "1739051839336"}},
            "__v": {"$numberInt": "0"}
        },
        {
            "_id": {"$oid": ""},
            "user": {"name": "John Doe", "email": "johndoe@example.com"},
            "bill": {
                "currency": "INR",
                "date": {"$date": {"$numberLong": "1708566840000"}},
                "invoice_number": "GA1232402AR87966",
                "payment_mode": {"$numberInt": "0"},
                "totalAmount": {"$numberInt": "50000"},
                "totalTax": {"$numberInt": "2500"}
            },
            "items": [
                {
                    "discount": {"$numberInt": "0"},
                    "name": "Hotel Stay",
                    "quantity": {"$numberInt": "1"},
                    "rate": {"$numberInt": "45000"},
                    "tax": {"$numberInt": "5000"},
                    "total": {"$numberInt": "50000"},
                    "_id": {"$oid": ""}
                }
            ],
            "vendor": {"category": "Accommodation", "name": "Marriott", "registration_number": "L62100DL2004PLC129769"},
            "category": "Travel",
            "subcategory": "Hotel",
            "employeeLevel": "Manager",
            "status": "pending",
            "createdAt": {"$date": {"$numberLong": "1739051839336"}},
            "updatedAt": {"$date": {"$numberLong": "1739051839336"}},
            "__v": {"$numberInt": "0"}
        }
    ]

    # Process the large JSON file
    processed_json = detect_fraud(large_json)

    # Print the processed JSON
    print(processed_json)


    {
        "Executive Level": {
          "Travel Expenses": {
            "Business Trips": {"min": 400000, "max": 1600000},
            "Local Transportation": {"min": 30000, "max": 60000},
            "Mileage Reimbursement": 45000,
            "Parking Fees & Tolls": "Fully covered"
          },
          "Accommodation": {
            "Hotel Stays": {"min": 25000, "max": 125000},
            "Rental Allowance": {"min": 250000, "max": 600000},
            "Meals During Travel": {"min": 8000, "max": 40000}
          },
          "Office Supplies and Equipment": {
            "Work Tools": "Unlimited",
            "Home Office Setup": 800000
          },
          "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
          },
          "Meals and Entertainment": {
            "Client Meetings": {"min": 400000, "max": 4000000},
            "Team Outings": {"min": 160000, "max": 1600000},
            "Daily Meal Allowance": {"min": 8000, "max": 24000}
          }
        },
        "Senior Management": {
          "Travel Expenses": {
            "Business Trips": {"min": 150000, "max": 400000},
            "Local Transportation": {"min": 20000, "max": 25000},
            "Mileage Reimbursement": 30000,
            "Parking Fees & Tolls": {"min": 0, "max": 10000}
          },
          "Accommodation": {
            "Hotel Stays": {"min": 16000, "max": 80000},
            "Rental Allowance": {"min": 100000, "max": 150000},
            "Meals During Travel": {"min": 6000, "max": 24000}
          },
          "Office Supplies and Equipment": {
            "Work Tools": 400000,
            "Home Office Setup": 400000
          },
          "Meals and Entertainment": {
            "Client Meetings": {"min": 240000, "max": 2400000},
            "Team Outings": {"min": 120000, "max": 1200000}
          }
        },
        "Middle Management": {
          "Travel Expenses": {
            "Business Trips": {"min": 160000, "max": 560000},
            "Local Transportation": {"min": 16000, "max": 20000},
            "Mileage Reimbursement": 25000
          },
          "Accommodation": {
            "Rental Allowance": {"min": 80000, "max": 90000}
          },
          "Office Supplies and Equipment": {
            "Work Tools": 240000,
            "Home Office Setup": 240000
          },
          "Meals and Entertainment": {
            "Client Meetings": {"min": 160000, "max": 1600000}
          }
        },
        "Lower Management": {
          "Travel Expenses": {
            "Business Trips": {"min": 80000, "max": 400000},
            "Local Transportation": {"min": 12000, "max": 15000},
            "Mileage Reimbursement": 20000
          },
          "Accommodation": {
            "Rental Allowance": {"min": 40000, "max": 50000}
          },
          "Office Supplies and Equipment": {
            "Work Tools": 160000
          },
          "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
          }
        },
        "Team Leads & Supervisors": {
          "Travel Expenses": {
            "Business Trips": {"min": 40000, "max": 240000},
            "Local Transportation": {"min": 8000, "max": 10000},
            "Mileage Reimbursement": 15000
          },
          "Accommodation": {
            "Rental Allowance": {"min": 30000, "max": 40000}
          },
          "Meals and Entertainment": {
            "Client Meetings": {"min": 80000, "max": 800000}
          },
          "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
          }
        },
        "Staff & Employees": {
          "Travel Expenses": {
            "Business Trips": {"min": 24000, "max": 160000},
            "Local Transportation": {"min": 0, "max": 5000},
            "Mileage Reimbursement": 10000
          },
          "Accommodation": {
            "Rental Allowance": {"min": 15000, "max": 30000}
          },
          "Office Supplies and Equipment": {
            "Work Tools": 80000
          },
          "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
          }
        }
      }



from datetime import datetime, timedelta

# Define updated expense policies for different employee levels
EXPENSE_POLICIES = {
    "Executive Level": {
        "Travel Expenses": {
            "Business Trips": {"min": 400000, "max": 1600000},
            "Local Transportation": {"min": 30000, "max": 60000},
            "Mileage Reimbursement": 45000,
            "Parking Fees & Tolls": "Fully covered"
        },
        "Accommodation": {
            "Hotel Stays": {"min": 25000, "max": 125000},
            "Rental Allowance": {"min": 250000, "max": 600000},
            "Meals During Travel": {"min": 8000, "max": 40000}
        },
        "Office Supplies and Equipment": {
            "Work Tools": "Unlimited",
            "Home Office Setup": 800000
        },
        "Communication Expenses": {
            "Mobile/Internet Bills": "Fully covered"
        },
        "Meals and Entertainment": {
            "Client Meetings": {"min": 400000, "max": 4000000},
            "Team Outings": {"min": 160000, "max": 1600000},
            "Daily Meal Allowance": {"min": 8000, "max": 24000}
        }
    },
    # Add policies for other employee levels similarly...
}

def fraud(receipt_data):
    """
    Detect potential fraud for a single receipt by comparing it against company policies.
    Returns the receipt data with an added 'flags' field.
    """
    # Initialize flags list
    flags = []

    # Validate required fields
    if "bill" not in receipt_data:
        flags.append("Violation: Missing 'bill' key in receipt data.")
        receipt_data["flags"] = flags
        return receipt_data

    bill = receipt_data["bill"]
    if "totalAmount" not in bill:
        flags.append("Violation: Missing 'totalAmount' in bill data.")
        receipt_data["flags"] = flags
        return receipt_data

    # Extract relevant fields
    employee_level = receipt_data.get("employeeLevel", "Staff & Employees")
    total_amount = int(bill.get("totalAmount", {}).get("$numberInt", 0))  # Safely extract totalAmount
    vendor_name = receipt_data.get("vendor", {}).get("name", "")
    invoice_number = bill.get("invoice_number", "")
    items = receipt_data.get("items", [])
    description_keywords = [item['name'].lower() for item in items]

    # Check for missing vendor or invoice number
    if not vendor_name:
        flags.append("Violation: Vendor name is missing.")
    if not invoice_number:
        flags.append("Violation: Invoice number is missing.")

    # Check invoice date (convert from milliseconds to datetime)
    try:
        bill_date_ms = bill.get("date", {}).get("$date", {}).get("$numberLong", "")
        if not bill_date_ms:
            flags.append("Violation: Missing or malformed 'date' in bill data.")
        else:
            bill_date = datetime.fromtimestamp(int(bill_date_ms) / 1000)
            current_date = datetime.now()
            if current_date - bill_date > timedelta(days=30):
                flags.append(f"Violation: Bill date {bill_date.strftime('%Y-%m-%d')} is older than 30 days.")
    except Exception as e:
        flags.append(f"Violation: Error processing bill date - {str(e)}")

    # Check if employee level exists in policies
    if employee_level not in EXPENSE_POLICIES:
        flags.append(f"Violation: Employee level '{employee_level}' not found in expense policies.")
        receipt_data["flags"] = flags
        return receipt_data

    policy = EXPENSE_POLICIES[employee_level]

    # Check total amount against travel expenses policy
    travel_expense_limits = policy.get("Travel Expenses", {})
    business_trip_limit = travel_expense_limits.get("Business Trips", {})
    min_business_trip = business_trip_limit.get("min", 0)
    max_business_trip = business_trip_limit.get("max", float('inf'))
    if total_amount < min_business_trip or total_amount > max_business_trip:
        flags.append(
            f"Violation: Total amount {total_amount} exceeds Business Trips policy limits ({min_business_trip} - {max_business_trip})."
        )

    # Check local transportation expenses
    local_transport_limit = travel_expense_limits.get("Local Transportation", {})
    min_local = local_transport_limit.get("min", 0)
    max_local = local_transport_limit.get("max", float('inf'))
    if "transport" in " ".join(description_keywords):
        if total_amount < min_local or total_amount > max_local:
            flags.append(
                f"Violation: Local transportation expense {total_amount} exceeds policy limits ({min_local} - {max_local})."
            )

    # Check mileage reimbursement
    mileage_reimbursement = travel_expense_limits.get("Mileage Reimbursement", 0)
    if "mileage" in " ".join(description_keywords):
        if total_amount > mileage_reimbursement:
            flags.append(
                f"Violation: Mileage reimbursement {total_amount} exceeds policy limit of {mileage_reimbursement}."
            )

    # Check parking fees and tolls
    parking_tolls = travel_expense_limits.get("Parking Fees & Tolls", "Not covered")
    if parking_tolls != "Fully covered":
        if "parking" in vendor_name.lower() or "tolls" in " ".join(description_keywords):
            flags.append("Violation: Parking fees or tolls are not fully covered under policy.")

    # Check accommodation expenses
    accommodation_policy = policy.get("Accommodation", {})
    hotel_stay_limit = accommodation_policy.get("Hotel Stays", {})
    min_hotel = hotel_stay_limit.get("min", 0)
    max_hotel = hotel_stay_limit.get("max", float('inf'))
    if "hotel" in " ".join(description_keywords):
        if total_amount < min_hotel or total_amount > max_hotel:
            flags.append(
                f"Violation: Hotel stay expense {total_amount} exceeds policy limits ({min_hotel} - {max_hotel})."
            )

    # Add more checks for other categories...

    # Mark as "Accepted" if no violations are found
    if not flags:
        receipt_data["flags"] = ["Accepted"]
    else:
        receipt_data["flags"] = flags

    return receipt_data


def detect_fraud(json_data):
    """
    Process a large JSON file containing multiple bills.
    Adds bill-specific and product-specific violations to each bill in the JSON.
    Also checks for duplicate invoices.
    """
    if isinstance(json_data, list):  # If the input is a list of bills
        processed_data = []
        seen_invoices = set()  # Track seen invoice numbers
        for bill in json_data:
            invoice_number = bill.get("bill", {}).get("invoice_number", "")
            if invoice_number in seen_invoices:
                bill["flags"] = ["Violation: Duplicate invoice number detected."]
            else:
                seen_invoices.add(invoice_number)
                processed_bill = fraud(bill)
                processed_data.append(processed_bill)
        return processed_data
    elif isinstance(json_data, dict):  # If the input is a single bill
        return fraud(json_data)
    else:
        raise ValueError("Input JSON must be a dictionary or a list of dictionaries.")


# Example usage
if __name__ == "__main__":
    # Example large JSON file with multiple bills
    large_json = [
        {
            "_id": {"$oid": ""},
            "user": {"name": "Dhruv Panchal", "email": "dhruvp2005@gmail.com"},
            "bill": {
                "currency": "INR",
                "date": {"$date": {"$numberLong": "1708566840000"}},
                "invoice_number": "GA1232402AR87965",
                "payment_mode": {"$numberInt": "0"},
                "totalAmount": {"$numberInt": "14842"},
                "totalTax": {"$numberInt": "740"}
            },
            "items": [
                {
                    "discount": {"$numberInt": "0"},
                    "name": "Air Travel and related charges 996425",
                    "quantity": {"$numberInt": "1"},
                    "rate": {"$numberInt": "11768"},
                    "tax": {"$numberInt": "588"},
                    "total": {"$numberInt": "12356"},
                    "_id": {"$oid": ""}
                }
            ],
            "vendor": {"category": "Transportation", "name": "IndiGo", "registration_number": "L62100DL2004PLC129768"},
            "category": "Miscellaneous",
            "subcategory": "Other",
            "employeeLevel": "Executive Level",
            "status": "pending",
            "createdAt": {"$date": {"$numberLong": "1739051839336"}},
            "updatedAt": {"$date": {"$numberLong": "1739051839336"}},
            "__v": {"$numberInt": "0"}
        },
        {
            "_id": {"$oid": ""},
            "user": {"name": "John Doe", "email": "johndoe@example.com"},
            "bill": {
                "currency": "INR",
                "date": {"$date": {"$numberLong": "1708566840000"}},
                "invoice_number": "GA1232402AR87966",
                "payment_mode": {"$numberInt": "0"},
                "totalAmount": {"$numberInt": "50000"},
                "totalTax": {"$numberInt": "2500"}
            },
            "items": [
                {
                    "discount": {"$numberInt": "0"},
                    "name": "Hotel Stay",
                    "quantity": {"$numberInt": "1"},
                    "rate": {"$numberInt": "45000"},
                    "tax": {"$numberInt": "5000"},
                    "total": {"$numberInt": "50000"},
                    "_id": {"$oid": ""}
                }
            ],
            "vendor": {"category": "Accommodation", "name": "Marriott", "registration_number": "L62100DL2004PLC129769"},
            "category": "Travel",
            "subcategory": "Hotel",
            "employeeLevel": "Manager",
            "status": "pending",
            "createdAt": {"$date": {"$numberLong": "1739051839336"}},
            "updatedAt": {"$date": {"$numberLong": "1739051839336"}},
            "__v": {"$numberInt": "0"}
        }
    ]

    # Process the large JSON file
    processed_json = detect_fraud(large_json)

    # Print the processed JSON
    print(json.dumps(processed_json, indent=4))