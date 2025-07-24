
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  phone: string;
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
  setUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isUserLoading: boolean;
  needsOnboarding: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { authUser, isLoading: isAuthLoading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchUserProfile = useCallback(async (uid: string, phone: string) => {
    setIsUserLoading(true);
    const userDocRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUser(docSnap.data() as UserProfile);
        setNeedsOnboarding(false);
      } else {
        // This is a new user, trigger onboarding
        console.log('User profile does not exist, triggering onboarding.');
        setUser({ uid, phone, name: '', location: '', language: 'en' }); // Temporary user object
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (authUser) {
        if (!user || user.uid !== authUser.uid) { // Fetch only if user is different
          fetchUserProfile(authUser.uid, authUser.phoneNumber!);
        }
      } else {
        setUser(null);
        setIsUserLoading(false);
        setNeedsOnboarding(false);
      }
    }
  }, [authUser, isAuthLoading, fetchUserProfile, user]);

  const setUserProfile = useCallback(async (profileUpdate: Partial<UserProfile>) => {
    if (!authUser) return;

    const userDocRef = doc(db, 'users', authUser.uid);
    try {
      // Get current profile to merge with updates
      const currentProfile = (await getDoc(userDocRef)).data() || { uid: authUser.uid, phone: authUser.phoneNumber };
      
      const updatedProfile = {
        ...currentProfile,
        ...profileUpdate,
      };

      await setDoc(userDocRef, updatedProfile, { merge: true });
      setUser(updatedProfile as UserProfile);
      
      // If this update came from onboarding, mark it as complete
      if (needsOnboarding && updatedProfile.name && updatedProfile.location) {
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  }, [authUser, needsOnboarding]);

  const value = { user, setUserProfile, isUserLoading, needsOnboarding };

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
