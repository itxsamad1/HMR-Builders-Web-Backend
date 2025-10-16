import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  AlertTriangle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import UserForm from '../../components/admin/UserForm';
import { adminAPI } from '../../services/api';
import { useAdminAuth } from '../../components/admin/AdminAuth';

const UsersManagement = () => {
  const { isAuthenticated } = useAdminAuth();
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kyc_status: '',
    include_inactive: false,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', filters, currentPage],
    () => adminAPI.getUsers({
      ...filters,
      page: currentPage,
      limit: 10,
      include_inactive: filters.include_inactive
    }),
    {
      enabled: isAuthenticated
    }
  );

  // Update user status mutation
  const updateStatusMutation = useMutation(
    ({ id, is_active }) => adminAPI.updateUserStatus(id, { is_active }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setShowModal(false);
        setSelectedUser(null);
      }
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    (userData) => adminAPI.createUser(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setShowUserForm(false);
        setEditingUser(null);
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ id, data }) => adminAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setShowUserForm(false);
        setEditingUser(null);
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (id) => adminAPI.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setShowDeleteModal(false);
        setUserToDelete(null);
        console.log('User deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  );

  const users = usersData?.data?.data?.users || usersData?.data?.users || [];
  const pagination = usersData?.data?.data?.pagination || usersData?.data?.pagination || {};


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({
        id: selectedUser.id,
        is_active: selectedUser.is_active
      });
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleDeleteUser = (user) => {
    console.log('Delete user clicked for:', user.name, user.id);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      console.log('Confirming delete for user:', userToDelete.id);
      deleteUserMutation.mutate(userToDelete.id);
    } else {
      console.log('No user selected for deletion');
    }
  };

  const getKYCStatusBadge = (status) => {
    const statusMap = {
      'verified': { variant: 'success', text: 'Verified', icon: CheckCircle },
      'pending': { variant: 'warning', text: 'Pending', icon: Clock },
      'rejected': { variant: 'danger', text: 'Rejected', icon: XCircle }
    };
    return statusMap[status] || { variant: 'default', text: status, icon: Clock };
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { variant: 'success', text: 'Active', icon: UserCheck }
      : { variant: 'danger', text: 'Inactive', icon: UserX };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view users.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load users</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage all users in your platform</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
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
                placeholder="Search users..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
            <select
              value={filters.kyc_status}
              onChange={(e) => handleFilterChange('kyc_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All KYC Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
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
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="kyc_status">KYC Status</option>
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
        
        {/* Additional Options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include_inactive"
              checked={filters.include_inactive}
              onChange={(e) => handleFilterChange('include_inactive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include_inactive" className="ml-2 text-sm text-gray-700">
              Include inactive users (deleted users)
            </label>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const kycInfo = getKYCStatusBadge(user.kyc_status);
                const statusInfo = getStatusBadge(user.is_active);
                const KycIcon = kycInfo.icon;
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {user.name || 'Unknown User'}
                            </span>
                            {!user.is_active && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Deleted
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusInfo.variant} className="flex items-center">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.text}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={kycInfo.variant} className="flex items-center">
                        <KycIcon className="w-3 h-3 mr-1" />
                        {kycInfo.text}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(user)}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`${!user.is_active ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                          onClick={() => !user.is_active ? null : handleDeleteUser(user)}
                          title={!user.is_active ? 'User already deleted' : `Delete ${user.name}`}
                          disabled={!user.is_active}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                    {Math.min(currentPage * 10, pagination.totalUsers)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalUsers}</span>{' '}
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

      {/* Status Update Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update User Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User: {selectedUser.name}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email: {selectedUser.email}
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.is_active}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active User</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
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

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This will deactivate the user account.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={deleteUserMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteUser}
                  disabled={deleteUserMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteUserMutation.isLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
