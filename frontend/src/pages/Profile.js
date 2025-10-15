import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3,
  Save,
  X
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useUser } from '../contexts/UserContext';
import { usersAPI } from '../services/api';
import { formatCurrency, formatPercentage } from '../utils/formatLocation';

const Profile = () => {
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Invalidate queries when user changes
  useEffect(() => {
    queryClient.invalidateQueries(['profile', userId]);
    queryClient.invalidateQueries(['wallet', userId]);
  }, [userId, queryClient]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['profile', userId],
    () => usersAPI.getProfileById(userId),
    { enabled: !!userId }
  );

  // Fetch wallet data
  const { data: walletData, isLoading: walletLoading } = useQuery(
    ['wallet', userId],
    () => usersAPI.getWalletById(userId),
    { enabled: !!userId }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(usersAPI.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', userId]);
      setIsEditing(false);
    },
  });

  const profile = profileData?.data?.data || {};
  const wallet = walletData?.data?.data || {};

  // Debug logging
  console.log('Profile - Profile data:', profile);
  console.log('Profile - Wallet data:', wallet);

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (profileLoading || walletLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Early return if no user is selected
  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        {...register('firstName', { required: 'First name is required' })}
                        error={errors.firstName?.message}
                      />
                      <Input
                        label="Last Name"
                        {...register('lastName', { required: 'Last name is required' })}
                        error={errors.lastName?.message}
                      />
                    </div>
                    
                    <Input
                      label="Email"
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      error={errors.email?.message}
                    />
                    
                    <Input
                      label="Phone"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isLoading}
                        className="flex-1"
                      >
                        {updateProfileMutation.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-lg text-gray-900">
                            {profile.firstName} {profile.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-lg text-gray-900">{profile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-lg text-gray-900">{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Member Since</p>
                          <p className="text-lg text-gray-900">
                            {new Date(profile.memberSince).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Account Status & Wallet */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">KYC Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.kycStatus === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : profile.kycStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.kycStatus || 'Not submitted'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <span className="text-sm font-medium text-gray-900">Individual</span>
                  </div>
                </div>
              </Card>

              {/* Wallet Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Balance</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(wallet.availableBalance || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Invested</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(wallet.totalInvested || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Returns</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(wallet.totalReturns || 0)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Complete KYC
                  </Button>
                  <Button className="w-full" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
