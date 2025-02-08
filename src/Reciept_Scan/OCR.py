import cv2
import pytesseract
from PIL import Image
from langchain.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI
import re
import json

# Step 1: Perform OCR on the invoice image
def perform_ocr(image_path):
    img_cv = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    ocr_data = pytesseract.image_to_data(img_rgb, output_type=pytesseract.Output.DICT)
    
    text_lines = []
    total_confidence = 0
    valid_word_count = 0
    
    for i in range(len(ocr_data['text'])):
        word = ocr_data['text'][i].strip()
        confidence = int(ocr_data['conf'][i])
        
        if word and confidence > -1:
            text_lines.append(word)
            total_confidence += confidence
            valid_word_count += 1
    
    extracted_text = " ".join(text_lines)
    average_confidence = total_confidence / valid_word_count if valid_word_count > 0 else 0
    cleaned_text = preprocess_text(extracted_text)
    
    return cleaned_text, average_confidence

# Step 2: Preprocess the OCR output
def preprocess_text(extracted_text):
    extracted_text = extracted_text.replace("Sub Total", "Subtotal")
    extracted_text = extracted_text.replace("Before Tax", "Subtotal")
    lines = extracted_text.split("\n")
    filtered_lines = [line for line in lines if not re.match(r"^\s*$", line)]
    cleaned_text = "\n".join(filtered_lines)
    return cleaned_text

# Step 3: Define the prompt template for extracting structured information
# Step 3: Define the prompt template for extracting structured information
invoice_prompt_template = """
You are an expert in extracting structured information from unstructured text. Your task is to analyze the provided text from a bill or receipt and extract the following details in JSON format:
{{
  "Vendor": {{
    "Name": "Name of the vendor",
    "Category": "Category of the vendor",
    "Reg Number": "Registration number of the vendor"
  }},
  "Items": [
    {{
      "Item Name": "Name of the item",
      "Item No": "Item number",
      "Tax": "Tax amount on the item",
      "Discount": "Discount applied (if any)",
      "Total Value": "Final value of the item after tax and discount"
    }}
  ],
  "Bill Date": "Date of the bill",
  "Invoice Number": "Invoice number",
  "Currency Type": "Type of currency used",
  "Mode of Payment": "Payment method used",
  "Subtotal": "Subtotal amount before taxes",
  "Taxes": "Total tax amount",
  "Total Amount After Taxes": "Final total amount including taxes"
}}
Context:\n{context}\n
Question: Extract the vendor details, items with their details, bill date, invoice number, currency type, mode of payment, subtotal, taxes, and the total amount after taxes from the provided text.\n
Answer:
"""

# Step 4: Initialize LangChain with Gemini API
def initialize_gemini_api(api_key):
    llm = GoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)
    return llm

# Step 5: Postprocess the Gemini API response
def validate_and_postprocess(response):
    try:
        # Attempt to parse the response as JSON
        structured_data = json.loads(response)
        return structured_data
    except Exception as e:
        print(f"Error parsing response as JSON: {e}")
        print(f"Raw Response: {response}")
        return {}

# Step 6: Process the extracted text using Gemini API
def extract_invoice_info(extracted_text, llm):
    prompt = PromptTemplate(template=invoice_prompt_template, input_variables=["context"])
    formatted_prompt = prompt.format(context=extracted_text)
    response = llm.invoke(formatted_prompt)
    validated_response = validate_and_postprocess(response)
    return validated_response

# Step 7: Load and Parse the Expense Policy Document
def load_expense_policy(policy_file_path):
    with open(policy_file_path, 'r') as file:
        policy_text = file.read()
    return policy_text

# Step 8: Extract Rules from the Policy Document
policy_prompt_template = """
You are an expert in interpreting company expense policies. Your task is to analyze the provided policy text and extract structured rules in JSON format. The JSON should include the following sections:

1. **Category-Specific Limits**:
   - Food & Beverages: Maximum per meal and daily limit.
   - Travel: Maximum for domestic and international flights.
   - Accommodation: Maximum hotel rate per night.
   - Office Supplies: Maximum per purchase.
   - Entertainment: Maximum per event.

2. **Vendor Restrictions**:
   - List of prohibited vendors.
   - List of approved vendors (if any).

3. **Tax Rules**:
   - Maximum allowable tax percentage.
   - Any additional conditions for taxes.

4. **Miscellaneous Rules**:
   - Tips or gratuities: Maximum percentage.
   - Personal expenses: Non-reimbursable items.
   - Mileage reimbursement: Maximum rate per mile.

5. **Non-Reimbursable Expenses**:
   - Examples of non-reimbursable expenses.

Policy Text:\n{policy}\n
Question: Extract structured rules from the provided policy text.\n
Answer:
"""

