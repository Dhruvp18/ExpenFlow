import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Backend response:', response.data); // Log the backend response
      setResult(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const formatResult = (data) => {
    if (!data) return '';

    let formattedResult = `Structured Information Extracted from Invoice:\n`;
    formattedResult += `**Vendor Name:** ${data['Vendor Name'] || 'Not available'}\n\n`;
    formattedResult += `**Items with Details:**\n`;

    if (data['Items with Details'] && Array.isArray(data['Items with Details'])) {
      data['Items with Details'].forEach(item => {
        formattedResult += `- Item Name: ${item['Item Name'] || 'Not available'}\n`;
        formattedResult += `  - Quantity: ${item['Quantity'] || 'Not available'}\n`;
        formattedResult += `  - MRP: ${item['MRP'] || 'Not available'}\n`;
        formattedResult += `  - Discount: ${item['Discount'] || 'Not applicable'}\n`;
        formattedResult += `  - Price After Discount: ${item['Price After Discount'] || 'Not available'}\n`;
        formattedResult += `  - Tags: ${item['Tags'] || 'Not available'}\n\n`;
      });
    } else {
      formattedResult += 'No items available.\n';
    }

    formattedResult += `**Subtotal:** ${data['Subtotal'] || 'Not available'}\n`;

    if (data['Taxes'] && typeof data['Taxes'] === 'object') {
      formattedResult += `**Taxes:**\n`;
      for (const [key, value] of Object.entries(data['Taxes'])) {
        formattedResult += `  - ${key}: ${value}\n`;
      }
    } else {
      formattedResult += `**Taxes:** Not available\n`;
    }

    formattedResult += `**Total Amount After Taxes:** ${data['Total Amount After Taxes'] || 'Not available'}\n`;

    return formattedResult;
  };

  return (
    <div className="App">
      <h1>Invoice OCR</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {result && (
        <div>
          <h2>Structured Data</h2>
          <pre>{formatResult(result)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;