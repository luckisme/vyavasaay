
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, ArrowLeft, Phone, MessageSquare, BookOpen, Play, Sprout, Tractor, Dot, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/app/page';


const resources = [
    {
        title: "Pest Management Manual",
        description: "Identification and organic control methods for common agricultural pests.",
        tag: "Pest Control",
        size: "18.5 MB"
    },
    {
        title: "Monsoon Farming Guide",
        description: "Seasonal farming strategies for monsoon conditions and water management.",
        tag: "Seasonal",
        size: "21.3 MB"
    }
];

const farmData = {
    season: "Kharif 2025",
    crops: [
        {
            name: "Cotton",
            icon: Sprout,
            area: 3.2,
            day: 45,
            status: "Healthy",
            statusClass: "text-green-600",
            action: "Irrigation due in 2 days"
        },
        {
            name: "Sugarcane",
            icon: Sprout,
            area: 2.0,
            day: 120,
            status: "Monitor",
            statusClass: "text-orange-600",
            action: "Pest check required"
        }
    ]
}

const recentConversations = [
    {
        question: "When is the best time to harvest wheat?",
        answer: "Wheat should be harvested when the grain moisture content is around 14-16%. Look for...",
        tag: "Harvesting",
        time: "2025-07-25 15:30"
    },
    {
        question: "How to control aphids organically?",
        answer: "Use neem oil spray (2-3ml per liter), introduce ladybugs, or spray soapy water solution early...",
        tag: "Pest Control",
        time: "2025-07-24 09:15"
    },
    {
        question: "Best fertilizer for cotton growth?",
        answer: "Use NPK 19:19:19 at 50kg/hectare during flowering stage. Add organic compost for better soil health.",
        tag: "Fertilization",
        time: "2025-07-23 14:45"
    }
];


export default function OfflinePage() {
    const { t } = useTranslation();
    const { user } = useUser();
    const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;


    const handleRetry = () => {
        window.location.reload();
    }
    
    const offlineTips = [
        "Use Call/SMS for urgent farming queries",
        "Access downloaded guides anytime",
        "Your farm data is safely stored locally",
        "Weather data updates when online"
    ];

    return (
        <div className="animate-fade-in bg-[#F5F5DC] min-h-screen">
            <div className="p-4 space-y-6 pb-24">
                <div className="p-4 sm:p-6 pb-0"><AppHeader setActiveFeature={() => {}} isOffline={true}/></div>


                <Card className="bg-red-500 text-white rounded-xl shadow-lg -mt-12">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <WifiOff className="h-6 w-6" />
                            <div>
                                <p className="font-bold">You are currently offline</p>
                                <p className="text-sm opacity-90">Access your downloaded content and use Call/SMS for help</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="bg-white/20 hover:bg-white/30" onClick={handleRetry}>Retry</Button>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-3">
                       <Phone className="h-5 w-5 text-primary"/>
                        Ask Vyavasaay <Badge variant="outline">Offline Mode</Badge>
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href={`tel:${offlineCallNumber}`} className="block">
                            <Card className="bg-green-500 text-white text-center p-4 flex flex-col items-center justify-center h-40">
                                <Phone className="h-10 w-10 mb-2" />
                                <p className="font-bold">Call</p>
                                <p className="text-xs opacity-90">Instant solution in your own language</p>
                            </Card>
                        </a>
                         <a href={`sms:${offlineCallNumber}`} className="block">
                            <Card className="bg-orange-500 text-white text-center p-4 flex flex-col items-center justify-center h-40">
                                <MessageSquare className="h-10 w-10 mb-2" />
                                <p className="font-bold">SMS</p>
                                <p className="text-xs opacity-90">Get answers on your query</p>
                            </Card>
                         </a>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                           <BookOpen className="h-5 w-5 text-primary"/>
                           Downloaded Resources
                        </h2>
                        <Badge className="bg-green-100 text-green-800">2 Available</Badge>
                    </div>
                    {resources.map((res, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-green-700" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{res.title}</p>
                                    <p className="text-sm text-muted-foreground">{res.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge variant="secondary">{res.tag}</Badge>
                                        <span className="text-sm text-muted-foreground">Size: {res.size}</span>
                                    </div>
                                </div>
                                 <Button variant="ghost" size="icon" className="text-primary"><Play className="h-6 w-6" /></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                         <Image src="/images/tractor.png" alt="Tractor" width={20} height={20} /> My Farm (Last Sync)
                    </h2>
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{farmData.season}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            {farmData.crops.map(crop => (
                                <div key={crop.name} className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 bg-green-100">
                                        <AvatarFallback className="bg-transparent"><crop.icon className="text-green-600"/></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{crop.name}</p>
                                        <p className="text-sm text-muted-foreground">{crop.area} acres <Dot /> Day {crop.day}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-semibold text-sm", crop.statusClass)}>{crop.status}</p>
                                        <p className="text-sm text-muted-foreground">{crop.action}</p>
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
                        {recentConversations.map(convo => (
                            <Card key={convo.question}>
                                <CardContent className="p-4 space-y-2">
                                     <p className="font-semibold text-sm flex items-center gap-2">
                                        <Avatar className="h-6 w-6 bg-blue-100">
                                             <AvatarFallback className="bg-transparent text-blue-600 text-xs font-bold">AI</AvatarFallback>
                                        </Avatar>
                                        {convo.question}
                                     </p>
                                     <p className="text-sm text-muted-foreground pl-8">{convo.answer}</p>
                                     <div className="flex items-center justify-between pl-8 pt-1">
                                         <Badge variant="outline">{convo.tag}</Badge>
                                         <span className="text-xs text-muted-foreground">{convo.time}</span>
                                     </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-500 text-white rounded-xl p-5 shadow-lg space-y-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" /> Offline Tips
                    </h3>
                    <ul className="space-y-2 text-sm pl-2">
                        {offlineTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-1">&#8226;</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
