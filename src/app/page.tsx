
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/app-sidebar';
import Discover from '@/components/features/discover';
import CropDiagnosis from '@/components/features/crop-diagnosis';
import MarketAnalysis from '@/components/features/market-analysis';
import GovtSchemes from '@/components/features/govt-schemes';
import Weather from '@/components/features/weather';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Bell, Search, Mic, LogOut, Phone } from 'lucide-react';
import { TranslationProvider, useTranslation } from '@/hooks/use-translation';
import { UserProvider, useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { getMarketAnalysisAction, getWeatherAction, summarizeSchemesAction, generateWeatherAlertAction, generateWeatherBasedTipAction, getAgriNewsAction } from '@/app/actions';
import type { WeatherData } from '@/app/actions';
import type { WeatherAlert, WeatherTip } from '@/app/actions';
import type { MarketAnalysisOutput, AgriNewsOutput } from '@/lib/types';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import CropCalculator from '@/components/features/crop-calculator';
import CropSelector from '@/components/features/crop-selector';
import AskVyavasaay from '@/components/features/ask-vyavasay';
import GrowHub from '@/components/features/grow-hub';
import Profile from '@/components/features/profile';
import { useOffline } from '@/hooks/use-offline';
import OfflinePage from '@/components/features/offline-page';

export type Feature = 'discover' | 'diagnose' | 'market' | 'schemes' | 'weather' | 'calculator' | 'selector' | 'ask' | 'grow-hub' | 'profile';

export const languages = [
    { value: 'en', label: 'English', short: 'E', native: 'English' },
    { value: 'hi', label: 'हिन्दी', short: 'ह', native: 'हिन्दी' },
    { value: 'mr', label: 'मराठी', short: 'म', native: 'मराठी' },
    { value: 'ta', label: 'தமிழ்', short: 'த', native: 'தமிழ்' },
    { value: 'te', label: 'తెలుగు', short: 'తె', native: 'తెలుగు' },
    { value: 'bn', label: 'বাংলা', short: 'ব', native: 'বাংলা' },
    { value: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ', native: 'ಕನ್ನಡ' },
    { value: 'gu', label: 'ગુજરાતી', short: 'ગ', native: 'ગુજરાતી' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ', short: 'ਪ', native: 'ਪੰਜਾਬੀ' },
];


interface DataStates {
    weather: { data: WeatherData | null; error: string | null; loading: boolean; };
    market: { data: MarketAnalysisOutput | null; error: string | null; loading: boolean; };
    schemes: { data: GovernmentSchemeOutput | null; error: string | null; loading: boolean; };
    weatherAlert: { data: WeatherAlert | null; error: string | null; loading: boolean; };
    weatherTip: { data: WeatherTip | null; error: string | null; loading: boolean; };
    agriNews: { data: AgriNewsOutput['articles'] | null; error: string | null; loading: boolean; };
}

export const AppHeader = ({ setActiveFeature, isOffline = false }: { setActiveFeature: (feature: Feature) => void, isOffline?: boolean }) => {
    const { user, setUserProfile } = useUser();
    const { setLanguage, t } = useTranslation();
    const { signOutUser } = useAuth();
    
    const handleLanguageChange = (langCode: string) => {
        if (user) {
            setUserProfile({ ...user, language: langCode });
        }
    };
    
    const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

    return (
        <header className="mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 -mt-16">
                    <div>
                        <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={170} height={170} />
                    </div>
                </div>
                <div className="flex items-center gap-2 -mt-16">
                    <Button variant="ghost" size="icon" disabled={isOffline}> <Bell className="h-5 w-5" /> </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isOffline}>
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isOffline}>
                             <Avatar className="cursor-pointer">
                                <Image src={user?.profilePicture || "/images/image.png"} alt={t('header.avatarAlt', 'Farmer avatar')} width={40} height={40} className="rounded-full" />
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setActiveFeature('profile')}>
                                {t('header.profile', 'Profile')}
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={signOutUser}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('header.logout', 'Log out')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
             {!isOffline && (
                <div className="flex items-center gap-2 -mt-6 mb-6">
                    <div 
                        className="relative flex-grow h-12 flex items-center bg-white rounded-full cursor-pointer shadow-sm border border-gray-200"
                        onClick={() => !isOffline && setActiveFeature('ask')}
                    >
                        <span className="pl-4 text-muted-foreground">{t('discover.searchPlaceholder', 'Ask Vyavasaay anything...')}</span>
                        <div className="absolute right-2 flex items-center gap-1">
                            <Button type="button" size="icon" variant="ghost" className="rounded-full h-9 w-9 text-muted-foreground" disabled={isOffline}>
                                <Mic className="h-5 w-5" />
                            </Button>
                            <Button type="button" size="icon" className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90" disabled={isOffline}>
                                <Search className="h-5 w-5 text-primary-foreground" />
                            </Button>
                        </div>
                    </div>
                    {offlineCallNumber && (
                        <a href={`tel:${offlineCallNumber}`}>
                            <Button variant="destructive" className="h-12 w-12 rounded-full p-0 flex-shrink-0 shadow-sm">
                                <Phone className="h-5 w-5" />
                            </Button>
                        </a>
                    )}
                </div>
             )}
        </header>
    );
}

