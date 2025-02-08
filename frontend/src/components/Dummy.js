// src/Dummy.jsx
import React, { useState } from "react";
import axios from "axios";

const Dummy = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        setError(response.data.error);
        setResult(null);
      } else {
        setResult(response.data);
        setError(null);
      }
    } catch (err) {
      setError("An error occurred while processing the file.");
      setResult(null);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Receipt Processor</h1>
      <div>
        <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload and Process</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <h2>Processed Data</h2>
          <h3>Vendor Information</h3>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vendor Name</td>
                <td>{result.vendor.name}</td>
              </tr>
              <tr>
                <td>Vendor Category</td>
                <td>{result.vendor.category}</td>
              </tr>
              <tr>
                <td>Vendor Registration Number</td>
                <td>{result.vendor.registration_number}</td>
              </tr>
            </tbody>
          </table>

          <h3>Bill Information</h3>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bill Date</td>
                <td>{result.bill.date}</td>
              </tr>
              <tr>
                <td>Invoice Number</td>
                <td>{result.bill.invoice_number}</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>{result.bill.currency}</td>
              </tr>
              <tr>
                <td>Payment Mode</td>
                <td>{result.bill.payment_mode}</td>
              </tr>
              <tr>
                <td>Total Amount</td>
                <td>{result.bill.totalAmount}</td>
              </tr>
              <tr>
                <td>Total Tax</td>
                <td>{result.bill.totalTax}</td>
              </tr>
            </tbody>
          </table>

          <h3>Items</h3>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.rate}</td>
                  <td>{item.tax}</td>
                  <td>{item.discount}</td>
                  <td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dummy;