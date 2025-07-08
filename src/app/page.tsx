'use client';

import React, { useState } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import Dashboard from '@/components/dashboard';
import CropDiagnosis from '@/components/features/crop-diagnosis';
import AskVyavasay from '@/components/features/ask-vyavasay';
import GovtSchemes from '@/components/features/govt-schemes';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from 'lucide-react';

export type Feature = 'dashboard' | 'diagnose' | 'ask' | 'schemes';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'हिन्दी' },
    { value: 'Marathi', label: 'मराठी' },
    { value: 'Tamil', label: 'தமிழ்' },
    { value: 'Telugu', label: 'తెలుగు' },
    { value: 'Bengali', label: 'বাংলা' },
    { value: 'Kannada', label: 'ಕನ್ನಡ' },
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<Feature>('dashboard');
  const [language, setLanguage] = useState<string>('English');

  const renderFeature = () => {
    switch (activeFeature) {
      case 'diagnose':
        return <CropDiagnosis />;
      case 'ask':
        return <AskVyavasay language={language} />;
      case 'schemes':
        return <GovtSchemes />;
      case 'dashboard':
      default:
        return <Dashboard setActiveFeature={setActiveFeature} />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
      <div className="flex flex-col w-full min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-bold text-primary font-headline hidden sm:block">Vyavasay</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[120px] border-none focus:ring-0 bg-transparent">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <Avatar>
              <Image src="https://placehold.co/40x40.png" alt="Farmer avatar" width={40} height={40} data-ai-hint="farmer avatar" />
              <AvatarFallback>FA</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <SidebarInset>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {renderFeature()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
