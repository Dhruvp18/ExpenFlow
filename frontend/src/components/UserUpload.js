import axios from 'axios';
import Navbar from './Navbar';
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Camera, Trash2 } from 'lucide-react';
import { addInvoice } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

const ReceiptUploader = () => {
  const { user } = useAuth0();
    const userData = {
        name: user?.name,
        email: user?.email
    };
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('Executive Level (CEO, CTO, CFO, COO, CMO)');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  const policyData = {
    "Executive Level": {
      "Travel Expenses": {
        "Business Trips": "₹4,00,000 - ₹16,00,000 per trip",
        "Local Transportation": "₹40,000 - ₹1,60,000 per month",
        "Mileage Reimbursement": "₹54 per km",
        "Parking Fees & Tolls": "Fully covered"
      },
      "Accommodation": {
        "Hotel Stays": "₹25,000 - ₹1,25,000 per night",
        "Short-Term Rentals": "₹4,00,000 - ₹12,00,000 per month",
        "Meals During Travel": "₹8,000 - ₹40,000 per day"
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Unlimited (as per requirement)",
        "Home Office Setup": "Up to ₹8,00,000"
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered"
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹4,00,000 per event",
        "Team Outings": "Up to ₹1,60,000 per event",
        "Daily Meal Allowance": "₹8,000 - ₹24,000 per day"
      }
    },
    "Senior Management": {
      "Travel Expenses": {
        "Business Trips": "₹2,40,000 - ₹8,00,000 per trip",
        "Local Transportation": "₹24,000 - ₹1,20,000 per month",
        "Mileage Reimbursement": "₹46 per km",
        "Parking Fees & Tolls": "Up to ₹40,000 per month"
      },
      "Accommodation": {
        "Hotel Stays": "₹16,000 - ₹80,000 per night",
        "Short-Term Rentals": "₹2,40,000 - ₹8,00,000 per month",
        "Meals During Travel": "₹6,000 - ₹24,000 per day"
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹4,00,000 per year",
        "Home Office Setup": "Up to ₹4,00,000"
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹2,40,000 per event",
        "Team Outings": "Up to ₹1,20,000 per event"
      }
    },
    "Middle Management": {
      "Travel Expenses": {
        "Business Trips": "₹1,60,000 - ₹5,60,000 per trip",
        "Local Transportation": "₹16,000 - ₹80,000 per month",
        "Mileage Reimbursement": "₹42 per km"
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹2,40,000 per year",
        "Home Office Setup": "Up to ₹2,40,000"
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹1,60,000 per event"
      }
    },
    "Lower Management": {
      "Travel Expenses": {
        "Business Trips": "₹80,000 - ₹4,00,000 per trip",
        "Local Transportation": "₹12,000 - ₹56,000 per month",
        "Mileage Reimbursement": "₹38 per km"
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹1,60,000 per year"
      }
    },
    "Team Leads & Supervisors": {
      "Travel Expenses": {
        "Business Trips": "₹40,000 - ₹2,40,000 per trip",
        "Local Transportation": "₹8,000 - ₹40,000 per month"
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹80,000 per event"
      }
    },
    "Staff & Employees": {
      "Travel Expenses": {
        "Business Trips": "₹24,000 - ₹1,60,000 per trip",
        "Local Transportation": "Up to ₹24,000 per month"
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹80,000 per year"
      }
    }
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  useEffect(() => {
    console.log('Selected Level:', selectedLevel);
    console.log('Policy Data:', policyData[selectedLevel]);
  }, [selectedLevel]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadResults(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
        formData.append('file', file);
    });

    try {
        const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
            withCredentials: false,
        });

        if (response.data.results) {
            console.log('Upload Results:', response.data.results);
            setUploadResults(response.data.results);

            for (const result of response.data.results) {
                try {
                    const invoiceData = result.data;
                    await addInvoice(userData, invoiceData);
                    console.log(`Invoice ${invoiceData.bill.invoice_number} added successfully!`);
                } catch (error) {
                    console.error(`Failed to add invoice ${result.filename}:`, error);
                }
            }

            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Upload failed:', error);
        let errorMessage = 'Failed to upload files. Please try again.';
        if (error.response) {
            errorMessage = error.response.data.error || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'No response from server. Please check if the server is running.';
        }
        setUploadError(errorMessage);
    } finally {
        setUploading(false);
    }
};

  const renderFilePreview = (file, index) => {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        return (
          <div key={index} className="group relative flex items-center p-4 mb-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex-1 flex items-center">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {isImage ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-8 h-8 text-blue-500" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200 group-hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20 px-4 py-8">
        <div className="mb-8 overflow-x-auto bg-white rounded-2xl shadow-sm p-4">
          <div className="flex justify-center items-center space-x-3 pb-2 overflow-x-auto">
            {Object.keys(policyData).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                  selectedLevel === level
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Receipts</h2>
            
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
            
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 opacity-50 rounded-xl" />
          {/* ... (keep upload section) */}
            {/* ... (keep existing upload area JSX) */}
              <div className="relative">
                <Upload className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Support for PDF, PNG, JPG (up to 10MB each)
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="mt-8 space-y-3">
              {selectedFiles.map((file, index) => renderFilePreview(file, index))}
            </div>
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl">
                {uploadError}
              </div>
            )}
            {uploadResults && (
              <div className="mt-8">
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Processed Receipts</h3>

                {/* Scrollable Container for Results */}
                <div
                  className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg shadow-md p-4"
                  style={{ maxHeight: '400px' }}
                >
                  {uploadResults.map((result, index) => (
                    <div key={index} className="mb-4 p-4 bg-white border border-gray-100 rounded-lg">
                      <h4 className="text-lg font-semibold text-blue-600">{result.filename}</h4>
                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700">Vendor Information:</h5>
                        <ul className="text-sm text-gray-600">
                          <li>Name: {result.data.vendor.name || 'N/A'}</li>
                          <li>Category: {result.data.vendor.category || 'N/A'}</li>
                          <li>Registration Number: {result.data.vendor.registration_number || 'N/A'}</li>
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700">Bill Details:</h5>
                        <ul className="text-sm text-gray-600">
                          <li>Date: {result.data.bill.date || 'N/A'}</li>
                          <li>Invoice Number: {result.data.bill.invoice_number || 'N/A'}</li>
                          <li>Currency: {result.data.bill.currency || 'N/A'}</li>
                          <li>Payment Mode: {result.data.bill.payment_mode || 'N/A'}</li>
                          <li>Total Amount: {result.data.bill.totalAmount ? `₹${result.data.bill.totalAmount.toFixed(2)}` : 'N/A'}</li>
                          <li>Total Tax: {result.data.bill.totalTax ? `₹${result.data.bill.totalTax.toFixed(2)}` : 'N/A'}</li>
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700">Items:</h5>
                        {result.data.items.length > 0 ? (
                          result.data.items.map((item, idx) => (
                            <div key={idx} className="ml-4 p-2 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-800">Item {idx + 1}: {item.name || 'Unnamed Item'}</p>
                              <ul className="text-sm text-gray-600">
                                <li>Quantity: {item.quantity || 'N/A'}</li>
                                <li>Rate: {item.rate ? `₹${item.rate.toFixed(2)}` : 'N/A'}</li>
                                <li>Tax: {item.tax ? `₹${item.tax.toFixed(2)}` : 'N/A'}</li>
                                <li>Discount: {item.discount ? `₹${item.discount.toFixed(2)}` : 'N/A'}</li>
                                <li>Total: {item.total ? `₹${item.total.toFixed(2)}` : 'N/A'}</li>
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No items found in this receipt.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedFiles.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-6 w-full py-3 px-6 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 ${
                  uploading
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Policy Details for {selectedLevel}
            </h2>
            <div className="space-y-6">
              {policyData[selectedLevel] && Object.entries(policyData[selectedLevel]).map(([category, policies]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(policies).map(([policy, limit]) => (
                      <div key={policy} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-sm text-gray-600">{policy}</span>
                        <span className="text-sm font-medium text-gray-900 bg-blue-50 px-3 py-1 rounded-full">
                          {limit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploader;