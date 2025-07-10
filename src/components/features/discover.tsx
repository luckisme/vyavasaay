
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Landmark, Youtube, Newspaper, Link as LinkIcon } from 'lucide-react';
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
  ];
  
  const resources = [
    {
      title: 'How to do soil testing',
      type: 'video',
      source: 'YouTube',
      icon: Youtube,
      imageUrl: 'https://placehold.co/600x400',
      dataAiHint: 'soil test farm',
    },
     {
      title: 'New government subsidies announced',
      type: 'news',
      source: 'AgriNews',
      icon: Newspaper,
      imageUrl: 'https://placehold.co/600x400',
      dataAiHint: 'farm subsidy',
    },
    {
      title: 'Krishi Vigyan Kendra Portal',
      type: 'link',
      source: 'kvk.icar.gov.in',
      icon: LinkIcon,
      imageUrl: 'https://placehold.co/600x400',
      dataAiHint: 'farm education',
    }
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{t('dashboard.welcome', `Welcome, ${userName}`, { name: userName })}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome_message', 'Your AI-powered agricultural assistant is ready to help.')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
