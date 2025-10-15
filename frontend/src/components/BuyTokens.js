import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Select } from './ui/Select';
import Badge from './ui/Badge';
import { Building2, MapPin, TrendingUp, Coins } from 'lucide-react';

const BuyTokens = ({ userId, onPurchaseSuccess, preselectPropertyId }) => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [highlightId, setHighlightId] = useState(null);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (preselectPropertyId) {
      setHighlightId(preselectPropertyId);
      // Scroll into view after list renders
      setTimeout(() => {
        const el = document.getElementById(`property-${preselectPropertyId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [preselectPropertyId, properties]);

  const fetchProperties = async () => {
    try {
      const response = await walletAPI.getProperties({ limit: 50 });
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Buy Property Tokens</h3>
        <p className="text-gray-600">Invest in real estate through tokenized properties</p>
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyTokenCard
            key={property.id}
            idAttr={`property-${property.id}`}
            highlight={highlightId === String(property.id) || highlightId === property.id}
            property={property}
            userId={userId}
            onPurchaseSuccess={onPurchaseSuccess}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Property Token Card Component
const PropertyTokenCard = ({ property, userId, onPurchaseSuccess, idAttr, highlight }) => {
  const [pkrAmount, setPkrAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tokenPrice = parseFloat(property.tokenization_price_per_token);

  // Calculate token amount when PKR amount changes (support fractional tokens)
  const handlePkrChange = (value) => {
    setPkrAmount(value);
    if (value && !isNaN(value)) {
      const tokens = parseFloat(value) / tokenPrice;
      // Allow fractional tokens (show up to 6 decimal places)
      setTokenAmount(tokens.toFixed(6));
    } else {
      setTokenAmount('');
    }
  };

  // Calculate PKR amount when token amount changes
  const handleTokenChange = (value) => {
    setTokenAmount(value);
    if (value && !isNaN(value)) {
      const pkr = parseFloat(value) * tokenPrice;
      setPkrAmount(pkr.toFixed(2));
    } else {
      setPkrAmount('');
    }
  };

  const handleBuyTokens = async () => {
    if (!pkrAmount && !tokenAmount) {
      setError('Please enter either PKR amount or token amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const purchaseData = {
        user_id: userId,
        property_id: property.id
      };

      if (pkrAmount) {
        purchaseData.amount_pkr = parseFloat(pkrAmount);
      } else {
        purchaseData.token_amount = parseFloat(tokenAmount);
      }

      const response = await walletAPI.buyTokens(purchaseData);
      
      if (response.data.success) {
        setSuccess(`Successfully purchased ${response.data.data.purchase.tokens_purchased} tokens!`);
        setPkrAmount('');
        setTokenAmount('');
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess(response.data.data);
        }
      } else {
        setError(response.data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError(error.response?.data?.error || 'Failed to purchase tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={idAttr} className={`p-6 hover:shadow-lg transition-shadow ${highlight ? 'ring-2 ring-green-400' : ''}`}>
      {/* Property Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {property.title}
          </h3>
          <Badge variant="info" className="ml-2">
            {property.tokenization_available_tokens} available
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location_city}, {property.location_state}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-gray-600">Price:</span>
            <span className="font-medium ml-1">PKR {property.tokenization_price_per_token}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-gray-600">ROI:</span>
            <span className="font-medium ml-1">{property.pricing_expected_roi}</span>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Dual Input Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Investment Amount</h4>
          <p className="text-xs text-gray-500 mb-3">Buy fractional tokens with any PKR amount</p>
        </div>

        {/* PKR Input */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Amount in PKR
          </label>
          <div className="relative">
            <Input
              type="number"
              value={pkrAmount}
              onChange={(e) => handlePkrChange(e.target.value)}
              placeholder="e.g., 5000 (any amount)"
              min="0"
              step="0.01"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              PKR
            </span>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-xs font-medium text-gray-500 bg-white">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Token Input */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Number of Tokens
          </label>
          <div className="relative">
            <Input
              type="number"
              value={tokenAmount}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="e.g., 0.5 (fractional tokens)"
              min="0"
              step="0.001"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              Tokens
            </span>
          </div>
        </div>

        {/* Purchase Summary */}
        {(pkrAmount || tokenAmount) && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-700">Tokens:</span>
                <span className="font-medium">
                  {tokenAmount || (parseFloat(pkrAmount) / tokenPrice).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Cost:</span>
                <span className="font-medium">
                  PKR {pkrAmount || (parseFloat(tokenAmount) * tokenPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Price per Token:</span>
                <span className="font-medium">PKR {tokenPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buy Button */}
        <Button
          onClick={handleBuyTokens}
          disabled={(!pkrAmount && !tokenAmount) || loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Processing...' : 'Buy Tokens'}
        </Button>
      </div>
    </Card>
  );
};

export default BuyTokens;
