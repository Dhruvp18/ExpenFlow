import React, { useEffect, useState } from 'react';
import { fetchUserInvoices } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

const FetchUserInvoices = () => {
    const { user } = useAuth0(); 
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const email = user?.email;

            if (!email) {
                throw new Error('Username not available');
            }

            const result = await fetchUserInvoices(email);
            console.log(result);
            setInvoices(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Fetch User Invoices</h1>

            <button
                onClick={fetchInvoices}
                style={{
                    margin: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                disabled={loading}
            >
                {loading ? 'Fetching...' : 'Fetch Invoices'}
            </button>

            {loading && <p>Loading invoices...</p>}

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {invoices.length > 0 ? (
                <div>
                    <h2>Invoices:</h2>
                    <ul>
                        {invoices.map((invoice, index) => (
                            <li key={index}>
                                <strong>Invoice Number:</strong> {invoice.bill.invoice_number} <br />
                                <strong>Total Amount:</strong> {invoice.bill.totalAmount} {invoice.bill.currency} <br />
                                <strong>Status:</strong> {invoice.status} <br />
                                <hr />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                !loading && !error && <p>No invoices found.</p>
            )}
        </div>
    );
};

export default FetchUserInvoices;