function AppCore() {
  const { user, isUserLoading } = useUser();
  const { setLanguage, t, language } = useTranslation();
  const [activeFeature, setActiveFeature] = useState<Feature>('discover');
  const isOffline = useOffline();
  
  const [dataStates, setDataStates] = useState<DataStates>({
    weather: { data: null, error: null, loading: true },
    market: { data: null, error: null, loading: true },
    schemes: { data: null, error: null, loading: true },
    weatherAlert: { data: null, error: null, loading: true },
    weatherTip: { data: null, error: null, loading: true },
    agriNews: { data: null, error: null, loading: true },
  });


  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user?.language, setLanguage]);

  useEffect(() => {
    if (user && !isOffline) {
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
        
        setDataStates(s => ({ ...s, agriNews: { data: null, error: null, loading: true }}));
        getAgriNewsAction(user.location, languageName).then(result => {
            if ('error' in result) {
                setDataStates(s => ({ ...s, agriNews: { data: null, error: result.error, loading: false }}));
            } else {
                setDataStates(s => ({ ...s, agriNews: { data: result.articles || null, error: null, loading: false }}));
            }
        });

    }
  }, [user, language, t, isOffline]);

  if (isUserLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
        )
    }

  const renderFeature = () => {
    if (!user) return null;
    if (isOffline) {
        return <OfflinePage />;
    }
    switch (activeFeature) {
      case 'diagnose':
        return <CropDiagnosis setActiveFeature={setActiveFeature} />;
      case 'market':
        return <MarketAnalysis state={dataStates.market} setActiveFeature={setActiveFeature} />;
      case 'schemes':
        return <GovtSchemes state={dataStates.schemes} setActiveFeature={setActiveFeature} />;
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
            agriNewsState={dataStates.agriNews}
        />;
    }
  };
  
  return (
    <>
      {user && (
         <SidebarProvider>
            <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
            <div className="flex flex-col w-full min-h-screen">
                <SidebarInset>
                    <main className="flex-1 flex flex-col overflow-auto bg-[#F5F5DC]">
                       {(activeFeature === 'discover' || isOffline) && <div className="p-4 sm:p-6 pb-0"><AppHeader setActiveFeature={setActiveFeature} isOffline={isOffline} /></div>}
                        <div className="p-4 sm:p-6 pt-0 pb-24 md:pb-6 flex-1">
                            {renderFeature()}
                        </div>
                    </main>
                </SidebarInset>
            </div>
            {!isOffline && <BottomNav activeFeature={activeFeature} setActiveFeature={setActiveFeature} />}
        </SidebarProvider>
      )}
    </>
  );
}

function AuthBoundary({ children }: { children: React.ReactNode }) {
    const { authUser, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push('/login');
        }
    }, [authUser, isLoading, router]);

    if (isLoading || !authUser) {
         return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
        )
    }

    return <>{children}</>;
}


export default function Home() {
  return (
    <TranslationProvider>
        <UserProvider>
            <AuthBoundary>
                <AppCore />
            </AuthBoundary>
        </UserProvider>
    </TranslationProvider>
  )
}
