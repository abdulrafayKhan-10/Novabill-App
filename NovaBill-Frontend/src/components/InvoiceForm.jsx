import { useEffect, useState, useRef } from "react";
import {
  fetchInvoice,
  createInvoice,
  updateInvoice,
  fetchItems,
} from "../api/invoices";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { ArrowLeft, Save, Download, Plus, Trash2 } from "lucide-react";
// Utility functions for date conversion
function toDateInputValue(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
}

function toISOStringFromInput(dateStr) {
  if (!dateStr) return "";
  if (dateStr.length > 10) return dateStr;
  return new Date(dateStr).toISOString();
}

const todayStr = toDateInputValue(new Date());

export default function InvoiceForm({ mode, invoiceId }) {
  const [form, setForm] = useState({
    invoiceDate: todayStr,
    dueDate: todayStr,
    paidAmount: 0,
    items: [],
    notes: "",
  });
  const [allItems, setAllItems] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const pdfRef = useRef();

  const handleDownloadPdf = () => {
    try {
      // Map names directly to item array before passing to PDF so the table is readable
      const enrichedFormData = {
        ...form,
        items: form.items.map(formItem => {
          const foundItem = allItems.find(i => i.id.toString() === formItem.itemId);
          return {
            ...formItem,
            name: foundItem ? foundItem.name : "Unknown Item"
          };
        })
      };

      generateInvoicePDF(enrichedFormData);
      showNotification("PDF downloaded successfully!", "success");
    } catch (err) {
      console.error("PDF generation failed", err);
      showNotification("Failed to generate PDF", "error");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsResponse, invoiceResponse] = await Promise.all([
          fetchItems(),
          mode === "edit" ? fetchInvoice(invoiceId) : Promise.resolve(null),
        ]);

        setAllItems(itemsResponse);

        if (mode === "edit" && invoiceResponse) {
          // Format dates to YYYY-MM-DD
          const formatDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          };

          // Map invoice items with their full details
          const mappedItems = invoiceResponse.items.map((item) => {
            const selectedItem = itemsResponse.find(
              (i) => i.id === item.itemId
            );
            return {
              id: item.id,
              itemId: item.itemId.toString(),
              description: selectedItem
                ? selectedItem.description
                : item.description || "",
              unitPrice: selectedItem
                ? selectedItem.unitPrice
                : item.unitPrice || 0,
              quantity: item.quantity || 1,
            };
          });

          const formData = {
            invoiceNumber: invoiceResponse.invoiceNumber,
            invoiceDate: formatDate(invoiceResponse.invoiceDate),
            dueDate: formatDate(invoiceResponse.dueDate),
            items: mappedItems,
            paidAmount: invoiceResponse.paidAmount || 0,
            notes: invoiceResponse.notes || "",
          };

          setForm(formData);
          setOriginalForm(JSON.stringify(formData));
          setIsDirty(false);
        } else {
          // Set default values for create mode
          const today = new Date().toISOString().split("T")[0];
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const dueDate = nextMonth.toISOString().split("T")[0];

          const formData = {
            invoiceNumber: "", // Empty in create mode, will show "Auto"
            invoiceDate: today,
            dueDate: dueDate,
            items: [
              {
                itemId: "",
                description: "",
                unitPrice: 0,
                quantity: 1,
              },
            ],
            paidAmount: 0,
            notes: "",
          };

          setForm(formData);
          setOriginalForm(JSON.stringify(formData));
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showNotification("Failed to load data. Please try again.", "error");
      }
    };

    loadData();
  }, [mode, invoiceId]);

  // Track form changes
  useEffect(() => {
    if (originalForm) {
      const currentForm = JSON.stringify(form);
      setIsDirty(currentForm !== originalForm);
    }
  }, [form, originalForm]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...form.items];

    if (name === "itemId") {
      const selectedItem = allItems.find(
        (item) => item.id.toString() === value
      );
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: value,
          description: selectedItem.description || "",
          unitPrice: selectedItem.unitPrice || 0,
          quantity: updatedItems[index].quantity || 1,
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
    }

    setForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a loading state to prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!form.items || form.items.length === 0) {
      showNotification("Please add at least one item to the invoice", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate amounts for each item
      const detailedItems = form.items.map((i) => {
        const selected = allItems.find((item) => item.id.toString() === i.itemId);
        if (!selected) {
          throw new Error(`Item with ID ${i.itemId} not found`);
        }
        const unitPrice = selected.unitPrice;
        const quantity = Number(i.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for item ${selected.name}`);
        }
        const amount = unitPrice * quantity;

        return {
          id: i.id || 0,
          invoiceId: mode === "edit" ? Number(invoiceId) : 0,
          itemId: Number(i.itemId),
          quantity,
          unitPrice,
          amount,
        };
      });

      // Calculate total amount
      const totalAmount = detailedItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const paidAmount = Number(form.paidAmount) || 0;

      const payload = {
        id: mode === "edit" ? Number(invoiceId) : 0,
        invoiceNumber: mode === "edit" ? form.invoiceNumber : "000000",
        invoiceDate: toISOStringFromInput(form.invoiceDate),
        dueDate: toISOStringFromInput(form.dueDate),
        totalAmount,
        paidAmount,
        items: detailedItems,
      };

      const savePromise =
        mode === "edit"
          ? updateInvoice(invoiceId, payload)
          : createInvoice(payload);

      savePromise
        .then((data) => {
          showNotification(
            `Invoice ${mode === "edit" ? "updated" : "created"} successfully`
          );
          navigate("/");
        })
        .catch((error) => {
          console.error("Error saving invoice:", error);
          showNotification(
            "Failed to save invoice: " + (error.message || "Unknown error"),
            "error"
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (error) {
      console.error("Error preparing invoice data:", error);
      showNotification(
        "Failed to prepare invoice data: " + (error.message || "Unknown error"),
        "error"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/60 backdrop-blur-md p-6 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-700/50 text-slate-300 hover:text-white hover:bg-indigo-500/20 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {mode === "create" ? "Create New Invoice" : `Edit Invoice #${form.invoiceNumber}`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-indigo-300 hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm font-medium"
              >
                <Download size={18} />
                Download PDF
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isDirty || isSubmitting}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-medium transition-all shadow-lg ${isDirty && !isSubmitting
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105"
                  : "bg-slate-600/50 cursor-not-allowed opacity-70"
                }`}
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        </div>

        {/* Form Body - Wrap with ref for PDF generation */}
        <div ref={pdfRef} className="p-8 space-y-8 bg-[#0f172a]/80" style={{ minHeight: '600px' }}>

          {/* Top Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                Invoice Number
              </label>
              <div className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-300 font-mono">
                {form.invoiceNumber || "AUTO-GENERATED"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={form.invoiceDate}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl transition-all"
                required
                min={form.invoiceDate}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-700/50 bg-slate-800/50">
              <h2 className="text-lg font-semibold text-white">Line Items</h2>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    items: [...form.items, { itemId: "", quantity: 1, description: "", unitPrice: 0 }],
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right w-24">Qty</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {form.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <select
                          name="itemId"
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, e)}
                          className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                          required
                        >
                          <option value="" className="bg-slate-800 text-slate-400">Select Item</option>
                          {allItems
                            .filter(
                              (i) =>
                                !form.items.some(
                                  (existingItem, idx) =>
                                    idx !== index && existingItem.itemId === i.id.toString()
                                )
                            )
                            .map((i) => (
                              <option key={i.id} value={i.id} className="bg-slate-800 text-white">
                                {i.name}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full px-3 py-2 bg-slate-800/40 text-slate-300 rounded-lg text-sm border border-transparent">
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full px-3 py-2 bg-slate-800/40 text-emerald-400 rounded-lg text-sm text-right font-medium border border-transparent">
                          ${(item.unitPrice || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          min="1"
                          className="glass-input w-full px-3 py-2 rounded-lg text-sm text-right"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-white">
                        ${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                items: form.items.filter((_, i) => i !== index),
                              });
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors tooltip"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                rows="5"
                className="glass-input w-full px-4 py-3 rounded-xl transition-all resize-none"
                placeholder="Payment instructions, terms and conditions, or thank you message..."
              />
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4 shadow-inner">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>

              <div className="flex justify-between items-center text-slate-300">
                <span>Subtotal ({form.items.length} items)</span>
                <span className="font-medium text-white">
                  ${form.items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                <span className="text-slate-300 font-medium">Paid Amount</span>
                <div className="flex items-center text-emerald-400">
                  <span className="mr-1">$</span>
                  <input
                    type="number"
                    name="paidAmount"
                    value={form.paidAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-24 bg-transparent border-b border-emerald-500/30 focus:border-emerald-500 outline-none text-right font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 flex justify-between items-end">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Amount Due</span>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  ${Math.max(0, form.items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0) - Number(form.paidAmount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
