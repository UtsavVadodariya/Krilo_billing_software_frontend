import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Calendar, FileText, DollarSign } from 'lucide-react';
import axios from 'axios';

function AccountHistory() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountType: 'Accounts Receivable', type: 'credit', amount: 0, description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const response = await axios.get('http://localhost:5000/api/accounts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error.response?.data || error.message);
        setError(error.response?.data?.error || 'Failed to fetch account history');
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      await axios.post('http://localhost:5000/api/accounts', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newEntry = {
        _id: Date.now().toString(),
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(),
      };
      setAccounts((prevAccounts) => [newEntry, ...prevAccounts]);
      setForm({ accountType: 'Accounts Receivable', type: 'credit', amount: 0, description: '' });
    } catch (error) {
      console.error('Error adding account entry:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to add account entry');
    } finally {
      setLoading(false);
    }
  };

  // Get unique customers for filter
  const customers = [...new Set(accounts.map((acc) => acc.invoiceId?.customer).filter(Boolean))];

  // Filter accounts by customer
  const filteredAccounts = customerFilter === 'all'
    ? accounts
    : accounts.filter((acc) => acc.invoiceId?.customer === customerFilter);

  // Calculate totals for Accounts Receivable only
  const creditEntries = filteredAccounts.filter((acc) => acc.type === 'credit');
  const debitEntries = filteredAccounts.filter((acc) => acc.type === 'debit');

  const totalCredit = creditEntries.length > 0
    ? creditEntries.reduce((sum, acc) => sum + (acc.amount || 0), 0)
    : 0;

  const totalDebit = debitEntries.length > 0
    ? debitEntries.reduce((sum, acc) => sum + (acc.amount || 0), 0)
    : 0;

  const balance = totalDebit > 0 && totalCredit > 0
    ? totalCredit - totalDebit
    : totalCredit || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account History</h1>
          <p className="text-gray-400">Manage your financial transactions</p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 block mb-2">Filter by Customer</label>
          <div className="relative">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full max-w-xs px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300 appearance-none"
            >
              <option value="all">All Customers</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Credit (A/R)</p>
                <p className="text-2xl font-bold text-emerald-400">₹{totalCredit.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Debit (A/R)</p>
                <p className="text-2xl font-bold text-red-400">₹{totalDebit.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Balance (A/R)</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₹{balance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className={`${balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} p-3 rounded-xl`}>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Plus className="w-6 h-6 mr-2" />
            Add New Entry
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Account Type</label>
                <div className="relative">
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300 appearance-none"
                  >
                    <option value="Accounts Receivable">Accounts Receivable</option>
                    <option value="Sales Revenue">Sales Revenue</option>
                    <option value="Cash">Cash</option>
                    <option value="Expenses">Expenses</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Transaction Type</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300 appearance-none"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Entry...
                </div>
              ) : (
                'Add Entry'
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Transaction History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No transactions found. Add an entry or create a sales invoice.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account._id} className="hover:bg-slate-700/20 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {account.accountType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {account.type === 'credit' ? (
                            <div className="bg-emerald-500/10 p-2 rounded-lg mr-3">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="bg-red-500/10 p-2 rounded-lg mr-3">
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                          <span className={`font-semibold ${account.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${account.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                          ₹{account.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {account.description || (account.invoiceId ? `Sales Invoice for ${account.invoiceId.customer}` : 'No description')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {new Date(account.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Krilo Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountHistory;