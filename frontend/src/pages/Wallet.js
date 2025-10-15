import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useUser } from '../contexts/UserContext';
import { walletTransactionsAPI, paymentMethodsAPI, usersAPI } from '../services/api';
import { formatCurrency } from '../utils/formatLocation';
import BuyTokens from '../components/BuyTokens';
import OnChainDeposit from '../components/OnChainDeposit';

const Wallet = () => {
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showOnChainDepositModal, setShowOnChainDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Invalidate queries when user changes
  useEffect(() => {
    if (currentUser?.name) {
      console.log('Wallet: User changed to:', currentUser.name, 'ID:', userId);
    }
    queryClient.invalidateQueries(['wallet-balance', userId]);
    queryClient.invalidateQueries(['wallet-transactions', userId]);
    queryClient.invalidateQueries(['paymentMethods', userId]);
  }, [userId, queryClient, currentUser?.name]);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  
  // Optional deep link flags from query string - MUST be before early returns
  const params = new URLSearchParams(window.location.search);
  const openBuyTokens = params.get('buyTokens') === '1';
  const preselectPropertyId = params.get('propertyId');

  // Auto-open buy tokens modal from URL parameter
  useEffect(() => {
    if (openBuyTokens) {
      setShowBuyTokens(true);
    }
  }, [openBuyTokens]);
  

  // Fetch wallet balance data
  const { data: walletBalanceData, isLoading: walletBalanceLoading, error: walletBalanceError } = useQuery(
    ['wallet-balance', userId],
    () => usersAPI.getWalletById(userId),
    { 
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('Wallet balance data for', currentUser?.name || 'User', ':', data);
      },
      onError: (error) => {
        console.error('Wallet balance error for', currentUser?.name || 'User', ':', error);
      }
    }
  );

  // Fetch wallet transactions
  const { data: walletTransactionsData, isLoading: walletTransactionsLoading, error: walletTransactionsError } = useQuery(
    ['wallet-transactions', userId],
    () => walletTransactionsAPI.getByUserId(userId),
    { 
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('Wallet transactions data for', currentUser?.name || 'User', ':', data);
      },
      onError: (error) => {
        console.error('Wallet transactions error for', currentUser?.name || 'User', ':', error);
      }
    }
  );

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery(
    ['paymentMethods', userId],
    () => paymentMethodsAPI.getAll(userId),
    { enabled: !!userId }
  );

  // Deposit mutation
  const depositMutation = useMutation((data) => walletTransactionsAPI.createDeposit({ ...data, userId }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['wallet-balance', userId]);
      queryClient.invalidateQueries(['wallet-transactions', userId]);
      setShowDepositModal(false);
      reset();
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation((data) => walletTransactionsAPI.createWithdrawal({ ...data, userId }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['wallet-balance', userId]);
      queryClient.invalidateQueries(['wallet-transactions', userId]);
      setShowWithdrawModal(false);
      reset();
    },
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation(paymentMethodsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('paymentMethods');
      setShowAddPaymentModal(false);
      reset();
    },
  });

  const wallet = walletBalanceData?.data?.data || {};
  const transactions = Array.isArray(walletTransactionsData?.data?.data) ? walletTransactionsData.data.data : [];
  const paymentMethods = Array.isArray(paymentMethodsData?.data?.data) ? paymentMethodsData.data.data : [];

  // Debug logging
  console.log('Wallet data:', wallet);
  console.log('Transactions data:', walletTransactionsData);
  console.log('Transactions array:', transactions);
  console.log('Payment methods for user', currentUser?.name || 'User', '(', userId, '):', paymentMethods);

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return transaction.transaction_type === 'deposit';
    if (filter === 'withdrawals') return transaction.transaction_type === 'withdrawal';
    if (filter === 'investments') return transaction.transaction_type === 'investment';
    if (filter === 'returns') return transaction.transaction_type === 'return';
    return true;
  }) : [];

  const getTransactionIcon = (transactionType, status) => {
    if (status === 'completed') {
      if (transactionType === 'deposit' || transactionType === 'return') return ArrowDownRight;
      if (transactionType === 'investment' || transactionType === 'withdrawal') return ArrowUpRight;
    }
    return Clock;
  };

  const getTransactionColor = (transactionType, status) => {
    if (status === 'completed') {
      if (transactionType === 'deposit' || transactionType === 'return') return 'text-green-600';
      if (transactionType === 'investment' || transactionType === 'withdrawal') return 'text-red-600';
    }
    if (status === 'pending') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      'pending': { icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
      'failed': { icon: XCircle, color: 'text-red-600 bg-red-100' },
    };
    const statusInfo = statusMap[status] || { icon: Clock, color: 'text-gray-600 bg-gray-100' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <statusInfo.icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const onDepositSubmit = (data) => {
    if (!data.paymentMethodId) {
      alert('Please select a payment method');
      return;
    }
    
    if (!data.amount || data.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    depositMutation.mutate({
      userId: userId,
      amount: parseFloat(data.amount),
      paymentMethodId: data.paymentMethodId,
    });
  };

  const onWithdrawSubmit = (data) => {
    if (!data.paymentMethodId) {
      alert('Please select a payment method');
      return;
    }
    
    if (!data.amount || data.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    withdrawMutation.mutate({
      userId: userId,
      amount: parseFloat(data.amount),
      paymentMethodId: data.paymentMethodId,
    });
  };

  if (walletBalanceLoading || walletTransactionsLoading || paymentMethodsLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading wallet{currentUser?.name ? ` for ${currentUser.name}` : ''}...</p>
                <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your funds and transaction history</p>
          </div>

          {/* Wallet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <WalletIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(wallet.availableBalance || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <ArrowDownRight className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Deposited</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(wallet.totalDeposited || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <ArrowUpRight className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(wallet.totalWithdrawn || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {/* Primary Actions */}
            <div className="flex gap-4">
              <Button onClick={() => setShowDepositModal(true)} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Debit Card Deposit
              </Button>
              <Button onClick={() => setShowOnChainDepositModal(true)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <WalletIcon className="h-4 w-4 mr-2" />
                On-Chain & Third-Party
              </Button>
              <Button onClick={() => setShowWithdrawModal(true)} variant="outline" className="flex-1">
                <Minus className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex gap-4">
              <Button onClick={() => setShowBuyTokens(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                <WalletIcon className="h-4 w-4 mr-2" />
                Buy Tokens
              </Button>
              <Button onClick={() => setShowAddPaymentModal(true)} variant="outline" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="deposits">Deposits</option>
                  <option value="withdrawals">Withdrawals</option>
                  <option value="investments">Investments</option>
                  <option value="returns">Dividends</option>
                </select>
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => {
                  const IconComponent = getTransactionIcon(transaction.transaction_type, transaction.status);
                  const getTransactionLabel = (transactionType, metadata) => {
                    // Parse metadata to get provider info
                    let provider = '';
                    try {
                      if (metadata) {
                        const meta = JSON.parse(metadata);
                        provider = meta.provider || '';
                      }
                    } catch (e) {
                      // Ignore parsing errors
                    }

                    switch (transactionType) {
                      case 'deposit': 
                        if (provider === 'binance') return 'Binance Pay Deposit';
                        return 'Deposit';
                      case 'withdrawal': return 'Withdrawal';
                      case 'investment': return 'Investment';
                      case 'return': return 'Dividend';
                      default: return 'Transaction';
                    }
                  };
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <IconComponent className={`h-5 w-5 mr-3 ${getTransactionColor(transaction.transaction_type, transaction.status)}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getTransactionLabel(transaction.transaction_type, transaction.metadata)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type, transaction.status)}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </Card>

          {/* Deposit Modal */}
          {showDepositModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 m-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Funds</h3>
                <form onSubmit={handleSubmit(onDepositSubmit)} className="space-y-4">
                  <Input
                    label="Amount (PKR)"
                    type="number"
                    step="0.01"
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 1000, message: 'Minimum deposit is PKR 1,000' }
                    })}
                    error={errors.amount?.message}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register('paymentMethodId', { 
                        required: 'Payment method is required' 
                      })}
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.card_type} - {method.card_number_masked}
                        </option>
                      ))}
                    </select>
                    {errors.paymentMethodId && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentMethodId.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={depositMutation.isLoading}>
                      {depositMutation.isLoading ? 'Processing...' : 'Deposit'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDepositModal(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                  
                </form>
              </Card>
            </div>
          )}

          {/* Withdraw Modal */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 m-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
                <form onSubmit={handleSubmit(onWithdrawSubmit)} className="space-y-4">
                  <Input
                    label="Amount (PKR)"
                    type="number"
                    step="0.01"
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 1000, message: 'Minimum withdrawal is PKR 1,000' },
                      max: { 
                        value: wallet.availableBalance || 0, 
                        message: 'Insufficient balance' 
                      }
                    })}
                    error={errors.amount?.message}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register('paymentMethodId', { 
                        required: 'Payment method is required' 
                      })}
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.card_type} - {method.card_number_masked}
                        </option>
                      ))}
                    </select>
                    {errors.paymentMethodId && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentMethodId.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={withdrawMutation.isLoading}>
                      {withdrawMutation.isLoading ? 'Processing...' : 'Withdraw'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowWithdrawModal(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                  
                </form>
              </Card>
            </div>
          )}

          {/* On-Chain & Third-Party Deposit Modal */}
          {showOnChainDepositModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="w-full max-w-2xl p-4">
                <OnChainDeposit
                  userId={userId}
                  onDepositSuccess={(data) => {
                    queryClient.invalidateQueries(['wallet-balance', userId]);
                    queryClient.invalidateQueries(['wallet-transactions', userId]);
                    setShowOnChainDepositModal(false);
                  }}
                  onClose={() => setShowOnChainDepositModal(false)}
                />
              </div>
            </div>
          )}

          {/* Buy Tokens Modal */}
          {showBuyTokens && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="w-full max-w-4xl p-4">
                <Card className="max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Buy Property Tokens</h3>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBuyTokens(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                  <BuyTokens 
                    userId={userId} 
                    preselectPropertyId={preselectPropertyId}
                    onPurchaseSuccess={(data) => {
                      queryClient.invalidateQueries(['wallet-balance', userId]);
                      queryClient.invalidateQueries(['wallet-transactions', userId]);
                      setShowBuyTokens(false);
                    }}
                  />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
