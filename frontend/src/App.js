import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UserProvider } from './contexts/UserContext';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import PropertyDetail from './pages/admin/PropertyDetail';
import { AdminAuthProvider } from './components/admin/AdminAuth';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/login" element={
                      <AdminAuthProvider>
                        <AdminLogin />
                      </AdminAuthProvider>
                    } />
                    <Route path="/admin" element={
                      <AdminAuthProvider>
                        <AdminDashboard />
                      </AdminAuthProvider>
                    } />
                    <Route path="/admin/property/:propertyId" element={
                      <AdminAuthProvider>
                        <PropertyDetail />
                      </AdminAuthProvider>
                    } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
