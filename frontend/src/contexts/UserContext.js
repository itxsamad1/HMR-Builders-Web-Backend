import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

// Available users for switching
export const USERS = [
  {
    id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    name: 'Afraz Alam',
    firstName: 'Afraz',
    lastName: 'Alam',
    email: 'afrazalam@example.com',
    phone: '+92-300-1234567',
    kycStatus: 'verified'
  },
  {
    id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    name: 'Sarah Khan',
    firstName: 'Sarah',
    lastName: 'Khan',
    email: 'sarahkhan@example.com',
    phone: '+92-301-2345678',
    kycStatus: 'verified'
  },
  {
    id: 'cff12952-dd79-49de-a831-ee2ff12204f6',
    name: 'Ahmed Hassan',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmedhassan@example.com',
    phone: '+92-302-3456789',
    kycStatus: 'pending'
  },
  {
    id: '6fef9e88-57d6-4b52-8066-7d9a74a68dda',
    name: 'Fatima Ali',
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatimaali@example.com',
    phone: '+92-303-4567890',
    kycStatus: 'verified'
  },
  {
    id: '0c9857b0-ebfc-4bb7-90a3-551ebf2c1208',
    name: 'Omar Malik',
    firstName: 'Omar',
    lastName: 'Malik',
    email: 'omarmalik@example.com',
    phone: '+92-304-5678901',
    kycStatus: 'verified'
  }
];

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(USERS[0]); // Default to Afraz

  const switchUser = (userId) => {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      console.log('Switching to user:', user);
      setCurrentUser(user);
    }
  };

  const value = {
    currentUser,
    switchUser,
    users: USERS
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
