
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Landmark, Youtube, Newspaper, Link as LinkIcon, Phone, CloudSun, Calculator, Lightbulb, Sprout } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

interface DiscoverProps {
  setActiveFeature: (feature: Feature) => void;
  userName: string;
}

export default function Discover({ setActiveFeature, userName }: DiscoverProps) {
  const { t } = useTranslation();

  const features = [
    {
      name: t('dashboard.features.diagnose.title', 'Crop Diagnosis'),
      description: t('dashboard.features.diagnose.description', 'Upload an image to detect crop diseases and get solutions.'),
      icon: Leaf,
      feature: 'diagnose' as Feature,
      color: 'bg-green-100 text-green-800',
    },
    {
      name: t('dashboard.features.marketAnalysis.title', 'Market Analysis'),
      description: t('dashboard.features.marketAnalysis.description', 'Get real-time market prices for your crops.'),
      icon: TrendingUp,
      feature: 'market' as Feature,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      name: t('dashboard.features.schemes.title', 'Government Schemes'),
      description: t('dashboard.features.schemes.description', 'Find relevant government schemes tailored for you.'),
      icon: Landmark,
      feature: 'schemes' as Feature,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      name: t('dashboard.features.weather.title', 'Weather Forecast'),
      description: t('dashboard.features.weather.description', 'Get current weather and forecasts for your location.'),
      icon: CloudSun,
      feature: 'weather' as Feature,
      color: 'bg-indigo-100 text-indigo-800',
    }
  ];
  
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
        color: 'bg-purple-100 text-purple-800',
    }
  ]

  const resources = [
    {
      title: 'How to do soil testing',
      type: 'video',
      source: 'YouTube',
      icon: Youtube,
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM.jpeg",
      dataAiHint: 'soil test farm',
    },
     {
      title: 'New government subsidies announced',
      type: 'news',
      source: 'AgriNews',
      icon: Newspaper,
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (1).jpeg",
      dataAiHint: 'farm subsidy',
    },
    {
      title: 'Krishi Vigyan Kendra Portal',
      type: 'link',
      source: 'kvk.icar.gov.in',
      icon: LinkIcon,
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (2).jpeg",
      dataAiHint: 'farm education',
    }
  ]

  const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{t('dashboard.welcome', `Welcome, ${userName}`, { name: userName })}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome_message', 'Your AI-powered agricultural assistant is ready to help.')}</p>
        </div>
      </div>

      {offlineCallNumber && (
        <a href={`tel:${offlineCallNumber}`}>
            <Card className="bg-primary text-primary-foreground border-accent shadow-lg transition-transform hover:scale-105">
                <CardHeader className="flex-row items-center gap-4">
                    <Phone className="h-8 w-8 text-accent"/>
                    <div>
                        <CardTitle className="font-headline text-lg">Call our offline AI assistant</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Get instant answers over the phone, no internet needed!</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </a>
      )}
      
      <div className="space-y-8">

        <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-headline mb-4">Quick Links</h2>
            <div className="grid gap-6 md:grid-cols-2">
                {quickLinks.map((item) => (
                    <Card
                        key={item.name}
                        className="flex flex-col justify-center text-center items-center p-6 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary"
                        onClick={() => setActiveFeature(item.feature)}
                    >
                        <div className={`p-4 rounded-full mb-4 ${item.color}`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <CardTitle className="font-headline text-xl break-words">{item.name}</CardTitle>
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {features.map((item) => (
            <Card
              key={item.name}
              className="flex flex-col justify-between transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary"
              onClick={() => setActiveFeature(item.feature)}
            >
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="font-headline break-words">{item.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-headline mb-4">{t('discover.resourcesTitle', 'Farming Resources')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((res) => (
                  <Card key={res.title} className="overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1">
                      <div className="relative h-40 w-full">
                          <Image src={res.imageUrl} alt={res.title} layout="fill" objectFit="cover" data-ai-hint={res.dataAiHint} />
                      </div>
                      <CardHeader>
                          <CardTitle className="text-lg">{res.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 pt-2">
                              <res.icon className="w-4 h-4 text-muted-foreground" />
                              <span>{res.source}</span>
                          </CardDescription>
                      </CardHeader>
                  </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
