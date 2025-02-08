import axios from 'axios';
const BASE_URL = 'http://localhost:5000/api';

export const addInvoice = async (user, invoiceData) => {
    try {
        const response = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, data: invoiceData })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (invoiceNumber, user, updatedData) => {
    try {
        const response = await fetch(`${BASE_URL}/invoices/${invoiceNumber}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, data: updatedData })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};

export const fetchUserInvoices = async (email) => {
    try {
        const response = await axios.get(`${BASE_URL}/user-invoices/${email}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch invoices');
    }
};