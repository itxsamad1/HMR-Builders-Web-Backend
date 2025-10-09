import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Coins, MapPin } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { formatLocation, formatCurrency, formatPercentage } from '../utils/formatLocation';

const PortfolioCard = ({ investment }) => {

  const getROIColor = (roi) => {
    const roiValue = typeof roi === 'string' ? parseFloat(roi.replace('%', '')) : roi;
    if (roiValue > 0) return 'text-green-600';
    if (roiValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getROIIcon = (roi) => {
    const roiValue = typeof roi === 'string' ? parseFloat(roi.replace('%', '')) : roi;
    if (roiValue > 0) return <TrendingUp className="w-4 h-4" />;
    if (roiValue < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Card hover className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {investment.property?.title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{formatLocation(investment.property?.location)}</span>
          </div>
        </div>
        <Badge variant="success">Active</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Investment</p>
          <p className="font-semibold text-lg">
            {formatCurrency(investment.investment)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="font-semibold text-lg">
            {formatCurrency(investment.currentValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Tokens</p>
          <p className="font-medium flex items-center">
            <Coins className="w-4 h-4 mr-1" />
            {investment.tokens} / {investment.totalTokens}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">ROI</p>
          <p className={`font-medium flex items-center ${getROIColor(investment.roi)}`}>
            {getROIIcon(investment.roi)}
            <span className="ml-1">{formatPercentage(investment.roi)}</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Token Ownership</span>
          <span className="font-medium">
            {((investment.tokens / investment.totalTokens) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(investment.tokens / investment.totalTokens) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          as={Link}
          to={`/properties/${investment.property?.id}`}
        >
          View Property
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          as={Link}
          to={`/investments/${investment.id}`}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default PortfolioCard;
