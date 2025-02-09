import { useState, useEffect } from 'react';

const useInvoicesByCompany = (companyName) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:5000/api/company/${companyName}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch invoices');
                }

                const data = await response.json();

                setInvoices(data);
            } catch (err) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (companyName) {
            fetchInvoices();
        } else {
            setLoading(false);
        }
    }, [companyName]);

    return { invoices, loading, error };
};

export default useInvoicesByCompany;