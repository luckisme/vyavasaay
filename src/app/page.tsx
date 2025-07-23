
'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import Discover from '@/components/features/discover';
import CropDiagnosis from '@/components/features/crop-diagnosis';
import MarketAnalysis from '@/components/features/market-analysis';
import GovtSchemes from '@/components/features/govt-schemes';
import Weather from '@/components/features/weather';
import OnboardingModal from '@/components/onboarding-modal';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Bell } from 'lucide-react';
import { TranslationProvider, useTranslation } from '@/hooks/use-translation';
import { UserProvider, useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { getMarketAnalysisAction, getWeatherAction, summarizeSchemesAction, generateWeatherAlertAction } from '@/app/actions';
import type { WeatherData, WeatherAlert } from '@/ai/flows/generate-weather-alert';
import type { MarketAnalysisOutput } from '@/ai/flows/get-market-analysis';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import CropCalculator from '@/components/features/crop-calculator';
import CropSelector from '@/components/features/crop-selector';
import AskVyavasaay from '@/components/features/ask-vyavasay';

export type Feature = 'discover' | 'diagnose' | 'market' | 'schemes' | 'weather' | 'calculator' | 'selector' | 'grow-hub';

export const languages = [
    { value: 'en', label: 'English', short: 'En' },
    { value: 'hi', label: 'हिन्दी', short: 'हि' },
    { value: 'mr', label: 'मराठी', short: 'म' },
    { value: 'ta', label: 'தமிழ்', short: 'த' },
    { value: 'te', label: 'తెలుగు', short: 'తె' },
    { value: 'bn', label: 'বাংলা', short: 'বা' },
    { value: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
];

interface DataStates {
    weather: { data: WeatherData | null; error: string | null; loading: boolean; };
    market: { data: MarketAnalysisOutput | null; error: string | null; loading: boolean; };
    schemes: { data: GovernmentSchemeOutput | null; error: string | null; loading: boolean; };
    weatherAlert: { data: WeatherAlert | null; error: string | null; loading: boolean; };
}

function AppCore() {
  const { user, setUserProfile } = useUser();
  const { setLanguage, t, language } = useTranslation();
  const [activeFeature, setActiveFeature] = useState<Feature>('discover');

  const [dataStates, setDataStates] = useState<DataStates>({
    weather: { data: null, error: null, loading: true },
    market: { data: null, error: null, loading: true },
    schemes: { data: null, error: null, loading: true },
    weatherAlert: { data: null, error: null, loading: true },
  });


  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user?.language, setLanguage]);

  useEffect(() => {
    if (user?.location) {
        const languageName = languages.find(l => l.value === language)?.label || 'English';
        const farmerDetails = t('govtSchemes.detailsDefault', `I am a farmer in {{location}}. I primarily grow cotton and soybeans. My main challenges are unpredictable weather patterns, access to modern farming equipment, and getting fair market prices for my produce. I own 5 acres of land.`, { location: user.location });
        const actions = [
            getWeatherAction(user.location).then(result => {
                if ('error' in result) {
                    setDataStates(s => ({ ...s, weather: { data: null, error: result.error, loading: false }}));
                } else {
                    setDataStates(s => ({ ...s, weather: { data: result, error: null, loading: false }}));
                    // After fetching weather, generate the alert.
                    generateWeatherAlertAction(result, languageName).then(alertResult => {
                        setDataStates(s => ({ ...s, weatherAlert: { data: alertResult, error: null, loading: false }}));
                    }).catch(e => {
                        setDataStates(s => ({ ...s, weatherAlert: { data: null, error: e.message, loading: false }}));
                    });
                }
            }),
            getMarketAnalysisAction(user.location, languageName).then(data => {
                setDataStates(s => ({ ...s, market: { data, error: null, loading: false }}));
            }).catch(e => {
                setDataStates(s => ({ ...s, market: { data: null, error: e.message, loading: false }}));
            }),
            summarizeSchemesAction(farmerDetails, languageName).then(data => {
                setDataStates(s => ({ ...s, schemes: { data, error: null, loading: false }}));
            }).catch(e => {
                setDataStates(s => ({ ...s, schemes: { data: null, error: e.message, loading: false }}));
            })
        ];
        Promise.all(actions);
    }
  }, [user, language, t]);

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
        return <MarketAnalysis state={dataStates.market} />;
      case 'schemes':
        return <GovtSchemes state={dataStates.schemes} />;
      case 'weather':
        return <Weather state={dataStates.weather} />;
      case 'calculator':
        return <CropCalculator />;
      case 'selector':
        return <CropSelector />;
      case 'discover':
      default:
        return <Discover 
            setActiveFeature={setActiveFeature} 
            userName={user.name} 
            weatherState={dataStates.weather}
            weatherAlertState={dataStates.weatherAlert}
            languages={languages}
            onLanguageChange={handleLanguageChange}
        />;
    }
  };
  
  const currentLanguage = languages.find(l => l.value === language) || languages[0];

  return (
    <>
      <OnboardingModal isOpen={!user} />
      {user && (
         <SidebarProvider>
            <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
            <div className="flex flex-col w-full min-h-screen">
                <SidebarInset>
                    <main className="flex-1 overflow-auto bg-[#F5F5DC]">
                        <div className="p-4 sm:p-6 pb-24 md:pb-6">
                            {renderFeature()}
                        </div>
                    </main>
                </SidebarInset>
            </div>
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
