
'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Leaf, TrendingUp, Landmark, Compass, CloudSun } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';

interface AppSidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
}

export default function AppSidebar({ activeFeature, setActiveFeature }: AppSidebarProps) {
  const { t } = useTranslation();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('discover')}
              isActive={activeFeature === 'discover'}
              tooltip={{ children: t('sidebar.discover', 'Discover'), side: 'right' }}
            >
              <Compass />
              <span>{t('sidebar.discover', 'Discover')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('diagnose')}
              isActive={activeFeature === 'diagnose'}
              tooltip={{ children: t('sidebar.diagnose', 'Crop Diagnosis'), side: 'right' }}
            >
              <Leaf />
              <span>{t('sidebar.diagnose', 'Crop Diagnosis')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('market')}
              isActive={activeFeature === 'market'}
              tooltip={{ children: t('sidebar.marketAnalysis', 'Market Analysis'), side: 'right' }}
            >
              <TrendingUp />
              <span>{t('sidebar.marketAnalysis', 'Market Analysis')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('schemes')}
              isActive={activeFeature === 'schemes'}
              tooltip={{ children: t('sidebar.schemes', 'Government Schemes'), side: 'right' }}
            >
              <Landmark />
              <span>{t('sidebar.schemes', 'Govt. Schemes')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('weather')}
              isActive={activeFeature === 'weather'}
              tooltip={{ children: t('sidebar.weather', 'Weather'), side: 'right' }}
            >
              <CloudSun />
              <span>{t('sidebar.weather', 'Weather')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
