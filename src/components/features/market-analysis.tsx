
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ArrowUp, ArrowDown, Filter, BarChart, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import type { MarketAnalysisOutput } from '@/lib/types';
import { cn } from '@/lib/utils';

type MarketAnalysisProps = {
    state: {
        data: MarketAnalysisOutput | null;
        error: string | null;
        loading: boolean;
    }
}

export default function MarketAnalysis({ state }: MarketAnalysisProps) {
    const { t } = useTranslation();
    const { user } = useUser();

    if (state.loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>
        );
    }
    
    if (state.error || !state.data) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('marketAnalysis.errorTitle', 'Error Fetching Market Data')}</AlertTitle>
                <AlertDescription>{state.error || t('marketAnalysis.noData', 'No market analysis data available.')}</AlertDescription>
            </Alert>
        )
    }

    const { marketAlert, todaysPrices } = state.data;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('₹', '₹ ');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">Market Analysis</h1>
                <p className="text-muted-foreground">Real-time market prices and trends for your crops</p>
            </div>

            {/* Market Alert */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-xl rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg">{marketAlert.title}</p>
                            <p className="mt-1 max-w-xs">{marketAlert.description}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <BarChart className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Prices */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Today's Prices
                    </h2>
                    <Button variant="link" className="text-primary">View All Markets</Button>
                </div>
                <div className="space-y-3">
                    {todaysPrices.map((item, index) => (
                        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-bold">{item.cropName}</p>
                                    <p className="text-sm text-muted-foreground">{item.marketName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                                    <div className={cn(
                                        "flex items-center justify-end gap-1 text-sm",
                                        item.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {item.trendPercentage >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        <span>{Math.abs(item.trendPercentage)}%</span>
                                        <span className="text-muted-foreground text-xs ml-1">{item.unit}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
