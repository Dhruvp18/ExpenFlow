from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from werkzeug.utils import secure_filename
import mimetypes

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

VERYFI_URL = "https://api.veryfi.com/api/v8/partner/documents"
HEADERS = {
    'Accept': 'application/json',
    'CLIENT-ID': 'vrfx4TnI53Pwwb8kb5jBYbKdJpz1y95nXgVn8w7',
    'AUTHORIZATION': 'apikey vrvora_b23:141f7f002498aae4fdb84bde80c0c95d'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_receipt_data(json_data):
    vendor_info = {
        "name": json_data["vendor"].get("name") if json_data["vendor"].get("name") is not None else 0,
        "category": json_data["vendor"].get("category") if json_data["vendor"].get("category") is not None else 0,
        "registration_number": json_data["vendor"].get("reg_number") if json_data["vendor"].get("reg_number") is not None else 0
    }
    
    bill_info = {
        "date": json_data.get("date") if json_data.get("date") is not None else 0,
        "invoice_number": json_data.get("invoice_number") if json_data.get("invoice_number") is not None else 0,
        "currency": json_data.get("currency_code") if json_data.get("currency_code") is not None else 0,
        "payment_mode": json_data["payment"].get("display_name") if json_data["payment"].get("display_name") is not None else 0,
        "totalAmount": json_data.get("total") if json_data.get("total") is not None else 0,
        "totalTax": json_data.get("tax") if json_data.get("tax") is not None else 0
    }
    
    items = []
    for item in json_data.get("line_items", []):
        if item.get("type") == "discount":
            continue
            
        item_info = {
            "name": item.get("description") if item.get("description") is not None else 0,
            "quantity": item.get("quantity") if item.get("quantity") is not None else 0,
            "rate": item.get("price") if item.get("price") is not None else 0,
            "tax": item.get("tax") if item.get("tax") is not None else 0,
            "discount": item.get("discount") if item.get("discount") is not None else 0,
            "total": item.get("total") if item.get("total") is not None else 0
        }
        items.append(item_info)
    
    receipt_data = {
        "vendor": vendor_info,
        "bill": bill_info,
        "items": items,
        "total_items": len(items)
    }
    
    return receipt_data

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    files = request.files.getlist('file')
    if not files or all(file.filename == '' for file in files):
        return jsonify({'error': 'No files selected'}), 400
    
    results = []
    
    for file in files:
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed: {file.filename}'}), 400
        
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            print(f"Uploaded file: {filename}, Path: {filepath}, Size: {os.path.getsize(filepath)} bytes")
            
            mime_type, _ = mimetypes.guess_type(filepath)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            
            print(f"MIME Type: {mime_type}")
            
            with open(filepath, 'rb') as uploaded_file:
                files_dict = {
                    'file': (filename, uploaded_file, mime_type)
                }
                
                response = requests.post(VERYFI_URL, headers=HEADERS, files=files_dict)
            
            os.remove(filepath)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            try:
                json_data = response.json()
            except ValueError as e:
                print(f"Failed to parse JSON: {str(e)}")
                return jsonify({'error': 'Invalid JSON response from Veryfi API'}), 500
            
            if response.status_code not in [200, 201]:
                return jsonify({'error': 'OCR service error', 'details': response.text}), 500
            
            receipt_data = extract_receipt_data(json_data)
            if not receipt_data:
                return jsonify({'error': 'Failed to extract receipt data'}), 500
            
            results.append({
                'filename': filename,
                'data': receipt_data
            })
        
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            print(f"Exception occurred: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'results': results})

app.run(debug=True)