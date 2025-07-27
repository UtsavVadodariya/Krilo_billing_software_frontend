// Create this file as src/axiosConfig.js
import axios from 'axios';
import { baseUrl } from './utils/baseUrl';

// Set base URL
axios.defaults.baseURL = `${baseUrl}`;

let isRedirecting = false; // Prevent multiple redirects

// Function to set up axios interceptors
export const setupAxiosInterceptors = (handleLogout) => {
  // Clear any existing interceptors
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();

  // Request interceptor to add token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Making request to:', config.url, 'with token:', !!token);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log('Axios interceptor caught error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });

      if (error.response?.status === 401 && !isRedirecting) {
        console.log('401 Unauthorized detected, logging out...');
        isRedirecting = true;
        
        // Clear token
        localStorage.removeItem('token');
        
        // Call logout handler
        handleLogout();
        
        // Force redirect to login page
        setTimeout(() => {
          window.location.href = '/';
          isRedirecting = false;
        }, 100);
      }
      
      return Promise.reject(error);
    }
  );
};

// Function to validate token
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await axios.get('/api/auth/validate-token');
    console.log('Token validation successful:', response.data);
    return true;
  } catch (error) {
    console.log('Token validation failed:', error.response?.data);
    localStorage.removeItem('token');
    return false;
  }
};

export default axios;