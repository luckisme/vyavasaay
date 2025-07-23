
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { summarizeSchemesAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import { languages } from '@/app/page';
import { ChatInterface } from './ask-vyavasay';

type GovtSchemesProps = {
    state: {
        data: GovernmentSchemeOutput | null;
        error: string | null;
        loading: boolean;
    }
}

export default function GovtSchemes({ state }: GovtSchemesProps) {
  const { t } = useTranslation();
  
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t('govtSchemes.resultTitle')}</CardTitle>
                <CardDescription>{t('govtSchemes.resultDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <SchemeResults state={state} />
            </CardContent>
        </Card>
        <div className="md:sticky md:top-24">
            <ChatInterface
                title={t('govtSchemes.chatTitle', 'Chat About Schemes')}
                placeholder={t('govtSchemes.chatPlaceholder', 'Ask about eligibility or how to apply...')}
                initialMessage={t('govtSchemes.chatInitialMessage', 'Ask for more details about the schemes listed or find other schemes.')}
            />
        </div>
    </div>
  );
}

function SchemeResults({ state }: GovtSchemesProps) {
    const { t } = useTranslation();

    if (state.loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                    <p className="text-muted-foreground">{t('govtSchemes.button_pending', 'Finding Schemes...')}</p>
                </div>
                 <div className="space-y-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }
    
    if (state.error) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('cropDiagnosis.error', 'Error')}</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )
    }

    if (!state.data || state.data.relevantSchemes.length === 0) {
        return <p className="text-muted-foreground">{t('govtSchemes.resultPlaceholder', 'No relevant schemes found based on your profile.')}</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {state.data.relevantSchemes.map((scheme, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-semibold text-primary">{scheme.schemeName}</AccordionTrigger>
                    <AccordionContent className="space-y-4 text-muted-foreground">
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.summaryBenefits', 'Summary & Benefits')}</h4>
                            <p className="whitespace-pre-wrap">{scheme.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.eligibility', 'Eligibility')}</h4>
                            <p className="whitespace-pre-wrap">{scheme.eligibility}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.applicationProcess', 'Application Process')}</h4>
                            <p className="whitespace-pre-wrap">{scheme.applicationProcess}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
