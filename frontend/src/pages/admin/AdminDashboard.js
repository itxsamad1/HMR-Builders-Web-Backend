import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Settings,
  BarChart3,
  FileText,
  Shield,
  LogOut
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { adminAPI } from '../../services/api';
import { useAdminAuth } from '../../components/admin/AdminAuth';
import PropertiesManagement from './PropertiesManagement';
import UsersManagement from './UsersManagement';
import TransactionsManagement from './TransactionsManagement';
import InvestmentsManagement from './InvestmentsManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { adminUser, isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  
  
  // Fallback admin user from localStorage
  const fallbackAdminUser = React.useMemo(() => {
    if (adminUser) return adminUser;
    const adminUserData = localStorage.getItem('adminUser');
    if (adminUserData) {
      try {
        return JSON.parse(adminUserData);
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        return null;
      }
    }
    return null;
  }, [adminUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'admin-dashboard',
    () => adminAPI.getDashboard(),
    { 
      refetchInterval: 30000, // Refresh every 30 seconds
      enabled: isAuthenticated
    }
  );

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'admin-analytics',
    () => adminAPI.getAnalytics(),
    { 
      refetchInterval: 60000, // Refresh every minute
      enabled: isAuthenticated
    }
  );

  const stats = dashboardData?.data?.data || dashboardData?.data || {};
  const analytics = analyticsData?.data?.data || analyticsData?.data || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'investments', label: 'Investments', icon: TrendingUp }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change, changeType = 'positive', onClick }) => (
    <Card 
      className={`p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Users"
          value={stats.activeUsers || stats.totalUsers || 0}
          icon={Users}
          color="blue"
          change={analytics.usersGrowth}
          changeType="positive"
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          title="Total Properties"
          value={stats.totalProperties || stats.activeProperties || 0}
          icon={Building2}
          color="green"
          change={analytics.propertiesGrowth}
          changeType="positive"
          onClick={() => setActiveTab('properties')}
        />
        <StatCard
          title="Total Investments"
          value={`PKR ${(stats.totalInvestments || 0).toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
          change={analytics.investmentsGrowth}
          changeType="positive"
          onClick={() => setActiveTab('investments')}
        />
        <StatCard
          title="Active Transactions"
          value={stats.activeTransactions || 0}
          icon={Activity}
          color="purple"
          change={analytics.transactionsGrowth}
          changeType="positive"
          onClick={() => setActiveTab('transactions')}
        />
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-green-600">
                PKR {stats.totalRevenue?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">
                PKR {stats.monthlyRevenue?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commission Earned</span>
              <span className="font-semibold text-blue-600">
                PKR {stats.commissionEarned?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fully Funded</span>
              <span className="font-semibold text-green-600">
                {stats.fullyFundedProperties || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-yellow-600">
                {stats.inProgressProperties || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Funding</span>
              <span className="font-semibold">
                {stats.averageFunding || 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'properties':
        return <PropertiesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'transactions':
        return <TransactionsManagement />;
      case 'investments':
        return <InvestmentsManagement />;
      default:
        return renderOverview();
    }
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your real estate platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{fallbackAdminUser?.name || adminUser?.name || 'Admin'}</span>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
