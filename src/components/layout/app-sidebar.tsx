'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Leaf, TrendingUp, Landmark, LayoutDashboard, Phone } from 'lucide-react';
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
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-2.png" alt="Vyavasaay Logo" width={32} height={32} />
          <h2 className="text-xl font-bold text-primary font-headline">{t('appName', 'Vyavasaay')}</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('dashboard')}
              isActive={activeFeature === 'dashboard'}
              tooltip={{ children: t('sidebar.dashboard', 'Dashboard'), side: 'right' }}
            >
              <LayoutDashboard />
              <span>{t('sidebar.dashboard', 'Dashboard')}</span>
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
            <SidebarMenuButton asChild>
                <a href="tel:1800-000-0000">
                    <Phone />
                    <span>{t('sidebar.callHelpline', 'Call Helpline')}</span>
                </a>
            </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
