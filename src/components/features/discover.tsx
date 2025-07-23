
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Landmark, Youtube, Newspaper, Link as LinkIcon, CloudSun, Calculator, Lightbulb, Sprout, Search, AlertTriangle, Wind, Droplets, Thermometer, ArrowRight, Bell, Globe } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '../ui/skeleton';
import { type WeatherData, type WeatherAlert } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { useUser } from '@/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DiscoverProps {
  setActiveFeature: (feature: Feature) => void;
  userName: string;
  weatherState: {
    data: WeatherData | null;
    error: string | null;
    loading: boolean;
  };
  weatherAlertState: {
    data: WeatherAlert | null;
    error: string | null;
    loading: boolean;
  };
  languages: { value: string; label: string; short: string; }[];
  onLanguageChange: (langCode: string) => void;
}

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
)

const SproutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 16.5c-1.66 0-3-1.34-3-3 0-1.31.84-2.42 2-2.83V10c0-1.1.9-2 2-2h1c.55 0 1 .45 1 1s-.45 1-1 1h-1v.67c1.16.41 2 1.52 2 2.83 0 1.66-1.34 3-3 3zm7-5.5c0-1.1-.9-2-2-2h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v.67c1.16.41 2 1.52 2 2.83 0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.31.84-2.42 2-2.83V8h1c1.1 0 2 .9 2 2v1.5z"/>
  </svg>
)

const CalculatorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2h10c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm0 15h2v2H7v-2zm0-4h2v2H7v-2zm0-4h2v2H7V9zm4 4h2v2h-2v-2zm0-4h2v2h-2V9zm4 8h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V9zm-4 8h2v2h-2v-2zm4-4h2v2h-2v-2z"/>
    </svg>
);


const WeatherAlertCard = ({ state }: { state: DiscoverProps['weatherAlertState']}) => {
    const { t } = useTranslation();

    if (state.loading) {
        return <Skeleton className="h-16 w-full" />;
    }

    if (state.error || !state.data) {
        return null; // Don't show the card if there's an error or no data
    }
    
    const { alert, severity } = state.data;

    const alertStyles = {
        warning: 'bg-red-100 border-red-500 text-red-800',
        info: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    };

    return (
        <Card className={cn("border-2 shadow-lg", alertStyles[severity])}>
            <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className={cn("h-6 w-6", severity === 'warning' ? 'text-red-600' : 'text-yellow-600')}/>
                <div>
                    <p className="font-bold">{t('discover.weatherAlertTitle', 'Weather Alert')}</p>
                    <p className="text-sm">{alert}</p>
                </div>
            </CardContent>
        </Card>
    );
};


