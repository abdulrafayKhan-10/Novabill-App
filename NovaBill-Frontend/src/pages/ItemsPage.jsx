import { useEffect, useState } from "react";
import { fetchItems, createItem, updateItem, deleteItem } from "../api/invoices";
import { useNotification } from "../context/NotificationContext";
import { Plus, Package, Edit, Trash2, X, Save } from "lucide-react";

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        unitPrice: 0,
        availableQuantity: 0,
    });

    const loadItems = async () => {
        try {
            const data = await fetchItems();
            setItems(data);
        } catch (error) {
            showNotification("Failed to load items: " + error.message, "error");
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                unitPrice: item.unitPrice,
                availableQuantity: item.availableQuantity,
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: "",
                description: "",
                unitPrice: 0,
                availableQuantity: 0,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "name" || name === "description" ? value : Number(value) || 0,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateItem(editingItem.id, formData);
                showNotification("Item updated successfully", "success");
            } else {
                await createItem(formData);
                showNotification("Item created successfully", "success");
            }
            closeModal();
            await loadItems();
        } catch (error) {
            showNotification("Failed to save item: " + error.message, "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteItem(id);
                showNotification("Item deleted successfully", "success");
                await loadItems();
            } catch (error) {
                showNotification("Failed to delete item: " + error.message, "error");
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        Item Management
                    </h1>
                    <p className="text-emerald-200 mt-2 text-sm font-medium">Manage your products and inventory</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-medium border border-slate-700 hover:border-slate-600"
                        onClick={() => window.location.href = "/"}
                    >
                        <Package size={20} />
                        Back to Invoices
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] transform hover:scale-105 font-medium"
                        onClick={() => openModal()}
                    >
                        <Plus size={20} />
                        New Item
                    </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <Package size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Total Products</h3>
                        <p className="text-3xl font-bold text-white">{items.length}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider text-right">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider text-right">Available QTY</th>
                                <th className="px-6 py-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No items found. Click "New Item" to create one.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors duration-200 group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-400">#{item.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate" title={item.description}>
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400 text-right">
                                            ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs border ${item.availableQuantity < 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                {item.availableQuantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors tooltip"
                                                    title="Edit Item"
                                                    onClick={() => openModal(item)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors tooltip"
                                                    title="Delete Item"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                <Package className="text-emerald-400" size={24} />
                                {editingItem ? "Edit Item" : "Create New Item"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="glass-input w-full p-3 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="e.g. Ergonomic Office Chair"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="glass-input w-full p-3 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                                    placeholder="Detailed description of the item..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.unitPrice || ""}
                                        onChange={handleInputChange}
                                        className="glass-input w-full p-3 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="availableQuantity"
                                        min="0"
                                        step="1"
                                        required
                                        value={formData.availableQuantity || ""}
                                        onChange={handleInputChange}
                                        className="glass-input w-full p-3 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-right"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 hover:text-white transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 font-medium"
                                >
                                    <Save size={18} />
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
