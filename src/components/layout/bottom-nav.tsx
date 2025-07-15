
'use client';

import React from 'react';
import { Compass, Leaf, Landmark, TrendingUp, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';

interface BottomNavProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
}

export default function BottomNav({ activeFeature, setActiveFeature }: BottomNavProps) {
  const { t } = useTranslation();

  const navItems = [
    {
      feature: 'discover' as Feature,
      icon: Compass,
      label: t('sidebar.discover', 'Discover'),
    },
    {
      feature: 'diagnose' as Feature,
      icon: Leaf,
      label: t('sidebar.diagnose', 'Diagnosis'),
    },
    {
      feature: 'market' as Feature,
      icon: TrendingUp,
      label: t('sidebar.marketAnalysis', 'Market'),
    },
    {
      feature: 'schemes' as Feature,
      icon: Landmark,
      label: t('sidebar.schemes', 'Schemes'),
    },
     {
      feature: 'weather' as Feature,
      icon: CloudSun,
      label: t('sidebar.weather', 'Weather'),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => (
          <button
            key={item.feature}
            type="button"
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
              activeFeature === item.feature ? 'text-primary' : 'text-muted-foreground'
            )}
            onClick={() => setActiveFeature(item.feature)}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
