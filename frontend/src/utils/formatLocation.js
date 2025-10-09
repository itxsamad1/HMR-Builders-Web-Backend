/**
 * Format location data for display
 * Handles both string and object formats
 * @param {string|object} location - Location data
 * @returns {string} Formatted location string
 */
export const formatLocation = (location) => {
  if (!location) return 'Location not specified';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const city = location.city || '';
    const address = location.address || '';
    return `${city}, ${address}`.replace(/^,\s*|,\s*$/g, '').trim() || 'Location not specified';
  }
  
  return 'Location not specified';
};

/**
 * Format currency for display
 * Handles both string and number formats
 * @param {string|number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount === 'string') {
    return amount; // Already formatted by backend
  }
  
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  return 'PKR 0';
};

/**
 * Format percentage for display
 * Handles both string and number formats
 * @param {string|number} percentage - Percentage to format
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (typeof percentage === 'string') {
    return percentage;
  }
  
  if (typeof percentage === 'number') {
    return `${percentage.toFixed(2)}%`;
  }
  
  return '0.00%';
};

/**
 * Get the first available image from property data
 * Handles various image formats from different API responses
 * @param {object} property - Property object
 * @returns {string|null} Image URL or null
 */
export const getPropertyImage = (property) => {
  if (!property) return null;
  
  // Direct image property
  if (property.image) return property.image;
  
  // Images object with thumbnail
  if (property.images?.thumbnail) return property.images.thumbnail;
  
  // Images object with gallery array
  if (property.images?.gallery && Array.isArray(property.images.gallery) && property.images.gallery.length > 0) {
    return property.images.gallery[0];
  }
  
  // Direct images array
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    return property.images[0];
  }
  
  return null;
};

/**
 * Get all available images from property data
 * @param {object} property - Property object
 * @returns {array} Array of image URLs
 */
export const getPropertyImages = (property) => {
  if (!property) return [];
  
  // Images object with gallery array
  if (property.images?.gallery && Array.isArray(property.images.gallery)) {
    return property.images.gallery;
  }
  
  // Direct images array
  if (property.images && Array.isArray(property.images)) {
    return property.images;
  }
  
  // Single image
  const singleImage = getPropertyImage(property);
  return singleImage ? [singleImage] : [];
};
