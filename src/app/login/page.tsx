
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ShieldCheck, MessageSquareText, Timer, Info, Check, Sparkles, User, Phone, MapPin } from 'lucide-react';
import { languages } from '@/app/page';
import { useTranslation, TranslationProvider } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TractorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4H21V6H3V4Z"></path>
        <path d="M3 10H21V12H3V10Z"></path>
        <path d="M8 16H16V18H8V16Z"></path>
        <path d="M12 2V22"></path>
    </svg>
);


type OnboardingStep = 'language' | 'details' | 'otp';

function LoginPageCore() {
    const [step, setStep] = useState<OnboardingStep>('language');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { sendOtp } = useAuth();
    const { toast } = useToast();
    const { t, setLanguage } = useTranslation();
    
    const [onboardingData, setOnboardingData] = useState({
        name: '',
        phoneNumber: '',
        state: '',
        district: '',
        farmSize: ''
    });
    
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [resendTimer, setResendTimer] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);
    
    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleLanguageContinue = () => {
        if (selectedLanguage) {
            setLanguage(selectedLanguage);
            setStep('details');
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResendTimer(30);
        try {
            const fullPhoneNumber = `+91${onboardingData.phoneNumber}`;
            const result = await sendOtp(fullPhoneNumber);
            setConfirmationResult(result);
            toast({ title: t('login.otpSent.title', "OTP Sent"), description: t('login.otpSent.description', "Check your phone for the verification code.") });
            setStep('otp');
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: t('login.error.title', "Error"), description: error.message });
            window.location.reload(); // Reset reCAPTCHA
        } finally {
            setIsLoading(false);
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmationResult || otp.join('').length !== 6) return;
        setIsLoading(true);
        
        const db = getFirestore(app);

        try {
            const credential = await confirmationResult.confirm(otp.join(''));
            const user = credential.user;

            const userProfile = {
                uid: user.uid,
                phone: user.phoneNumber,
                name: onboardingData.name,
                location: `${onboardingData.district}, ${onboardingData.state}`,
                language: selectedLanguage,
                landArea: parseFloat(onboardingData.farmSize),
                profilePicture: '/images/image.png'
            };
            
            await setDoc(doc(db, "users", user.uid), userProfile);

            toast({ title: t('login.success.title', "Success"), description: t('login.success.description', "You are now logged in.") });
            router.push('/');
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: t('login.error.title', "Error"), description: t('login.error.invalidOtp', "Invalid OTP. Please try again.") });
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        if (step === 'details') setStep('language');
        if (step === 'otp') setStep('details');
    };
    
    const maskPhoneNumber = (phone: string) => {
        if (phone.length !== 10) return phone;
        return `+91 ${phone.substring(0, 3)}XXX-XXX${phone.substring(6)}`;
    }
    
    const renderStep = () => {
        switch (step) {
            case 'language':
                return (
                    <div className="w-full max-w-sm flex flex-col justify-between h-full py-8">
                        <div className="text-center">
                            <div className="mx-auto w-40 h-40 flex items-center justify-center mb-4">
                                <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={150} height={150} />
                            </div>
                            <h1 className="text-2xl font-bold text-green-800">Welcome to Vyavasaay</h1>
                            <p className="text-muted-foreground mt-1">Choose your preferred language</p>
                        </div>
                        <div className="space-y-3 my-6">
                            {languages.map(lang => (
                                <button
                                    key={lang.value}
                                    onClick={() => setSelectedLanguage(lang.value)}
                                    className={cn(
                                        "w-full flex items-center p-3 rounded-lg border-2 transition-all",
                                        selectedLanguage === lang.value
                                            ? "bg-green-50 border-green-500"
                                            : "bg-white border-gray-200"
                                    )}
                                >
                                    <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold text-xl mr-4">{lang.short}</div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">{lang.native}</p>
                                        <p className="text-sm text-gray-500">{lang.label}</p>
                                    </div>
                                    {selectedLanguage === lang.value && (
                                        <div className="ml-auto w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <Button onClick={handleLanguageContinue} disabled={!selectedLanguage} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-12">
                                Continue
                            </Button>
                            <p className="text-center text-xs text-gray-500">You can change this later in settings</p>
                        </div>
                    </div>
                );
            case 'details':
                return (
                    <div className="w-full max-w-sm flex flex-col h-full">
                        <header className="flex items-center p-4 -ml-4">
                            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft/></Button>
                        </header>
                         <div className="text-center">
                            <div className="mx-auto w-40 h-40 flex items-center justify-center mb-4">
                                <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={150} height={150} />
                            </div>
                            <h1 className="text-2xl font-bold text-green-800">{t('onboarding.details.title', 'Tell us about yourself')}</h1>
                            <p className="text-muted-foreground">{t('onboarding.details.description', 'Help us personalize your experience')}</p>
                        </div>
                        <form onSubmit={handleDetailsSubmit} className="space-y-4 flex-1 mt-4">
                            <Card>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full"><User className="h-5 w-5 text-blue-600" /></div>
                                        <div>
                                            <Label htmlFor="name" className="font-semibold">{t('onboarding.name', 'Full Name')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('onboarding.details.nameHint', 'As per your documents')}</p>
                                        </div>
                                    </div>
                                    <Input id="name" value={onboardingData.name} onChange={e => setOnboardingData(p => ({...p, name: e.target.value}))} placeholder={t('onboarding.namePlaceholder')} required />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 rounded-full"><Phone className="h-5 w-5 text-green-600" /></div>
                                        <div>
                                            <Label htmlFor="phone" className="font-semibold">{t('login.phone.title', 'Mobile Number')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('onboarding.details.phoneHint', 'For weather alerts & tips')}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-10">
                                            +91
                                        </span>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder={t('login.phone.placeholder', 'Enter 10-digit number')}
                                            value={onboardingData.phoneNumber}
                                            onChange={(e) => setOnboardingData(p => ({...p, phoneNumber: e.target.value}))}
                                            required
                                            className="rounded-l-none"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-orange-100 rounded-full"><MapPin className="h-5 w-5 text-orange-600" /></div>
                                        <div>
                                            <Label className="font-semibold">{t('onboarding.details.farmLocation', 'Farm Location')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('onboarding.details.locationHint', 'For local weather & market data')}</p>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                      <Input id="state" value={onboardingData.state} onChange={e => setOnboardingData(p => ({...p, state: e.target.value}))} placeholder={t('onboarding.details.state', 'Select State')} required />
                                      <Input id="district" value={onboardingData.district} onChange={e => setOnboardingData(p => ({...p, district: e.target.value}))} placeholder={t('onboarding.details.district', 'Select District')} required />
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 rounded-full"><TractorIcon className="h-5 w-5 text-purple-600" /></div>
                                        <div>
                                            <Label htmlFor="farmSize" className="font-semibold">{t('onboarding.details.farmSize', 'Farm Size')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('onboarding.details.farmSizeHint', 'Approximate area in acres')}</p>
                                        </div>
                                    </div>
                                    <Select onValueChange={(value) => setOnboardingData(p => ({...p, farmSize: value}))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('onboarding.details.farmSizeSelect', "Select Farm Size")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Acre</SelectItem>
                                            <SelectItem value="2">2 Acres</SelectItem>
                                            <SelectItem value="5">5 Acres</SelectItem>
                                            <SelectItem value="10">10 Acres</SelectItem>
                                            <SelectItem value="10+">10+ Acres</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <div className="!mt-auto pt-4">
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('onboarding.button', 'Continue')}
                                </Button>
                                <p className="text-center text-xs text-gray-500 mt-2">{t('onboarding.details.secure', 'Your information will be stored securely')}</p>
                            </div>
                        </form>
                    </div>
                );
            case 'otp':
                return (
                     <div className="w-full max-w-sm flex flex-col items-center">
                        <Button variant="ghost" size="icon" className="absolute top-8 left-8" onClick={goBack}><ArrowLeft/></Button>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-primary">{t('login.otp.title', 'Mobile Verification')}</h1>
                            <p className="text-muted-foreground">{t('login.otp.subtitle', 'OTP Verification')}</p>
                        </div>
                        <div className="bg-green-500 text-white rounded-full p-4 my-6">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <p className="text-lg text-center mb-4">{t('login.otp.prompt', 'Enter the 6-digit code sent to your mobile number')}</p>
                        <Card className="w-full mb-4">
                            <CardContent className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <MessageSquareText className="h-6 w-6 text-primary"/>
                                    <div>
                                        <p className="text-muted-foreground text-sm">{t('login.otp.codeSentTo', 'Code sent to:')}</p>
                                        <p className="font-semibold">{maskPhoneNumber(onboardingData.phoneNumber)}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setStep('details')}>{t('login.otp.changeButton', 'Change')}</Button>
                            </CardContent>
                        </Card>
                        <form onSubmit={handleVerifyOtp} className="w-full space-y-6">
                             <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold"
                                        required
                                    />
                                ))}
                            </div>
                            
                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-muted-foreground">
                                        <Timer className="inline h-4 w-4 mr-1"/>
                                        {t('login.otp.resendTimer', 'Resend in {{seconds}} seconds', { seconds: resendTimer.toString() })}
                                    </p>
                                ) : (
                                    <Button variant="link" onClick={e => handleDetailsSubmit(e)} disabled={isLoading}>
                                        {t('login.otp.resendButton', 'Resend Code')}
                                    </Button>
                                )}
                            </div>

                             <Card className="bg-blue-50 border-blue-200">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                                        <Info className="h-5 w-5"/>
                                        {t('login.otp.tips.title', 'Tips')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm text-blue-700 space-y-1">
                                    <p>&bull; {t('login.otp.tips.tip1', 'Code may take 1-2 minutes to arrive')}</p>
                                    <p>&bull; {t('login.otp.tips.tip2', 'Check your spam folder too')}</p>
                                    <p>&bull; {t('login.otp.tips.tip3', 'Ensure good network connection')}</p>
                                </CardContent>
                            </Card>

                            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || otp.join('').length !== 6}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('login.otp.verifyButton', 'Verify')}
                            </Button>
                        </form>
                    </div>
                );
        }
    };
    
    return (
        <main className={cn(
            "flex min-h-screen flex-col items-center justify-start p-4",
            "bg-[#F7FDF3]"
        )}>
            <div id="recaptcha-container" className="my-4"></div>
            {renderStep()}
        </main>
    );
}

export default function LoginPage() {
    return (
        <TranslationProvider>
            <LoginPageCore />
        </TranslationProvider>
    )
}

    

    
