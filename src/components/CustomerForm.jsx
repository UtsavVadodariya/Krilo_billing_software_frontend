import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { baseUrl } from '../utils/baseUrl';


function CustomerForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    GSTIN: '',
  });
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${baseUrl}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch customers error:', err);
        setError('Failed to fetch customers: ' + err.message);
      }
    };
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const payload = { ...formData };
      console.log('Sending customer payload:', payload);
      const response = await fetch(`${baseUrl}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }
      const data = await response.json();
      console.log('Customer created:', data);
      setCustomers([...customers, data]);
      setFormData({
        name: '',
        address: '',
        country: '',
        state: '',
        city: '',
        pincode: '',
        GSTIN: '',
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.message || 'Failed to create customer.');
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-10 no-print">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 text-red-400 rounded-xl text-center no-print">
            {error}
          </div>
        )}

        <div className="text-center mb-8 no-print">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Customer Management</h1>
          <p className="text-gray-400">Add and manage customer details</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 no-print">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Add Customer</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Customer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter address"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter country"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter pincode"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">GSTIN</label>
                <input
                  type="text"
                  value={formData.GSTIN}
                  onChange={(e) => handleInputChange('GSTIN', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  placeholder="Enter GSTIN (optional)"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Customer
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 no-print">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Customer List</h2>
          </div>

          {customers.length > 0 ? (
            <div className="border border-slate-600/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Name</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Address</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Country</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">State</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">City</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">Pincode</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">GSTIN</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white">{customer.name || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.address || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.country || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.state || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.city || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.pincode || '-'}</td>
                      <td className="px-6 py-4 text-white">{customer.GSTIN || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No customers available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerForm;