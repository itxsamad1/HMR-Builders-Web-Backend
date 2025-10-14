import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (no auth needed)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (no auth redirects)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  registerWithPayment: (userData) => api.post('/auth/register-with-payment', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Properties API (Complete)
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getFeatured: () => api.get('/properties/featured'),
  getBySlug: (slug) => api.get(`/properties/slug/${slug}`),
  getById: (id) => api.get(`/properties/${id}`),
  getStats: (id) => api.get(`/properties/${id}/stats`),
  create: (propertyData) => api.post('/properties', propertyData),
  update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  delete: (id) => api.delete(`/properties/${id}`),
};

// Investments API (Complete)
export const investmentsAPI = {
  create: (investmentData) => api.post('/investments', investmentData),
  getMyInvestments: (params) => api.get('/investments/my-investments', { params }),
  getByUserId: (userId) => api.get(`/investments/user/${userId}`),
  getById: (id) => api.get(`/investments/${id}`),
  updateStatus: (id, status) => api.patch(`/investments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/investments/${id}/cancel`),
  getPortfolioSummary: () => api.get('/investments/portfolio/summary'),
};

// Users API (Complete)
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getProfileById: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  submitKYC: (kycData) => api.post('/users/kyc', kycData),
  getKYCStatus: () => api.get('/users/kyc/status'),
  getActivity: () => api.get('/users/activity'),
  getNotifications: () => api.get('/users/notifications'),
  getWallet: () => api.get('/users/wallet'),
  getWalletById: (userId) => api.get(`/users/wallet/${userId}`),
  getHoldings: () => api.get('/users/holdings'),
};

// Payment Methods API
export const paymentMethodsAPI = {
  getAll: () => api.get('/payment-methods'),
  create: (paymentData) => api.post('/payment-methods', paymentData),
  setDefault: (id) => api.put(`/payment-methods/${id}/default`),
  delete: (id) => api.delete(`/payment-methods/${id}`),
  verify: (id, otp) => api.post(`/payment-methods/${id}/verify`, { otp }),
};

// Wallet Transactions API (Complete)
export const walletTransactionsAPI = {
  getAll: (params) => api.get('/wallet-transactions', { params }),
  createDeposit: (depositData) => api.post('/wallet-transactions/deposit', depositData),
  createWithdrawal: (withdrawalData) => api.post('/wallet-transactions/withdrawal', withdrawalData),
  verifyOTP: (id, otp) => api.post(`/wallet-transactions/${id}/verify-otp`, { otp }),
  getById: (id) => api.get(`/wallet-transactions/${id}`),
  getBalance: () => api.get('/wallet-transactions/balance/current'),
  getByUserId: (userId, params) => api.get(`/wallet-transactions/user/${userId}`, { params }),
};

// Admin API (Complete)
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getProperties: (params) => api.get('/admin/properties', { params }),
  getInvestments: (params) => api.get('/admin/investments', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Portfolio API (Mobile Optimized)
export const portfolioAPI = {
  getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
  getSummary: (userId) => api.get(`/portfolio/summary/${userId}`),
};

// Calculator API (Mobile Optimized)
export const calculatorAPI = {
  calculateROI: (data) => api.post('/calculator/roi', data),
  calculateInvestment: (data) => api.post('/calculator/investment', data),
};

// Support API (Mobile Optimized)
export const supportAPI = {
  submitContact: (data) => api.post('/support/contact', data),
  getFAQ: () => api.get('/support/faq'),
  getContactInfo: () => api.get('/support/contact-info'),
};

// Docs API
export const docsAPI = {
  getDocs: () => api.get('/docs'),
};

// KYC API
export const kycAPI = {
  submitKYC: (kycData) => api.post('/kyc/submit', kycData),
  uploadImage: (formData) => api.post('/kyc/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getKYCStatus: (userId) => api.get(`/kyc/status/${userId}`),
  updateKYCStatus: (kycId, statusData) => api.patch(`/kyc/update-status/${kycId}`, statusData),
  detectCardType: (cardNumber) => api.post('/kyc/detect-card-type', { cardNumber }),
};

export default api;
