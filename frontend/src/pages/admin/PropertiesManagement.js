import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PropertyForm from '../../components/admin/PropertyForm';
import { adminAPI } from '../../services/api';
import { useAdminAuth } from '../../components/admin/AdminAuth';

const PropertiesManagement = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    property_type: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const queryClient = useQueryClient();

  // Fetch properties
  const { data: propertiesData, isLoading, error } = useQuery(
    ['admin-properties', filters, currentPage],
    () => adminAPI.getProperties({
      ...filters,
      page: currentPage,
      limit: 10
    }),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      enabled: isAuthenticated
    }
  );

  // Update property status mutation
  const updateStatusMutation = useMutation(
    ({ id, status, is_active, is_featured }) => adminAPI.updatePropertyStatus(id, { status, is_active, is_featured }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        setShowModal(false);
        setSelectedProperty(null);
        // You could add a toast notification here
        console.log('Property status updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update property status:', error);
        // You could add error toast notification here
      }
    }
  );

  // Create property mutation
  const createPropertyMutation = useMutation(
    (propertyData) => adminAPI.createProperty(propertyData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        setShowPropertyForm(false);
        setEditingProperty(null);
        console.log('Property created successfully');
      },
      onError: (error) => {
        console.error('Failed to create property:', error);
      }
    }
  );

  // Update property mutation
  const updatePropertyMutation = useMutation(
    ({ id, data }) => adminAPI.updateProperty(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        setShowPropertyForm(false);
        setEditingProperty(null);
        console.log('Property updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update property:', error);
      }
    }
  );

  // Delete property mutation
  const deletePropertyMutation = useMutation(
    (id) => adminAPI.deleteProperty(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        setShowDeleteModal(false);
        setPropertyToDelete(null);
        console.log('Property deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete property:', error);
      }
    }
  );

  const properties = propertiesData?.data?.data?.properties || [];
  const pagination = propertiesData?.data?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedProperty) {
      updateStatusMutation.mutate({
        id: selectedProperty.id,
        status: selectedProperty.status,
        is_active: selectedProperty.is_active,
        is_featured: selectedProperty.is_featured
      });
    }
  };

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setShowPropertyForm(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleViewProperty = (property) => {
    // For now, we'll show property details in a modal
    // In the future, this could navigate to a detailed view page
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleSaveProperty = (propertyData) => {
    if (editingProperty) {
      updatePropertyMutation.mutate({ id: editingProperty.id, data: propertyData });
    } else {
      createPropertyMutation.mutate(propertyData);
    }
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete.id);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'coming-soon': { variant: 'warning', text: 'Coming Soon' },
      'active': { variant: 'success', text: 'Active' },
      'construction': { variant: 'info', text: 'Under Construction' },
      'on-hold': { variant: 'secondary', text: 'On Hold' },
      'sold-out': { variant: 'danger', text: 'Sold Out' },
      'completed': { variant: 'primary', text: 'Completed' }
    };
    return statusMap[status] || { variant: 'default', text: status };
  };

  const getPropertyTypeColor = (type) => {
    const typeMap = {
      'residential': 'bg-blue-100 text-blue-800',
      'commercial': 'bg-green-100 text-green-800',
      'mixed-use': 'bg-purple-100 text-purple-800'
    };
    return typeMap[type] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num >= 1000000000) {
      return `PKR ${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `PKR ${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `PKR ${(num / 1000).toFixed(0)}K`;
    }
    return `PKR ${num.toFixed(0)}`;
  };

  const calculateFundingPercentage = (total, available) => {
    // Convert to numbers to handle string inputs
    const totalNum = parseFloat(total) || 0;
    const availableNum = parseFloat(available) || 0;
    
    if (totalNum === 0) return 0;
    
    const percentage = ((totalNum - availableNum) / totalNum) * 100;
    console.log(`Funding calculation: total=${totalNum}, available=${availableNum}, percentage=${percentage}`);
    return percentage;
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view properties.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load properties: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties Management</h2>
          <p className="text-gray-600">Manage all properties in your platform</p>
        </div>
        <Button onClick={handleCreateProperty} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="active">Active</option>
              <option value="construction">Under Construction</option>
              <option value="on-hold">On Hold</option>
              <option value="sold-out">Sold Out</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed-use">Mixed Use</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="pricing_total_value">Total Value</option>
              <option value="pricing_expected_roi">Expected ROI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sort_order}
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </Card>


      {/* Properties Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No properties found</p>
                      <p className="text-sm">Try adjusting your filters or add a new property</p>
                    </div>
                  </td>
                </tr>
              ) : (
                properties.map((property) => {
                const fundingPercentage = calculateFundingPercentage(
                  property.tokenization_total_tokens,
                  property.tokenization_available_tokens
                );
                
                // Explicit check for delete button - consider very small funding as "no funding"
                const canDelete = fundingPercentage < 0.0001; // Less than 0.01%
                const isDisabled = fundingPercentage >= 0.0001; // 0.01% or more
                
                // Debug logging for all properties
                console.log(`${property.title} Debug:`, {
                  title: property.title,
                  total_tokens: property.tokenization_total_tokens,
                  available_tokens: property.tokenization_available_tokens,
                  fundingPercentage: fundingPercentage,
                  canDelete: canDelete,
                  isDisabled: isDisabled,
                  fundingCheck: fundingPercentage > 0
                });
                const statusInfo = getStatusBadge(property.status);

                return (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <button
                              onClick={() => navigate(`/admin/property/${property.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {property.title}
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {property.location_city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPropertyTypeColor(property.property_type)}>
                        {property.property_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.text}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(property.pricing_total_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${isDisabled ? 'bg-green-600' : 'bg-gray-400'}`}
                            style={{ width: `${Math.max(fundingPercentage, 0.1)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${isDisabled ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {fundingPercentage < 0.01 ? fundingPercentage.toFixed(5) : Math.round(fundingPercentage)}%
                        </span>
                        {isDisabled && (
                          <span className="ml-2 text-xs text-red-500">🔒</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.pricing_expected_roi}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProperty(property)}
                          title="Edit Property"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProperty(property)}
                          title="View Property Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`${isDisabled ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                          onClick={() => {
                            console.log(`Delete clicked for ${property.title}:`, {
                              fundingPercentage,
                              canDelete: canDelete,
                              isDisabled: isDisabled,
                              total: property.tokenization_total_tokens,
                              available: property.tokenization_available_tokens
                            });
                            if (isDisabled) {
                              console.log(`Cannot delete ${property.title} - funding: ${fundingPercentage}%`);
                              return;
                            }
                            handleDeleteProperty(property);
                          }}
                          disabled={isDisabled}
                          title={isDisabled ? `Cannot delete property with ${fundingPercentage.toFixed(5)}% funding` : 'Delete Property'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * 10) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, pagination.totalProperties)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalProperties}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Property Details/Status Update Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Property Details
              </h3>
              
              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-sm text-gray-900">{selectedProperty.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedProperty.property_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedProperty.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900">{selectedProperty.location_city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                  <p className="text-sm text-gray-900">{formatPrice(selectedProperty.pricing_total_value)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment</label>
                  <p className="text-sm text-gray-900">{formatPrice(selectedProperty.pricing_min_investment)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Tokens</label>
                  <p className="text-sm text-gray-900">{selectedProperty.tokenization_total_tokens?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Tokens</label>
                  <p className="text-sm text-gray-900">{selectedProperty.tokenization_available_tokens?.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Update Property Status</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedProperty.status}
                      onChange={(e) => setSelectedProperty(prev => ({ ...prev, status: e.target.value }))}
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
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProperty.is_active}
                        onChange={(e) => setSelectedProperty(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Property</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProperty.is_featured}
                        onChange={(e) => setSelectedProperty(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Property</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProperty(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={confirmStatusUpdate}
                  disabled={updateStatusMutation.isLoading}
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onSave={handleSaveProperty}
          onCancel={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          isLoading={createPropertyMutation.isLoading || updatePropertyMutation.isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              {/* Property Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{propertyToDelete.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Type: {propertyToDelete.property_type}</p>
                  <p>Status: {propertyToDelete.status}</p>
                  <p>Location: {propertyToDelete.location_city}</p>
                  <p>Total Value: {formatPrice(propertyToDelete.pricing_total_value)}</p>
                  <p>Funding: {calculateFundingPercentage(
                    propertyToDelete.tokenization_total_tokens,
                    propertyToDelete.tokenization_available_tokens
                  ).toFixed(5)}%</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete this property? 
                This will deactivate the property listing and remove it from the platform.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPropertyToDelete(null);
                  }}
                  disabled={deletePropertyMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteProperty}
                  disabled={deletePropertyMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deletePropertyMutation.isLoading ? 'Deleting...' : 'Delete Property'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesManagement;
