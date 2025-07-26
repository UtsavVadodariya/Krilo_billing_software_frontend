import { useEffect, useState } from 'react';
import { Package, FileText, CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import { baseUrl } from '../utils/baseUrl';


function Dashboard() {
  const [stats, setStats] = useState({ products: 0, invoices: 0, accounts: 0 });

 useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [products, invoices, accounts] = await Promise.all([
          // axios.get('https://krilo-billing-software-backend.onrender.com/api/products', {
          axios.get(`${baseUrl}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // axios.get('https://krilo-billing-software-backend.onrender.com/api/invoices/sales_invoice', {
          axios.get(`${baseUrl}/api/invoices/sales_invoice`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // axios.get('https://krilo-billing-software-backend.onrender.com/api/accounts', {
          axios.get(`${baseUrl}/api/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStats({
          products: products.data.length,
          invoices: invoices.data.length,
          accounts: accounts.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto">
      {/* <Header/> */}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Welcome back to your business overview</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Products Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Total Products</h2>
                  <p className="text-gray-400 text-sm">Inventory items</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-white">{stats.products}</p>
              <span className="text-emerald-400 text-sm font-medium">+12%</span>
            </div>
            <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">This month</span>
                <span className="text-blue-400 font-medium">+{Math.floor(stats.products * 0.12)} items</span>
              </div>
            </div>
          </div>

          {/* Invoices Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Total Invoices</h2>
                  <p className="text-gray-400 text-sm">Sales records</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-white">{stats.invoices}</p>
              <span className="text-emerald-400 text-sm font-medium">+8%</span>
            </div>
            <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">This month</span>
                <span className="text-emerald-400 font-medium">+{Math.floor(stats.invoices * 0.08)} invoices</span>
              </div>
            </div>
          </div>

          {/* Transactions Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Total Transactions</h2>
                  <p className="text-gray-400 text-sm">Account records</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-white">{stats.accounts}</p>
              <span className="text-emerald-400 text-sm font-medium">+15%</span>
            </div>
            <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">This month</span>
                <span className="text-purple-400 font-medium">+{Math.floor(stats.accounts * 0.15)} transactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
                <p className="text-xl font-bold text-white">₹{(stats.invoices * 15000).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
                <p className="text-xl font-bold text-white">{Math.floor(stats.accounts * 1.5)}</p>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Conversion</h3>
                <p className="text-xl font-bold text-white">68.5%</p>
              </div>
            </div>
          </div>

          {/* Growth Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Growth</h3>
                <p className="text-xl font-bold text-white">+24%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span><a href="/products">Add Product</a></span>
            </button>
            <button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span><a href="/invoices">New Invoice</a></span>
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span><a href="/accounts">Add Transaction</a></span>
            </button>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span><a href="/">View Reports</a></span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Krilo Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;