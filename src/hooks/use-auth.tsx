
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

  const sendOtp = useCallback(async (phoneNumber: string): Promise<ConfirmationResult> => {
    // This function will be called when the user clicks the "Send OTP" button.
    // We will set up the invisible reCAPTCHA verifier here.
    const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'sign-in-button', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      }
    });

    return signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
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
