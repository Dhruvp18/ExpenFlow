import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Receipt, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Navbar from './Navbar';
import useFetchUserInvoices from '../hooks/useFetchUserInvoices';

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const { invoices, loading, error } = useFetchUserInvoices();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error loading data</div>;
  if (!invoices?.length) return <div className="flex items-center justify-center min-h-screen">No invoices found</div>;
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.bill.totalAmount, 0);
  const acceptedAmount = invoices
    .filter(invoice => invoice.status === 'accepted')
    .reduce((acc, curr) => acc + curr.bill.totalAmount, 0);
  const totalItems = invoices.reduce((acc, curr) => acc + curr.total_items, 0);
  // For the area chart - last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const chartData = invoices
    .filter(invoice => new Date(invoice.createdAt) >= thirtyDaysAgo)
    .map(invoice => ({
      name: new Date(invoice.createdAt).toLocaleDateString(),
      amount: invoice.bill.totalAmount
    }));
  // For the pie chart - status distribution
  const statusCounts = invoices.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));
  const COLORS = ['#818cf8', '#34d399', '#f87171'];
  const STATUS_COLORS = {
    pending: 'yellow',
    accepted: 'green',
    rejected: 'red'
  };
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };
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
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-3 gap-6 pb-8">
          {[
            {
              title: "Total Amount",
              value: `₹${totalAmount.toFixed(2)}`,
              Icon: TrendingUp,
              color: "blue",
            },
            {
              title: "Accepted Amount",
              value: `₹${acceptedAmount.toFixed(2)}`,
              Icon: Receipt,
              color: "emerald",
            },
            {
              title: "Total Items",
              value: totalItems,
              Icon: AlertCircle,
              color: "gray",
            },
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
                  <p className={`text-sm font-medium text-${item.color}-600 mb-1`}>
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
                <div
                  className={`bg-${item.color}-100 p-3 rounded-xl 
                    transform transition-all duration-300 
                    ${hoveredCard === index ? "scale-110 rotate-6" : ""}`}
                >
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
          {/* Status Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h2>
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
          {/* Receipt History */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6
            hover:shadow-xl transition-all duration-300 hover:bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Receipts</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices
                    .filter(invoice => new Date(invoice.createdAt) >= thirtyDaysAgo)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((invoice, index) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.vendor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{invoice.bill.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className={`ml-2 text-sm text-${STATUS_COLORS[invoice.status]}-600 capitalize`}>
                              {invoice.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;