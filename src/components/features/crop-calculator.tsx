
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateCropCostsAction } from '@/app/actions';
import type { CalculateCostsState } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { AlertCircle, Calculator, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '../ui/badge';

const initialState: CalculateCostsState = {
    data: null,
    error: null,
    loading: false,
};

function CalculationResult({ data }: { data: CalculateCostsState['data'] }) {
    const { t } = useTranslation();
    if (!data) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold font-headline">Farming Cost Summary</h3>
                <p className="text-muted-foreground">{data.cropName} ({data.area})</p>
            </div>
            
            <div className="space-y-4">
                {data.costBreakdown.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{cost.item}</span>
                        <span className="font-medium">{formatCurrency(cost.amount)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-foreground">Total Cost</span>
                    <span>{formatCurrency(data.totalCost)}</span>
                </div>
            </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expected Yield</span>
                    <span className="font-medium">{data.expectedYield}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Market Price</span>
                    <span className="font-medium">{data.marketPrice}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-foreground">Total Revenue</span>
                    <span className="text-green-600">{formatCurrency(data.totalRevenue)}</span>
                </div>
            </div>

             <div className="border-t pt-4 space-y-2">
                 <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-foreground">Estimated Profit</span>
                    <span className="text-green-600">{formatCurrency(data.estimatedProfit)}</span>
                </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
                <Sparkles className="h-4 w-4 text-green-700" />
                <AlertTitle className="text-green-800 font-semibold">Pro Tip</AlertTitle>
                <AlertDescription className="text-green-700">
                    {data.tip}
                </AlertDescription>
            </Alert>
        </div>
    );
}


export default function CropCalculator() {
    const { t, language } = useTranslation();
    const [state, setState] = useState<CalculateCostsState>(initialState);
    const [userInput, setUserInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ ...initialState, loading: true });
        const result = await calculateCropCostsAction(userInput, language);
        setState({ ...result, loading: false });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Calculator className="text-primary"/> {t('cropCalculator.title', 'Cost Calculator')}
                </CardTitle>
                <CardDescription>
                    {t('cropCalculator.descriptionPage', 'Estimate the cost and potential profit of growing a crop. Provide details like crop type, land size, input costs (seed, fertilizer, labour), and expected market price.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={t('cropCalculator.placeholder', 'e.g., I want to grow tomatoes in 1 acre. Seed cost is ₹1500, fertilizer ₹2000...')}
                        className="min-h-[150px]"
                        required
                    />
                    <Button type="submit" className="w-full" disabled={state.loading}>
                        {state.loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                             <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Calculate
                            </>
                        )}
                    </Button>
                </form>

                <div className="bg-muted/50 rounded-lg p-6">
                    {state.loading && (
                         <div className="space-y-6">
                            <div className="flex justify-center"><Skeleton className="h-6 w-3/4" /></div>
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                            <div className="border-t pt-4">
                                <Skeleton className="h-8 w-1/2 mx-auto" />
                            </div>
                         </div>
                    )}
                    {state.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t('cropDiagnosis.error', 'Error')}</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    {state.data && <CalculationResult data={state.data} />}
                     {!state.loading && !state.error && !state.data && (
                        <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                            <p>Your cost calculation will appear here.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
