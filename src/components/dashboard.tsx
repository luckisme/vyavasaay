'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, Search, Landmark } from 'lucide-react';
import type { Feature } from '@/app/page';

interface DashboardProps {
  setActiveFeature: (feature: Feature) => void;
}

const features = [
  {
    name: 'Crop Diagnosis',
    description: 'Upload an image to detect crop diseases and get solutions.',
    icon: Leaf,
    feature: 'diagnose' as Feature,
  },
  {
    name: 'Ask Vyavasay',
    description: 'Get answers about market prices, weather, and more.',
    icon: Search,
    feature: 'ask' as Feature,
  },
  {
    name: 'Government Schemes',
    description: 'Find relevant government schemes tailored for you.',
    icon: Landmark,
    feature: 'schemes' as Feature,
  },
];

export default function Dashboard({ setActiveFeature }: DashboardProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Welcome, Farmer!</h1>
        <p className="text-muted-foreground">Your AI-powered agricultural assistant is ready to help.</p>
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
