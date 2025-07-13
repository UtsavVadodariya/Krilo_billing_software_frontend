import { useState } from 'react';
import { Search, Edit2, Save, X, FileText, User, Users } from 'lucide-react';

function CustomerDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [newTotalReceived, setNewTotalReceived] = useState('');

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Fetching invoices with token:', token.substring(0, 20) + '...');
      
      const url = new URL('http://localhost:5000/api/invoices/customer');
      url.searchParams.append('customerName', searchTerm.trim());
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }
      
      const data = await response.json();
      console.log('Invoices received:', data);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invoices:', err.message);
      const errorMessage = err.message || 'Failed to fetch invoices. Please try again.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEditPayment = (invoice) => {
    setEditingInvoice(invoice._id);
    setNewTotalReceived(invoice.totalReceived || '');
  };

  const handleUpdatePayment = async (invoiceId) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const parsedTotalReceived = parseFloat(newTotalReceived) || 0;
      if (parsedTotalReceived < 0) {
        throw new Error('Total received cannot be negative');
      }
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      if (parsedTotalReceived > invoice.total) {
        throw new Error('Total received cannot exceed total amount');
      }
      
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          totalReceived: parsedTotalReceived,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }
      
      const data = await response.json();
      console.log('Invoice updated:', data);
      setInvoices(invoices.map((inv) =>
        inv._id === invoiceId ? { ...inv, totalReceived: parsedTotalReceived, totalPendingAmount: data.totalPendingAmount } : inv
      ));
      setEditingInvoice(null);
      setNewTotalReceived('');
    } catch (err) {
      console.error('Error updating payment:', err.message);
      setError(err.message || 'Failed to update payment.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Customer Details</h1>
          <p className="text-gray-400">Search and manage customer invoices</p>
        </div>

        {/* Search Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 mb-8">
          <div className="flex items-center mb-6">
            <Search className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Search Customer</h2>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter customer name (leave empty for all invoices)"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-xl text-center border border-red-500/30">
            {error}
          </div>
        )}

        {/* Results Section */}
        {invoices.length > 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-emerald-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                {searchTerm ? `Invoices for "${searchTerm}"` : 'All Invoices'}
              </h2>
              <span className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'}
              </span>
            </div>

            <div className="border border-slate-600/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Customer
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Invoice Type</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Products</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">Quantities</th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">Total</th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">Received</th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">Pending</th>
                      <th className="px-6 py-4 text-center text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{invoice.customer || '-'}</td>
                        <td className="px-6 py-4 text-white">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-sm capitalize">
                            {(invoice.type || '').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {Array.isArray(invoice.products) && invoice.products.length > 0
                            ? invoice.products.map((p, i) => (
                                <span key={i} className="inline-block bg-slate-700/50 text-gray-300 px-2 py-1 rounded-md text-sm mr-1 mb-1">
                                  {p.name || 'Unknown'}
                                </span>
                              ))
                            : <span className="text-gray-500">-</span>}
                        </td>
                        <td className="px-6 py-4 text-white">
                          {Array.isArray(invoice.quantities) && invoice.quantities.length > 0
                            ? invoice.quantities.map((qty, i) => (
                                <span key={i} className="inline-block bg-slate-700/50 text-gray-300 px-2 py-1 rounded-md text-sm mr-1 mb-1">
                                  {qty}
                                </span>
                              ))
                            : <span className="text-gray-500">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-semibold">
                          {invoice.total ? `₹${invoice.total.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingInvoice === invoice._id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <input
                                type="number"
                                value={newTotalReceived}
                                onChange={(e) => setNewTotalReceived(e.target.value)}
                                className="w-24 px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                                placeholder="Amount"
                                min="0"
                                max={invoice.total}
                              />
                              <button
                                onClick={() => handleUpdatePayment(invoice._id)}
                                className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingInvoice(null)}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-white font-medium">
                              {invoice.totalReceived ? `₹${invoice.totalReceived.toLocaleString()}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-red-400 font-medium">
                            {invoice.totalPendingAmount ? `₹${invoice.totalPendingAmount.toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editingInvoice !== invoice._id && (
                            <button
                              onClick={() => handleEditPayment(invoice)}
                              className="flex items-center justify-center px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                              title="Edit Payment"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Invoices</span>
                  <span className="text-2xl font-bold text-white">{invoices.length}</span>
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ₹{invoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Pending</span>
                  <span className="text-2xl font-bold text-red-400">
                    ₹{invoices.reduce((sum, inv) => sum + (inv.totalPendingAmount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="bg-slate-700/50 p-4 rounded-2xl">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Invoices Found</h3>
              <p className="text-gray-400">
                {searchTerm ? `No invoices found for "${searchTerm}".` : 'No invoices available. Try searching for a specific customer.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetails;