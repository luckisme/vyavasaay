
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { type AgriNewsOutput } from '@/lib/types';
import { ArrowRight, Newspaper, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface AgriNewsProps {
    state: {
        data: AgriNewsOutput['articles'] | null;
        error: string | null;
        loading: boolean;
    }
}

const newsImages = [
    "/images/WhatsApp Image 2025-07-27 at 7.24.14 AM.jpeg",
    "/images/WhatsApp Image 2025-07-27 at 7.24.23 AM.jpeg",
    "/images/WhatsApp Image 2025-07-27 at 7.24.14 AM (1).jpeg"
];

const NewsCard = ({ article, imageUrl }: { article: AgriNewsOutput['articles'][0], imageUrl: string }) => (
    <div className="block w-[180px] flex-shrink-0 cursor-pointer">
        <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="relative h-24">
                <Image
                    src={imageUrl}
                    alt={article.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform"
                    data-ai-hint={article.dataAiHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <CardContent className="p-3 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{article.source}</span>
                </div>
            </CardContent>
        </Card>
    </div>
);

const NewsCardSkeleton = () => (
    <div className="w-[180px] flex-shrink-0">
        <Card className="overflow-hidden h-full">
            <Skeleton className="h-24 w-full" />
            <CardContent className="p-3 bg-white space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3 mt-1" />
            </CardContent>
        </Card>
    </div>
);


export default function AgriNews({ state }: AgriNewsProps) {
    const { t } = useTranslation();

    const renderContent = () => {
        if (state.loading) {
            return (
                <>
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                </>
            );
        }

        if (state.error) {
            return (
                <Alert variant="destructive" className="col-span-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error fetching news</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            );
        }

        if (!state.data || state.data.length === 0) {
            return (
                <div className="col-span-full text-center text-muted-foreground py-4">
                    No agricultural news available at the moment.
                </div>
            );
        }

        return state.data.map((article, index) => (
            <NewsCard key={index} article={article} imageUrl={newsImages[index % newsImages.length]} />
        ));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-headline flex items-center gap-2">
                    {/* <Newspaper className="h-5 w-5 text-primary"/> */}
                    Agri News
                </h2>
                <Button variant="link" className="text-primary pr-0">
                    {t('discover.seeAll', 'See All')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                 {renderContent()}
            </div>
        </div>
    );
}
