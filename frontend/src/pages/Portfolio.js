import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { TrendingUp, DollarSign, Coins, PieChart, ArrowUpRight, Building2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { portfolioAPI, usersAPI, walletAPI } from '../services/api';
import Layout from '../components/Layout/Layout';
import PortfolioCard from '../components/PortfolioCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatCurrency, formatPercentage } from '../utils/formatLocation';
import { demoUser, demoPortfolio } from '../services/demoData';

const Portfolio = () => {
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Invalidate queries when user changes
  useEffect(() => {
    queryClient.invalidateQueries(['portfolio', userId]);
    queryClient.invalidateQueries(['portfolio-summary', userId]);
    queryClient.invalidateQueries(['profile', userId]);
    queryClient.invalidateQueries(['token-holdings', userId]);
  }, [userId, queryClient]);

  // Fetch portfolio data
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery(
    ['portfolio', userId],
    () => portfolioAPI.getPortfolio(userId),
    {
      enabled: !!userId,
    }
  );

  // Fetch portfolio summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    ['portfolio-summary', userId],
    () => portfolioAPI.getSummary(userId),
    {
      enabled: !!userId,
    }
  );

  // Fetch user stats (same as Dashboard)
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

  // Fetch user profile for additional data
  const { data: profileData } = useQuery(
    ['user-profile', userId],
    () => usersAPI.getProfileById(userId),
    {
      enabled: !!userId,
    }
  );

  // Fetch token holdings
  const { data: tokenHoldingsData, isLoading: tokenHoldingsLoading } = useQuery(
    ['token-holdings', userId],
    () => walletAPI.getHoldings(userId),
    {
      enabled: !!userId,
    }
  );

  const portfolio = portfolioData?.data?.data || {};
  const summary = summaryData?.data?.data || {};
  const profile = profileData?.data?.data || {};
  const userStats = statsData?.data?.data || statsData?.data || {};
  const tokenHoldings = tokenHoldingsData?.data?.data || {};

  // Debug logging
  console.log('Portfolio - Portfolio data:', portfolio);
  console.log('Portfolio - Summary data:', summary);
  console.log('Portfolio - Profile data:', profile);


  if (portfolioLoading || summaryLoading || statsLoading || tokenHoldingsLoading) { 
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
              <p className="text-gray-600">
                Track your real estate investments and returns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button as="a" href="/wallet?buyTokens=1" className="bg-green-600 hover:bg-green-700">View All Properties</Button>
              <Button 
                onClick={() => refetchStats()} 
                variant="outline"
                className="ml-0"
              >
                Refresh Stats
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(userStats.totalInvestment || tokenHoldings.summary?.total_invested_pkr || summary.totalInvestment || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(userStats.currentValue || tokenHoldings.summary?.total_current_value_pkr || summary.currentValue || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total ROI</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(userStats.totalROI || summary.totalROI || 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'tokens'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tokens')}
            >
              My Investments
            </button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Chart Placeholder */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Performance chart will be displayed here</p>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Coins className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {parseFloat(tokenHoldings.summary?.total_tokens || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Tokens</p>
                </Card>
                <Card className="p-4 text-center">
                  <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats.activeInvestments || tokenHoldings.summary?.total_holdings || portfolio.investments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Properties</p>
                </Card>
                <Card className="p-4 text-center">
                  <ArrowUpRight className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(userStats.totalROI || summary.totalROI || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Average ROI</p>
                </Card>
                <Card className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      (userStats.currentValue || summary.currentValue || 0) - 
                      (userStats.totalInvestment || summary.totalInvestment || 0)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Gains</p>
                </Card>
              </div>

              {/* My Investments preview on Overview */}
              {tokenHoldings.holdings && tokenHoldings.holdings.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">My Investments</h3>
                    <Button variant="outline" onClick={() => setActiveTab('tokens')}>View All</Button>
                  </div>
                  <div className="space-y-4">
                    {tokenHoldings.holdings.slice(0, 3).map((holding) => {
                      const gainLoss = parseFloat(holding.current_value_pkr || 0) - parseFloat(holding.total_invested_pkr || 0);
                      const gainLossPercentage = parseFloat(holding.total_invested_pkr || 0) > 0 
                        ? (gainLoss / parseFloat(holding.total_invested_pkr || 0)) * 100 
                        : 0;
                      return (
                        <div key={holding.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{holding.title}</h4>
                              <p className="text-sm text-gray-600">{holding.location_city}, {holding.location_state}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Current Value</p>
                              <p className="font-semibold">{formatCurrency(holding.current_value_pkr || 0)}</p>
                              <Button as="a" href={`/wallet?buyTokens=1&propertyId=${holding.property_id}`} className="mt-2 bg-green-600 hover:bg-green-700 py-1 px-3 text-sm">Invest</Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Tokens</p>
                              <p className="font-medium">{parseFloat(holding.tokens_owned || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Invested</p>
                              <p className="font-medium">{formatCurrency(holding.total_invested_pkr || 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Gain/Loss</p>
                              <p className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
                              </p>
                            </div>
                            <div className="hidden md:block" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-6">
              {/* Token Holdings Summary */}
              {tokenHoldings.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 text-center">
                    <Coins className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {tokenHoldings.summary.total_holdings || 0}
                    </p>
                    <p className="text-sm text-gray-600">Properties</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {parseFloat(tokenHoldings.summary.total_tokens || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(tokenHoldings.summary.total_invested_pkr || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Invested</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(tokenHoldings.summary.total_current_value_pkr || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Current Value</p>
                  </Card>
                </div>
              )}

              {/* Token Holdings List */}
              {tokenHoldings.holdings && tokenHoldings.holdings.length > 0 ? (
                <div className="space-y-4">
                  {tokenHoldings.holdings.map((holding) => {
                    const gainLoss = parseFloat(holding.current_value_pkr || 0) - parseFloat(holding.total_invested_pkr || 0);
                    const gainLossPercentage = parseFloat(holding.total_invested_pkr || 0) > 0 
                      ? (gainLoss / parseFloat(holding.total_invested_pkr || 0)) * 100 
                      : 0;

                    return (
                      <Card key={holding.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {holding.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {holding.location_city}, {holding.location_state}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Tokens Owned</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {parseFloat(holding.tokens_owned || 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total Invested</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(holding.total_invested_pkr || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Current Value</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(holding.current_value_pkr || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Gain/Loss</p>
                                <p className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Token Holdings Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your token portfolio by purchasing property tokens.
                  </p>
                  <Button as="a" href="/wallet">
                    Buy Tokens
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
