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
    gstAmounts: [0],
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

  // Number to Words function (matching backend)
  const numberToWords = (num) => {
    if (num === 0) return 'Zero Rupees only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertHundreds = (n) => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;

    let result = '';
    if (crores > 0) result += convertHundreds(crores) + 'Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
    if (hundreds > 0) result += convertHundreds(hundreds);

    return result.trim() + ' Rupees only';
  };

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
        const sortedInvoices = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setInvoices(sortedInvoices);
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
        gstAmounts: formData.gstAmounts,
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
      setInvoices([data, ...invoices]);
      setFormData({
        customerId: '',
        customerDetails: null,
        type: 'sales_invoice',
        products: [''],
        quantities: [1],
        gstAmounts: [0],
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
    const newGstAmounts = [...formData.gstAmounts];

    if (field === 'product') {
      newProducts[index] = value;
      const selectedProduct = products.find((p) => p._id === value);
      newGstAmounts[index] = selectedProduct ? (selectedProduct.price * (selectedProduct.gst || 0) / 100) * (newQuantities[index] || 0) : 0;
    } else {
      newQuantities[index] = parseInt(value) || 0;
      const selectedProduct = products.find((p) => p._id === newProducts[index]);
      newGstAmounts[index] = selectedProduct ? (selectedProduct.price * (selectedProduct.gst || 0) / 100) * (newQuantities[index] || 0) : 0;
    }

    const total = newProducts.reduce((sum, prodId, i) => {
      const product = products.find((p) => p._id === prodId);
      return sum + (product ? product.price * (newQuantities[i] || 0) * (1 + (product.gst || 0) / 100) : 0);
    }, 0);

    setFormData({ ...formData, products: newProducts, quantities: newQuantities, gstAmounts: newGstAmounts, total });
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, ''],
      quantities: [...formData.quantities, 1],
      gstAmounts: [...formData.gstAmounts, 0],
    });
  };

  const removeProductField = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const newQuantities = formData.quantities.filter((_, i) => i !== index);
    const newGstAmounts = formData.gstAmounts.filter((_, i) => i !== index);
    const total = newProducts.reduce((sum, prodId, i) => {
      const product = products.find((p) => p._id === prodId);
      return sum + (product ? product.price * (newQuantities[i] || 0) * (1 + (product.gst || 0) / 100) : 0);
    }, 0);
    setFormData({ ...formData, products: newProducts, quantities: newQuantities, gstAmounts: newGstAmounts, total });
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

  // GST calculation logic for inter-state/intra-state
  const companyState = companySettings?.state || '';
  const customerState = formData.customerDetails?.state || '';
  const isInterState = companyState.toLowerCase() !== customerState.toLowerCase();

  // HSN-wise summary
  const hsnSummary = {};
  let totalTaxableAmount = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalAmount = 0;

  formData.products.forEach((prodId, index) => {
    const product = products.find((p) => p._id === prodId);
    if (product) {
      const quantity = formData.quantities[index] || 0;
      const price = product.price || 0;
      const gstRate = product.gst || 0;
      const hsn = product.hsn || '28391900';
      const taxableAmount = price * quantity;

      if (!hsnSummary[hsn]) {
        hsnSummary[hsn] = {
          hsn,
          gstRate,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0,
        };
      }

      hsnSummary[hsn].taxableAmount += taxableAmount;
      if (isInterState) {
        const igstAmount = (taxableAmount * gstRate) / 100;
        hsnSummary[hsn].igstAmount += igstAmount;
        hsnSummary[hsn].totalAmount += taxableAmount + igstAmount;
      } else {
        const cgstAmount = (taxableAmount * gstRate / 2) / 100;
        const sgstAmount = (taxableAmount * gstRate / 2) / 100;
        hsnSummary[hsn].cgstAmount += cgstAmount;
        hsnSummary[hsn].sgstAmount += sgstAmount;
        hsnSummary[hsn].totalAmount += taxableAmount + cgstAmount + sgstAmount;
      }

      totalTaxableAmount += taxableAmount;
      if (isInterState) {
        totalIGST += (taxableAmount * gstRate) / 100;
      } else {
        totalCGST += (taxableAmount * gstRate / 2) / 100;
        totalSGST += (taxableAmount * gstRate / 2) / 100;
      }
      totalAmount += isInterState
        ? taxableAmount + (taxableAmount * gstRate) / 100
        : taxableAmount + (taxableAmount * gstRate) / 100;
    }
  });

  const hsnSummaryArray = Object.values(hsnSummary);

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
              padding: 30px;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
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
              font-weight: bold;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.1;
              z-index: -1;
              pointer-events: none;
            }
            .bordered-box {
              border: 1px solid #ccc;
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

                {formData.products.map((_, index) => {
                  const selectedProduct = products.find((p) => p._id === formData.products[index]);
                  return (
                    <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-400 block mb-1">Product</label>
                          <select
                            value={formData.products[index] || ''}
                            onChange={(e) => handleProductChange(index, 'product', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} (Stock: {product.stock || 0}, GST: {product.gst || 0}%)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
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
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-400 block mb-1">GST (%)</label>
                            <input
                              type="text"
                              value={selectedProduct ? `${selectedProduct.gst || 0}%` : '0%'}
                              readOnly
                              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
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
                    </div>
                  );
                })}
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
                  <span className="text-lg font-semibold text-gray-300">Total Amount (incl. GST):</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{formData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-400">Total GST Amount:</span>
                  <span className="text-sm font-medium text-gray-300">
                    ₹{formData.gstAmounts.reduce((sum, amt) => sum + (amt || 0), 0).toLocaleString()}
                  </span>
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
            <div ref={printRef} style={{ padding: '30px', fontFamily: 'Arial, sans-serif', position: 'relative', width: '535px', minHeight: '782px' }}>
              {/* Watermark Logo */}
              {companySettings?.companyLogo && !imageErrors.logo && (
                <img
                  src={`${baseUrl}/${companySettings.companyLogo}`}
                  alt="Company Logo Watermark"
                  className="watermark"
                  style={{ maxWidth: '200px', maxHeight: '100px' }}
                  onError={handleImageError('logo')}
                />
              )}

              {/* Header: Tax Invoice */}
              <div className="bordered-box" style={{ padding: '5px', textAlign: 'center', marginBottom: '15px' }}>
                <h1 style={{ fontSize: '14px', fontWeight: 'bold' }}>Tax Invoice</h1>
              </div>

              {/* Company Info */}
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                {companySettings ? (
                  <>
                    <h1 style={{ fontSize: '16px', fontWeight: 'bold' }}>{companySettings.companyName}</h1>
                    {companySettings.address && <p style={{ fontSize: '9px' }}>{companySettings.address}</p>}
                    {companySettings.city && (
                      <p style={{ fontSize: '9px' }}>
                        {companySettings.city}{companySettings.state ? ', ' + companySettings.state : ''}{companySettings.pincode ? ' ' + companySettings.pincode : ''}
                      </p>
                    )}
                    {companySettings.contactNumber && <p style={{ fontSize: '9px' }}>Phone no.: {companySettings.contactNumber}</p>}
                    {companySettings.GSTIN && <p style={{ fontSize: '9px' }}>GSTIN: {companySettings.GSTIN}</p>}
                  </>
                ) : (
                  <p style={{ fontSize: '9px' }}>Loading company details...</p>
                )}
              </div>

              {/* Bill To and Invoice Details */}
              <div className="bordered-box" style={{ display: 'flex', height: '80px', marginBottom: '15px' }}>
                {/* Bill To (Left) */}
                <div style={{ width: '50%', padding: '10px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold' }}>Bill To</p>
                  {formData.customerDetails ? (
                    <>
                      <p style={{ fontSize: '9px', fontWeight: 'bold' }}>{formData.customerDetails.name}</p>
                      {formData.customerDetails.address && <p style={{ fontSize: '9px' }}>{formData.customerDetails.address}</p>}
                      {formData.customerDetails.city && <p style={{ fontSize: '9px' }}>{formData.customerDetails.city}</p>}
                      {formData.customerDetails.GSTIN && <p style={{ fontSize: '9px' }}>GSTIN Number: {formData.customerDetails.GSTIN}</p>}
                      {formData.customerDetails.state && <p style={{ fontSize: '9px' }}>State: {formData.customerDetails.state}</p>}
                    </>
                  ) : (
                    <p style={{ fontSize: '9px', fontWeight: 'bold' }}>{formData.customer || 'Customer Name'}</p>
                  )}
                </div>
                {/* Invoice Details (Right) */}
                <div style={{ width: '50%', padding: '10px', textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold' }}>Invoice Details</p>
                  <p style={{ fontSize: '9px' }}>Invoice No.: INV-{formData.customerId?.slice(-6) || 'XXXXXX'}</p>
                  <p style={{ fontSize: '9px' }}>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  <p style={{ fontSize: '9px' }}>Place of Supply: {customerState || companyState || '24-Gujarat'}</p>
                </div>
              </div>

              {/* Main Invoice Table */}
              <div className="bordered-box" style={{ marginBottom: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', height: '35px' }}>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', width: '25px' }}>#</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'left', width: '120px' }}>Item Name</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', width: '60px' }}>HSN/SAC</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', width: '40px' }}>Quantity</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '60px' }}>Price/Unit</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '60px' }}>Taxable Amount</th>
                      {isInterState ? (
                        <>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '70px' }}>IGST</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '70px' }}>Amount</th>
                        </>
                      ) : (
                        <>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '50px' }}>CGST</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '50px' }}>SGST</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '70px' }}>Amount</th>
                        </>
                      )}
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
                      .map(({ product, quantity, index }) => {
                        const price = product.price || 0;
                        const gstRate = product.gst || 0;
                        const taxableAmount = price * quantity;
                        const igstAmount = isInterState ? (taxableAmount * gstRate) / 100 : 0;
                        const cgstAmount = !isInterState ? (taxableAmount * gstRate / 2) / 100 : 0;
                        const sgstAmount = !isInterState ? (taxableAmount * gstRate / 2) / 100 : 0;
                        const itemTotal = isInterState ? taxableAmount + igstAmount : taxableAmount + cgstAmount + sgstAmount;

                        return (
                          <tr key={index} style={{ height: '25px' }}>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', paddingLeft: '2px' }}>{(product.name || 'Unknown Product').toUpperCase()}</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>{product.hsn || '28391900'}</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>{quantity}</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>INR {price.toFixed(2)}</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>INR {taxableAmount.toFixed(2)}</td>
                            {isInterState ? (
                              <>
                                <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                                  INR {igstAmount.toFixed(2)}<br />({gstRate}%)
                                </td>
                                <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>INR {itemTotal.toFixed(2)}</td>
                              </>
                            ) : (
                              <>
                                <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                                  INR {cgstAmount.toFixed(2)}<br />({gstRate / 2}%)
                                </td>
                                <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                                  INR {sgstAmount.toFixed(2)}<br />({gstRate / 2}%)
                                </td>
                                <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>INR {itemTotal.toFixed(2)}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    <tr style={{ height: '25px', fontWeight: 'bold' }}>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>Total</td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px' }}></td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>
                        {formData.products.filter((prodId) => products.find((p) => p._id === prodId)).length}
                      </td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'center' }}>
                        {formData.quantities.reduce((sum, qty) => sum + (qty || 0), 0)}
                      </td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px' }}></td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                        INR {totalTaxableAmount.toFixed(2)}
                      </td>
                      {isInterState ? (
                        <>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalIGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalAmount.toFixed(2)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalCGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalSGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalAmount.toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* HSN-wise Tax Summary Table */}
              <div className="bordered-box" style={{ marginBottom: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', height: '20px' }}>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: isInterState ? '90px' : '80px' }}>HSN/SAC</th>
                      <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: isInterState ? '90px' : '80px' }}>Taxable Amount</th>
                      {isInterState ? (
                        <>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '90px' }}>IGST Rate</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '90px' }}>IGST Amount</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '185px' }}>Total Amount</th>
                        </>
                      ) : (
                        <>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '70px' }}>CGST Rate</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '70px' }}>CGST Amount</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '70px' }}>SGST Rate</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '70px' }}>SGST Amount</th>
                          <th style={{ border: '1px solid #ccc', fontSize: '8px', fontWeight: 'bold', width: '115px' }}>Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {hsnSummaryArray.map((hsn, index) => (
                      <tr key={index} style={{ height: '20px' }}>
                        <td style={{ border: '1px solid #ccc', fontSize: '8px', paddingLeft: '2px' }}>{hsn.hsn}</td>
                        <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                          INR {hsn.taxableAmount.toFixed(2)}
                        </td>
                        {isInterState ? (
                          <>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>{hsn.gstRate}%</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                              INR {hsn.igstAmount.toFixed(2)}
                            </td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                              INR {hsn.totalAmount.toFixed(2)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>{hsn.gstRate / 2}%</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                              INR {hsn.cgstAmount.toFixed(2)}
                            </td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>{hsn.gstRate / 2}%</td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                              INR {hsn.sgstAmount.toFixed(2)}
                            </td>
                            <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                              INR {hsn.totalAmount.toFixed(2)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    <tr style={{ height: '20px', fontWeight: 'bold' }}>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', paddingLeft: '2px' }}>Total</td>
                      <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                        INR {totalTaxableAmount.toFixed(2)}
                      </td>
                      {isInterState ? (
                        <>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px' }}></td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalIGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalAmount.toFixed(2)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px' }}></td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalCGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px' }}></td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalSGST.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', fontSize: '8px', textAlign: 'right', paddingRight: '2px' }}>
                            INR {totalAmount.toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="bordered-box" style={{ padding: '8px', marginBottom: '15px' }}>
                <p style={{ fontSize: '9px', fontWeight: 'bold' }}>Invoice Amount In Words</p>
                <p style={{ fontSize: '8px' }}>{numberToWords(Math.floor(formData.total || 0))}</p>
              </div>

              {/* Footer: Bank Details and Terms */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {/* Bank Details (Left) */}
                <div className="bordered-box" style={{ width: '267px', height: '120px', padding: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 'bold' }}>Bank Details</p>
                  <p style={{ fontSize: '8px' }}>Name: {companySettings?.bankDetails?.bankName || 'Bank Of Baroda, Motiparabdi,'}</p>
                  <p style={{ fontSize: '8px' }}>Gujarat</p>
                  <p style={{ fontSize: '8px' }}>Account No.: {companySettings?.bankDetails?.accountNumber || '17910200000021'}</p>
                  <p style={{ fontSize: '8px' }}>IFSC code: {companySettings?.bankDetails?.IFSC || 'BARB0MOTIPA'}</p>
                  <p style={{ fontSize: '8px' }}>Account Holder's Name: {companySettings?.companyName || 'Company Name'}</p>
                </div>
                {/* Terms and Signature (Right) */}
                <div className="bordered-box" style={{ width: '258px', height: '120px', padding: '10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 'bold' }}>Terms and conditions</p>
                  <p style={{ fontSize: '8px', whiteSpace: 'pre-wrap' }}>
                    {companySettings?.termsAndConditions || 'Thank you for doing business with us.'}
                  </p>
                  <p style={{ fontSize: '8px', textAlign: 'right', marginTop: '20px' }}>
                    For: {companySettings?.companyName || 'COMPANY NAME'}
                  </p>
                  {companySettings?.companySign && !imageErrors.sign ? (
                    <>
                      <img
                        src={`${baseUrl}/${companySettings.companySign}`}
                        alt="Company Signature"
                        style={{ width: '60px', height: '30px', marginLeft: 'auto' }}
                        onError={handleImageError('sign')}
                      />
                      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>Authorized Signatory</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '8px', textAlign: 'right', color: '#999' }}>[Signature not available]</p>
                      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>Authorized Signatory</p>
                    </>
                  )}
                </div>
              </div>
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
                    <th className="px-6 py-4 text-right text-gray-300 font-medium">Total GST</th>
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
                              .map((p, i) => `${p.name || 'Unknown'} (Stock: ${p.stock || 0}, GST: ${p.gst || 0}%)`)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {Array.isArray(invoice.quantities) && invoice.quantities.length > 0
                          ? invoice.quantities.join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        {Array.isArray(invoice.gstAmounts) && invoice.gstAmounts.length > 0
                          ? `₹${invoice.gstAmounts.reduce((sum, amt) => sum + (amt || 0), 0).toLocaleString()}`
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