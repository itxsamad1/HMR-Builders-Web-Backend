import React, { useState } from 'react';
import { walletTransactionsAPI } from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { 
  Copy, 
  Share2, 
  QrCode, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Coins,
  CreditCard
} from 'lucide-react';

const OnChainDeposit = ({ userId, onDepositSuccess, onClose }) => {
  const [step, setStep] = useState('select'); // 'select', 'onchain', 'thirdparty'
  const [selectedBlockchain, setSelectedBlockchain] = useState('');
  const [onChainData, setOnChainData] = useState(null);
  const [binanceAmount, setBinanceAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const blockchains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-500' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', color: 'bg-cyan-500' },
    { id: 'bnb', name: 'Binance Smart Chain', symbol: 'BNB', color: 'bg-yellow-500' }
  ];

  const handleBlockchainSelect = async (blockchain) => {
    setSelectedBlockchain(blockchain);
    setLoading(true);
    setError('');

    try {
      const response = await walletTransactionsAPI.createOnChainDeposit({
        userId,
        blockchain
      });

      if (response.data.success) {
        setOnChainData(response.data.data);
        setStep('onchain');
      } else {
        setError(response.data.error || 'Failed to generate deposit address');
      }
    } catch (error) {
      console.error('On-chain deposit error:', error);
      setError('Failed to generate deposit address');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    const address = onChainData.depositAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    navigator.clipboard.writeText(address);
    // You could add a toast notification here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'HMR Builders Deposit Address',
        text: onChainData.shareText,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(onChainData.shareText);
    }
  };

  const handleBinanceDeposit = async () => {
    if (!binanceAmount || parseFloat(binanceAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Direct deposit without QR code generation
      const response = await walletTransactionsAPI.createThirdPartyDeposit({
        userId,
        amount: parseFloat(binanceAmount),
        currency: 'PKR',
        provider: 'binance',
        action: 'complete'
      });

      if (response.data.success) {
        setSuccess(`Successfully deposited ${binanceAmount} PKR via Binance Pay!`);
        if (onDepositSuccess) {
          onDepositSuccess(response.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.error || 'Deposit failed');
      }
    } catch (error) {
      console.error('Binance deposit error:', error);
      setError('Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };


  const renderBlockchainSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Blockchain Network</h3>
        <p className="text-gray-600">Choose your preferred blockchain for on-chain deposits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blockchains.map((blockchain) => (
          <button
            key={blockchain.id}
            onClick={() => handleBlockchainSelect(blockchain.id)}
            disabled={loading}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${blockchain.color} rounded-full flex items-center justify-center`}>
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">{blockchain.name}</h4>
                <p className="text-sm text-gray-500">{blockchain.symbol}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Generating deposit address...</p>
        </div>
      )}
    </div>
  );

  const renderOnChainDeposit = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">On-Chain Deposit</h3>
        <p className="text-gray-600">Send funds to the address below</p>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className="inline-block p-3 bg-white border border-gray-200 rounded-lg">
          <img 
            src={onChainData.qrCode} 
            alt="QR Code" 
            className="w-32 h-32"
          />
        </div>
      </div>

      {/* Contract Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Contract Address</label>
        <div className="flex items-center space-x-2">
          <Input
            value={onChainData.depositAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            onClick={handleCopyAddress}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button
        onClick={handleShare}
        variant="outline"
        className="w-full"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Deposit Address
      </Button>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Send funds from your crypto wallet to this address</li>
              <li>Make sure you're on the {selectedBlockchain} network</li>
              <li>Funds will be automatically converted to PKR</li>
              <li>Deposits may take a few minutes to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThirdPartyDeposit = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Binance Pay Deposit</h3>
        <p className="text-gray-600">Connect your Binance account for instant deposits</p>
      </div>

      {/* Binance Connect Button */}
      <div className="text-center">
        <Button
          onClick={() => setStep('binance-form')}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect Binance Pay
        </Button>
      </div>

      {/* Mock Connection Status */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">Mock: Binance Pay Connected</span>
        </div>
      </div>
    </div>
  );

  const renderBinanceForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Deposit via Binance Pay</h3>
        <p className="text-gray-600">Enter the amount you want to deposit</p>
      </div>

      <div>
        <Input
          label="Amount (PKR)"
          type="number"
          value={binanceAmount}
          onChange={(e) => setBinanceAmount(e.target.value)}
          placeholder="Enter amount in PKR"
          min="1000"
          step="0.01"
        />
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Mock Integration:</p>
            <p>This is a demo version. In production, this would connect to real Binance Pay API.</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleBinanceDeposit}
          disabled={!binanceAmount || loading}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
        >
          {loading ? 'Processing...' : 'Deposit via Binance Pay'}
        </Button>
        <Button
          onClick={() => setStep('thirdparty')}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
      </div>
    </div>
  );


  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">On-Chain & Third-Party Deposit</h2>
        <Button
          onClick={onClose}
          variant="outline"
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setStep('select')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            step === 'select' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Select Network
        </button>
        <button
          onClick={() => setStep('onchain')}
          disabled={!onChainData}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            step === 'onchain' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          On-Chain
        </button>
        <button
          onClick={() => setStep('thirdparty')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            step === 'thirdparty' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Binance Pay
        </button>
      </div>

      {/* Content */}
      {step === 'select' && renderBlockchainSelection()}
      {step === 'onchain' && onChainData && renderOnChainDeposit()}
      {step === 'thirdparty' && renderThirdPartyDeposit()}
      {step === 'binance-form' && renderBinanceForm()}
    </Card>
  );
};

export default OnChainDeposit;
