import React from 'react';
import useInvoicesByCompany from '../hooks/useInvoicesByCompany';

const CompanyInvoiceList = ({ companyName }) => {
    const { invoices, loading, error } = useInvoicesByCompany("company2");
    console.log(invoices);
    
    if (loading) {
        return <p>Loading invoices...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Invoices for {companyName}</h2>
            {invoices.length === 0 ? (
                <p>No invoices found for this company.</p>
            ) : (
                <ul>
                    {invoices.map((invoice) => (
                        <li key={invoice._id}>
                            <strong>Invoice Number:</strong> {invoice.bill.invoice_number},{' '}
                            <strong>Total Amount:</strong> {invoice.bill.totalAmount}{' '}
                            {invoice.bill.currency}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CompanyInvoiceList;