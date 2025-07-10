
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface UserProfile {
  name: string;
  location: string;
  language: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to check for a stored user
    const storedUser = localStorage.getItem('vyavasaay-user-temp');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setIsUserLoading(false);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    if (profile) {
        // We'll use a temporary key for prototyping to ensure onboarding always shows on a fresh start
        localStorage.setItem('vyavasaay-user-temp', JSON.stringify(profile));
        setUser(profile);
    } else {
        localStorage.removeItem('vyavasaay-user-temp');
        setUser(null);
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
