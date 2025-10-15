import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (no auth needed for demo)
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
  getFilterOptions: () => api.get('/properties/filter-options'),
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
  getAll: () => api.get('/users'),
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
  getAllUsers: () => api.get('/users/all'),
};

// Payment Methods API
export const paymentMethodsAPI = {
  getAll: (userId) => api.get(`/payment-methods${userId ? `?userId=${userId}` : ''}`),
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
  // New on-chain and third-party deposit methods
  createOnChainDeposit: (data) => api.post('/wallet-transactions/deposit', { 
    userId: data.userId,
    provider: data.blockchain,
    action: 'generate',
    amount: 1000, // Default amount for address generation
    currency: 'PKR'
  }),
  createThirdPartyDeposit: (data) => api.post('/wallet-transactions/deposit', { ...data, type: 'thirdparty' }),
};

// Admin API (Complete)
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  
  // Users CRUD
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  
  // Properties CRUD
  getProperties: (params) => api.get('/admin/properties', { params }),
  getProperty: (id) => api.get(`/admin/properties/${id}`),
  createProperty: (data) => api.post('/admin/properties', data),
  updateProperty: (id, data) => api.put(`/admin/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
  updatePropertyStatus: (id, data) => api.patch(`/admin/properties/${id}/status`, data),
  
  // Other
  getInvestments: (params) => api.get('/admin/investments', { params }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
};

// Portfolio API (Mobile Optimized)
export const portfolioAPI = {
  getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
  getSummary: (userId) => api.get(`/portfolio/summary/${userId}`),
  getStats: (userId) => api.get(`/portfolio/stats/${userId}`),
  updateStats: (userId, statsData) => api.put(`/portfolio/stats/${userId}`, statsData),
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

// Wallet API (Token Purchase & Management)
export const walletAPI = {
  buyTokens: (data) => api.post('/wallet/buy-tokens', data),
  getHoldings: (userId) => api.get(`/wallet/holdings/${userId}`),
  getHistory: (userId, params) => api.get(`/wallet/history/${userId}`, { params }),
  getProperties: (params) => api.get('/wallet/properties', { params }),
  getProperty: (id) => api.get(`/wallet/properties/${id}`),
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
