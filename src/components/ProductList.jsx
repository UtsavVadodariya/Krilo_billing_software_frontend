import { useEffect, useState } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, DollarSign, Box, X } from 'lucide-react';
import { baseUrl } from '../utils/baseUrl';


function ProductList() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: 0, stock: 0 });
  const [editProductId, setEditProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count products that are in stock (stock > 0)
  const inStockCount = products.filter(product => product.stock > 0).length;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        // const response = await fetch('https://krilo-billing-software-backend.onrender.com/api/products', {
        const response = await fetch(`${baseUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const stockValue = parseInt(form.stock, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        throw new Error('Stock must be a non-negative number');
      }
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: parseFloat(form.price),
        stock: stockValue,
      };
      console.log('Submitting payload:', payload);

      let response;
      if (editProductId) {
        // Update existing product
        // response = await fetch(`https://krilo-billing-software-backend.onrender.com/api/products/${editProductId}`, {
        response = await fetch(`${baseUrl}/api/products/${editProductId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        console.log('Product updated:', await response.json());
      } else {
        // Create new product
        // response = await fetch('https://krilo-billing-software-backend.onrender.com/api/products', {
        response = await fetch(`${baseUrl}/api/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        console.log('Product added:', await response.json());
      }

      // Refresh product list
      // const refreshResponse = await fetch('https://krilo-billing-software-backend.onrender.com/api/products', {
      const refreshResponse = await fetch(`${baseUrl}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshedData = await refreshResponse.json();
      setProducts(refreshedData);

      // Reset form
      setForm({ name: '', category: '', price: 0, stock: 0 });
      setEditProductId(null);
    } catch (error) {
      console.error(`Error ${editProductId ? 'updating' : 'adding'} product:`, error);
      setError(`Failed to ${editProductId ? 'update' : 'add'} product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category || '',
      price: product.price || 0,
      stock: product.stock || 0,
    });
    setEditProductId(product._id);
    setError(null);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      // await fetch(`https://krilo-billing-software-backend.onrender.com/api/products/${productId}`, {
      await fetch(`${baseUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Product deleted:', productId);
      
      // Refresh product list
      // const response = await fetch('https://krilo-billing-software-backend.onrender.com/api/products', {
      const response = await fetch(`${baseUrl}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Failed to delete product: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setForm({ name: '', category: '', price: 0, stock: 0 });
    setEditProductId(null);
    setError(null);
  };

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Products</h1>
              <p className="text-gray-400">Manage your product inventory</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Add/Edit Product Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">{editProductId ? 'Edit Product' : 'Add New Product'}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Product Name</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Category</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Price (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Stock</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block opacity-0">Action</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={loading || !form.name.trim() || !form.category.trim() || isNaN(parseFloat(form.price)) || isNaN(parseInt(form.stock, 10))}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>{editProductId ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{editProductId ? 'Update Product' : 'Add Product'}</span>
                    </>
                  )}
                </button>
                {editProductId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-slate-700/50 text-white py-3 px-4 rounded-xl font-medium border border-slate-600 hover:bg-slate-700 transition-all duration-300 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Product Inventory</h2>
                  <p className="text-gray-400 text-sm">{inStockCount} products in stock</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                          <Package className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400">ID: {product._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-gray-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">₹{product.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 10 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : product.stock > 0 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {searchTerm ? 'No products found matching your search' : 'No products found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first product to get started'}
              </p>
            </div>
          )}
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

export default ProductList;