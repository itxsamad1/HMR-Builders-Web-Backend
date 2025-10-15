import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { usersAPI } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch users from database
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery(
    'users',
    () => usersAPI.getAll(),
    {
      onSuccess: (data) => {
        console.log('Users API response:', data);
        const fetchedUsers = data?.data?.data || [];
        setUsers(fetchedUsers);
        
        // Set first user as default if no current user
        if (!currentUser && fetchedUsers.length > 0) {
          console.log('Setting default user:', fetchedUsers[0]);
          setCurrentUser(fetchedUsers[0]);
        }
      },
      onError: (error) => {
        console.error('Failed to fetch users:', error);
        // Fallback to hardcoded users if API fails
        const fallbackUsers = [
          {
            id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
            name: 'Afraz Alam',
            firstName: 'Afraz',
            lastName: 'Alam',
            email: 'afrazalam@example.com',
            phone: '+92-300-1234567',
            kycStatus: 'verified'
          }
        ];
        setUsers(fallbackUsers);
        setCurrentUser(fallbackUsers[0]);
      }
    }
  );

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log('Switching to user:', user);
      setCurrentUser(user);
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      if (response.data?.success && response.data?.data?.users) {
        const dbUsers = response.data.data.users;
        setUsers(dbUsers);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing users:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    switchUser,
    users,
    usersLoading,
    usersError,
    refreshUsers
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
