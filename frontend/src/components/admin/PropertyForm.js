import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, DollarSign, TrendingUp, Hash, Plus, Trash2, Calendar, Settings, Edit } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import SimpleMap from './SimpleMap';

const PropertyForm = ({ property, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    location_address: '',
    location_city: 'Karachi',
    location_state: 'Sindh',
    location_country: 'Pakistan',
    location_latitude: '',
    location_longitude: '',
    property_type: 'residential',
    project_type: '',
    status: 'coming-soon',
    floors: '',
    total_units: '',
    construction_progress: 0,
    start_date: '',
    expected_completion: '',
    handover_date: '',
    pricing_total_value: '',
    pricing_market_value: '',
    pricing_appreciation: '',
    pricing_expected_roi: '',
    pricing_min_investment: '',
    tokenization_total_tokens: 1000,
    tokenization_available_tokens: 1000,
    tokenization_price_per_token: '',
    tokenization_token_price: '',
    unit_types: [],
    features: [],
    images: {},
    seo: {},
    investment_stats: {
      totalInvestors: 0,
      totalInvestment: 0,
      averageInvestment: 0
    },
    is_active: true,
    is_featured: false,
    sort_order: 0,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 100.00,
    is_rented: false,
    appreciation_percentage: 20.00,
    amenities: [],
    documents: [],
    property_features: [],
    listing_price_formatted: 'PKR 0'
  });

  const [newUnitType, setNewUnitType] = useState({ type: '', size: '', price: '' });
  const [editingUnitIndex, setEditingUnitIndex] = useState(null);
  const [editingUnit, setEditingUnit] = useState({ type: '', size: '', price: '' });
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [newDocument, setNewDocument] = useState({ name: '', url: '', type: '' });
  const [newPropertyFeature, setNewPropertyFeature] = useState('');
  const [newImage, setNewImage] = useState({ url: '', alt: '', type: 'main' });
  const [seoData, setSeoData] = useState({ title: '', description: '', keywords: '' });

  useEffect(() => {
    if (property) {
      setFormData({
        ...formData,
        ...property
      });
      if (property.seo) {
        setSeoData(property.seo);
      }
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto-calculate Expected ROI when Total Value changes
      if (name === 'pricing_total_value' && value) {
        const totalValue = parseFloat(value);
        if (totalValue > 0) {
          // Calculate ROI based on total value (higher value = higher ROI)
          const calculatedROI = Math.min(25, Math.max(5, (totalValue / 1000000000) * 2 + 8)).toFixed(1);
          newData.pricing_expected_roi = calculatedROI;
        }
      }

      // Auto-calculate Price Per Token when Total Tokens changes
      if (name === 'tokenization_total_tokens' && value && prev.pricing_total_value) {
        const totalTokens = parseFloat(value);
        const totalValue = parseFloat(prev.pricing_total_value);
        if (totalTokens > 0 && totalValue > 0) {
          const pricePerToken = (totalValue / totalTokens).toFixed(2);
          newData.tokenization_price_per_token = pricePerToken;
          newData.tokenization_token_price = pricePerToken;
        }
      }

      // Auto-calculate Price Per Token when Total Value changes (if Total Tokens is set)
      if (name === 'pricing_total_value' && value && prev.tokenization_total_tokens) {
        const totalValue = parseFloat(value);
        const totalTokens = parseFloat(prev.tokenization_total_tokens);
        if (totalValue > 0 && totalTokens > 0) {
          const pricePerToken = (totalValue / totalTokens).toFixed(2);
          newData.tokenization_price_per_token = pricePerToken;
          newData.tokenization_token_price = pricePerToken;
        }
      }

      // Auto-generate Unit Types when Total Units changes
      if (name === 'total_units' && value) {
        const totalUnits = parseInt(value);
        if (totalUnits > 0 && totalUnits <= 10) {
          const generatedUnitTypes = [];
          for (let i = 1; i <= totalUnits; i++) {
            generatedUnitTypes.push({
              type: `${i}BR`,
              size: `${800 + (i * 200)} sq ft`,
              price: `${(1000000 + (i * 500000)).toLocaleString()}`
            });
          }
          newData.unit_types = generatedUnitTypes;
        }
      }

      return newData;
    });
  };

  const handleLocationChange = (latitude, longitude) => {
    setFormData(prev => ({
      ...prev,
      location_latitude: latitude.toFixed(6),
      location_longitude: longitude.toFixed(6)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (formData.documents.length === 0) {
      alert('Please add at least one document before saving the property.');
      return;
    }
    
    const finalData = {
      ...formData,
      seo: seoData
    };
    onSave(finalData);
  };

  const fillRandomValues = () => {
    const randomTitles = [
      'Luxury Heights Residency',
      'Golden Gate Apartments',
      'Skyline Towers',
      'Emerald Gardens',
      'Royal Plaza Complex',
      'Diamond Heights',
      'Crystal Residences',
      'Pearl Towers',
      'Sapphire Gardens',
      'Platinum Heights'
    ];
    
    const randomDescriptions = [
      'A premium residential complex offering modern amenities and luxury living in the heart of the city.',
      'State-of-the-art residential development with world-class facilities and breathtaking views.',
      'Exclusive residential project featuring contemporary design and premium lifestyle amenities.',
      'Luxury residential complex with modern architecture and comprehensive lifestyle facilities.',
      'Premium residential development offering sophisticated living with world-class amenities.'
    ];
    
    const randomAddresses = [
      'DHA Phase 8, Karachi',
      'Clifton Block 2, Karachi',
      'Gulshan-e-Iqbal Block 13D, Karachi',
      'North Nazimabad Block H, Karachi',
      'PECHS Block 6, Karachi',
      'Defence Phase 5, Karachi',
      'Malir Cantt, Karachi',
      'Korangi Industrial Area, Karachi'
    ];
    
    const randomPropertyTypes = ['residential', 'commercial', 'mixed-use'];
    const randomStatuses = ['coming-soon', 'active', 'construction', 'planning', 'on-hold'];
    
    const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];
    const randomDescription = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    const randomAddress = randomAddresses[Math.floor(Math.random() * randomAddresses.length)];
    const randomPropertyType = randomPropertyTypes[Math.floor(Math.random() * randomPropertyTypes.length)];
    const randomStatus = randomStatuses[Math.floor(Math.random() * randomStatuses.length)];
    
    // Generate random pricing values
    const totalValue = Math.floor(Math.random() * 20000000000) + 1000000000; // 1B to 20B
    const minInvestment = Math.floor(Math.random() * 1000000) + 100000; // 100K to 1M
    const roi = (Math.random() * 15 + 5).toFixed(1); // 5% to 20%
    const totalTokens = Math.floor(Math.random() * 200000) + 10000; // 10K to 200K
    const availableTokens = Math.floor(totalTokens * (Math.random() * 0.8 + 0.2)); // 20% to 100% of total
    
    // Generate random dates
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + Math.floor(Math.random() * 12));
    const completionDate = new Date(startDate);
    completionDate.setMonth(completionDate.getMonth() + Math.floor(Math.random() * 24) + 12);
    
    setFormData({
      title: randomTitle,
      slug: generateSlug(randomTitle),
      description: randomDescription,
      short_description: `Premium ${randomPropertyType} development in ${randomAddress.split(',')[0]}`,
      location_address: randomAddress,
      location_city: 'Karachi',
      location_state: 'Sindh',
      location_country: 'Pakistan',
      location_latitude: (24.8 + Math.random() * 0.2).toFixed(6),
      location_longitude: (67.0 + Math.random() * 0.2).toFixed(6),
      property_type: randomPropertyType,
      project_type: ['residential', 'commercial', 'mixed-use', 'residential-commercial', 'retail', 'office'][Math.floor(Math.random() * 6)],
      status: randomStatus,
      floors: Math.floor(Math.random() * 20) + 5,
      total_units: Math.floor(Math.random() * 10) + 1,
      construction_progress: [0, 25, 50, 75, 100][Math.floor(Math.random() * 5)],
      start_date: startDate.toISOString().split('T')[0],
      expected_completion: completionDate.toISOString().split('T')[0],
      handover_date: new Date(completionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricing_total_value: totalValue.toString(),
      pricing_market_value: Math.floor(totalValue * 0.9).toString(),
      pricing_appreciation: (Math.random() * 20 + 10).toFixed(1),
      pricing_expected_roi: roi,
      pricing_min_investment: minInvestment.toString(),
      tokenization_total_tokens: totalTokens,
      tokenization_available_tokens: availableTokens,
      tokenization_price_per_token: (totalValue / totalTokens).toFixed(2),
      tokenization_token_price: (totalValue / totalTokens).toFixed(2),
      unit_types: [
        { type: '1 Bedroom', size: '800 sq ft', price: (minInvestment * 0.8).toString() },
        { type: '2 Bedroom', size: '1200 sq ft', price: minInvestment.toString() },
        { type: '3 Bedroom', size: '1800 sq ft', price: (minInvestment * 1.5).toString() }
      ],
      features: [
        'Swimming Pool',
        'Gymnasium',
        'Parking',
        'Security',
        'Garden',
        'Elevator',
        'Power Backup',
        'Water Treatment'
      ],
      images: {
        main: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        gallery: [
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ]
      },
      seo: {
        title: `${randomTitle} - Premium Real Estate Investment`,
        description: `Invest in ${randomTitle}, a premium ${randomPropertyType} development offering ${roi}% ROI.`,
        keywords: `${randomPropertyType}, real estate, investment, Karachi, premium`
      },
      investment_stats: {
        totalInvestors: Math.floor(Math.random() * 100),
        totalInvestment: Math.floor(totalValue * 0.1),
        averageInvestment: Math.floor(minInvestment * 1.2)
      },
      is_active: true,
      is_featured: Math.random() > 0.5,
      sort_order: Math.floor(Math.random() * 100),
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      area_sqm: Math.floor(Math.random() * 200) + 100,
      is_rented: Math.random() > 0.7,
      appreciation_percentage: (Math.random() * 30 + 10).toFixed(2),
      amenities: [
        'Swimming Pool',
        'Gymnasium',
        'Parking',
        '24/7 Security',
        'Garden',
        'Elevator',
        'Power Backup',
        'Water Treatment',
        'Club House',
        'Playground'
      ],
      documents: [
        { name: 'Approval Letter', url: 'https://example.com/approval.pdf', type: 'approval' },
        { name: 'Floor Plan', url: 'https://example.com/floorplan.pdf', type: 'floorplan' },
        { name: 'Legal Documents', url: 'https://example.com/legal.pdf', type: 'legal' },
        { name: 'Property Deed', url: 'https://example.com/deed.pdf', type: 'legal' },
        { name: 'Survey Report', url: 'https://example.com/survey.pdf', type: 'technical' }
      ],
      property_features: [
        'Modern Architecture',
        'Energy Efficient',
        'Smart Home Features',
        'Premium Finishes',
        'High Ceilings',
        'Balcony Access'
      ],
      listing_price_formatted: `PKR ${(totalValue / 1000000).toFixed(1)}M`
    });
    
    setSeoData({
      title: `${randomTitle} - Premium Real Estate Investment`,
      description: `Invest in ${randomTitle}, a premium ${randomPropertyType} development offering ${roi}% ROI.`,
      keywords: `${randomPropertyType}, real estate, investment, Karachi, premium`
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Unit Types Management
  const addUnitType = () => {
    if (newUnitType.type && newUnitType.size && newUnitType.price) {
      setFormData(prev => ({
        ...prev,
        unit_types: [...prev.unit_types, { ...newUnitType }]
      }));
      setNewUnitType({ type: '', size: '', price: '' });
    }
  };

  const removeUnitType = (index) => {
    setFormData(prev => ({
      ...prev,
      unit_types: prev.unit_types.filter((_, i) => i !== index)
    }));
  };

  const editUnitType = (index) => {
    const unit = formData.unit_types[index];
    setEditingUnitIndex(index);
    setEditingUnit({ ...unit });
  };

  const saveUnitType = () => {
    if (editingUnitIndex !== null) {
      setFormData(prev => ({
        ...prev,
        unit_types: prev.unit_types.map((unit, index) => 
          index === editingUnitIndex ? editingUnit : unit
        )
      }));
      setEditingUnitIndex(null);
      setEditingUnit({ type: '', size: '', price: '' });
    }
  };

  const cancelEditUnitType = () => {
    setEditingUnitIndex(null);
    setEditingUnit({ type: '', size: '', price: '' });
  };

  // Features Management
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Amenities Management
  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  // Documents Management
  const addDocument = () => {
    if (newDocument.name && newDocument.url && newDocument.type) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { ...newDocument }]
      }));
      setNewDocument({ name: '', url: '', type: '' });
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Property Features Management
  const addPropertyFeature = () => {
    if (newPropertyFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        property_features: [...prev.property_features, newPropertyFeature.trim()]
      }));
      setNewPropertyFeature('');
    }
  };

  const removePropertyFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      property_features: prev.property_features.filter((_, i) => i !== index)
    }));
  };

  // Images Management
  const addImage = () => {
    if (newImage.url && newImage.alt) {
      setFormData(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [newImage.type]: {
            url: newImage.url,
            alt: newImage.alt
          }
        }
      }));
      setNewImage({ url: '', alt: '', type: 'main' });
    }
  };

  const removeImage = (type) => {
    setFormData(prev => {
      const newImages = { ...prev.images };
      delete newImages[type];
      return { ...prev, images: newImages };
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="location_state"
                  value={formData.location_state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="location_country"
                  value={formData.location_country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location_latitude"
                  value={formData.location_latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location_longitude"
                  value={formData.location_longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Location Map */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Location Map
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Enter coordinates manually or use the map links to verify location. The latitude and longitude will be updated automatically.
              </p>
              <SimpleMap
                latitude={formData.location_latitude}
                longitude={formData.location_longitude}
                onLocationChange={handleLocationChange}
                height="400px"
              />
            </div>
          </Card>

          {/* Property Details */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Property Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed-use">Mixed Use</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Project Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed-use">Mixed Use</option>
                  <option value="residential-commercial">Residential-Commercial</option>
                  <option value="retail">Retail</option>
                  <option value="office">Office</option>
                  <option value="industrial">Industrial</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="educational">Educational</option>
                  <option value="recreational">Recreational</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="construction">Construction</option>
                  <option value="active">Active</option>
                  <option value="coming-soon">Coming Soon</option>
                  <option value="on-hold">On Hold</option>
                  <option value="sold-out">Sold Out</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floors *
                </label>
                <input
                  type="text"
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  name="total_units"
                  value={formData.total_units}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of units (1-10)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unit types will be automatically generated based on this number
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Construction Progress (%)
                </label>
                <div className="space-y-3">
                  {/* Quick Progress Buttons */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, construction_progress: 25 }))}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.construction_progress === 25
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, construction_progress: 50 }))}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.construction_progress === 50
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, construction_progress: 75 }))}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.construction_progress === 75
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, construction_progress: 100 }))}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.construction_progress === 100
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      100%
                    </button>
                  </div>
                  
                  {/* Manual Input Field */}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="construction_progress"
                    value={formData.construction_progress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom progress (0-100)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Completion
                </label>
                <input
                  type="date"
                  name="expected_completion"
                  value={formData.expected_completion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handover Date
                </label>
                <input
                  type="date"
                  name="handover_date"
                  value={formData.handover_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Pricing Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Value (PKR) *
                </label>
                <input
                  type="text"
                  name="pricing_total_value"
                  value={formData.pricing_total_value}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 12000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Value (PKR) *
                </label>
                <input
                  type="text"
                  name="pricing_market_value"
                  value={formData.pricing_market_value}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 12000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appreciation (%)
                </label>
                <input
                  type="text"
                  name="pricing_appreciation"
                  value={formData.pricing_appreciation}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected ROI (%) * 
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated)</span>
                </label>
                <input
                  type="text"
                  name="pricing_expected_roi"
                  value={formData.pricing_expected_roi}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 11"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Investment (PKR) *
                </label>
                <input
                  type="text"
                  name="pricing_min_investment"
                  value={formData.pricing_min_investment}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 400000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Price Formatted
                </label>
                <input
                  type="text"
                  name="listing_price_formatted"
                  value={formData.listing_price_formatted}
                  onChange={handleChange}
                  placeholder="e.g., PKR 12B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Tokenization Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Tokenization Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Tokens *
                </label>
                <input
                  type="number"
                  name="tokenization_total_tokens"
                  value={formData.tokenization_total_tokens}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Tokens *
                </label>
                <input
                  type="number"
                  name="tokenization_available_tokens"
                  value={formData.tokenization_available_tokens}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Token (PKR) * 
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated)</span>
                </label>
                <input
                  type="text"
                  name="tokenization_price_per_token"
                  value={formData.tokenization_price_per_token}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Price (PKR) * 
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated)</span>
                </label>
                <input
                  type="text"
                  name="tokenization_token_price"
                  value={formData.tokenization_token_price}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                />
              </div>
            </div>
          </Card>

          {/* Property Specifications */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Property Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sqm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="area_sqm"
                  value={formData.area_sqm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appreciation Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="appreciation_percentage"
                  value={formData.appreciation_percentage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_rented"
                    checked={formData.is_rented}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Is Rented</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Unit Types */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Unit Types</h4>
              <p className="text-sm text-gray-500">
                {formData.unit_types.length > 0 ? `${formData.unit_types.length} units generated` : 'Enter Total Units above to auto-generate'}
              </p>
            </div>
            {formData.unit_types.length > 0 && (
              <p className="text-xs text-gray-500 mb-4">
                💡 Click the edit button to modify any unit type. You can change the type, size, or price.
              </p>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Unit Type (e.g., 2BR)"
                  value={newUnitType.type}
                  onChange={(e) => setNewUnitType(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Size (e.g., 1200 sqft)"
                  value={newUnitType.size}
                  onChange={(e) => setNewUnitType(prev => ({ ...prev, size: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Price (e.g., 5000000)"
                  value={newUnitType.price}
                  onChange={(e) => setNewUnitType(prev => ({ ...prev, price: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button type="button" onClick={addUnitType} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              {formData.unit_types.map((unit, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  {editingUnitIndex === index ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Unit Type (e.g., 2BR)"
                          value={editingUnit.type}
                          onChange={(e) => setEditingUnit(prev => ({ ...prev, type: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Size (e.g., 1200 sqft)"
                          value={editingUnit.size}
                          onChange={(e) => setEditingUnit(prev => ({ ...prev, size: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Price (e.g., 5000000)"
                          value={editingUnit.price}
                          onChange={(e) => setEditingUnit(prev => ({ ...prev, price: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={saveUnitType}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditUnitType}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <span className="font-medium">{unit.type}</span>
                        <span className="text-gray-600">{unit.size}</span>
                        <span className="text-green-600">PKR {unit.price}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editUnitType(index)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeUnitType(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Features (optional)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Add property features like modern architecture, energy efficiency, smart home features, etc. This field is optional.
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button type="button" onClick={addFeature} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Amenities (optional)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Add property amenities like swimming pool, gym, parking, security, etc. This field is optional.
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add an amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button type="button" onClick={addAmenity} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Documents *</h4>
              <span className="text-sm text-gray-500">
                {formData.documents.length} document{formData.documents.length !== 1 ? 's' : ''} added
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add important property documents like approval letters, floor plans, legal documents, etc.
            </p>
            {formData.documents.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ At least one document is required to save the property.
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Document Name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="url"
                  placeholder="Document URL"
                  value={newDocument.url}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="brochure">Brochure</option>
                  <option value="floor-plan">Floor Plan</option>
                  <option value="legal">Legal Document</option>
                  <option value="other">Other</option>
                </select>
                <Button type="button" onClick={addDocument} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex space-x-4">
                    <span className="font-medium">{doc.name}</span>
                    <span className="text-gray-600">{doc.type}</span>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      View Document
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Property Features */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Features (optional)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Add specific property features like premium finishes, high ceilings, balcony access, etc. This field is optional.
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a property feature"
                  value={newPropertyFeature}
                  onChange={(e) => setNewPropertyFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button type="button" onClick={addPropertyFeature} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.property_features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removePropertyFeature(index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Images</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newImage.url}
                  onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Alt Text"
                  value={newImage.alt}
                  onChange={(e) => setNewImage(prev => ({ ...prev, alt: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={newImage.type}
                  onChange={(e) => setNewImage(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="main">Main Image</option>
                  <option value="gallery">Gallery</option>
                  <option value="floor-plan">Floor Plan</option>
                  <option value="location">Location</option>
                </select>
                <Button type="button" onClick={addImage} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>
              {Object.entries(formData.images).map(([type, image]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex space-x-4">
                    <span className="font-medium capitalize">{type}</span>
                    <span className="text-gray-600">{image.alt}</span>
                    <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      View Image
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(type)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* SEO Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoData.title}
                  onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={seoData.description}
                  onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Status and Visibility */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Status and Visibility
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Property</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Property</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={fillRandomValues}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Fill Random Values</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;