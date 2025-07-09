'use client';

import React, { useState } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import Dashboard from '@/components/dashboard';
import CropDiagnosis from '@/components/features/crop-diagnosis';
import AskVyavasaay, { MarketAnalysis } from '@/components/features/ask-vyavasay';
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

export type Feature = 'dashboard' | 'market' | 'schemes';

export const languages = [
    { value: 'English', label: 'English', code: 'en' },
    { value: 'Hindi', label: 'हिन्दी', code: 'hi' },
    { value: 'Marathi', label: 'मराठी', code: 'mr' },
    { value: 'Tamil', label: 'தமிழ்', code: 'ta' },
    { value: 'Telugu', label: 'తెలుగు', code: 'te' },
    { value: 'Bengali', label: 'বাংলা', code: 'bn' },
    { value: 'Kannada', label: 'ಕನ್ನಡ', code: 'kn' },
];

function AppContent() {
  const [activeFeature, setActiveFeature] = useState<Feature>('dashboard');
  const { language, setLanguage, t } = useTranslation();
  const { user, isUserLoading } = useUser();

  const renderFeature = () => {
    if (!user) return null; // Or show a loader/message
    switch (activeFeature) {
      case 'diagnose':
        return <CropDiagnosis />;
      case 'market':
        return <MarketAnalysis />;
      case 'schemes':
        return <GovtSchemes />;
      case 'dashboard':
      default:
        return <Dashboard setActiveFeature={setActiveFeature} userName={user.name} />;
    }
  };

  if (isUserLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
        </div>
    )
  }

  return (
    <>
      <OnboardingModal isOpen={!user} />
      {user && (
         <SidebarProvider>
            <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
            <div className="flex flex-col w-full min-h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-2xl font-bold text-primary font-headline hidden sm:block">{t('appName', 'Vyavasaay')}</h1>
                </div>
                <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[120px] border-none focus:ring-0 bg-transparent">
                        <SelectValue placeholder={t('header.language', 'Language')} />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <Avatar>
                  <Image src="https://placehold.co/40x40.png" alt={t('header.avatarAlt', 'Farmer avatar')} width={40} height={40} data-ai-hint="farmer avatar" />
                  <AvatarFallback>{user.name?.substring(0,2).toUpperCase() || 'FA'}</AvatarFallback>
                </Avatar>
                </div>
            </header>
            <SidebarInset>
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                {renderFeature()}
                </main>
            </SidebarInset>
            </div>
            <AskVyavasaay />
        </SidebarProvider>
      )}
    </>
  );
}

export default function Home() {
  // The providers need to be at the root, so we wrap the main content.
  return (
    <TranslationProvider initialLanguage="en">
        <UserProvider>
            <AppContent />
        </UserProvider>
    </TranslationProvider>
  )
}
