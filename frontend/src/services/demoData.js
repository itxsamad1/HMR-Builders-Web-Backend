// Demo data for the application when not using authentication
export const demoUser = {
  id: 'demo-user-1',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@hmrbuilders.com',
  phone: '+92 300 1234567',
  memberSince: '2024-01-15T00:00:00Z',
  kycStatus: 'verified',
  totalInvestments: 2500000,
  totalReturns: 125000,
  walletBalance: 50000
};

export const demoPortfolio = {
  totalInvestment: 2500000,
  currentValue: 2625000,
  totalROI: 5.0,
  totalTokens: 1250,
  investments: [
    {
      id: 'inv-1',
      property: {
        id: 'prop-1',
        title: 'Luxury Apartment Complex',
        location: 'DHA Phase 8, Lahore'
      },
      tokens: 500,
      totalTokens: 1000,
      investment: 1000000,
      currentValue: 1050000,
      roi: '5.00%',
      status: 'active',
      investmentDate: '2024-01-15T00:00:00Z'
    },
    {
      id: 'inv-2',
      property: {
        id: 'prop-2',
        title: 'Commercial Plaza',
        location: 'Gulberg, Lahore'
      },
      tokens: 750,
      totalTokens: 1500,
      investment: 1500000,
      currentValue: 1575000,
      roi: '5.00%',
      status: 'active',
      investmentDate: '2024-02-01T00:00:00Z'
    }
  ]
};

export const demoWallet = {
  availableBalance: 50000,
  totalDeposited: 3000000,
  totalWithdrawn: 500000,
  totalInvested: 2500000,
  totalReturns: 125000
};

export const demoTransactions = [
  {
    id: 'txn-1',
    type: 'deposit',
    amount: 1000000,
    status: 'completed',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'txn-2',
    type: 'deposit',
    amount: 2000000,
    status: 'completed',
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'txn-3',
    type: 'withdrawal',
    amount: 500000,
    status: 'completed',
    created_at: '2024-02-15T00:00:00Z'
  }
];

export const demoPaymentMethods = [
  {
    id: 'pm-1',
    type: 'bank_account',
    last_four_digits: '1234',
    bank_name: 'HBL'
  },
  {
    id: 'pm-2',
    type: 'credit_card',
    last_four_digits: '5678',
    bank_name: 'MCB'
  }
];
