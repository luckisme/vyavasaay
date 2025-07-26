
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tractor, MessageSquare, Download, Play, Lightbulb, WifiOff } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

const farmData = [
    { name: 'Cotton', acres: 3.2, day: 45, status: 'Healthy', statusColor: 'text-green-600', task: 'Irrigation due in 2 days' },
    { name: 'Sugarcane', acres: 2.0, day: 120, status: 'Monitor', statusColor: 'text-orange-500', task: 'Pest check required' },
];

const conversations = [
    { question: 'When is the best time to harvest wheat?', answer: 'Wheat should be harvested when the grain moisture content is around 14-16%. Look for...', tag: 'Harvesting', time: '2025-07-25 15:30' },
    { question: 'How to control aphids organically?', answer: 'Use neem oil spray (2-3ml per liter), introduce ladybugs, or spray soapy water solution early...', tag: 'Pest Control', time: '2025-07-24 09:15' },
    { question: 'Best fertilizer for cotton growth?', answer: 'Use NPK 19:19:19 at 50kg/hectare during flowering stage. Add organic compost for better soil health.', tag: 'Fertilization', time: '2025-07-23 14:45' },
];

const offlineTips = [
    'Use Call/SMS for urgent farming queries',
    'Access downloaded guides anytime',
    'Your farm data is safely stored locally',
    'Weather data updates when online',
];

export default function OfflinePage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="bg-red-50 border-red-200 text-red-800">
                <CardContent className="p-4 flex items-center gap-3">
                    <WifiOff className="h-5 w-5" />
                    <div>
                        <p className="font-semibold">You are currently offline</p>
                        <p className="text-sm">Showing last synced data. Some features may be unavailable.</p>
                    </div>
                </CardContent>
            </Card>
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary"/>
                    Downloaded Guides
                </h2>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center">
                             <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Guide" width={80} height={80} objectFit="contain" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Guide to Pest Management</p>
                            <p className="text-sm text-muted-foreground">Comprehensive guide for sustainable pest control.</p>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge variant="secondary">Seasonal</Badge>
                                <span className="text-sm text-muted-foreground">Size: 21.3 MB</span>
                            </div>
                        </div>
                         <Button><Play className="mr-2 h-4 w-4" /> Open</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <Tractor className="h-5 w-5 text-primary" /> My Farm (Last Sync)
                </h2>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Kharif 2025</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {farmData.map(crop => (
                            <div key={crop.name} className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Tractor className="h-5 w-5 text-green-700" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{crop.name}</p>
                                    <p className="text-sm text-muted-foreground">{crop.acres} acres • Day {crop.day}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${crop.statusColor}`}>{crop.status}</p>
                                    <p className="text-sm text-muted-foreground">{crop.task}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Recent AI Conversations
                </h2>
                <div className="space-y-3">
                    {conversations.map(convo => (
                        <Card key={convo.question}>
                            <CardContent className="p-4">
                                <p className="font-semibold">{convo.question}</p>
                                <p className="text-sm text-muted-foreground mt-1">{convo.answer}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <Badge variant="outline">{convo.tag}</Badge>
                                    <p className="text-xs text-muted-foreground">{convo.time}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                 <Card className="bg-blue-600 text-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb /> Offline Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2">
                            {offlineTips.map(tip => <li key={tip}>{tip}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
