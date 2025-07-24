
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
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Bell, Search, Mic } from 'lucide-react';
import { TranslationProvider, useTranslation } from '@/hooks/use-translation';
import { UserProvider, useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { getMarketAnalysisAction, getWeatherAction, summarizeSchemesAction, generateWeatherAlertAction, generateWeatherBasedTipAction } from '@/app/actions';
import type { WeatherData } from '@/app/actions';
import type { WeatherAlert, WeatherTip } from '@/app/actions';
import type { MarketAnalysisOutput } from '@/lib/types';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import CropCalculator from '@/components/features/crop-calculator';
import CropSelector from '@/components/features/crop-selector';
import AskVyavasaay from '@/components/features/ask-vyavasay';
import GrowHub from '@/components/features/grow-hub';
import Profile from '@/components/features/profile';

export type Feature = 'discover' | 'diagnose' | 'market' | 'schemes' | 'weather' | 'calculator' | 'selector' | 'ask' | 'grow-hub' | 'profile';

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
    weatherTip: { data: WeatherTip | null; error: string | null; loading: boolean; };
}

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
)

const AppHeader = ({ setActiveFeature }: { setActiveFeature: (feature: Feature) => void }) => {
    const { user, setUserProfile } = useUser();
    const { setLanguage, t } = useTranslation();
    
    const handleLanguageChange = (langCode: string) => {
        if (user) {
            setUserProfile({ ...user, language: langCode });
        }
    };
    
    const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

    return (
        <header className="px-4 pt-4 bg-[#F5F5DC] space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 -mt-16">
                    <div>
                        <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={170} height={170} />
                    </div>
                </div>
                <div className="flex items-center gap-2 -mt-16">
                    <Button variant="ghost" size="icon"> <Bell className="h-5 w-5" /> </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Globe className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {languages.map((lang) => (
                          <DropdownMenuItem key={lang.value} onClick={() => handleLanguageChange(lang.value)}>
                            {lang.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Avatar className="cursor-pointer" onClick={() => setActiveFeature('profile')}>
                        <Image src={user?.profilePicture || "/images/image.png"} alt={t('header.avatarAlt', 'Farmer avatar')} width={40} height={40} className="rounded-full" />
                    </Avatar>
                </div>
            </div>
             <div 
                className="relative flex-grow h-12 flex items-center bg-white rounded-full cursor-pointer shadow-sm border border-gray-200"
                onClick={() => setActiveFeature('ask')}
            >
                <span className="pl-4 text-muted-foreground">{t('discover.searchPlaceholder', 'Ask Vyavasaay anything...')}</span>
                <div className="absolute right-2 flex items-center gap-1">
                    <Button type="button" size="icon" variant="ghost" className="rounded-full h-9 w-9 text-muted-foreground">
                        <Mic className="h-5 w-5" />
                    </Button>
                     <Button type="button" size="icon" className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90">
                        <Search className="h-5 w-5 text-primary-foreground" />
                    </Button>
                </div>
            </div>
        </header>
    );
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
    weatherTip: { data: null, error: null, loading: true },
  });


  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user?.language, setLanguage]);

  useEffect(() => {
    if (user) {
        const languageName = languages.find(l => l.value === language)?.label || 'English';
        const farmerDetails = t('govtSchemes.detailsDefault', `I am a farmer in {{location}}. I primarily grow cotton and soybeans. My main challenges are unpredictable weather patterns, access to modern farming equipment, and getting fair market prices for my produce. I own 5 acres of land.`, { location: user.location });
        
        setDataStates(s => ({ ...s, weather: { data: null, error: null, loading: true }, weatherAlert: { data: null, error: null, loading: true }, weatherTip: { data: null, error: null, loading: true }}));
        getWeatherAction(user.location).then(weatherResult => {
            if ('error' in weatherResult) {
                setDataStates(s => ({ 
                    ...s, 
                    weather: { data: null, error: weatherResult.error, loading: false },
                    weatherAlert: { data: null, error: weatherResult.error, loading: false },
                    weatherTip: { data: null, error: weatherResult.error, loading: false }
                }));
            } else {
                setDataStates(s => ({ ...s, weather: { data: weatherResult, error: null, loading: false }}));

                generateWeatherAlertAction(weatherResult, languageName).then(alertResult => {
                    setDataStates(s => ({ 
                        ...s, 
                        weatherAlert: { data: alertResult, error: null, loading: false }
                    }));
                }).catch(e => {
                     setDataStates(s => ({ 
                        ...s, 
                        weatherAlert: { data: null, error: e.message, loading: false }
                    }));
                });

                generateWeatherBasedTipAction(weatherResult, user, languageName).then(tipResult => {
                    setDataStates(s => ({ 
                        ...s, 
                        weatherTip: { data: tipResult, error: null, loading: false }
                    }));
                }).catch(e => {
                     setDataStates(s => ({ 
                        ...s, 
                        weatherTip: { data: null, error: e.message, loading: false }
                    }));
                });
            }
        });
        
        setDataStates(s => ({ ...s, market: { data: null, error: null, loading: true }}));
        getMarketAnalysisAction(user.location, languageName).then(data => {
            setDataStates(s => ({ ...s, market: { data, error: null, loading: false }}));
        }).catch(e => {
            setDataStates(s => ({ ...s, market: { data: null, error: e.message, loading: false }}));
        });

        setDataStates(s => ({ ...s, schemes: { data: null, error: null, loading: true }}));
        summarizeSchemesAction(farmerDetails, languageName).then(data => {
            setDataStates(s => ({ ...s, schemes: { data, error: null, loading: false }}));
        }).catch(e => {
            setDataStates(s => ({ ...s, schemes: { data: null, error: e.message, loading: false }}));
        });
    }
  }, [user, language, t]);

  const renderFeature = () => {
    if (!user) return null;
    switch (activeFeature) {
      case 'diagnose':
        return <CropDiagnosis setActiveFeature={setActiveFeature} />;
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
      case 'ask':
        return <AskVyavasaay />;
      case 'grow-hub':
        return <GrowHub setActiveFeature={setActiveFeature} />;
      case 'profile':
        return <Profile setActiveFeature={setActiveFeature} />;
      case 'discover':
      default:
        return <Discover 
            setActiveFeature={setActiveFeature} 
            weatherState={dataStates.weather}
            weatherAlertState={dataStates.weatherAlert}
            weatherTipState={dataStates.weatherTip}
        />;
    }
  };
  
  return (
    <>
      <OnboardingModal isOpen={!user} />
      {user && (
         <SidebarProvider>
            <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
            <div className="flex flex-col w-full min-h-screen">
                <SidebarInset>
                    <main className="flex-1 flex flex-col overflow-auto bg-[#F5F5DC]">
                       {activeFeature === 'discover' && <AppHeader setActiveFeature={setActiveFeature} />}
                        <div className="p-4 sm:p-6 pb-24 md:pb-6 flex-1">
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
