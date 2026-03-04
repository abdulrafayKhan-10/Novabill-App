import { useEffect, useState } from "react";
import { fetchInvoices, deleteInvoice, fetchInvoice } from "../api/invoices";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { Plus, FileText, DollarSign, Wallet, Trash2, Edit, Download } from "lucide-react";
import { generateInvoicePDF } from "../utils/pdfGenerator";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices({ invoiceItems: false });
      setInvoices(data);
    } catch (error) {
      showNotification("Failed to load invoices: " + error.message, "error");
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDownload = async (id) => {
    try {
      showNotification("Generating PDF...", "info");
      const fullInvoice = await fetchInvoice(id);
      if (!fullInvoice) throw new Error("Could not fetch invoice details");

      generateInvoicePDF(fullInvoice);
      showNotification("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation failed", error);
      showNotification("Failed to generate PDF", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        showNotification("Invoice deleted successfully");
        await loadInvoices(); // Reload the list
      } catch (error) {
        showNotification("Failed to delete invoice: " + error.message, "error");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            NovaBill Invoices
          </h1>
          <p className="text-indigo-200 mt-2 text-sm font-medium">Manage and track your premium billing flow</p>
        </div>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-medium border border-slate-700 hover:border-slate-600"
            onClick={() => navigate("/items")}
          >
            <Wallet size={20} />
            Manage Items
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] transform hover:scale-105 font-medium"
            onClick={() => navigate("/invoices/new")}
          >
            <Plus size={20} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Invoices</h3>
            <p className="text-3xl font-bold text-white">{invoices.length}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <DollarSign size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Amount</h3>
            <p className="text-3xl font-bold text-white">
              ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Wallet size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Paid</h3>
            <p className="text-3xl font-bold text-white">
              ${invoices.reduce((sum, inv) => sum + inv.paidAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-rose-500/20 rounded-lg text-rose-400">
            <DollarSign size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Balance</h3>
            <p className="text-3xl font-bold text-white">
              ${invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider">Due</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider text-right">Paid</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider text-right">Balance</th>
                <th className="px-6 py-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No invoices found. Click "New Invoice" to create one.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const balance = invoice.totalAmount - invoice.paidAmount;
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-800/40 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        <span className="bg-slate-700/50 px-3 py-1 rounded-md border border-slate-600 group-hover:border-indigo-500/50 transition-colors">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(invoice.invoiceDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${new Date(invoice.dueDate) < new Date() && balance > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-700/30 text-slate-300 border-slate-600/30'}`}>
                          {new Date(invoice.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">
                        ${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400 text-right">
                        ${invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                        <span className={balance > 0 ? "text-rose-400" : "text-emerald-400"}>
                          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-3">
                          <button
                            className="p-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300 transition-colors tooltip"
                            title="Download PDF"
                            onClick={() => handleDownload(invoice.id)}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors tooltip"
                            title="Edit Invoice"
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors tooltip"
                            title="Delete Invoice"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
