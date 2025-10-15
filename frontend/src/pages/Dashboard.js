import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  PieChart, 
  Wallet, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PropertyCard from '../components/PropertyCard';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  portfolioAPI, 
  usersAPI, 
  investmentsAPI, 
  propertiesAPI,
  walletTransactionsAPI 
} from '../services/api';
import { formatCurrency, formatPercentage, formatPrice } from '../utils/formatLocation';
import { demoUser, demoPortfolio, demoWallet, demoTransactions } from '../services/demoData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  const queryClient = useQueryClient();

  const handleInvest = (property) => {
    navigate(`/wallet?buyTokens=1&propertyId=${property.id}`);
  };

  // Invalidate queries when user changes
  useEffect(() => {
    console.log('User changed to:', currentUser?.name, 'ID:', userId);
    queryClient.invalidateQueries(['portfolio', userId]);
    queryClient.invalidateQueries(['portfolio-summary', userId]);
    queryClient.invalidateQueries(['profile', userId]);
    queryClient.invalidateQueries(['investments', userId]);
    queryClient.invalidateQueries(['wallet', userId]);
    queryClient.invalidateQueries(['transactions', userId]);
    queryClient.invalidateQueries(['featured-properties']);
  }, [userId, queryClient, currentUser?.name]);

  // Fetch dashboard data
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = useQuery(
    ['portfolio', userId],
    () => portfolioAPI.getPortfolio(userId),
    { 
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('Portfolio data for', currentUser?.name, ':', data);
      },
      onError: (error) => {
        console.error('Portfolio error for', currentUser?.name, ':', error);
      }
    }
  );

  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    ['portfolioSummary', userId],
    () => portfolioAPI.getSummary(userId),
    { enabled: !!userId }
  );

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery(
    ['profile', userId],
    () => usersAPI.getProfileById(userId),
    { 
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('Profile data for', currentUser?.name, ':', data);
      },
      onError: (error) => {
        console.error('Profile error for', currentUser?.name, ':', error);
      }
    }
  );

  const { data: investmentsData, isLoading: investmentsLoading } = useQuery(
    ['investments', userId],
    () => investmentsAPI.getByUserId(userId),
    { enabled: !!userId }
  );

  const { data: walletData, isLoading: walletLoading } = useQuery(
    ['wallet', userId],
    () => usersAPI.getWalletById(userId),
    { enabled: !!userId }
  );

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery(
    ['recentTransactions', userId],
    () => walletTransactionsAPI.getByUserId(userId, { limit: 5 }),
    { enabled: !!userId }
  );

  const { data: featuredProperties, isLoading: propertiesLoading } = useQuery(
    'featuredProperties',
    () => propertiesAPI.getFeatured()
  );

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ['portfolio-stats', userId],
    () => portfolioAPI.getStats(userId),
    { 
      enabled: !!userId,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache the data
      refetchOnWindowFocus: true // Refetch when window gains focus
    }
  );

  const portfolio = portfolioData?.data?.data || {};
  const summary = summaryData?.data?.data || {};
  const profile = profileData?.data?.data || {};
  const investments = investmentsData?.data?.data?.investments || [];
  const wallet = walletData?.data?.data || {};
  const transactions = recentTransactions?.data?.data?.transactions || [];
  const properties = featuredProperties?.data?.data?.properties || featuredProperties?.data?.properties || featuredProperties?.properties || [];
  const userStats = statsData?.data?.data || statsData?.data || {};


  if (portfolioLoading || summaryLoading || profileLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard for {currentUser?.name}...</p>
                <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }


  const stats = [
    {
      name: 'Total Investment',
      value: formatCurrency(userStats.totalInvestment || portfolio.totalInvestment || 0),
      change: userStats.totalInvestmentChange !== undefined ? 
        `${userStats.totalInvestmentChange >= 0 ? '+' : ''}${userStats.totalInvestmentChange}%` : '+0%',
      changeType: userStats.totalInvestmentChange > 0 ? 'positive' : userStats.totalInvestmentChange < 0 ? 'negative' : 'neutral',
      icon: DollarSign,
    },
    {
      name: 'Current Value',
      value: formatCurrency(userStats.currentValue || portfolio.currentValue || 0),
      change: userStats.currentValueChange !== undefined ? 
        `${userStats.currentValueChange >= 0 ? '+' : ''}${userStats.currentValueChange}%` : '+0%',
      changeType: userStats.currentValueChange > 0 ? 'positive' : userStats.currentValueChange < 0 ? 'negative' : 'neutral',
      icon: TrendingUp,
    },
    {
      name: 'Total ROI',
      value: formatPercentage(userStats.totalROI || portfolio.totalROI || 0),
      change: userStats.totalROIChange !== undefined ? 
        `${userStats.totalROIChange >= 0 ? '+' : ''}${userStats.totalROIChange}%` : '+0%',
      changeType: userStats.totalROIChange > 0 ? 'positive' : userStats.totalROIChange < 0 ? 'negative' : 'neutral',
      icon: PieChart,
    },
    {
      name: 'Active Investments',
      value: (userStats.activeInvestments || investments.length).toString(),
      change: userStats.activeInvestmentsChange !== undefined ? 
        `${userStats.activeInvestmentsChange >= 0 ? '+' : ''}${userStats.activeInvestmentsChange}` : '+0',
      changeType: userStats.activeInvestmentsChange > 0 ? 'positive' : userStats.activeInvestmentsChange < 0 ? 'negative' : 'neutral',
      icon: Building2,
    },
  ];

  // Early return if no user is selected
  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile.firstName || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's an overview of your investment portfolio
              </p>
            </div>
            <Button 
              onClick={() => refetchStats()} 
              variant="outline"
              className="ml-4"
            >
              Refresh Stats
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.name} className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
                  <Button as={Link} to="/portfolio" variant="outline">
                    View All
                  </Button>
                </div>
                
                {investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.slice(0, 3).map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Building2 className="h-8 w-8 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {investment.property?.title || 'Property'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {investment.property?.location || 'Location'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(investment.currentValue || investment.investmentAmount)}
                          </p>
                          <p className="text-sm text-green-600">
                            {formatPercentage(investment.roiPercentage || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No investments yet</p>
                    <Button as={Link} to="/properties">
                      Start Investing
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${
                            transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Featured Properties */}
          {properties.length > 0 && (
            <div className="mt-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Featured Properties</h2>
                  <Button as={Link} to="/properties" variant="outline">
                    View All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} property={property} onInvest={handleInvest} />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;