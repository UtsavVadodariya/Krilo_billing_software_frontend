import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { baseUrl } from '../utils/baseUrl';
import { Building2, MapPin, Globe, CreditCard, FileText, Upload, Save, X } from 'lucide-react';

const CompanySettingsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    GSTIN: '',
    termsAndConditions: '',
    bankName: '',
    accountNumber: '',
    IFSC: '',
    branch: '',
    contactNumber: '',
  });
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companySign, setCompanySign] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [signPreview, setSignPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch existing settings
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/company-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          companyName: response.data.companyName || '',
          address: response.data.address || '',
          country: response.data.country || '',
          state: response.data.state || '',
          city: response.data.city || '',
          pincode: response.data.pincode || '',
          GSTIN: response.data.GSTIN || '',
          termsAndConditions: response.data.termsAndConditions || '',
          bankName: response.data.bankDetails.bankName || '',
          accountNumber: response.data.bankDetails.accountNumber || '',
          IFSC: response.data.bankDetails.IFSC || '',
          branch: response.data.bankDetails.branch || '',
          contactNumber: response.data.contactNumber || '',
        });
        if (response.data.companyLogo) {
          setLogoPreview(`/${response.data.companyLogo}`);
        }
        if (response.data.companySign) {
          setSignPreview(`/${response.data.companySign}`);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch company settings');
        }
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const file = files[0];
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only JPEG/PNG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (name === 'companyLogo') {
        setCompanyLogo(file);
        setLogoPreview(URL.createObjectURL(file));
      } else if (name === 'companySign') {
        setCompanySign(file);
        setSignPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    const requiredFields = ['companyName', 'address', 'country', 'state', 'city', 'pincode'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1')} is required`);
        setLoading(false);
        return;
      }
    }

    // Prepare FormData
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (companyLogo) {
      data.append('companyLogo', companyLogo);
    }
    if (companySign) {
      data.append('companySign', companySign);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/api/company-settings`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Company settings saved successfully');
      navigate('/'); // Adjust as needed
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save company settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Building2 className="w-8 h-8 mr-3" />
            Company Settings
          </h2>
          <p className="text-gray-400">Configure your business information and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Building2 className="w-6 h-6 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2" />
              Address Information
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">GSTIN</label>
                  <input
                    type="text"
                    name="GSTIN"
                    value={formData.GSTIN}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Terms and Conditions
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Terms and Conditions</label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300 resize-none"
                rows="4"
                placeholder="Enter your terms and conditions..."
              />
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">IFSC Code</label>
                <input
                  type="text"
                  name="IFSC"
                  value={formData.IFSC}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* File Uploads Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-2" />
              Company Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 block">Company Logo</label>
                <div className="relative">
                  <input
                    type="file"
                    name="companyLogo"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-slate-700/70 transition-all duration-300">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Click to upload logo</p>
                    <p className="text-gray-500 text-xs mt-1">JPEG, PNG (Max 5MB)</p>
                  </div>
                </div>
                {logoPreview && (
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <img src={logoPreview} alt="Logo Preview" className="h-20 w-auto mx-auto rounded-md" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 block">Company Signature</label>
                <div className="relative">
                  <input
                    type="file"
                    name="companySign"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-slate-700/70 transition-all duration-300">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Click to upload signature</p>
                    <p className="text-gray-500 text-xs mt-1">JPEG, PNG (Max 5MB)</p>
                  </div>
                </div>
                {signPreview && (
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <img src={signPreview} alt="Sign Preview" className="h-20 w-auto mx-auto rounded-md" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all duration-300 flex items-center"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Krilo Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsForm;