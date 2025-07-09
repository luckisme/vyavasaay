'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
  name: string;
  location: string;
  language: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const value = { user, setUserProfile, isUserLoading };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
