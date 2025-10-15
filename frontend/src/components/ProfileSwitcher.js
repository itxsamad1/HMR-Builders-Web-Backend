import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { User, ChevronDown, Check, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const ProfileSwitcher = () => {
  const { currentUser, switchUser, users, usersLoading, usersError, refreshUsers } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleUserSwitch = (userId) => {
    switchUser(userId);
    setIsOpen(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2"
        disabled={usersLoading}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">
          {usersLoading ? 'Loading...' : currentUser?.name || 'Select User'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 z-50">
          <Card className="p-4 shadow-lg">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">
                Switch Profile
              </h3>
              {usersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading users...</span>
                </div>
              ) : usersError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600">Failed to load users</p>
                  <p className="text-xs text-gray-500 mt-1">Using fallback data</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">No users found</p>
                </div>
              ) : (
                users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSwitch(user.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    currentUser.id === user.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            user.kycStatus === 'verified'
                              ? 'bg-green-500'
                              : user.kycStatus === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="text-xs text-gray-500 capitalize">
                          {user.kycStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  {currentUser.id === user.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
