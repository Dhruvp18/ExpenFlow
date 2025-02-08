import axios from "axios";
import Navbar from "./Navbar";
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Camera, Trash2, ChevronDown } from "lucide-react";
import { addInvoice } from "../services/api";
import { useAuth0 } from "@auth0/auth0-react";

const ReceiptUploader = () => {
  const { user } = useAuth0();
  const userData = {
    name: user?.name,
    email: user?.email,
  };
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Executive Level");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [fileCategories, setFileCategories] = useState({});
  const fileInputRef = useRef(null);
  const [company, setCompany] = useState('');

  const policyData = {
    "Executive Level": {
      "Travel Expenses": {
        "Business Trips": "₹4,00,000 - ₹16,00,000 per month",
        "Local Transportation": "₹30,000 - ₹60,000 per month",
        "Mileage Reimbursement": "₹45000 per month",
        "Parking Fees & Tolls": "Fully covered",
      },
      Accommodation: {
        "Hotel Stays": "₹25,000 - ₹1,25,000 per night",
        "Rental Allowance": "₹2,50,000 - ₹6,00,000 per month",
        "Meals During Travel": "₹8,000 - ₹40,000 per day",
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Unlimited (as per requirement)",
        "Home Office Setup": "Up to ₹8,00,000",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹4,00,000 per month",
        "Team Outings": "Up to ₹1,60,000 per month",
        "Daily Meal Allowance": "₹8,000 - ₹24,000 per day",
      },
    },
    "Senior Management": {
      "Travel Expenses": {
        "Business Trips": "₹1,50,000 - ₹4,00,000 per month",
        "Local Transportation": "₹20,000 - ₹25,000 per month",
        "Mileage Reimbursement": "₹30000 per month",
        "Parking Fees & Tolls": "Up to ₹10,000 per month",
      },
      Accommodation: {
        "Hotel Stays": "₹16,000 - ₹80,000 per night",
        "Rental Allowance": "₹1,00,000 - ₹1,50,000 per month",
        "Meals During Travel": "₹6,000 - ₹24,000 per day",
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹4,00,000 per year",
        "Home Office Setup": "Up to ₹4,00,000",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹2,40,000 per month",
        "Team Outings": "Up to ₹1,20,000 per month",
      },
    },
    "Middle Management": {
      "Travel Expenses": {
        "Business Trips": "₹1,60,000 - ₹5,60,000 per month",
        "Local Transportation": "₹16,000 - ₹20,000 per month",
        "Mileage Reimbursement": "₹25000 per month",
      },
      Accommodation: {
        "Rental Allowance": "₹80,000 - ₹90,000 per month",
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹2,40,000 per year",
        "Home Office Setup": "Up to ₹2,40,000",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹1,60,000 per event",
      },
    },
    "Lower Management": {
      "Travel Expenses": {
        "Business Trips": "₹80,000 - ₹4,00,000 per trip",
        "Local Transportation": "₹12,000 - ₹15,000 per month",
        "Mileage Reimbursement": "₹20000 per month",
      },
      Accommodation: {
        "Rental Allowance": "₹40,000 - ₹50,000 per month",
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹1,60,000 per year",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
    },
    "Team Leads & Supervisors": {
      "Travel Expenses": {
        "Business Trips": "₹40,000 - ₹2,40,000 per trip",
        "Local Transportation": "₹8,000 - ₹10,000 per month",
        "Mileage Reimbursement": "₹15000 per month",
      },
      Accommodation: {
        "Rental Allowance": "₹30,000 - ₹40,000 per month",
      },
      "Meals and Entertainment": {
        "Client Meetings": "Up to ₹80,000 per event",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
    },
    "Staff & Employees": {
      "Travel Expenses": {
        "Business Trips": "₹24,000 - ₹1,60,000 per trip",
        "Local Transportation": "Up to ₹5,000 per month",
        "Mileage Reimbursement": "₹10000 per month",
      },
      Accommodation: {
        "Rental Allowance": "₹15,000 - ₹30,000 per month",
      },
      "Office Supplies and Equipment": {
        "Work Tools": "Up to ₹80,000 per year",
      },
      "Communication Expenses": {
        "Mobile/Internet Bills": "Fully covered",
      },
    },
  };

  const categories = {
    "Travel Expenses": [
      "Business Trips",
      "Local Transportation",
      "Mileage Reimbursement",
      "Parking Fees & Tolls",
    ],
    Accommodation: ["Hotel Stays", "Short-Term Rentals", "Meals During Travel"],
    "Office Supplies and Equipment": ["Work Tools", "Home Office Setup"],
    "Communication Expenses": ["Mobile/Internet Bills"],
    "Meals and Entertainment": [
      "Client Meetings",
      "Team Outings",
      "Daily Meal Allowance",
    ],
    Miscellaneous: ["Other"],
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
    setSelectedFiles((prev) => [...prev, ...files]);
  };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("Selected Level:", selectedLevel);
    console.log("Policy Data:", policyData[selectedLevel]);
  }, [selectedLevel]);

  const CategoryDropdown = ({ fileIndex }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleCategorySelect = (mainCategory, subCategory) => {
      setFileCategories((prev) => ({
        ...prev,
        [fileIndex]: { mainCategory, subCategory },
      }));
      setIsOpen(false);
    };
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-56 px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <span className="truncate">
            {fileCategories[fileIndex]
              ? `${fileCategories[fileIndex].subCategory}`
              : "Select Category"}
          </span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-xl border border-purple-200">
            {Object.entries(categories).map(([mainCategory, subCategories]) => (
              <div key={mainCategory} className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-purple-500 bg-purple-50">
                  {mainCategory}
                </div>
                {subCategories.map((subCategory) => (
                  <button
                    key={subCategory}
                    onClick={() =>
                      handleCategorySelect(mainCategory, subCategory)
                    }
                    className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between group"
                  >
                    <span>{subCategory}</span>
                    {fileCategories[fileIndex]?.subCategory === subCategory && (
                      <span className="text-purple-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const renderFilePreview = (file, index) => {
    const isImage = file.type.startsWith("image/");
    return (
      <div
        key={index}
        className="group relative flex items-center p-4 mb-3 bg-white rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex-1 flex items-center">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-purple-50 flex items-center justify-center">
            {isImage ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-8 h-8 text-purple-500" />
            )}
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-purple-800 truncate max-w-xs">
              {file.name.length > 15
                ? `${file.name.slice(0, 15)}...`
                : file.name}
            </p>
            <p className="text-xs text-purple-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="ml-4">
            <CategoryDropdown fileIndex={index} />
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
            setFileCategories((prev) => {
              const newCategories = { ...prev };
              delete newCategories[index];
              return newCategories;
            });
          }}
          className="ml-4 p-2 hover:bg-red-50 rounded-full transition-colors duration-200 group-hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadResults(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("file", file);
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
                    const fileCategory = fileCategories[result.index] || {};
                    const invoiceData = {
                        ...result.data,
                        category: fileCategory.mainCategory || 'Miscellaneous',
                        subcategory: fileCategory.subCategory || 'Other',
                        employeeLevel: selectedLevel,
                        status: 'pending',
                        company: company || 'company1'
                    };
                    
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
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label 
            htmlFor="company" 
            className="block text-sm font-medium text-gray-700 transition duration-300 ease-in-out hover:text-blue-600"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md transition duration-300 ease-in-out placeholder:text-gray-400"
            placeholder="Enter company name"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-6">
              Upload Receipts
            </h2>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-purple-500 bg-purple-50"
                  : "border-purple-200 hover:border-purple-400 bg-purple-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50 opacity-50 rounded-xl" />
              <div className="relative">
                <Upload className="mx-auto h-16 w-16 text-purple-500 mb-4" />
                <p className="text-lg font-medium text-purple-900 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-purple-500">
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
              {selectedFiles.map((file, index) =>
                renderFilePreview(file, index)
              )}
            </div>
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl">
                {uploadError}
              </div>
            )}
            {uploadResults && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-purple-800 mb-6">
                  Processed Receipts
                </h3>

                <div
                  className="max-h-[400px] overflow-y-auto border border-purple-200 rounded-lg shadow-md p-4"
                  style={{ maxHeight: "400px" }}
                >
                  {uploadResults.map((result, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-white border border-purple-100 rounded-lg"
                    >
                      <h4 className="text-lg font-semibold text-purple-600">
                        {result.filename}
                      </h4>
                      <div className="mt-2">
                        <h5 className="font-medium text-purple-700">
                          Vendor Information:
                        </h5>
                        <ul className="text-sm text-purple-600">
                          <li>Name: {result.data.vendor.name || "N/A"}</li>
                          <li>
                            Category: {result.data.vendor.category || "N/A"}
                          </li>
                          <li>
                            Registration Number:{" "}
                            {result.data.vendor.registration_number || "N/A"}
                          </li>
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h5 className="font-medium text-purple-700">
                          Bill Details:
                        </h5>
                        <ul className="text-sm text-purple-600">
                          <li>Date: {result.data.bill.date || "N/A"}</li>
                          <li>
                            Invoice Number:{" "}
                            {result.data.bill.invoice_number || "N/A"}
                          </li>
                          <li>
                            Currency: {result.data.bill.currency || "N/A"}
                          </li>
                          <li>
                            Payment Mode:{" "}
                            {result.data.bill.payment_mode || "N/A"}
                          </li>
                          <li>
                            Total Amount:{" "}
                            {result.data.bill.totalAmount
                              ? `₹${result.data.bill.totalAmount.toFixed(2)}`
                              : "N/A"}
                          </li>
                          <li>
                            Total Tax:{" "}
                            {result.data.bill.totalTax
                              ? `₹${result.data.bill.totalTax.toFixed(2)}`
                              : "N/A"}
                          </li>
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h5 className="font-medium text-purple-700">Items:</h5>
                        {result.data.items.length > 0 ? (
                          result.data.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="ml-4 p-2 bg-purple-50 rounded-lg"
                            >
                              <p className="font-medium text-purple-800">
                                Item {idx + 1}: {item.name || "Unnamed Item"}
                              </p>
                              <ul className="text-sm text-purple-600">
                                <li>Quantity: {item.quantity || "N/A"}</li>
                                <li>
                                  Rate:{" "}
                                  {item.rate
                                    ? `₹${item.rate.toFixed(2)}`
                                    : "N/A"}
                                </li>
                                <li>
                                  Tax:{" "}
                                  {item.tax ? `₹${item.tax.toFixed(2)}` : "N/A"}
                                </li>
                                <li>
                                  Discount:{" "}
                                  {item.discount
                                    ? `₹${item.discount.toFixed(2)}`
                                    : "N/A"}
                                </li>
                                <li>
                                  Total:{" "}
                                  {item.total
                                    ? `₹${item.total.toFixed(2)}`
                                    : "N/A"}
                                </li>
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-purple-500 italic">
                            No items found in this receipt.
                          </p>
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
                    ? "bg-purple-100 text-purple-400"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} Files`}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-6">
              Policy Details for {selectedLevel}
            </h2>
            <div className="space-y-6">
              {policyData[selectedLevel] &&
                Object.entries(policyData[selectedLevel]).map(
                  ([category, policies]) => (
                    <div key={category} className="p-4 bg-purple-50 rounded-xl">
                      <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(policies).map(([policy, limit]) => (
                          <div
                            key={policy}
                            className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <span className="text-sm text-purple-600">
                              {policy}
                            </span>
                            <span className="text-sm font-medium text-purple-900 bg-purple-50 px-3 py-1 rounded-full">
                              {limit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploader;