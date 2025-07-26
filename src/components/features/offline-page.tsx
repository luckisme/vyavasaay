
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


const OfflinePage = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const offlineCallNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

    const resources = [
        {
            title: t('offline.resources.pest.title'),
            description: t('offline.resources.pest.desc'),
            tag: t('offline.resources.pest.tag'),
            size: "18.5 MB"
        },
        {
            title: t('offline.resources.monsoon.title'),
            description: t('offline.resources.monsoon.desc'),
            tag: t('offline.resources.monsoon.tag'),
            size: "21.3 MB"
        }
    ];

    const farmData = {
        season: "Kharif 2025",
        crops: [
            {
                name: t('offline.farm.cotton.name'),
                icon: Sprout,
                area: 3.2,
                day: 45,
                status: t('offline.farm.status.healthy'),
                statusClass: "text-green-600",
                action: t('offline.farm.cotton.action')
            },
            {
                name: t('offline.farm.sugarcane.name'),
                icon: Sprout,
                area: 2.0,
                day: 120,
                status: t('offline.farm.status.monitor'),
                statusClass: "text-orange-600",
                action: t('offline.farm.sugarcane.action')
            }
        ]
    }

    const recentConversations = [
        {
            question: t('offline.conversations.wheat.question'),
            answer: t('offline.conversations.wheat.answer'),
            tag: t('offline.conversations.wheat.tag'),
            time: "2025-07-25 15:30"
        },
        {
            question: t('offline.conversations.aphids.question'),
            answer: t('offline.conversations.aphids.answer'),
            tag: t('offline.conversations.aphids.tag'),
            time: "2025-07-24 09:15"
        },
        {
            question: t('offline.conversations.fertilizer.question'),
            answer: t('offline.conversations.fertilizer.answer'),
            tag: t('offline.conversations.fertilizer.tag'),
            time: "2025-07-23 14:45"
        }
    ];


    const handleRetry = () => {
        window.location.reload();
    }
    
    return (
        <div className="space-y-6">

            <Card className="bg-red-500 text-white rounded-xl shadow-lg -mt-12">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <WifiOff className="h-6 w-6" />
                        <div>
                            <p className="font-bold">{t('offline.banner.title')}</p>
                            <p className="text-sm opacity-90">{t('offline.banner.desc')}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="bg-white/20 hover:bg-white/30" onClick={handleRetry}>{t('offline.banner.retry')}</Button>
                </CardContent>
            </Card>

             <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary"/>
                    {t('askVyavasaay.title')}
                    <Badge variant="outline">{t('offline.badge')}</Badge>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <a href={`tel:${offlineCallNumber}`}>
                        <Card className="bg-green-500 text-white text-center p-4 h-full flex flex-col justify-center items-center cursor-pointer hover:bg-green-600 transition-colors">
                            <Phone className="h-8 w-8 mb-2" />
                            <p className="font-bold">{t('offline.ask.call.title')}</p>
                            <p className="text-xs text-white/90">{t('offline.ask.call.desc')}</p>
                        </Card>
                    </a>
                     <a href={`sms:${offlineCallNumber}`}>
                        <Card className="bg-orange-500 text-white text-center p-4 h-full flex flex-col justify-center items-center cursor-pointer hover:bg-orange-600 transition-colors">
                            <MessageSquare className="h-8 w-8 mb-2" />
                            <p className="font-bold">{t('offline.ask.sms.title')}</p>
                            <p className="text-xs text-white/90">{t('offline.ask.sms.desc')}</p>
                        </Card>
                    </a>
                </div>
            </div>

            <div className="space-y-4">
                    <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary"/>
                        {t('offline.resources.title')}
                    </h2>
                    <Badge className="bg-green-100 text-green-800">{t('offline.resources.available', {count: 2})}</Badge>
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
                                    <span className="text-sm text-muted-foreground">{t('offline.resources.size')}: {res.size}</span>
                                </div>
                            </div>
                                <Button variant="ghost" size="icon" className="text-primary"><Play className="h-6 w-6" /></Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                        <Image src="/images/tractor.png" alt="Tractor" width={20} height={20} /> {t('offline.farm.title')}
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
                                    <p className="text-sm text-muted-foreground">{crop.area} {t('offline.farm.acres')} <Dot /> {t('offline.farm.day')} {crop.day}</p>
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
                    <MessageSquare className="h-5 w-5 text-primary" /> {t('offline.conversations.title')}
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
        </div>
    );
}

export default OfflinePage;
