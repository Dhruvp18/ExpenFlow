import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Receipt, AlertCircle, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

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

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171'];
  
  const totalFlags = data[0].results.reduce((acc, curr) => acc + curr.fraud_flags.length, 0);
  const totalAmount = data[0].results.reduce((acc, curr) => acc + curr.data.bill.totalAmount, 0);
  const totalTax = data[0].results.reduce((acc, curr) => acc + curr.data.bill.totalTax, 0);

  const pieData = [
    { name: 'Clean', value: data[0].results.filter(r => r.fraud_flags.length === 0).length },
    { name: 'Flagged', value: data[0].results.filter(r => r.fraud_flags.length > 0).length }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 p-4 rounded-xl shadow-lg">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50">
      <Navbar />

      {/* Charts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-3 gap-6 pb-8">
            {[
              { title: 'Total Amount', value: `$${totalAmount.toFixed(2)}`, Icon: TrendingUp, color: 'indigo' },
              { title: 'Total Tax', value: `$${totalTax.toFixed(2)}`, Icon: Receipt, color: 'emerald' },
              { title: 'Total Flags', value: totalFlags, Icon: AlertCircle, color: 'red' }
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 border border-${item.color}-100 shadow-sm 
                transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-${item.color}-600 mb-1`}>{item.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                  </div>
                  <div className={`bg-${item.color}-100 p-3 rounded-xl 
                    transform transition-all duration-300 
                    ${hoveredCard === index ? 'scale-110 rotate-6' : ''}`}>
                    <item.Icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-8">
          {/* Amount Trend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Amount Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#818cf8" 
                    strokeWidth={3}
                    fill="url(#amountGradient)"
                    dot={{ fill: '#818cf8', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Flag Details</h2>
            <div className="h-72 overflow-auto space-y-4 pr-2">
              {data[0].results.map((receipt, index) => (
                receipt.fraud_flags.length > 0 && (
                  <div 
                    key={index} 
                    className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100
                      transform transition-all duration-300 hover:scale-102 hover:bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-700">Receipt {index + 1}</span>
                      <div className="flex items-center bg-red-100 px-3 py-1 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-red-600">{receipt.fraud_flags.length}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {receipt.fraud_flags.map((flag, flagIndex) => (
                        <div key={flagIndex} className="flex items-start space-x-2 group">
                          <div className="min-w-2 h-2 w-2 rounded-full bg-red-400 mt-2 
                            group-hover:scale-125 transition-transform duration-300" />
                          <p className="text-sm text-gray-600">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Fraud Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fraud Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tax Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="tax" 
                    fill="url(#taxGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;