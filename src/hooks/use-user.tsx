
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface UserProfile {
  name: string;
  location: string;
  language: string;
  landArea?: number;
  soilType?: string;
  primaryCrops?: string;
  profilePicture?: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: UserProfile = {
    name: 'Rohan',
    location: 'Nashik, Maharashtra',
    language: 'en',
    landArea: 5.2,
    soilType: 'Black Cotton Soil',
    primaryCrops: 'Wheat, Cotton, Sugarcane',
    profilePicture: '/images/image.png'
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('vyavasaay-user-temp');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Set default user if no user is in local storage (for first-time onboarding)
            // In a real app, this might be null until they log in or complete onboarding.
            // For the prototype, we can start with a default to show the profile page.
            //setUser(defaultUser); 
        }
    } catch (e) {
        console.error("Could not parse user from localStorage", e);
        // setUser(defaultUser);
    }
    setIsUserLoading(false);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    if (profile) {
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
