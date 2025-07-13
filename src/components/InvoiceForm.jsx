import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, FileText, Printer, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';

function InvoiceForm() {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    type: 'quotation',
    customer: '',
    items: [{ product: '', quantity: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [productRes, invoiceRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/invoices/sales_invoice', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProducts(productRes.data);
        setInvoices(invoiceRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch products or invoices');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { product: '', quantity: 0 }] });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === 'quantity' ? parseInt(value, 10) || 0 : value;
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    return form.items.reduce((total, item) => {
      const product = products.find((p) => p._id === item.product);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const isFormValid = () => {
    if (!form.customer.trim()) {
      return false; // Customer name is empty
    }
    if (form.items.length === 0) {
      return false; // No items
    }
    return form.items.every((item) => {
      const product = products.find((p) => p._id === item.product);
      const quantity = parseInt(item.quantity, 10);
      if (!product || !item.product || isNaN(quantity) || quantity <= 0) {
        return false; // Invalid product or quantity
      }
      if (form.type === 'sales_invoice' && quantity > product.stock) {
        return false; // Insufficient stock for sales invoice
      }
      return true;
    });
  };

  const getFormErrors = () => {
    const errors = [];
    if (!form.customer.trim()) {
      errors.push('Customer name is required');
    }
    if (form.items.length === 0) {
      errors.push('At least one item is required');
    }
    form.items.forEach((item, index) => {
      const product = products.find((p) => p._id === item.product);
      const quantity = parseInt(item.quantity, 10);
      if (!item.product || !product) {
        errors.push(`Item ${index + 1}: Select a valid product`);
      }
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be a positive number`);
      }
      if (form.type === 'sales_invoice' && product && quantity > product.stock) {
        errors.push(`Item ${index + 1}: Insufficient stock for ${product.name} (${product.stock} available)`);
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const errors = getFormErrors();
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      const token = localStorage.getItem('token');
      const total = calculateTotal();
      const payload = {
        type: form.type,
        customer: form.customer.trim(),
        products: form.items.map((item) => item.product).filter((id) => id), // Remove empty IDs
        quantities: form.items.map((item) => parseInt(item.quantity, 10)).filter((q, i) => form.items[i].product), // Match products
        total,
      };
      console.log('Submitting invoice payload:', payload);
      await axios.post('http://localhost:5000/api/invoices', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh products and invoices
      const [productRes, invoiceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/invoices/sales_invoice', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(productRes.data);
      setInvoices(invoiceRes.data);
      setForm({ type: 'quotation', customer: '', items: [{ product: '', quantity: 0 }] });
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error.response?.data?.error || `Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Invoice Management</h1>
          <p className="text-gray-400">Create and manage your invoices with ease</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Invoice Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                >
                  <option value="quotation">Quotation</option>
                  <option value="sales_order">Sales Order</option>
                  <option value="sales_invoice">Sales Invoice</option>
                  <option value="purchase_invoice">Purchase Invoice</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300 block">Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                {form.items.map((item, index) => {
                  const product = products.find((p) => p._id === item.product);
                  return (
                    <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-400 block mb-1">Product</label>
                          <select
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} (Stock: {product.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="text-xs font-medium text-gray-400 block mb-1">Quantity</label>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                            min="0"
                          />
                        </div>
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {form.type === 'sales_invoice' && product && item.quantity > product.stock && (
                        <p className="text-red-400 text-xs mt-1">Insufficient stock: {product.stock} available</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-300">Total Amount:</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Invoice
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-slate-700/50 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-medium border border-slate-600 transition-all duration-300 flex items-center"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div ref={componentRef}>
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-emerald-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Invoice Preview</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white font-medium">{form.customer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white font-medium capitalize">{form.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border border-slate-600/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium">Product</th>
                      <th className="px-4 py-3 text-right text-gray-300 font-medium">Qty</th>
                      <th className="px-4 py-3 text-right text-gray-300 font-medium">Price</th>
                      <th className="px-4 py-3 text-right text-gray-300 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, index) => {
                      const product = products.find((p) => p._id === item.product);
                      return (
                        <tr key={index} className="border-t border-slate-600/30">
                          <td className="px-4 py-3 text-white">{product ? product.name : '-'}</td>
                          <td className="px-4 py-3 text-right text-white">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-white">₹{product ? product.price.toLocaleString() : '-'}</td>
                          <td className="px-4 py-3 text-right text-white">₹{product ? (product.price * item.quantity).toLocaleString() : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-300">Total:</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Invoice History</h2>
          </div>

          <div className="border border-slate-600/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Type</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Customer</th>
                  <th className="px-6 py-4 text-right text-gray-300 font-medium">Total</th>
                  <th className="px-6 py-4 text-right text-gray-300 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 text-white capitalize">{invoice.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-white">{invoice.customer}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${invoice.type === 'purchase_invoice' ? 'text-red-400' : 'text-emerald-400'}`}>
                      ₹{invoice.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">{new Date(invoice.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InvoiceForm;