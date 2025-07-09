'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  location: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('vyavasaay-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
        setIsUserLoading(false);
    }
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    try {
      localStorage.setItem('vyavasaay-user', JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
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
