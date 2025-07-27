// Create this file as src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { validateToken } from '../axiosConfig';

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      console.log('ProtectedRoute: Validating token...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('ProtectedRoute: No token found');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const valid = await validateToken();
        console.log('ProtectedRoute: Token validation result:', valid);
        setIsValid(valid);
      } catch (error) {
        console.log('ProtectedRoute: Token validation failed:', error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Validating access...</div>
      </div>
    );
  }

  if (!isValid) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;