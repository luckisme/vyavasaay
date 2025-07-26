
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Landmark, Youtube, Newspaper, Link as LinkIcon, CloudSun, Calculator, Lightbulb, Sprout, Search, AlertTriangle, Wind, Droplets, Thermometer, ArrowRight, Bell, Globe, ArrowUpRight } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '../ui/skeleton';
import { type WeatherData, type WeatherAlert, type WeatherTip } from '@/app/actions';
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
import { AgriNewsOutput } from '@/lib/types';
import AgriNews from './agri-news';

interface DiscoverProps {
  setActiveFeature: (feature: Feature) => void;
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
  weatherTipState: {
    data: WeatherTip | null;
    error: string | null;
    loading: boolean;
  };
   agriNewsState: {
    data: AgriNewsOutput['articles'] | null;
    error: string | null;
    loading: boolean;
  };
}

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
        return <Skeleton className="h-[52px] w-full rounded-2xl" />;
    }

    if (state.error || !state.data) {
        return null; // Don't show the card if there's an error or no data
    }
    
    const { alert, severity } = state.data;
    const isWarning = severity === 'warning';

    return (
        <Card className={cn(
            "border-none shadow-lg rounded-2xl text-white", 
            isWarning ? 'bg-red-500' : 'bg-yellow-500'
        )}>
            <CardContent className="p-3 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-white"/>
                </div>
                <p className="font-semibold text-sm flex-1">{t('discover.weatherAlertTitle', 'Weather Alert')}: <span className="font-normal">{alert}</span></p>
            </CardContent>
        </Card>
    );
};


export default function Discover({ setActiveFeature, weatherState, weatherAlertState, weatherTipState, agriNewsState }: DiscoverProps) {
  const { t } = useTranslation();
  const [showAllResources, setShowAllResources] = useState(false);
  const [isResourcesLoading, setIsResourcesLoading] = useState(true);
  
  const quickLinks = [
    {
        name: t('cropSelector.title', 'Crop Selector'),
        description: t('cropSelector.description', 'Get AI-powered crop recommendations'),
        icon: Sprout,
        feature: 'selector' as Feature,
        color: 'bg-green-100 text-green-800',
    },
    {
        name: t('cropCalculator.title', 'Cost Calculator'),
        description: t('cropCalculator.description', 'Calculate farming costs and profits'),
        icon: Calculator,
        feature: 'calculator' as Feature,
        color: 'bg-blue-100 text-blue-800',
    }
  ]

  const allResources = [
    {
      title: t('discover.resources.fertilizer.title', 'How to make your own fertilizer?'),
      description: t('discover.resources.fertilizer.description', 'Complete guide for organic fertilizer preparation using kitchen waste and cow dung.'),
      tags: ['AI Query', 'Organic', 'DIY'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (2).jpeg",
      dataAiHint: 'compost fertilizer',
      link: 'https://www.marthastewart.com/how-to-make-homemade-fertilizer-7481114'
    },
    {
      title: t('discover.resources.irrigation.title', 'Mastering Drip Irrigation'),
      description: t('discover.resources.irrigation.description', 'Learn how to set up and maintain a drip irrigation system for water conservation.'),
      tags: ['Water Management', 'Modern Farming'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM.jpeg",
      dataAiHint: 'drip irrigation',
      link: 'https://www.agrivi.com/blog/drip-irrigation-as-the-most-efficient-irrigation-system-type/',
    },
    {
      title: t('discover.resources.pestControl.title', 'Natural Pest Control Methods'),
      description: t('discover.resources.pestControl.description', 'A guide to using natural predators and neem oil to protect your crops from pests.'),
      tags: ['Organic', 'Pest Control'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (1).jpeg",
      dataAiHint: 'crop pest',
      link: 'https://extension.sdstate.edu/organic-pest-control-methods'
    }
  ]

  useEffect(() => {
    // Simulate fetching resources
    const timer = setTimeout(() => {
        setIsResourcesLoading(false);
    }, 1500); // 1.5 seconds delay to show skeleton
    return () => clearTimeout(timer);
  }, []);

  const resourcesToShow = showAllResources ? allResources : allResources.slice(0, 1);

  return (
    <div className="flex flex-col gap-6">
        {/* Weather Section */}
        <div className="space-y-4">
            <WeatherAlertCard state={weatherAlertState} />
            {weatherState.loading && <Skeleton className="h-48 w-full rounded-2xl" />}
            {weatherState.data && (
                <Card className="bg-gradient-to-br from-blue-400 to-purple-500 text-white border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-5 relative">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm font-medium">{t('weather.title')} &bull; {t('discover.todaysWeather', "Today's Weather")}</p>
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
                                {weatherTipState.loading ? (
                                    <Skeleton className="h-4 w-48 bg-white/30" />
                                ) : (
                                    <>
                                        <p className="font-bold text-sm">{weatherTipState.data?.tip}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        {/* Agri News Section */}
        <AgriNews state={agriNewsState} />

        {/* Quick Links */}
        <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-headline flex items-center gap-2 mb-3">
                 {/* <Leaf className="h-5 w-5 text-primary"/> */}
                 {t('discover.quickLinks', 'Quick Links')}
            </h2>
            <div className="space-y-4">
                {quickLinks.map((item) => (
                    <Card
                        key={item.name}
                        className="flex justify-between items-center text-left p-4 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white"
                        onClick={() => setActiveFeature(item.feature)}
                    >
                        <div className="flex items-center gap-4">
                           <div className={cn('p-3 rounded-full', item.color)}>
                               <item.icon className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <CardDescription className="text-xs mt-1">{item.description}</CardDescription>
                           </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </Card>
                ))}
            </div>
        </div>
        
        {/* Farming Resources */}
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-headline flex items-center gap-2">
                    {/* <Sprout className="h-5 w-5 text-primary"/> */}
                    {t('discover.resourcesTitle', 'Farming Resources')}
                </h2>
                {!isResourcesLoading && (
                    <Button variant="link" className="text-primary pr-0" onClick={() => setShowAllResources(!showAllResources)}>
                      {showAllResources ? t('discover.seeLess', 'See Less') : t('discover.seeAll', 'See All')}
                       <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </div>
            <div className="space-y-4">
              {isResourcesLoading ? (
                  [...Array(1)].map((_, i) => (
                    <Card key={i} className="overflow-hidden bg-white">
                        <Skeleton className="h-40 w-full" />
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                  ))
              ) : (
                resourcesToShow.map((res) => {
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
                                 <div className="p-2 rounded-full bg-gray-100">
                                  <ArrowUpRight className="h-4 w-4 text-gray-600" />
                                 </div>
                              </div>
                          </CardContent>
                      </Card>
                    );

                    if (res.link) {
                      return (
                          <a href={res.link} target="_blank" rel="noopener noreferrer" key={res.title} className="block">
                              {resourceCard}
                          </a>
                      )
                    }
                    return resourceCard;
                })
              )}
          </div>
        </div>
    </div>
  );
}
