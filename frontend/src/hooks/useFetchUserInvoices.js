import { useState, useEffect } from 'react';
import { fetchUserInvoices } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

const useFetchUserInvoices = () => {
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
                throw new Error('Email not available');
            }

            const result = await fetchUserInvoices(email);
            setInvoices(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [user]);

    return { invoices, loading, error, fetchInvoices };
};

export default useFetchUserInvoices;