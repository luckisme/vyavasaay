
'use client';

import React, { useState, useEffect } from 'react';
import { getMarketAnalysisAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, BarChart, FileText, Bot, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import type { MarketAnalysisOutput } from '@/ai/flows/get-market-analysis';
import { Badge } from '@/components/ui/badge';
import { languages } from '@/app/page';
import { ChatInterface } from './ask-vyavasay';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
        case 'up':
            return <ArrowUp className="h-4 w-4 text-green-500" />;
        case 'down':
            return <ArrowDown className="h-4 w-4 text-red-500" />;
        case 'stable':
        default:
            return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
};

const CollapsibleOutlook = ({ text, className }: { text: string, className?: string }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const words = text.split(' ');
    const isCollapsible = words.length > 10;
    const preview = isCollapsible ? words.slice(0, 10).join(' ') + '...' : text;

    if (!isCollapsible) {
        return <p className={cn("text-muted-foreground", className)}>{text}</p>
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("space-y-2", className)}>
            <p className="text-muted-foreground">{isOpen ? text : preview}</p>
            <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-sm">
                    {isOpen ? t('marketAnalysis.showLess', 'Show less') : t('marketAnalysis.showMore', 'Show more')}
                    <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
        </Collapsible>
    );
};

type MarketAnalysisProps = {
    state: {
        data: MarketAnalysisOutput | null;
        error: string | null;
        loading: boolean;
    }
}

export default function MarketAnalysis({ state }: MarketAnalysisProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const MainContent = () => {
    if (state.loading) {
        return (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (state.error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('cropDiagnosis.error', 'Error')}</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        );
    }
    
    if (!state.data) {
        return <p className="text-muted-foreground">{t('marketAnalysis.noData', 'No market analysis data available at this time.')}</p>;
    }

    const { marketSummary, detailedAnalysis, recommendations } = state.data;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <FileText className="text-primary"/>
                        {t('marketAnalysis.summaryTitle', 'Market Summary')}
                    </CardTitle>
                    <CardDescription>
                        {t('marketAnalysis.summaryDescription', 'A brief overview of the current agricultural market conditions in your area.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{marketSummary}</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <BarChart className="text-primary"/>
                        {t('marketAnalysis.detailedTitle', 'Crop Market Analysis')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    { isMobile ? (
                        <div className="space-y-4">
                            {detailedAnalysis.map((crop) => (
                                <Card key={crop.cropName} className="bg-muted/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">{crop.cropName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-muted-foreground">{t('marketAnalysis.table.price', 'Price')}</span>
                                            <span className="font-semibold">{crop.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-muted-foreground">{t('marketAnalysis.table.trend', 'Trend')}</span>
                                             <Badge variant="outline" className="flex items-center gap-1 w-24 justify-center">
                                                <TrendIcon trend={crop.trend} />
                                                <span>{t(`marketAnalysis.trends.${crop.trend}`, crop.trend)}</span>
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 pt-2">
                                            <h4 className="font-medium text-muted-foreground">{t('marketAnalysis.table.outlook', 'Outlook')}</h4>
                                            <CollapsibleOutlook text={crop.outlook} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('marketAnalysis.table.crop', 'Crop')}</TableHead>
                                    <TableHead>{t('marketAnalysis.table.price', 'Price')}</TableHead>
                                    <TableHead>{t('marketAnalysis.table.trend', 'Trend')}</TableHead>
                                    <TableHead className="w-[40%]">{t('marketAnalysis.table.outlook', 'Outlook')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detailedAnalysis.map((crop) => (
                                    <TableRow key={crop.cropName}>
                                        <TableCell className="font-medium">{crop.cropName}</TableCell>
                                        <TableCell>{crop.price}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="flex items-center gap-1 w-24 justify-center">
                                                <TrendIcon trend={crop.trend} />
                                                <span>{t(`marketAnalysis.trends.${crop.trend}`, crop.trend)}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <CollapsibleOutlook text={crop.outlook} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="text-primary"/>
                        {t('marketAnalysis.recommendationsTitle', 'AI Recommendations')}
                    </CardTitle>
                    <CardDescription>
                        {t('marketAnalysis.recommendationsDescription', 'Actionable advice based on the current market analysis.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{recommendations}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <MainContent />
        </div>
        <div className="md:sticky md:top-24">
             <ChatInterface
                title={t('marketAnalysis.chatTitle', 'Chat About Markets')}
                placeholder={t('marketAnalysis.chatPlaceholder', 'Ask about prices or trends...')}
                initialMessage={t('marketAnalysis.chatInitialMessage', 'Use this chat to ask for more details on the market analysis.')}
            />
        </div>
    </div>
  )
}
