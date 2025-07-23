
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tag, Star, Sprout, Briefcase, Tractor, Leaf } from 'lucide-react';
import type { Feature } from '@/app/page';

const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
)

const popularTopics = [
    {
        icon: Sprout,
        title: 'Crop Management',
        discussions: 120,
        feature: 'selector' as Feature,
    },
    {
        icon: DollarSignIcon,
        title: 'Market Prices',
        discussions: 85,
        feature: 'market' as Feature,
    },
    {
        icon: Tractor,
        title: 'Equipment',
        discussions: 64,
        feature: null,
    },
    {
        icon: Leaf,
        title: 'Organic Methods',
        discussions: 92,
        feature: null,
    }
];

const expertContributors = [
    {
        avatar: '/images/expert-1.jpeg',
        dataAiHint: 'man smiling',
        name: 'Dr. Sharma',
        specialty: 'Soil Expert',
        badge: 'Gold',
        badgeClass: 'bg-yellow-400 text-yellow-900',
    },
    {
        avatar: '/images/expert-2.jpeg',
        dataAiHint: 'woman with mask',
        name: 'Anita Gupta',
        specialty: 'Organic Farming',
        badge: 'Silver',
        badgeClass: 'bg-slate-300 text-slate-800',
    },
    {
        avatar: '/images/expert-3.jpeg',
        dataAiHint: 'man in glasses',
        name: 'Raj Kumar',
        specialty: 'Crop Diagnostics',
        badge: 'Bronze',
        badgeClass: 'bg-orange-400 text-orange-900',
    },
    {
        avatar: '/images/expert-1.jpeg',
        dataAiHint: 'man smiling',
        name: 'Vikram Singh',
        specialty: 'Horticulture',
        badge: 'Gold',
        badgeClass: 'bg-yellow-400 text-yellow-900',
    }
];

export default function GrowHub({ setActiveFeature }: { setActiveFeature: (feature: Feature) => void; }) {
    return (
        <div className="space-y-8">
            {/* Popular Topics Section */}
            <div>
                <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-primary" /> Popular Topics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {popularTopics.map((topic, index) => (
                        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => topic.feature && setActiveFeature(topic.feature)}>
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="p-3 bg-muted rounded-full mb-3">
                                    <topic.icon className="h-7 w-7 text-primary" />
                                </div>
                                <p className="font-semibold">{topic.title}</p>
                                <p className="text-sm text-muted-foreground">{topic.discussions} discussions</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Expert Contributors Section */}
            <div>
                <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary" /> Expert Contributors
                </h2>
                <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                >
                    <CarouselContent>
                        {expertContributors.map((expert, index) => (
                            <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="p-1">
                                    <Card className="shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="relative h-20 w-20 mb-3">
                                                <Image src={expert.avatar} alt={expert.name} layout="fill" objectFit="cover" className="rounded-full" data-ai-hint={expert.dataAiHint} />
                                            </div>
                                            <p className="font-bold">{expert.name}</p>
                                            <p className="text-sm text-muted-foreground mb-2">{expert.specialty}</p>
                                            <Badge className={expert.badgeClass}>{expert.badge}</Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
        </div>
    );
}

    