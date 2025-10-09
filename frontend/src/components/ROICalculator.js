import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Coins, DollarSign } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { calculatorAPI } from '../services/api';

const ROICalculator = ({ propertyId, onClose }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateROI = async () => {
    if (!investmentAmount || !propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await calculatorAPI.calculateROI({
        propertyId,
        investmentAmount: parseFloat(investmentAmount)
      });

      if (response.data.success) {
        setCalculation(response.data.data);
      } else {
        setError('Failed to calculate ROI');
      }
    } catch (err) {
      setError('Error calculating ROI. Please try again.');
      console.error('ROI calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      return amount;
    }
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    if (typeof percentage === 'string') {
      return percentage;
    }
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="w-6 h-6 mr-2" />
            ROI Calculator
          </h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (PKR)
            </label>
            <Input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="Enter investment amount"
              className="w-full"
            />
          </div>

          <Button
            onClick={calculateROI}
            disabled={!investmentAmount || loading}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate ROI'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {calculation && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Investment Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Tokens You'll Get</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {calculation.tokens}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total Costs</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(calculation.totalCosts)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Fee (2%)</span>
                    <span className="font-medium">
                      {formatCurrency(calculation.costBreakdown.purchaseFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Running Fee (1%)</span>
                    <span className="font-medium">
                      {formatCurrency(calculation.costBreakdown.runningFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Fee (0.5%)</span>
                    <span className="font-medium">
                      {formatCurrency(calculation.costBreakdown.transactionFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Projected Returns (5 Years)
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(calculation.projectedReturns).map(([year, amount]) => (
                    <div key={year} className="text-center">
                      <p className="text-xs text-green-700">Year {year.replace('year', '')}</p>
                      <p className="font-semibold text-green-900">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {calculation.property && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Property:</span>
                      <p className="font-medium">{calculation.property.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected ROI:</span>
                      <p className="font-medium">{calculation.property.expectedROI}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price per Token:</span>
                      <p className="font-medium">
                        {formatCurrency(calculation.property.pricePerToken)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ROICalculator;
