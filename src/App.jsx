import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import InvoiceForm from './components/InvoiceForm';
import AccountHistory from './components/AccountHistory';
import Login from './components/Login';
import Register from './components/Register';
import { useState } from 'react';
import './index.css'
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/products') return 'products';
    if (path === '/invoices') return 'invoices';
    if (path === '/accounts') return 'accounts';
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
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/products"
            element={isAuthenticated ? <ProductList /> : <Navigate to="/login" />}
          />
          <Route
            path="/invoices"
            element={isAuthenticated ? <InvoiceForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/accounts"
            element={isAuthenticated ? <AccountHistory /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;