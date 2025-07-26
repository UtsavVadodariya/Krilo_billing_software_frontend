import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Printer, Save, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { baseUrl } from '../utils/baseUrl';

function InvoiceForm() {
  const [formData, setFormData] = useState({
    customerId: '',
    customerDetails: null,
    type: 'sales_invoice',
    products: [''],
    quantities: [1],
    total: 0,
    showPaymentFields: true,
    totalReceived: '',
  });
  const [companySettings, setCompanySettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [imageErrors, setImageErrors] = useState({ logo: false, sign: false });
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${baseUrl}/api/company-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch company settings');
        const data = await response.json();
        setCompanySettings(data);
      } catch (err) {
        console.error('Fetch company settings error:', err);
        setError('Failed to fetch company settings: ' + err.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${baseUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Fetch products error:', err);
        setError('Failed to fetch products: ' + err.message);
      }
    };

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

    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${baseUrl}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch invoices error:', err);
        setError('Failed to fetch invoice history: ' + err.message);
      }
    };

    fetchCompanySettings();
    fetchProducts();
    fetchCustomers();
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (printRef.current) {
      console.log('printRef after render:', printRef.current);
      setIsPrintReady(true);
    } else {
      console.warn('printRef is null after render');
      setIsPrintReady(false);
    }
  }, [formData, products, customers, companySettings]);

  const handleCustomerChange = (customerId) => {
    const selectedCustomer = customers.find((c) => c._id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerDetails: selectedCustomer || null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const parsedTotalReceived = formData.showPaymentFields ? parseFloat(formData.totalReceived) || 0 : null;

      if (formData.showPaymentFields) {
        if (parsedTotalReceived < 0) {
          throw new Error('Total received cannot be negative');
        }
        if (parsedTotalReceived > formData.total) {
          throw new Error('Total received cannot exceed total amount');
        }
      }

      const payload = {
        customerId: formData.customerId,
        customer: formData.customerDetails ? formData.customerDetails.name : '',
        type: formData.type,
        products: formData.products.filter((p) => p !== ''),
        quantities: formData.quantities,
        total: formData.total,
        totalReceived: parsedTotalReceived,
      };
      console.log('Sending invoice payload:', payload);
      const response = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
        customerId: '',
        customerDetails: null,
        type: 'sales_invoice',
        products: [''],
        quantities: [1],
        total: 0,
        showPaymentFields: true,
        totalReceived: '',
      });
    } catch (err) {
      console.error('Error creating invoice:', err);
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
      quantities: [...formData.quantities, 1],
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
    content: () => {
      if (!printRef.current) {
        console.error('Print ref is null in content callback');
        setError('Cannot print: Invoice content not found. Please try again.');
        return null;
      }
      console.log('Initiating print with ref:', printRef.current);
      return printRef.current;
    },
    onBeforeGetContent: () => {
      console.log('Preparing print content');
      return new Promise((resolve, reject) => {
        if (!printRef.current) {
          console.error('Print ref is null before print');
          setError('Cannot print: Invoice content not found. Please try again.');
          reject(new Error('Print ref is null'));
          return;
        }
        setTimeout(() => {
          console.log('Print ref after delay:', printRef.current);
          resolve();
        }, 1000);
      });
    },
    onAfterPrint: () => {
      console.log('Print completed');
    },
    documentTitle: `invoice_${formData.customerDetails?.name || 'invoice'}_${new Date().toISOString().split('T')[0]}`,
  });

  const handleDownloadPDF = async (invoiceId) => {
    if (!invoiceId) {
      setError('Invalid invoice ID for PDF download.');
      return;
    }
    
    setDownloadingInvoiceId(invoiceId);
    
    try {
      console.log('Initiating PDF download for invoice:', invoiceId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('PDF downloaded');
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF: ' + err.message);
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleImageError = (type) => (e) => {
    console.error(`${type} image failed to load:`, e);
    setImageErrors((prev) => ({ ...prev, [type]: true }));
    setError(`Failed to load ${type} image. Check server configuration.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: static;
              width: 100%;
              background: white;
              color: black;
              padding: 20px;
              box-sizing: border-box;
            }
            .no-print {
              display: none !important;
            }
            table, th, td {
              border: 1px solid #ccc !important;
              border-collapse: collapse !important;
            }
            th {
              background-color: #f0f0f0 !important;
            }
            img {
              max-width: 100px;
            }
          }
        `}
      </style>
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
          <h1 className="text-4xl font-bold text-white mb-2">Invoice Management</h1>
          <p className="text-gray-400">Create and manage your invoices with ease</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 no-print">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
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
                              {product.name} (Stock: {product.stock || 0})
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
                <label className="flex items-center text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.showPaymentFields}
                    onChange={(e) => setFormData({ ...formData, showPaymentFields: e.target.checked })}
                    className="mr-2 rounded bg-slate-600 border-slate-500 focus:ring-blue-500"
                  />
                  Add Payment Details
                </label>
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
                  disabled={!isPrintReady}
                  className={`bg-slate-700/50 text-white py-3 px-6 rounded-xl font-medium border border-slate-600 transition-all duration-300 flex items-center ${
                    !isPrintReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'
                  }`}
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white text-black p-8 rounded-2xl shadow-2xl border border-gray-200 print-container">
            <div ref={printRef} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  {companySettings?.companyLogo && !imageErrors.logo ? (
                    <img
                      src={`${baseUrl}/${companySettings.companyLogo}`}
                      alt="Company Logo"
                      style={{ maxWidth: '100px', marginBottom: '8px' }}
                      onError={handleImageError('logo')}
                    />
                  ) : (
                    <p style={{ fontSize: '12px', color: '#999' }}>[Logo not available]</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {companySettings ? (
                    <>
                      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{companySettings.companyName}</h1>
                      <p style={{ fontSize: '12px' }}>{companySettings.address}</p>
                      <p style={{ fontSize: '12px' }}>
                        {companySettings.city}, {companySettings.state}, {companySettings.country} {companySettings.pincode}
                      </p>
                      {companySettings.GSTIN && (
                        <p style={{ fontSize: '12px' }}>GSTIN: {companySettings.GSTIN}</p>
                      )}
                      {companySettings.contactNumber && (
                        <p style={{ fontSize: '12px' }}>Phone: {companySettings.contactNumber}</p>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '12px' }}>Loading company details...</p>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>Tax Invoice</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '14px' }}><strong>Customer:</strong> {formData.customerDetails?.name || 'N/A'}</p>
                  {formData.customerDetails && (
                    <>
                      <p style={{ fontSize: '14px' }}><strong>Address:</strong> {formData.customerDetails.address || '-'}</p>
                      <p style={{ fontSize: '14px' }}><strong>City:</strong> {formData.customerDetails.city || '-'}</p>
                      <p style={{ fontSize: '14px' }}><strong>State:</strong> {formData.customerDetails.state || '-'}</p>
                      <p style={{ fontSize: '14px' }}><strong>Country:</strong> {formData.customerDetails.country || '-'}</p>
                      <p style={{ fontSize: '14px' }}><strong>Pincode:</strong> {formData.customerDetails.pincode || '-'}</p>
                      {formData.customerDetails.GSTIN && (
                        <p style={{ fontSize: '14px' }}><strong>GSTIN:</strong> {formData.customerDetails.GSTIN}</p>
                      )}
                    </>
                  )}
                  <p style={{ fontSize: '14px' }}><strong>Invoice Type:</strong> {formData.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px' }}><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: '600' }}>Product</th>
                      <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
                      <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                      <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: '600' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products
                      .map((prodId, index) => ({
                        product: products.find((p) => p._id === prodId),
                        quantity: formData.quantities[index] || 0,
                        index,
                      }))
                      .filter(({ product }) => product)
                      .map(({ product, quantity, index }) => (
                        <tr key={index} style={{ borderTop: '1px solid #ccc' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.name}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{quantity}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>₹{product.price.toLocaleString()}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>₹{(product.price * quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <p style={{ fontSize: '14px' }}><strong>Total:</strong> ₹{formData.total.toLocaleString()}</p>
                {formData.showPaymentFields && (
                  <>
                    <p style={{ fontSize: '14px' }}><strong>Total Received:</strong> ₹{(parseFloat(formData.totalReceived) || 0).toLocaleString()}</p>
                    <p style={{ fontSize: '14px' }}><strong>Total Pending:</strong> ₹{(formData.total - (parseFloat(formData.totalReceived) || 0)).toLocaleString()}</p>
                  </>
                )}
              </div>

              {companySettings?.termsAndConditions && (
                <div style={{ marginTop: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Terms and Conditions:</p>
                  <p style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{companySettings.termsAndConditions}</p>
                </div>
              )}

              {companySettings?.bankDetails && (
                <div style={{ marginTop: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Bank Details:</p>
                  <p style={{ fontSize: '12px' }}>Bank Name: {companySettings.bankDetails?.bankName || '-'}</p>
                  <p style={{ fontSize: '12px' }}>Account Number: {companySettings.bankDetails?.accountNumber || '-'}</p>
                  <p style={{ fontSize: '12px' }}>IFSC: {companySettings.bankDetails?.IFSC || '-'}</p>
                  <p style={{ fontSize: '12px' }}>Branch: {companySettings.bankDetails?.branch || '-'}</p>
                </div>
              )}

              {companySettings?.companySign && !imageErrors.sign ? (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <img
                    src={`${baseUrl}/${companySettings.companySign}`}
                    alt="Company Signature"
                    style={{ maxWidth: '100px', marginTop: '10px' }}
                    onError={handleImageError('sign')}
                  />
                  <p style={{ fontSize: '12px', fontWeight: '600' }}>Authorized Signatory</p>
                </div>
              ) : (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#999' }}>[Signature not available]</p>
                  <p style={{ fontSize: '12px', fontWeight: '600' }}>Authorized Signatory</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 no-print">
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
                    <th className="px-6 py-4 text-center text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white">{invoice.customer || '-'}</td>
                      <td className="px-6 py-4 text-white capitalize">{(invoice.type || '').replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-white">
                        {Array.isArray(invoice.products) && invoice.products.length > 0
                          ? invoice.products
                              .map((p, i) => `${p.name || 'Unknown'} (Stock: ${p.stock || 0})`)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {Array.isArray(invoice.quantities) && invoice.quantities.length > 0
                          ? invoice.quantities.join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-semibold">
                        {invoice.total ? `₹${invoice.total.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        {invoice.totalReceived ? `₹${invoice.totalReceived.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-red-400">
                        {invoice.totalPendingAmount ? `₹${invoice.totalPendingAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          disabled={downloadingInvoiceId === invoice._id}
                          className={`bg-blue-500/20 text-blue-400 py-2 px-4 rounded-lg font-medium border border-blue-500/30 transition-all duration-300 flex items-center justify-center mx-auto ${
                            downloadingInvoiceId === invoice._id 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-blue-500/30 hover:border-blue-500/50'
                          }`}
                        >
                          {downloadingInvoiceId === invoice._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                              <span className="text-sm">Downloading...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              <span className="text-sm">Download PDF</span>
                            </>
                          )}
                        </button>
                      </td>
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

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Krilo Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;