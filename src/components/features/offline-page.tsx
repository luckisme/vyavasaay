
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, ArrowLeft, Phone, MessageSquare, BookOpen, Play, Sprout } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';
import { Avatar } from '../ui/avatar';


const OfflineHeader = () => {
    const { user } = useUser();
    
    return (
        <header className="flex items-center justify-between p-4 bg-background">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
                <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={32} height={32} />
                <span className="font-bold text-lg">Vyavasaay</span>
            </div>
            <div className="flex items-center gap-2">
                <WifiOff className="h-6 w-6 text-red-500" />
                 <Avatar className="h-8 w-8">
                    <Image src={user?.profilePicture || "/images/image.png"} alt={user?.name || 'User'} width={32} height={32} />
                </Avatar>
            </div>
        </header>
    )
}

const resources = [
    {
        title: "Crop Planting Guide",
        description: "Comprehensive guide covering planting schedules, soil requirements, and best...",
        tag: "Planting",
        size: "15.2 MB"
    },
    {
        title: "Organic Fertilizer Handbook",
        description: "Complete guide to organic fertilizers, composting techniques, and nutrient...",
        tag: "Fertilization",
        size: "12.8 MB"
    }
];

export default function OfflinePage() {
    const { t } = useTranslation();
    const { user } = useUser();

    const handleRetry = () => {
        window.location.reload();
    }

    return (
        <div className="animate-fade-in bg-background min-h-screen">
            <OfflineHeader />

            <div className="p-4 space-y-6">

                <Card className="bg-red-500 text-white rounded-xl shadow-lg">
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

                <Card className="bg-gradient-to-br from-blue-400 to-purple-500 text-white border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-5 relative">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm font-medium">आज का मौसम • Today's Weather (Cached)</p>
                                <p className="text-4xl font-bold mt-1">28°C</p>
                                <p className="capitalize">Cloudy</p>
                                <p className="text-xs opacity-80 mt-1">July 26, 2025 • {user?.name}'s Farm, {user?.location?.split(',')[0]}</p>
                             </div>
                             <div className="w-16 h-16 opacity-80">
                                <Image src="https://openweathermap.org/img/wn/03d@2x.png" alt="Cloudy" width={64} height={64}/>
                             </div>
                        </div>
                        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                            <div className="bg-green-500 p-2 rounded-full">
                                <Sprout className="h-5 w-5 text-white" />
                            </div>
                            <div>
                               <p className="font-bold text-sm">Perfect for {user?.name}'s wheat sowing!</p>
                               <p className="text-xs opacity-90">Based on last synced weather data.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div>
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-3">
                       <Phone className="h-5 w-5 text-primary"/>
                        Ask Vyavasaay <Badge variant="outline">Offline Mode</Badge>
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-green-500 text-white text-center p-4 flex flex-col items-center justify-center h-40">
                            <Phone className="h-10 w-10 mb-2" />
                            <p className="font-bold">Call</p>
                            <p className="text-xs opacity-90">Instant solution in your own language</p>
                        </Card>
                         <Card className="bg-orange-500 text-white text-center p-4 flex flex-col items-center justify-center h-40">
                            <MessageSquare className="h-10 w-10 mb-2" />
                            <p className="font-bold">SMS</p>
                            <p className="text-xs opacity-90">Get answers on your query</p>
                        </Card>
                    </div>
                </div>


                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                           <BookOpen className="h-5 w-5 text-primary"/>
                           Downloaded Resources
                        </h2>
                        <Badge className="bg-green-100 text-green-800">4 Available</Badge>
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

            </div>
        </div>
    );
}
