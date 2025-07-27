
'use client';

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  User,
  ConfirmationResult
} from 'firebase/auth';
import { app, auth as firebaseAuth } from '@/lib/firebase'; // Use the initialized auth instance

interface AuthContextType {
  authUser: User | null;
  isLoading: boolean;
  sendOtp: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  isLoading: true,
  sendOtp: async () => new Promise(() => {}),
  verifyOtp: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setAuthUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    const recaptchaContainerId = 'recaptcha-container-invisible';
    let recaptchaContainer = document.getElementById(recaptchaContainerId);
    if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = recaptchaContainerId;
        document.body.appendChild(recaptchaContainer);
    }
    
    const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainer, {
        'size': 'invisible'
    });
    
    try {
        const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
    } catch (error) {
        console.error("Error during signInWithPhoneNumber:", error);
        // We don't need to manually reset the verifier for invisible reCAPTCHA
        // It resets automatically on errors like expiration.
        throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (confirmationResult: ConfirmationResult, otp: string) => {
    await confirmationResult.confirm(otp);
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseAuth.signOut();
  }, []);
  
  const value = { authUser, isLoading, sendOtp, verifyOtp, signOutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  return useContext(AuthContext);
};

// We will wrap the app in this provider in the layout file
export function AppAuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>
}
