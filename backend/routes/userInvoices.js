const express = require('express');
const Invoice = require('../models/invoice');
const router = express.Router();

router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const invoices = await Invoice.find({ 'user.email': email });

        if (invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found for this user' });
        }

        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

module.exports = router;