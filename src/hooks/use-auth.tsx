
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
    // This is a simplified approach for demonstration, bypassing the visible reCAPTCHA.
    // In a production environment, you must use a proper RecaptchaVerifier.
    const confirmationResult = {
        // This is a mock confirm function.
        confirm: async (verificationCode: string) => {
            // In a real scenario, you would not have access to the user object here.
            // This is simplified to allow login flow to proceed without backend verification.
            // This mock will not work with real Firebase Auth.
            
            // A more robust mock would involve a mock user object.
            // For now, we rely on the onAuthStateChanged to pick up the logged-in user.
            // The actual user sign-in will be triggered by a custom backend function
            // or a different auth method if reCAPTCHA is to be fully avoided.
             const dummyUser = {
                uid: `mock-uid-${phoneNumber}`,
                phoneNumber: phoneNumber,
                // Add other properties as needed to match Firebase's User interface
            } as User;

            // This simulates the result of a successful confirmation.
            return Promise.resolve({
                user: dummyUser,
                // other properties of UserCredential
            });
        },
        // other properties of ConfirmationResult
    } as ConfirmationResult;

    // Simulate a successful OTP send
    console.log(`Simulating OTP send to ${phoneNumber}`);
    return Promise.resolve(confirmationResult);
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
