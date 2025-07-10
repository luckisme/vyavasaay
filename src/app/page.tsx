
'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import Discover from '@/components/features/discover';
import CropDiagnosis from '@/components/features/crop-diagnosis';
import AskVyavasaay from '@/components/features/ask-vyavasay';
import MarketAnalysis from '@/components/features/market-analysis';
import GovtSchemes from '@/components/features/govt-schemes';
import OnboardingModal from '@/components/onboarding-modal';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from 'lucide-react';
import { TranslationProvider, useTranslation } from '@/hooks/use-translation';
import { UserProvider, useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/layout/bottom-nav';

export type Feature = 'discover' | 'diagnose' | 'market' | 'schemes';

export const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
    { value: 'mr', label: 'मराठी' },
    { value: 'ta', label: 'தமிழ்' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'bn', label: 'বাংলা' },
    { value: 'kn', label: 'ಕನ್ನಡ' },
];

function AppCore() {
  const { user, setUserProfile } = useUser();
  const { setLanguage, t, language } = useTranslation();
  const [activeFeature, setActiveFeature] = useState<Feature>('discover');

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user?.language, setLanguage]);

  const handleLanguageChange = (langCode: string) => {
    if (user) {
      setUserProfile({ ...user, language: langCode });
    }
  };

  const renderFeature = () => {
    if (!user) return null;
    switch (activeFeature) {
      case 'diagnose':
        return <CropDiagnosis />;
      case 'market':
        return <MarketAnalysis />;
      case 'schemes':
        return <GovtSchemes />;
      case 'discover':
      default:
        return <Discover setActiveFeature={setActiveFeature} userName={user.name} />;
    }
  };

  return (
    <>
      <OnboardingModal isOpen={!user} />
      {user && (
         <SidebarProvider>
            <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
            <div className="flex flex-col w-full min-h-screen">
                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <button onClick={() => setActiveFeature('discover')} className="flex items-center gap-2">
                            <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={180} height={180} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-auto sm:w-[120px] border-none focus:ring-0 bg-transparent flex items-center gap-2">
                            <Globe className="h-5 w-5 text-muted-foreground hidden sm:block" />
                            <SelectValue placeholder={t('header.language', 'Language')} />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Avatar>
                            <Image src="/images/image.png" alt={t('header.avatarAlt', 'Farmer avatar')} width={40} height={40} className="rounded-full" />
                            <AvatarFallback>{user.name?.substring(0,2).toUpperCase() || 'FA'}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <SidebarInset>
                    <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 overflow-auto">
                    {renderFeature()}
                    </main>
                </SidebarInset>
            </div>
            <AskVyavasaay />
            <BottomNav activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        </SidebarProvider>
      )}
    </>
  );
}

function AppContent() {
    const { isUserLoading } = useUser();
    
    if (isUserLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
        )
    }

    return (
        <TranslationProvider>
            <AppCore />
        </TranslationProvider>
    );
}


export default function Home() {
  return (
    <UserProvider>
        <AppContent />
    </UserProvider>
  )
}
