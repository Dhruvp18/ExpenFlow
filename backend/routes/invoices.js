const express = require('express');
const Invoice = require('../models/invoice'); // Import the Invoice model

const router = express.Router();

// POST endpoint to add a new invoice
router.post('/', async (req, res) => {
    try {
        const { user, data } = req.body;

        // Add user details to the data
        const invoiceData = {
            user: {
                name: user.name,
                email: user.email
            },
            ...data
        };

        // Save the invoice to MongoDB
        const invoice = new Invoice(invoiceData);
        await invoice.save();

        res.status(201).json({ message: 'Invoice added successfully', invoice });
    } catch (error) {
        console.error('Error adding invoice:', error);
        res.status(500).json({ error: 'Failed to add invoice' });
    }
});

// PATCH endpoint to update an existing invoice by invoice number
router.patch('/:invoiceNumber', async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const { user, data } = req.body;

        // Find the invoice by invoice number and user email
        const updatedInvoice = await Invoice.findOneAndUpdate(
            { 'bill.invoice_number': invoiceNumber, 'user.email': user.email },
            { $set: data },
            { new: true } // Return the updated document
        );

        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice updated successfully', invoice: updatedInvoice });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});

module.exports = router;