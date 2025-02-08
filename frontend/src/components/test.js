import React from 'react';
import { addInvoice } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react'

const Test = () => {
    const { user } = useAuth0();

    const userData = {
        name: user?.name,
        email: user?.email
    };

    // Example invoice data
    const exampleInvoiceData = {
        bill: {
            currency: "INR",
            date: "2024-02-22 07:24:00",
            invoice_number: "sdfghjkrdertyhb", // Unique invoice number
            payment_mode: 0,
            totalAmount: 10000,
            totalTax: 500
        },
        items: [
            {
                discount: 0,
                name: "Test Item",
                quantity: 1,
                rate: 9500,
                tax: 500,
                total: 10000
            }
        ],
        total_items: 1,
        vendor: {
            category: "Test Category",
            name: "Test Vendor",
            registration_number: "TEST12345"
        },
        filename: "test_invoice.png"
    };

    // Test adding an invoice
    const handleAddInvoice = async () => {
        try {
            const result = await addInvoice(user, exampleInvoiceData);
            alert('Invoice added successfully!');
            console.log(result);
        } catch (error) {
            alert('Failed to add invoice');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Invoice Management</h1>

            {/* Button to test adding an invoice */}
            <button onClick={handleAddInvoice} style={{ margin: '10px', padding: '10px 20px' }}>
                Add Invoice
            </button>
        </div>
    );
};

export default Test;