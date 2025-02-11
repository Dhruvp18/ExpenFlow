const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCEbn8bq8qCFT3nl0_7ft1ub_V-qehNLlQ"; // Use environment variable
const MODEL_NAME = 'gemini-1.5-flash'; // Replace with the correct model name if different

// POST endpoint for chatbot
app.post('/api/chat', async (req, res) => {
    const { message, invoices } = req.body;
    console.log(invoices) // Extract both message and invoices

    try {
        // Format the invoices into a readable structure for the chatbot
        const formattedInvoices = JSON.stringify(invoices,null,2)
        console.log(formattedInvoices)
        // Construct the prompt by including the invoices data
        const prompt = `
            You are a friendly chatbot for uploaded user reciepts
            User Message: ${message} from this formatted invoices extract data of vendor, vendor name, invoice number, category, sub-category, flags if any, status, invoice number, total amount and total tax
            Dont assume any data, just take what is given
            Context (Invoices):
            ${formattedInvoices}
        `;

        console.log(prompt)

        // Send the prompt to the Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the bot's response
        const botResponse = response.data.candidates[0].content.parts[0].text;

        // Send the bot's response back to the frontend
        res.json({
            response: botResponse.trim(),
        });
    } catch (error) {
        console.error("Error processing chat request:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});