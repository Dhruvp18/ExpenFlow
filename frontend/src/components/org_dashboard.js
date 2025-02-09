import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Search,
  Download,
} from "lucide-react";
import { data } from "./dummydata";
import Navbar from "./Navbar";
import useInvoicesByCompany from "../hooks/useInvoicesByCompany";

const TabButton = ({ active, children, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
      active
        ? "bg-purple-600 text-white shadow-lg"
        : "bg-white text-purple-600 hover:bg-purple-50"
    }`}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

const StatusTag = ({ status }) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusIcons = {
    accepted: <CheckCircle className="h-3 w-3 mr-1" />,
    rejected: <XCircle className="h-3 w-3 mr-1" />,
  };

  const statusText = {
    pending: "Pending Review",
    accepted: "Accepted",
    rejected: "Rejected",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${statusStyles[status]}`}
    >
      {statusIcons[status]}
      {statusText[status]}
    </span>
  );
};

const ReceiptCard = ({ receipt, onView }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-purple-100"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-purple-900">
            {receipt?.name || "Unnamed Receipt"}
          </span>
          <StatusTag status={receipt?.status || "pending"} />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Date:{" "}
            {receipt?.bill?.date
              ? new Date(receipt.bill.date).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Amount: {receipt?.bill?.currency || ""}{" "}
            {receipt?.bill?.totalAmount || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Vendor: {receipt?.vendor?.name || "N/A"}
          </p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
        onClick={() => onView(receipt)}
      >
        <span>View Details</span>
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </div>
  </motion.div>
);

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 mx-4 max-h-[90vh] overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Orgdashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localInvoices, setLocalInvoices] = useState([]);

  const companyName = "company1";
  const {
    invoices = [],
    loading,
    error,
    mutate,
  } = useInvoicesByCompany(companyName);

  React.useEffect(() => {
    if (invoices.length > 0) {
      setLocalInvoices(invoices);
    }
  }, [invoices]);

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const handleReceiptAction = async (receipt, action) => {
    try {
      const newStatus = action === "accept" ? "accepted" : "rejected";
      const updatedReceipt = { ...receipt, status: newStatus };

      const response = await fetch(`/api/invoices/${receipt.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedReceipt),
      });

      if (!response.ok) {
        throw new Error("Failed to update receipt status");
      }

      const updatedInvoices = localInvoices.map((inv) =>
        inv.id === receipt.id ? updatedReceipt : inv
      );
      setLocalInvoices(updatedInvoices);

      await mutate();

      setIsModalOpen(false);
      setSelectedReceipt(null);
    } catch (error) {
      console.error("Failed to update receipt status:", error);
      alert(`Failed to ${action} receipt: ${error.message}`);
    }
  };

  const getActiveReceipts = () => {
    switch (activeTab) {
      case "pending":
        return localInvoices.filter((receipt) => receipt?.status === "pending");
      case "accepted":
        return localInvoices.filter(
          (receipt) => receipt?.status === "accepted"
        );
      case "rejected":
        return localInvoices.filter(
          (receipt) => receipt?.status === "rejected"
        );
      default:
        return [];
    }
  };

  const pendingReceipts = localInvoices.filter(
    (receipt) => receipt?.status === "pending"
  );
  const acceptedReceipts = localInvoices.filter(
    (receipt) => receipt?.status === "accepted"
  );
  const rejectedReceipts = localInvoices.filter(
    (receipt) => receipt?.status === "rejected"
  );

  const filteredReceipts = getActiveReceipts().filter((receipt) => {
    if (!receipt) return false;
    const receiptName = (receipt.name || "").toLowerCase();
    const vendorName = (receipt.vendor?.name || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      receiptName.includes(searchLower) || vendorName.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            Receipt Manager
          </h1>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
            >
              Pending Reviews ({pendingReceipts.length})
            </TabButton>
            <TabButton
              active={activeTab === "accepted"}
              onClick={() => setActiveTab("accepted")}
            >
              Accepted ({acceptedReceipts.length})
            </TabButton>
            <TabButton
              active={activeTab === "rejected"}
              onClick={() => setActiveTab("rejected")}
            >
              Rejected ({rejectedReceipts.length})
            </TabButton>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center space-x-2"
            onClick={() => {
              console.log("Downloading report...");
            }}
          >
            <Download className="h-5 w-5" />
            <span>Download Report</span>
          </motion.button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or vendor..."
            className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt?.bill?.invoice_number || Math.random()}
                receipt={receipt}
                onView={handleView}
              />
            ))}
          </AnimatePresence>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedReceipt && (
            <div className="space-y-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-purple-900">
                  Receipt Details
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-medium text-purple-900">
                      Customer: {selectedReceipt.name || "N/A"}
                    </p>
                    <StatusTag status={selectedReceipt.status || "pending"} />
                  </div>
                  <p className="text-gray-600">
                    Date:{" "}
                    {selectedReceipt.bill?.date
                      ? new Date(selectedReceipt.bill.date).toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Amount: {selectedReceipt.bill?.currency || ""}{" "}
                    {selectedReceipt.bill?.totalAmount || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Tax: {selectedReceipt.bill?.currency || ""}{" "}
                    {selectedReceipt.bill?.totalTax || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Payment Mode: {selectedReceipt.bill?.payment_mode || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-purple-900">Vendor Details:</p>
                  <p className="text-gray-600">
                    Name: {selectedReceipt.vendor?.name || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Category: {selectedReceipt.vendor?.category || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Registration:{" "}
                    {selectedReceipt.vendor?.registration_number || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-purple-900">Items:</p>
                  <div className="space-y-2">
                    {(selectedReceipt.items || []).map((item, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-900">
                          {item?.name || "Unnamed Item"}
                        </p>
                        <p className="text-gray-600">
                          Quantity: {item?.quantity || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Rate: {selectedReceipt.bill?.currency || ""}{" "}
                          {item?.rate || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Tax: {selectedReceipt.bill?.currency || ""}{" "}
                          {item?.tax || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Total: {selectedReceipt.bill?.currency || ""}{" "}
                          {item?.total || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedReceipt.status === "pending" && (
                  <div className="flex space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      onClick={() =>
                        handleReceiptAction(selectedReceipt, "accept")
                      }
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Accept Receipt</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      onClick={() =>
                        handleReceiptAction(selectedReceipt, "reject")
                      }
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Reject Receipt</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default Orgdashboard;