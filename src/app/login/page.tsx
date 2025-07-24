
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { sendOtp, verifyOtp } = useAuth();
    const { toast } = useToast();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const fullPhoneNumber = `+91${phoneNumber}`;
            const result = await sendOtp(fullPhoneNumber);
            setConfirmationResult(result);
            toast({ title: "OTP Sent", description: "Check your phone for the verification code." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message });
            // This is to reset the reCAPTCHA verifier
            window.location.reload();
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmationResult || !otp) return;
        setIsLoading(true);
        try {
            await verifyOtp(confirmationResult, otp);
            toast({ title: "Success", description: "You are now logged in." });
            router.push('/');
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Invalid OTP. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
            <div id="recaptcha-container" className="my-4"></div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={150} height={150} className="mx-auto" />
                    <CardTitle className="font-headline text-2xl">Welcome to Vyavasaay</CardTitle>
                    <CardDescription>Your AI farming assistant</CardDescription>
                </CardHeader>
                <CardContent>
                    {!confirmationResult ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="flex items-center mt-1">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-10">
                                        +91
                                    </span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="Enter your 10-digit number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="rounded-l-none"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Login
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
