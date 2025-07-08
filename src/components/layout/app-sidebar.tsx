'use client';

import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Leaf, Search, Landmark, LayoutDashboard, Sprout, Phone } from 'lucide-react';
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
          <Sprout className="w-8 h-8 text-primary" />
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
              onClick={() => setActiveFeature('ask')}
              isActive={activeFeature === 'ask'}
              tooltip={{ children: t('sidebar.ask', 'Ask Vyavasaay'), side: 'right' }}
            >
              <Search />
              <span>{t('sidebar.ask', 'Ask Vyavasaay')}</span>
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
