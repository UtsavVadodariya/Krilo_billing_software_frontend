import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Printer, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

function InvoiceForm() {
  const [formData, setFormData] = useState({
    customer: '',
    type: 'sales_invoice',
    products: [' '],
    quantities: [1],
    total: 0,
    showPaymentFields: true,
    totalReceived: '',
  });
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products.');
      }
    };

    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/invoices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch invoice history.');
      }
    };

    fetchProducts();
    fetchInvoices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const parsedTotalReceived = formData.showPaymentFields ? parseFloat(formData.totalReceived) || 0 : null;
      
      // Validate totalReceived
      if (formData.showPaymentFields) {
        if (parsedTotalReceived < 0) {
          throw new Error('Total received cannot be negative');
        }
        if (parsedTotalReceived > formData.total) {
          throw new Error('Total received cannot exceed total amount');
        }
      }

      const payload = {
        customer: formData.customer,
        type: formData.type,
        products: formData.products,
        quantities: formData.quantities,
        total: formData.total,
        totalReceived: parsedTotalReceived,
      };
      console.log('Sending invoice payload:', payload);
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const data = await response.json();
      console.log('Invoice created:', data);
      setInvoices([...invoices, data]);
      setFormData({
        customer: '',
        type: 'sales_invoice',
        products: [],
        quantities: [],
        total: 0,
        showPaymentFields: false,
        totalReceived: '',
      });
    } catch (err) {
      console.error('Error creating invoice:', err.message);
      setError(err.message || 'Failed to create invoice.');
    }
    setLoading(false);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    const newQuantities = [...formData.quantities];
    if (field === 'product') {
      newProducts[index] = value;
    } else {
      newQuantities[index] = parseInt(value) || 0;
    }
    const total = newProducts.reduce((sum, prodId, i) => {
      const product = products.find((p) => p._id === prodId);
      return sum + (product ? product.price * (newQuantities[i] || 0) : 0);
    }, 0);
    setFormData({ ...formData, products: newProducts, quantities: newQuantities, total });
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, ''],
      quantities: [...formData.quantities, 0],
    });
  };

  const removeProductField = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const newQuantities = formData.quantities.filter((_, i) => i !== index);
    const total = newProducts.reduce((sum, prodId, i) => {
      const product = products.find((p) => p._id === prodId);
      return sum + (product ? product.price * (newQuantities[i] || 0) : 0);
    }, 0);
    setFormData({ ...formData, products: newProducts, quantities: newQuantities, total });
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
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
          {/* Form Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Invoice Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                >
                  <option value="sales_invoice">Sales Invoice</option>
                  <option value="purchase_invoice">Purchase Invoice</option>
                  <option value="quotation">Quotation</option>
                  <option value="sales_order">Sales Order</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300 block">Products</label>
                  <button
                    type="button"
                    onClick={addProductField}
                    className="flex items-center px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Product
                  </button>
                </div>

                {formData.products.map((_, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-400 block mb-1">Product</label>
                        <select
                          value={formData.products[index] || ''}
                          onChange={(e) => handleProductChange(index, 'product', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="text-xs font-medium text-gray-400 block mb-1">Quantity</label>
                        <input
                          type="number"
                          value={formData.quantities[index] || ''}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                          min="0"
                          required
                        />
                      </div>
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductField(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                

                {formData.showPaymentFields && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Total Received</label>
                    <input
                      type="number"
                      value={formData.totalReceived}
                      onChange={(e) => setFormData({ ...formData, totalReceived: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                      placeholder="Enter amount received"
                      min="0"
                      max={formData.total}
                    />
                  </div>
                )}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-300">Total Amount:</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{formData.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
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
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div ref={printRef}>
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-emerald-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Invoice Preview</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white font-medium">{formData.customer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white font-medium capitalize">{formData.type.replace('_', ' ')}</span>
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
                      <th className="px-4 py-3 text-right text-gray-300 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((prodId, index) => {
                      const product = products.find((p) => p._id === prodId);
                      return (
                        <tr key={index} className="border-t border-slate-600/30">
                          <td className="px-4 py-3 text-white">{product ? product.name : 'Unknown'}</td>
                          <td className="px-4 py-3 text-right text-white">{formData.quantities[index] || 0}</td>
                          <td className="px-4 py-3 text-right text-white">{product ? `₹${product.price.toLocaleString()}` : '-'}</td>
                          <td className="px-4 py-3 text-right text-white">
                            {product ? `₹${(product.price * (formData.quantities[index] || 0)).toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-300">Total:</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{formData.total.toLocaleString()}</span>
                </div>
                {formData.showPaymentFields && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400">Total Received:</span>
                    <span className="text-white font-medium">₹{(formData.totalReceived || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Invoice History</h2>
          </div>

          {invoices.length > 0 ? (
            <div className="border border-slate-600/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Customer</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Type</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Products</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Quantities</th>
                    <th className="px-6 py-4 text-right text-gray-300 font-medium">Total</th>
                    <th className="px-6 py-4 text-right text-gray-300 font-medium">Received</th>
                    <th className="px-6 py-4 text-right text-gray-300 font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white">{invoice.customer || '-'}</td>
                      <td className="px-6 py-4 text-white capitalize">{(invoice.type || '').replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-white">
                        {Array.isArray(invoice.products) && invoice.products.length > 0
                          ? invoice.products.map((p, i) => (
                              <span key={i}>{p.name || 'Unknown'}{i < invoice.products.length - 1 ? ', ' : ''}</span>
                            ))
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {Array.isArray(invoice.quantities) && invoice.quantities.length > 0
                          ? invoice.quantities.join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-semibold">{invoice.total ? `₹${invoice.total.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 text-right text-white">{invoice.totalReceived ? `₹${invoice.totalReceived.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 text-right text-red-400">{invoice.totalPendingAmount ? `₹${invoice.totalPendingAmount.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No invoices available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;