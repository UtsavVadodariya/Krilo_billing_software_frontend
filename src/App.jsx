import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import InvoiceForm from './components/InvoiceForm';
import AccountHistory from './components/AccountHistory';
import Login from './components/Login';
import Register from './components/Register';
import { useState, useEffect } from 'react';
import './index.css'
import Header from './components/Header';
import CustomerDetails from './components/CustomerDetails';
import CustomerForm from './components/CustomerForm';
import CompanySettingsForm from './components/CompanySettings';
import ProtectedRoute from './components/ProtectedRoute';
import { setupAxiosInterceptors, validateToken } from './axiosConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    console.log('Logging out user...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    console.log('User logged in');
    setIsAuthenticated(true);
  };

  // Initialize app and validate token
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      
      // Setup axios interceptors first
      setupAxiosInterceptors(handleLogout);
      
      // Check if token exists and validate it
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token found, validating...');
        const isValid = await validateToken();
        if (isValid) {
          console.log('Token is valid, user authenticated');
          setIsAuthenticated(true);
        } else {
          console.log('Token is invalid, user not authenticated');
          setIsAuthenticated(false);
        }
      } else {
        console.log('No token found, user not authenticated');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Show loading screen while validating token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/products') return 'products';
    if (path === '/invoices') return 'invoices';
    if (path === '/accounts') return 'accounts';
    if (path === '/customer-details') return 'customer-details';
    return 'dashboard';
  };

  return (
    <Router>
      <div>
        <Header
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
          currentPage={getCurrentPage()}
        />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AccountHistory />
              </ProtectedRoute>
            }
          />
           <Route
            path="/customer-details"
            element={
              <ProtectedRoute>
                <CustomerDetails />
              </ProtectedRoute>
            }
          />
           <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
           <Route
            path="/company-settings"
            element={
              <ProtectedRoute>
                <CompanySettingsForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;