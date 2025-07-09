'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Landmark } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';

interface DashboardProps {
  setActiveFeature: (feature: Feature) => void;
}

export default function Dashboard({ setActiveFeature }: DashboardProps) {
  const { t } = useTranslation();

  const features = [
    {
      name: t('dashboard.features.diagnose.title'),
      description: t('dashboard.features.diagnose.description'),
      icon: Leaf,
      feature: 'diagnose' as Feature,
    },
    {
      name: t('dashboard.features.marketAnalysis.title'),
      description: t('dashboard.features.marketAnalysis.description'),
      icon: TrendingUp,
      feature: 'market' as Feature,
    },
    {
      name: t('dashboard.features.schemes.title'),
      description: t('dashboard.features.schemes.description'),
      icon: Landmark,
      feature: 'schemes' as Feature,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{t('dashboard.welcome')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome_message')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => (
          <Card
            key={item.name}
            className="flex flex-col justify-between transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary"
            onClick={() => setActiveFeature(item.feature)}
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="font-headline">{item.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
