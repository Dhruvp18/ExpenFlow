import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Receipt, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  const data = [
    {
      "results": [
        {
          "data": {
            "bill": {
              "totalAmount": 114.99,
              "totalTax": 11.99,
              "invoice_number": "D271224-3723255",
              "date": "2024-12-15"
            },
            "vendor": {
              "name": "DS DROGHERIA SELLERS PRIVATE LIMITED"
            }
          },
          "fraud_flags": []
        },
        {
          "data": {
            "bill": {
              "totalAmount": 393.0,
              "totalTax": 26.2,
              "invoice_number": "533102007-004468",
              "date": "2020-02-19"
            },
            "vendor": {
              "name": "DMART KAKINADA"
            }
          },
          "fraud_flags": []
        },
        {
          "data": {
            "bill": {
              "totalAmount": 84.8,
              "totalTax": 8.0,
              "invoice_number": "",
              "date": "2018-01-01"
            },
            "vendor": {
              "name": ""
            }
          },
          "fraud_flags": ["Missing or invalid invoice number", "Missing or invalid vendor name", "Invoice date is out of sequence"]
        },
        {
          "data": {
            "bill": {
              "totalAmount": 393.0,
              "totalTax": 26.2,
              "invoice_number": "533102007-004468",
              "date": "2020-02-19"
            },
            "vendor": {
              "name": "DMART KAKINADA"
            }
          },
          "fraud_flags": ["Duplicate invoice number detected: 533102007-004468"]
        }
      ]
    }
  ];

  const chartData = data[0].results.map((item, index) => ({
    name: `R${index + 1}`,
    amount: item.data.bill.totalAmount,
    tax: item.data.bill.totalTax,
    flags: item.fraud_flags.length
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
  
  const totalFlags = data[0].results.reduce((acc, curr) => acc + curr.fraud_flags.length, 0);
  const totalAmount = data[0].results.reduce((acc, curr) => acc + curr.data.bill.totalAmount, 0);
  const totalTax = data[0].results.reduce((acc, curr) => acc + curr.data.bill.totalTax, 0);

  const pieData = [
    { name: 'Clean', value: data[0].results.filter(r => r.fraud_flags.length === 0).length },
    { name: 'Flagged', value: data[0].results.filter(r => r.fraud_flags.length > 0).length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Receipt Analysis Dashboard</h1>
          <div className="flex space-x-4">
            <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center">
              <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-gray-800">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center">
              <Receipt className="h-5 w-5 text-emerald-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Tax</p>
                <p className="text-lg font-semibold text-gray-800">${totalTax.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Flags</p>
                <p className="text-lg font-semibold text-gray-800">{totalFlags}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Amount Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Amount Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tax Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Tax Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="tax" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fraud Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Fraud Flags</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flag Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Flag Details</h2>
            <div className="h-64 overflow-auto">
              {data[0].results.map((receipt, index) => (
                receipt.fraud_flags.length > 0 && (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Receipt {index + 1}</span>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-500">{receipt.fraud_flags.length}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {receipt.fraud_flags.map((flag, flagIndex) => (
                        <p key={flagIndex} className="text-sm text-gray-600">• {flag}</p>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;