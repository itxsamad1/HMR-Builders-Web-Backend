import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Settings
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { adminAPI } from '../../services/api';
import { useAdminAuth } from '../../components/admin/AdminAuth';

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch comprehensive property data
  const { data: propertyData, isLoading, error } = useQuery(
    ['property-detail', propertyId],
    () => adminAPI.getPropertyDetail(propertyId),
    {
      enabled: Boolean(isAuthenticated && propertyId)
    }
  );

  const property = propertyData?.data?.data || propertyData?.data || {};
  const metrics = property.metrics || {};
  const investments = property.investments || [];
  const tokenPurchases = property.tokenPurchases || [];
  const tokenTransactions = property.tokenTransactions || [];

  const formatPrice = (amount, currency = 'PKR') => {
    const num = parseFloat(amount);
    if (num >= 1000000000) {
      return `${currency} ${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${currency} ${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${currency} ${(num / 1000).toFixed(0)}K`;
    }
    return `${currency} ${num.toFixed(0)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'coming-soon': { variant: 'warning', text: 'Coming Soon' },
      'active': { variant: 'success', text: 'Active' },
      'construction': { variant: 'info', text: 'Under Construction' },
      'on-hold': { variant: 'secondary', text: 'On Hold' },
      'sold-out': { variant: 'danger', text: 'Sold Out' },
      'completed': { variant: 'primary', text: 'Completed' }
    };
    return statusMap[status] || { variant: 'default', text: status };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'tokens', label: 'Token Activity', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: Activity }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change, changeType = 'positive' }) => (
    <Card className="p-6">
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
          title="Total Investment"
          value={formatPrice(metrics.totalInvestment || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Buyers"
          value={metrics.totalBuyers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Tokens Left"
          value={metrics.tokensLeft || 0}
          icon={Target}
          color="yellow"
        />
        <StatCard
          title="ROI"
          value={`${metrics.roi || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Price Per Token"
          value={formatPrice(metrics.pricePerToken || 0)}
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Total Tokens"
          value={metrics.totalTokens || 0}
          icon={PieChart}
          color="pink"
        />
        <StatCard
          title="Funding Progress"
          value={`${metrics.fundingProgress || 0}%`}
          icon={BarChart3}
          color="teal"
        />
      </div>

      {/* Property Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <p className="text-sm text-gray-900">{property.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <p className="text-sm text-gray-900 capitalize">{property.property_type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Badge variant={getStatusBadge(property.status).variant}>
              {getStatusBadge(property.status).text}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <p className="text-sm text-gray-900">{property.location_city}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
            <p className="text-sm text-gray-900">{formatPrice(property.pricing_total_value)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment</label>
            <p className="text-sm text-gray-900">{formatPrice(property.pricing_min_investment)}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderInvestments = () => (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Investment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {investment.user_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {investment.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(investment.investment_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {investment.tokens_purchased?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(investment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">Completed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTokens = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Tokens</label>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalTokens || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Sold</label>
            <p className="text-2xl font-bold text-gray-900">{metrics.tokensSold || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Left</label>
            <p className="text-2xl font-bold text-gray-900">{metrics.tokensLeft || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Token</label>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(metrics.pricePerToken || 0)}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Token Purchases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokenPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.user_name || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.tokens_purchased?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(purchase.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(purchase.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokenTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="info">{transaction.transaction_type}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">Completed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'investments':
        return renderInvestments();
      case 'tokens':
        return renderTokens();
      case 'transactions':
        return renderTransactions();
      default:
        return renderOverview();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view property details.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading property details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load property details</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
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
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <p className="text-sm text-gray-600">{property.location_city}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Property</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
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

export default PropertyDetail;
