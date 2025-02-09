const express = require('express');
const Invoice = require('../models/invoice');
const router = express.Router();

router.get('/:companyName', async (req, res) => {
    try {
        const { companyName } = req.params; 

        const invoices = await Invoice.find({ company: companyName });

        if (invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found for this company' });
        }

        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

module.exports = router;