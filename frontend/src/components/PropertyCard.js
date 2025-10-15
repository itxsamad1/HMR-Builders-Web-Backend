import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Coins, Users } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { formatLocation, formatPrice, formatCurrency, getPropertyImage } from '../utils/formatLocation';

const PropertyCard = ({ property, onInvest }) => {
  // Debug: Log the property data
  console.log('PropertyCard received property:', property);

  const getStatusBadge = (status) => {
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

  const getPropertyTypeColor = (type) => {
    const typeMap = {
      'residential': 'bg-blue-100 text-blue-800',
      'commercial': 'bg-green-100 text-green-800',
      'mixed-use': 'bg-purple-100 text-purple-800',
    };
    return typeMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Handle mobile API format - fundingPercentage is already calculated
  const tokenPercentage = property.fundingPercentage || 
    (property.tokenization
      ? ((property.tokenization.totalTokens - property.tokenization.availableTokens) / property.tokenization.totalTokens) * 100
      : 0);

  return (
    <Card hover className="h-full flex flex-col">
      <div className="relative">
        {getPropertyImage(property) && (
          <img
            src={getPropertyImage(property)}
            alt={property.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {getStatusBadge(property.status)}
          <Badge className={getPropertyTypeColor(property.propertyType || property.type)}>
            {property.propertyType || property.type || 'Property'}
          </Badge>
        </div>
        {property.isFeatured && (
          <div className="absolute top-2 right-2">
            <Badge variant="primary">Featured</Badge>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.shortDescription || property.description || 'No description available'}
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{formatLocation(property.location)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="font-semibold text-lg">
              {property.price || formatPrice(property.pricing?.totalValue) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected ROI</p>
            <p className="font-semibold text-lg text-green-600">
              {property.roi ? `${property.roi}%` : (property.pricing?.expectedROI ? `${property.pricing.expectedROI}%` : 'N/A')}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Funding Progress</span>
            <span className="font-medium">{Math.round(tokenPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${tokenPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{property.availableTokens || 0} available</span>
            <span>{property.tokens || 0} total</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center">
            <Coins className="w-4 h-4 mr-1 text-gray-400" />
            <span className="text-gray-500">Min Investment</span>
          </div>
          <div className="text-right font-medium">
            {property.minInvestment || 'PKR 0'}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              as={Link}
              to={`/properties/${property.slug}`}
            >
              View Details
            </Button>
            {property.status === 'active' && (property.availableTokens > 0 || property.tokenization?.availableTokens > 0) && (
              <Button
                className="flex-1"
                onClick={() => onInvest && onInvest(property)}
              >
                Invest Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