def extract_rules_from_policy(policy_text, llm):
    prompt = PromptTemplate(template=policy_prompt_template, input_variables=["policy"])
    formatted_prompt = prompt.format(policy=policy_text)
    response = llm.invoke(formatted_prompt)
    
    # Validate and postprocess the response
    structured_rules = validate_and_postprocess(response)
    
    # Add default values for missing rules
    default_rules = {
        "Category Limits": {
            "Food & Beverages": {"Max Per Meal": 50, "Daily Limit": 150},
            "Travel": {"Domestic Flights": 500, "International Flights": 1200},
            "Accommodation": {"Hotel Rate": 200},
            "Office Supplies": {"Max Per Purchase": 200},
            "Entertainment": {"Max Per Event": 300},
        },
        "Prohibited Vendors": [],
        "Max Tax Percentage": 10,
        "Miscellaneous Rules": {
            "Tips or Gratuities": 20,
            "Mileage Reimbursement": 0.58,
        },
        "Non-Reimbursable Expenses": [],
    }
    
    # Merge extracted rules with defaults
    merged_rules = {**default_rules, **structured_rules}
    return merged_rules

# Step 9: Check Violations Against Rules
# Step 9: Check Violations Against Rules
def check_violations(structured_info, structured_rules):
    violations = []

    # Check if the vendor is prohibited
    vendor_name = structured_info.get("Vendor", {}).get("Name", "").lower()
    prohibited_vendors = [v.lower() for v in structured_rules.get("Prohibited Vendors", [])]
    if vendor_name in prohibited_vendors:
        violations.append(f"Violation: Purchase from prohibited vendor '{vendor_name}'.")

    # Check total amount against category limits
    total_amount = float(structured_info.get("Total Amount After Taxes", 0))
    vendor_category = structured_info.get("Vendor", {}).get("Category", "").lower()
    category_limits = structured_rules.get("Category Limits", {})
    
    for category, limit in category_limits.items():
        if vendor_category == category.lower():
            max_per_meal = limit.get("Max Per Meal", 0)
            daily_limit = limit.get("Daily Limit", 0)
            
            if total_amount > max_per_meal:
                violations.append(f"Violation: Total amount ({total_amount}) exceeds the meal limit for {category} ({max_per_meal}).")
            
            if total_amount > daily_limit:
                violations.append(f"Violation: Total amount ({total_amount}) exceeds the daily limit for {category} ({daily_limit}).")

    # Check tax percentage
    taxes = float(structured_info.get("Taxes", 0))
    subtotal = float(structured_info.get("Subtotal", 1))  # Avoid division by zero
    tax_percentage = (taxes / subtotal) * 100
    max_tax_percentage = float(structured_rules.get("Max Tax Percentage", 100))
    if tax_percentage > max_tax_percentage:
        violations.append(f"Violation: Tax percentage ({tax_percentage:.2f}%) exceeds the allowed limit ({max_tax_percentage}%).")

    return violations
# Step 10: Generate a Report of Violations
def generate_violation_report(violations):
    if not violations:
        return "No violations found. The expense report complies with the company's policy."
    
    report = "Violations Found:\n"
    for i, violation in enumerate(violations, 1):
        report += f"{i}. {violation}\n"
    return report

# Main function to tie everything together
# Main function to tie everything together
def process_invoice_with_policy_check(image_path, api_key, policy_file_path):
    # Step 1: Perform OCR to extract text from the invoice image
    extracted_text, ocr_score = perform_ocr(image_path)
    print(f"Extracted Text from Invoice (OCR Confidence Score: {ocr_score:.2f}%):")
    print(extracted_text)

    # Step 2: Initialize the Gemini API
    llm = initialize_gemini_api(api_key)

    # Step 3: Extract structured information using the Gemini API
    structured_info = extract_invoice_info(extracted_text, llm)
    print("\nStructured Information Extracted from Invoice:")
    print(json.dumps(structured_info, indent=4))

    # Step 4: Load and parse the expense policy
    policy_text = load_expense_policy(policy_file_path)
    structured_rules = extract_rules_from_policy(policy_text, llm)
    print("\nStructured Rules Extracted from Policy:")
    print(json.dumps(structured_rules, indent=4))

    # Step 5: Check for violations
    violations = check_violations(structured_info, structured_rules)
    report = generate_violation_report(violations)
    print("\nViolation Report:")
    print(report)

# Example usage
if __name__ == "__main__":
    # Replace 'your_image_path.jpg' with the path to your invoice image
    image_path = './dmart.jpg'
    
    # Replace 'your_gemini_api_key' with your actual Gemini API key
    gemini_api_key = 'AIzaSyDvabrVP2DH3zjtowJQjYT1SMxfxWomXmg'
    
    # Replace 'expense_policy.txt' with the path to your expense policy document
    policy_file_path = './expense_policy.txt'
    
    # Process the invoice and check for violations
    process_invoice_with_policy_check(image_path, gemini_api_key, policy_file_path)