import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Coins, MapPin } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { formatLocation, formatCurrency, getPropertyImage } from '../utils/formatLocation';

const InvestmentCard = ({ investment }) => {

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', text: 'Pending' },
      'confirmed': { variant: 'info', text: 'Confirmed' },
      'active': { variant: 'success', text: 'Active' },
      'sold': { variant: 'primary', text: 'Sold' },
      'cancelled': { variant: 'danger', text: 'Cancelled' },
    };
    
    const statusInfo = statusMap[status] || { variant: 'default', text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const getPropertyStatusBadge = (status) => {
    const statusMap = {
      'coming-soon': { variant: 'warning', text: 'Coming Soon' },
      'active': { variant: 'success', text: 'Active' },
      'construction': { variant: 'info', text: 'Under Construction' },
      'sold-out': { variant: 'danger', text: 'Sold Out' },
      'completed': { variant: 'primary', text: 'Completed' },
    };
    
    const statusInfo = statusMap[status] || { variant: 'default', text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  return (
    <Card hover className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {investment.property?.title || investment.propertyTitle}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{formatLocation(investment.property?.location || investment.propertyLocation)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(investment.status)}
          {getPropertyStatusBadge(investment.propertyStatus)}
        </div>
      </div>

      {getPropertyImage(investment.property) && (
        <img
          src={getPropertyImage(investment.property)}
          alt={investment.property?.title || investment.propertyTitle}
          className="w-full h-32 object-cover rounded-lg mb-4"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Investment Amount</p>
          <p className="font-semibold text-lg">
            {formatCurrency(investment.investmentAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tokens Owned</p>
          <p className="font-semibold text-lg flex items-center">
            <Coins className="w-4 h-4 mr-1" />
            {investment.tokensPurchased}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Price per Token</p>
          <p className="font-medium">
            {formatCurrency(investment.pricePerToken)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="font-medium text-green-600">
            {formatCurrency(investment.currentValue || 0)}
          </p>
        </div>
      </div>

      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Calendar className="w-4 h-4 mr-1" />
        <span>Invested on {formatDate(investment.investmentDate || investment.createdAt)}</span>
      </div>

      {investment.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800 font-medium">
              Investment is active and earning returns
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          as={Link}
          to={`/properties/${investment.property?.id || investment.propertyId}`}
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

export default InvestmentCard;
