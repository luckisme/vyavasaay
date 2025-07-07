'use client';

import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Leaf, Search, Landmark, LayoutDashboard, Phone, Sprout } from 'lucide-react';
import type { Feature } from '@/app/page';

interface AppSidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
}

export default function AppSidebar({ activeFeature, setActiveFeature }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Sprout className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-bold text-primary font-headline">Vyavasay</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('dashboard')}
              isActive={activeFeature === 'dashboard'}
              tooltip={{ children: 'Dashboard', side: 'right' }}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('diagnose')}
              isActive={activeFeature === 'diagnose'}
              tooltip={{ children: 'Crop Diagnosis', side: 'right' }}
            >
              <Leaf />
              <span>Crop Diagnosis</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('ask')}
              isActive={activeFeature === 'ask'}
              tooltip={{ children: 'Ask Vyavasay', side: 'right' }}
            >
              <Search />
              <span>Ask Vyavasay</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveFeature('schemes')}
              isActive={activeFeature === 'schemes'}
              tooltip={{ children: 'Government Schemes', side: 'right' }}
            >
              <Landmark />
              <span>Govt. Schemes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="p-4 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-semibold">Need help offline?</span>
          </div>
          <p>
            Call us on our dedicated line for AI-powered assistance in your local language.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
