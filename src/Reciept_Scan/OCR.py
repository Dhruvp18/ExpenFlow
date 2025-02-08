from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import cv2
import pytesseract
from PIL import Image
from langchain.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI
import re
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Process the image and extract structured data
            structured_data = process_invoice(file_path, 'AIzaSyCvMHjtAO6wxqz6Mdy4IzgCtPxgZ8nwvt0')
            return jsonify(structured_data)
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

def preprocess_text(extracted_text):
    extracted_text = extracted_text.replace("Sub Total", "Subtotal")
    extracted_text = extracted_text.replace("Before Tax", "Subtotal")
    
    lines = extracted_text.split("\n")
    filtered_lines = [line for line in lines if not re.match(r"^\s*$", line)]
    
    cleaned_text = "\n".join(filtered_lines)
    return cleaned_text

prompt_template = """
You are an expert in extracting structured information from unstructured text. Your task is to analyze the provided text from a bill or receipt and extract the following details:
Vendor Name: Identify the name of the vendor or business that issued the bill/receipt.
Items with Details: For each item purchased, extract the following:
  - Item Name: The name or description of the item.
  - Quantity: The quantity of the item purchased.
  - MRP (Maximum Retail Price): The maximum retail price of the item.
  - Discount: Any discount applied to the item (if applicable).
  - Price After Discount: The final price of the item after applying the discount.
  - Tags: Generate one or more tags for the item based on its name to indicate the category of the product (e.g., Grocery, Electronics, Clothing, Beverages, etc.).
Subtotal: Identify the subtotal amount before taxes. If the term "Subtotal" is not explicitly mentioned, look for similar terms like "Sub Total," "Before Tax," or any amount listed before taxes.
Taxes: Extract the total tax amount applied to the bill/receipt.
Total Amount After Taxes: Identify the final total amount charged on the bill/receipt, including taxes.
If any of the required information is missing or unclear in the provided text, explicitly state that the information is not available. Do not make assumptions or provide incorrect data.
Context:\n{context}\n
Question: Extract the vendor name, items with their details (name, quantity, MRP, discount, price after discount, tags), subtotal, taxes, and the total amount after taxes from the provided text.\n
Answer:
"""

def initialize_gemini_api(api_key):
    llm = GoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)
    return llm

def validate_and_postprocess(response):
    try:
        structured_data = json.loads(response)
        
        subtotal = structured_data.get("Subtotal", None)
        taxes = structured_data.get("Taxes", None)
        total_after_taxes = structured_data.get("Total Amount After Taxes", None)
        
        if subtotal is not None and taxes is not None and total_after_taxes is not None:
            calculated_total = float(subtotal) + float(taxes)
            if abs(calculated_total - float(total_after_taxes)) > 0.01:
                print("Warning: Subtotal validation failed. Please review manually.")
        
        return structured_data
    except Exception as e:
        print(f"Error during postprocessing: {e}")
        return response

def extract_invoice_info(extracted_text, llm):
    prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
    formatted_prompt = prompt.format(context=extracted_text)
    response = llm.invoke(formatted_prompt)
    validated_response = validate_and_postprocess(response)
    return validated_response

def process_invoice(image_path, api_key):
    extracted_text, ocr_score = perform_ocr(image_path)
    print(f"Extracted Text from Invoice (OCR Confidence Score: {ocr_score:.2f}%):")
    print(extracted_text)
    
    llm = initialize_gemini_api(api_key)
    structured_info = extract_invoice_info(extracted_text, llm)
    print("\nStructured Information Extracted from Invoice:")
    print(structured_info)
    return structured_info

if __name__ == '__main__':
    app.run(debug=True)