
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { getWeatherAction, type WeatherData } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Thermometer, Wind, Droplets, Sunrise, Sunset } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { ChatInterface } from './ask-vyavasay';

const WeatherCardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-6 w-40" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full md:w-auto">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const WeatherInfo = ({ data }: { data: WeatherData }) => {
    const { t } = useTranslation();

    const weatherDetails = [
        { icon: Thermometer, label: t('weather.feelsLike', 'Feels Like'), value: `${Math.round(data.feelsLike)}°C` },
        { icon: Droplets, label: t('weather.humidity', 'Humidity'), value: `${data.humidity}%` },
        { icon: Wind, label: t('weather.windSpeed', 'Wind Speed'), value: `${data.windSpeed.toFixed(1)} m/s` },
    ];

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">{t('weather.currentTitle', 'Current Weather in {{location}}', { location: data.location })}</CardTitle>
                <CardDescription>{t('weather.lastUpdated', 'Last updated just now.')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <Image src={data.iconUrl} alt={data.description} width={100} height={100} className="bg-blue-100 rounded-full" />
                    <div>
                        <p className="text-6xl font-bold">{Math.round(data.temperature)}°C</p>
                        <p className="text-lg capitalize text-muted-foreground">{data.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {weatherDetails.map(detail => (
                        <div key={detail.label} className="flex items-center gap-2">
                            <detail.icon className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">{detail.label}</p>
                                <p className="font-semibold">{detail.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default function Weather() {
    const { t } = useTranslation();
    const { user } = useUser();
    const [state, setState] = useState<{
        data: WeatherData | null;
        error: string | null;
        loading: boolean;
    }>({ data: null, error: null, loading: true });

    useEffect(() => {
        if (!user?.location) {
            setState({ loading: false, error: "Location not set. Please set your location in your profile.", data: null });
            return;
        }

        const fetchWeather = async () => {
            setState({ loading: true, error: null, data: null });
            const result = await getWeatherAction(user.location);
            if ('error' in result) {
                setState({ loading: false, error: result.error, data: null });
            } else {
                setState({ loading: false, error: null, data: result });
            }
        };

        fetchWeather();
    }, [user?.location]);

    return (
        <div className="grid gap-8 md:grid-cols-2 items-start">
            <div className="space-y-8">
                {state.loading && <WeatherCardSkeleton />}
                {state.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('weather.errorTitle', 'Error Fetching Weather')}</AlertTitle>

                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
                {state.data && <WeatherInfo data={state.data} />}
            </div>
            <div className="md:sticky md:top-24">
                <ChatInterface
                    title={t('weather.chatTitle', 'Ask About Weather')}
                    placeholder={t('weather.chatPlaceholder', 'e.g., Will it rain tomorrow?')}
                    initialMessage={t('weather.chatInitialMessage', 'Ask for a forecast, or any other weather-related questions.')}
                />
            </div>
        </div>
    );
}
