const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    bill: {
        currency: String,
        date: Date,
        invoice_number: { type: String, unique: true }, 
        payment_mode: Number,
        totalAmount: Number,
        totalTax: Number
    },
    items: [
        {
            discount: Number,
            name: String,
            quantity: Number,
            rate: Number,
            tax: Number,
            total: Number
        }
    ],
    total_items: Number,
    vendor: {
        category: mongoose.Schema.Types.Mixed,
        name: String,
        registration_number: mongoose.Schema.Types.Mixed
    },
    filename: String
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;