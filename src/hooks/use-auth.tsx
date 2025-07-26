
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
    // Check if a container element exists, and only then create the RecaptchaVerifier
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
        throw new Error("reCAPTCHA container not found.");
    }
    
    // Ensure the verifier is only created once per call or managed appropriately
    if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainer, {
          'size': 'invisible'
        });
    }
    
    const recaptchaVerifier = (window as any).recaptchaVerifier;

    try {
        const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
    } catch (error) {
        // Handle specific errors, e.g., reCAPTCHA expired, and reset if necessary
        console.error("Error during signInWithPhoneNumber:", error);
        recaptchaVerifier.render().then((widgetId: any) => {
            if (typeof (window as any).grecaptcha !== 'undefined') {
                (window as any).grecaptcha.reset(widgetId);
            }
        });
        throw error; // Re-throw the error to be handled by the caller
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
