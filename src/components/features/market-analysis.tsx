
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowUp, ArrowDown, BarChart, AlertTriangle, Bell, CheckCircle, Apple, Wheat } from 'lucide-react';
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

const SpicesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
        <path d="M8.5 8.5c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3z"></path>
        <path d="M15.5 15.5c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3z"></path>
    </svg>
);

const VegetablesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2c-2.33 0-4.47.93-6 2.5A6.02 6.02 0 0 0 2.5 10c0 .9.2 1.75.53 2.52C3 12.83 3 13.17 3 13.5v.5c0 2.2 1.8 4 4 4h1c2.2 0 4-1.8 4-4v-3c0-1.1.9-2 2-2h1.5c.83 0 1.5.67 1.5 1.5V13c0 1.1.9 2 2 2h.5c2.2 0 4-1.8 4-4s-1.8-4-4-4h-2c-1.1 0-2-.9-2-2V4.5A2.5 2.5 0 0 0 14 2zM3.12 10.12C4.19 8.2 6.32 7.02 8.5 7.02c1.37 0 2.65.45 3.65 1.22"></path>
        <path d="M18.88 10.12C19.81 8.2 21.68 7.02 23.5 7.02c.28 0 .55.02.82.06"></path>
    </svg>
);


export default function MarketAnalysis({ state }: MarketAnalysisProps) {
    const { t } = useTranslation();
    const { user } = useUser();

    const marketCategories = [
        { name: "Cereals", commodities: 12, status: "Stable", icon: Wheat, statusColor: "bg-green-100 text-green-800" },
        { name: "Vegetables", commodities: 25, status: "Rising", icon: VegetablesIcon, statusColor: "bg-orange-100 text-orange-800" },
        { name: "Fruits", commodities: 18, status: "Seasonal", icon: Apple, statusColor: "bg-blue-100 text-blue-800" },
        { name: "Spices", commodities: 8, status: "Volatile", icon: SpicesIcon, statusColor: "bg-red-100 text-red-800" },
    ];


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

    const { marketAlert, todaysPrices, priceAlerts } = state.data;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('₹', '₹ ');
    };

    const getAlertIcon = (title: string) => {
        if (title.toLowerCase().includes('target')) {
            return { Icon: CheckCircle, color: "border-green-500", iconColor: "text-green-500" };
        }
        if (title.toLowerCase().includes('drop')) {
            return { Icon: AlertTriangle, color: "border-orange-500", iconColor: "text-orange-500" };
        }
        return { Icon: Bell, color: "border-gray-500", iconColor: "text-gray-500" };
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">Market Analysis</h1>
                <p className="text-muted-foreground">Real-time market prices for {user?.location || 'your area'}</p>
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

            {/* Price Alerts */}
            <div className="space-y-4">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Price Alerts
                </h2>
                {priceAlerts.map((alert, index) => {
                    const { Icon, color, iconColor } = getAlertIcon(alert.title);
                    return (
                        <Card key={index} className={cn("border-l-4", color)}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Icon className={cn("h-6 w-6", iconColor)} />
                                <div className="flex-1">
                                    <p className="font-semibold">{alert.title}</p>
                                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Market Categories */}
            <div className="space-y-4">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    Market Categories
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {marketCategories.map((cat, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="p-3 rounded-full bg-muted mb-2">
                                    <cat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-semibold">{cat.name}</p>
                                <p className="text-xs text-muted-foreground">{cat.commodities} commodities</p>
                                <Badge className={cn("mt-2 text-xs", cat.statusColor)}>{cat.status}</Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
