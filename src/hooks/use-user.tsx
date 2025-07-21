
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface UserProfile {
  name: string;
  location: string;
  language: string;
  voice: string;
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
    // For prototyping: This will clear the user on every reload, forcing the onboarding modal.
    // In a real app, you would read from localStorage here.
    localStorage.removeItem('vyavasaay-user-temp');
    setIsUserLoading(false);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    if (profile) {
        // We still save to localStorage so that other components can potentially
        // use it during the same session if needed.
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
