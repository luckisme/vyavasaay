'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { summarizeSchemesAction, type SchemeState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

const initialState: SchemeState = {
  data: null,
  error: null,
};

const exampleFarmerDetails = "I am a small-scale farmer in Maharashtra, India. I primarily grow cotton and soybeans. My main challenges are unpredictable weather patterns, access to modern farming equipment, and getting fair market prices for my produce. I own 5 acres of land.";
const exampleSchemeDatabase = `
- Pradhan Mantri Fasal Bima Yojana (PMFBY): A crop insurance scheme to protect against crop failure due to natural calamities.
- PM-Kisan Samman Nidhi: Provides income support of ₹6,000 per year to all farmer families.
- National Food Security Mission (NFSM): Aims to increase the production of rice, wheat, pulses, and coarse cereals through area expansion and productivity enhancement.
- Rashtriya Krishi Vikas Yojana (RKVY): Allows states to choose their own agriculture and allied sector development activities.
- Soil Health Card Scheme: Provides farmers with soil health cards to help them manage soil nutrients and improve productivity.
`;

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? t('govtSchemes.button_pending') : t('govtSchemes.button')}
    </Button>
  );
}

export default function GovtSchemes() {
  const [state, formAction] = useActionState(summarizeSchemesAction, initialState);
  const { t } = useTranslation();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">{t('govtSchemes.findTitle')}</CardTitle>
            <CardDescription>{t('govtSchemes.findDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmerDetails">{t('govtSchemes.yourDetails')}</Label>
              <Textarea
                id="farmerDetails"
                name="farmerDetails"
                placeholder={t('govtSchemes.detailsPlaceholder')}
                rows={6}
                defaultValue={exampleFarmerDetails}
                required
              />
            </div>
            <input type="hidden" name="schemeDatabase" value={exampleSchemeDatabase} />
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('cropDiagnosis.error')}</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('govtSchemes.resultTitle')}</CardTitle>
          <CardDescription>{t('govtSchemes.resultDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SchemeResults data={state.data} />
        </CardContent>
      </Card>
    </div>
  );
}

function SchemeResults({ data }: { data: SchemeState['data'] }) {
    const { pending } = useFormStatus();
    const { t } = useTranslation();

    if(pending) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        )
    }

    if (!data) {
        return <p className="text-muted-foreground">{t('govtSchemes.resultPlaceholder')}</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {data.relevantSchemes.map((scheme, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-semibold text-primary">{scheme.schemeName}</AccordionTrigger>
                    <AccordionContent className="space-y-4 text-muted-foreground">
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.summaryBenefits')}</h4>
                            <p>{scheme.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.eligibility')}</h4>
                            <p>{scheme.eligibility}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{t('govtSchemes.applicationProcess')}</h4>
                            <p>{scheme.applicationProcess}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