export default function Discover({ setActiveFeature, userName, weatherState, weatherAlertState, languages, onLanguageChange }: DiscoverProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [showAllResources, setShowAllResources] = useState(false);
  
  const quickLinks = [
    {
        name: t('cropSelector.title', 'Crop Selector'),
        description: t('cropSelector.description', 'Get AI-powered crop recommendations'),
        icon: Sprout,
        feature: 'selector' as Feature,
        color: 'bg-green-100 text-green-800',
        icon_path: 'green'
    },
    {
        name: t('cropCalculator.title', 'Cost Calculator'),
        description: t('cropCalculator.description', 'Calculate farming costs and profits'),
        icon: Calculator,
        feature: 'calculator' as Feature,
        color: 'bg-purple-100 text-purple-800',
        icon_path: 'purple'
    }
  ]

  const allResources = [
    {
      title: 'How to make your own fertilizer?',
      description: 'Complete guide for organic fertilizer preparation using kitchen waste and cow dung.',
      tags: ['AI Query', 'Organic', 'DIY'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (2).jpeg",
      dataAiHint: 'compost fertilizer',
      link: 'https://www.marthastewart.com/how-to-make-homemade-fertilizer-7481114'
    },
    {
      title: 'Mastering Drip Irrigation',
      description: 'Learn how to set up and maintain a drip irrigation system for water conservation.',
      tags: ['Water Management', 'Modern Farming'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM.jpeg",
      dataAiHint: 'drip irrigation',
    },
    {
      title: 'Natural Pest Control Methods',
      description: 'A guide to using natural predators and neem oil to protect your crops from pests.',
      tags: ['Organic', 'Pest Control'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (1).jpeg",
      dataAiHint: 'crop pest',
    }
  ]

  const resourcesToShow = showAllResources ? allResources : allResources.slice(0, 1);

  const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

  return (
    <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={56} height={56} />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"> <Bell className="h-5 w-5" /> </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang.value} onClick={() => onLanguageChange(lang.value)}>
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Avatar>
                    <Image src="/images/image.png" alt={t('header.avatarAlt', 'Farmer avatar')} width={40} height={40} className="rounded-full" />
                </Avatar>
            </div>
        </header>

        {/* Search and Call */}
         <div className="flex items-center gap-2">
             <div 
                className="relative flex-grow h-12 flex items-center bg-white rounded-full cursor-pointer shadow-sm border border-gray-200"
                onClick={() => setActiveFeature('ask')}
            >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <span className="pl-12 text-muted-foreground">{t('discover.searchPlaceholder', 'Ask Vyavasaay anything...')}</span>
            </div>
            {offlineCallNumber && (
                <a href={`tel:${offlineCallNumber}`}>
                    <Button type="button" size="icon" className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90">
                        <PhoneIcon className="h-6 w-6 text-primary-foreground" />
                    </Button>
                </a>
            )}
        </div>

        {/* Weather Section */}
        <div className="space-y-4">
             <WeatherAlertCard state={weatherAlertState} />
            {weatherState.loading && <Skeleton className="h-48 w-full rounded-2xl" />}
            {weatherState.data && (
                <Card className="bg-gradient-to-br from-blue-400 to-purple-500 text-white border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-5 relative">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm font-medium">{t('weather.title')} &bull; Today's Weather</p>
                                <p className="text-4xl font-bold mt-1">{Math.round(weatherState.data.temperature)}°C</p>
                                <p className="capitalize">{weatherState.data.description}</p>
                                <p className="text-xs opacity-80 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; {weatherState.data.location}</p>
                             </div>
                             <div className="w-16 h-16">
                                <Image src={weatherState.data.iconUrl} alt={weatherState.data.description} width={64} height={64}/>
                             </div>
                        </div>
                         <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                            <div className="bg-green-500 p-2 rounded-full">
                                <Sprout className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{t('discover.smartAlertTitle', 'Perfect for banana plantation!')}</p>
                                <p className="text-xs opacity-90">{t('discover.smartAlertBody', 'Ideal humidity and temperature conditions detected.')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        {/* Quick Links */}
        <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-headline mb-3 flex items-center gap-2">
                 <Leaf className="h-5 w-5 text-primary"/>
                 {t('discover.quickLinks', 'Quick Links')}
            </h2>
            <div className="grid gap-4 grid-cols-2">
                {quickLinks.map((item) => (
                    <Card
                        key={item.name}
                        className="flex flex-col justify-center items-center text-center p-4 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white"
                        onClick={() => setActiveFeature(item.feature)}
                    >
                        <div className={cn('p-3 rounded-full mb-3', item.color)}>
                           <item.icon className="w-7 h-7" />
                        </div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <CardDescription className="text-xs mt-1">{item.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
        
        {/* Farming Resources */}
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-headline flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary"/>
                    {t('discover.resourcesTitle', 'Farming Resources for You')}
                </h2>
                <Button variant="link" className="text-primary pr-0" onClick={() => setShowAllResources(!showAllResources)}>
                  {showAllResources ? 'See Less' : t('discover.seeAll', 'See All')}
                </Button>
            </div>
            <div className="space-y-4">
              {resourcesToShow.map((res) => {
                  const resourceCard = (
                    <Card key={res.title} className="overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white">
                        <div className="relative h-40 w-full">
                            <Image src={res.imageUrl} alt={res.title} layout="fill" objectFit="cover" data-ai-hint={res.dataAiHint} />
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold">{res.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{res.description}</p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex gap-2">
                                  {res.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                              </div>
                            </div>
                        </CardContent>
                    </Card>
                  );

                  if (res.link) {
                    return (
                        <a href={res.link} target="_blank" rel="noopener noreferrer" key={res.title}>
                            {resourceCard}
                        </a>
                    )
                  }
                  return resourceCard;
              })}
          </div>
        </div>
    </div>
  );
}
