from flask import Flask, request, jsonify
from pymongo import MongoClient
import datetime

app = Flask(__name__)

# Connect to MongoDB
try:
    client = MongoClient('mongodb://127.0.0.1:27017/')
    db = client['receipt_database']
    receipts_collection = db['receipts']
    # Create indexes for common query fields
    receipts_collection.create_index([('bill.date', 1)])
    receipts_collection.create_index([('vendor.name', 1)])
    receipts_collection.create_index([('bill.invoice_number', 1)], unique=True)
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")

@app.route('/store_receipt', methods=['POST'])
def store_receipt():
    try:
        receipt_data = request.json
        if not receipt_data:
            return jsonify({'error': 'No receipt data provided'}), 400

        # Add timestamp for when the receipt was stored
        receipt_data['stored_at'] = datetime.datetime.utcnow()

        # Insert the receipt data into MongoDB
        result = receipts_collection.insert_one(receipt_data)
        
        return jsonify({
            'message': 'Receipt stored successfully',
            'receipt_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({'error': f'Failed to store receipt: {str(e)}'}), 500

@app.route('/get_receipt/<receipt_id>', methods=['GET'])
def get_receipt(receipt_id):
    try:
        from bson.objectid import ObjectId
        receipt = receipts_collection.find_one({'_id': ObjectId(receipt_id)})
        
        if receipt:
            receipt['_id'] = str(receipt['_id'])  # Convert ObjectId to string
            return jsonify(receipt), 200
        else:
            return jsonify({'error': 'Receipt not found'}), 404

    except Exception as e:
        return jsonify({'error': f'Failed to retrieve receipt: {str(e)}'}), 500

@app.route('/search_receipts', methods=['GET'])
def search_receipts():
    try:
        # Get search parameters from query string
        vendor_name = request.args.get('vendor_name')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        invoice_number = request.args.get('invoice_number')

        # Build query based on provided parameters
        query = {}
        if vendor_name:
            query['vendor.name'] = {'$regex': vendor_name, '$options': 'i'}
        if start_date and end_date:
            query['bill.date'] = {
                '$gte': start_date,
                '$lte': end_date
            }
        if invoice_number:
            query['bill.invoice_number'] = invoice_number

        # Execute search
        receipts = list(receipts_collection.find(query))
        
        # Convert ObjectId to string for JSON serialization
        for receipt in receipts:
            receipt['_id'] = str(receipt['_id'])

        return jsonify({
            'count': len(receipts),
            'receipts': receipts
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to search receipts: {str(e)}'}), 500

@app.route('/delete_receipt/<receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    try:
        from bson.objectid import ObjectId
        result = receipts_collection.delete_one({'_id': ObjectId(receipt_id)})
        
        if result.deleted_count > 0:
            return jsonify({'message': 'Receipt deleted successfully'}), 200
        else:
            return jsonify({'error': 'Receipt not found'}), 404

    except Exception as e:
        return jsonify({'error': f'Failed to delete receipt: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)