'use client';

import React, { useState, useEffect } from 'react';
import { getMarketAnalysisAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, Loader2, BarChart, FileText, Bot } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import type { MarketAnalysisOutput } from '@/ai/flows/get-market-analysis';
import { Badge } from '@/components/ui/badge';
import { languages } from '@/app/page';

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

export default function MarketAnalysis() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const [state, setState] = useState<{
    data: MarketAnalysisOutput | null;
    error: string | null;
    loading: boolean;
  }>({ data: null, error: null, loading: true });

  useEffect(() => {
    if (!user) {
        setState({ data: null, error: null, loading: false });
        return;
    }

    const fetchAnalysis = async () => {
        setState({ loading: true, error: null, data: null });
        const languageName = languages.find(l => l.value === language)?.label || 'English';
        try {
            const result = await getMarketAnalysisAction(user.location, languageName);
            setState({ loading: false, error: null, data: result });
        } catch (e) {
            const error = e instanceof Error ? e.message : "An unknown error occurred.";
            setState({ loading: false, error, data: null });
        }
    };

    fetchAnalysis();
  }, [user, language]);

  if (state.loading) {
    return (
        <div className="space-y-6">
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
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
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
                {t('marketAnalysis.detailedTitle', 'Detailed Crop Analysis')}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('marketAnalysis.table.crop', 'Crop')}</TableHead>
                        <TableHead>{t('marketAnalysis.table.price', 'Price')}</TableHead>
                        <TableHead>{t('marketAnalysis.table.trend', 'Trend')}</TableHead>
                        <TableHead>{t('marketAnalysis.table.outlook', 'Outlook')}</TableHead>
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
                            <TableCell className="text-muted-foreground">{crop.outlook}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
