
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { suggestCropsAction } from '@/app/actions';
import type { SuggestCropsState } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { AlertCircle, Lightbulb, Loader2, Sprout, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';

const initialState: SuggestCropsState = {
    data: null,
    error: null,
    loading: false,
};

function SuggestionResult({ data }: { data: SuggestCropsState['data'] }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold font-headline">Crop Suggestions</h3>
            </div>
            
            <div className="space-y-4">
                {data.suggestions.map((crop, index) => (
                    <Card key={index} className="bg-background/50">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-lg flex items-center gap-2"><Sprout className="text-primary h-5 w-5"/> {crop.cropName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-muted-foreground pl-1">{crop.reasoning}</p>
                            <Badge variant="secondary" className="font-semibold text-green-700">
                                Profit: {crop.estimatedProfit}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
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

export default function CropSelector() {
    const { t, language } = useTranslation();
    const [state, setState] = useState<SuggestCropsState>(initialState);
    const [userInput, setUserInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ ...initialState, loading: true });
        const result = await suggestCropsAction(userInput, language);
        setState({ ...result, loading: false });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Lightbulb className="text-primary"/> Crop Selector
                </CardTitle>
                <CardDescription>
                    Get suggestions for the best crops to grow. Provide details like land size, location, soil, and season.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., I have 2 acres of black soil land in Maharashtra. It's monsoon season with decent water availability."
                        className="min-h-[150px]"
                        required
                    />
                    <Button type="submit" className="w-full" disabled={state.loading}>
                        {state.loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suggesting...
                            </>
                        ) : (
                             <>
                                <Sprout className="mr-2 h-4 w-4" />
                                Suggest Crops
                            </>
                        )}
                    </Button>
                </form>

                <div className="bg-muted/50 rounded-lg p-6 min-h-[250px] flex flex-col justify-center">
                    {state.loading && (
                         <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-full" />
                         </div>
                    )}
                    {state.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t('cropDiagnosis.error', 'Error')}</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    {state.data && <SuggestionResult data={state.data} />}
                     {!state.loading && !state.error && !state.data && (
                        <div className="text-center text-muted-foreground">
                            <p>Your crop suggestions will appear here.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
