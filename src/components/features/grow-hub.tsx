
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Store, BookOpen, ArrowRight } from 'lucide-react';
import type { Feature } from '@/app/page';
import { useTranslation } from '@/hooks/use-translation';

const recentDiscussions = [
    {
        avatar: '/images/expert-3.jpeg',
        dataAiHint: 'man in glasses',
        name: 'Rajesh Kumar',
        badge: 'Verified Farmer',
        badgeClass: 'bg-blue-100 text-blue-800',
        question: 'Which fertilizer works best for wheat in Punjab during winter season?',
        replies: 12,
        time: '2 hours ago',
    },
    {
        avatar: '/images/expert-2.jpeg',
        dataAiHint: 'woman with mask',
        name: 'Priya Mehta',
        badge: 'Expert',
        badgeClass: 'bg-green-100 text-green-800',
        question: 'Sharing my organic pest control recipe that increased my tomato yield by 30%',
        replies: 28,
        time: '5 hours ago',
    }
];

const knowledgeLibraryItems = [
    {
      title: 'How to make your own fertilizer?',
      description: 'Complete guide for organic fertilizer preparation using kitchen waste and cow dung.',
      tags: ['AI Query', 'Organic', 'DIY'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (2).jpeg",
      dataAiHint: 'compost fertilizer',
      link: 'https://www.marthastewart.com/how-to-make-homemade-fertilizer-7481114'
    },
    {
      title: 'Mastering Drip Irrigation',
      description: 'Learn how to set up and maintain a drip irrigation system for water conservation.',
      tags: ['Water Management', 'Modern Farming'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM.jpeg",
      dataAiHint: 'drip irrigation',
      link: 'https://www.agrivi.com/blog/drip-irrigation-as-the-most-efficient-irrigation-system-type/',
    },
    {
      title: 'Natural Pest Control Methods',
      description: 'A guide to using natural predators and neem oil to protect your crops from pests.',
      tags: ['Organic', 'Pest Control'],
      imageUrl: "/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (1).jpeg",
      dataAiHint: 'crop pest',
      link: 'https://extension.sdstate.edu/organic-pest-control-methods'
    }
]

export default function GrowHub({ setActiveFeature }: { setActiveFeature: (feature: Feature) => void; }) {
    const { t } = useTranslation();
    const [showAllResources, setShowAllResources] = useState(false);
    const resourcesToShow = showAllResources ? knowledgeLibraryItems : knowledgeLibraryItems.slice(0, 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveFeature('discover')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline">{t('growHub.title', 'Grow Hub')}</h1>
                    <p className="text-muted-foreground">{t('growHub.description', 'Connect, learn, and grow together with fellow farmers')}</p>
                </div>
            </header>

            {/* Join the Conversation Card */}
            <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
                <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                         <div>
                            <h2 className="text-xl font-bold">{t('growHub.joinConversation.title', 'Join the Conversation')}</h2>
                            <p className="text-sm opacity-90 mt-1">{t('growHub.joinConversation.description', 'Connect with 50K+ farmers across India')}</p>
                         </div>
                         <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                            <Image src="/images/Black and Beige Simple Illustration Farmer's Local Market Logo-3.png" alt="Vyavasaay Logo" width={48} height={48} />
                         </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                        <Button variant="secondary" className="w-full bg-white/30 text-white hover:bg-white/40" onClick={() => setActiveFeature('ask')}>
                            <MessageSquare className="mr-2 h-4 w-4" /> {t('growHub.joinConversation.askButton', 'Ask Question')}
                        </Button>
                         <Button variant="secondary" className="w-full bg-white/30 text-white hover:bg-white/40" onClick={() => setActiveFeature('market')}>
                            <Store className="mr-2 h-4 w-4" /> {t('growHub.joinConversation.marketplaceButton', 'Marketplace')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Discussions Section */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" /> {t('growHub.recentDiscussions.title', 'Recent Discussions')}
                    </h2>
                    <Button variant="link" className="text-primary pr-0">
                        {t('growHub.recentDiscussions.viewAll', 'View All')}
                    </Button>
                </div>
                <div className="space-y-3">
                    {recentDiscussions.map((discussion, index) => (
                        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4 flex gap-4">
                                <Image src={discussion.avatar} alt={discussion.name} width={40} height={40} className="rounded-full h-10 w-10 object-cover" data-ai-hint={discussion.dataAiHint} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{discussion.name}</p>
                                        <Badge className={discussion.badgeClass}>{discussion.badge}</Badge>
                                    </div>
                                    <p className="mt-1 text-foreground">{discussion.question}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                        <span>{discussion.replies} {t('growHub.recentDiscussions.replies', 'replies')}</span>
                                        <span>{discussion.time}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Knowledge Library Section */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary"/>
                        {t('growHub.knowledgeLibrary.title', 'Knowledge Library')}
                    </h2>
                    <Button variant="link" className="text-primary pr-0" onClick={() => setShowAllResources(!showAllResources)}>
                      {showAllResources ? t('discover.seeLess', 'See Less') : t('discover.seeAll', 'See All')}
                    </Button>
                </div>
                <div className="space-y-4">
                {resourcesToShow.map((res) => {
                    const resourceCard = (
                        <Card key={res.title} className="overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white">
                            <div className="relative h-40 w-full">
                                <Image src={res.imageUrl} alt={res.title} layout="fill" objectFit="cover" data-ai-hint={res.dataAiHint} />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold">{res.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{res.description}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex gap-2">
                                        {res.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );

                    if (res.link) {
                        return (
                            <a href={res.link} target="_blank" rel="noopener noreferrer" key={res.title}>
                                {resourceCard}
                            </a>
                        )
                    }
                    return resourceCard;
                })}
                </div>
            </div>
        </div>
    );
}
