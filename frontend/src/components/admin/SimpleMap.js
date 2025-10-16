import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const SimpleMap = ({ latitude, longitude, onLocationChange, height = '400px' }) => {
  const [lat, setLat] = useState(latitude || 24.8607);
  const [lng, setLng] = useState(longitude || 67.0011);

  useEffect(() => {
    if (latitude && longitude) {
      setLat(parseFloat(latitude));
      setLng(parseFloat(longitude));
    }
  }, [latitude, longitude]);

  const handleLatChange = (e) => {
    const value = parseFloat(e.target.value);
    setLat(value);
    onLocationChange(value, lng);
  };

  const handleLngChange = (e) => {
    const value = parseFloat(e.target.value);
    setLng(value);
    onLocationChange(lat, value);
  };

  const getGoogleMapsUrl = () => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  };

  const getOpenStreetMapUrl = () => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
      {/* Map Preview */}
      <div className="bg-gray-100 h-3/4 flex items-center justify-center relative">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Property Location</p>
          <p className="text-xs text-gray-500">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
        
        {/* Interactive Controls */}
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2">
          <div className="flex space-x-2">
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              <Navigation className="w-3 h-3" />
              <span>Google Maps</span>
            </a>
            <a
              href={getOpenStreetMapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              <Navigation className="w-3 h-3" />
              <span>OpenStreet</span>
            </a>
          </div>
        </div>
      </div>

      {/* Coordinate Inputs */}
      <div className="bg-white p-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={handleLatChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="24.8607"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={handleLngChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="67.0011"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter coordinates manually or click the map links to verify location
        </p>
      </div>
    </div>
  );
};

export default SimpleMap;
