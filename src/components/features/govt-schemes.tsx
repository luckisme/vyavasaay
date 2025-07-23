
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Landmark, FileText, Building2, Phone, RefreshCw, ExternalLink, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


const TractorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4H21V6H3V4Z"></path>
        <path d="M3 10H21V12H3V10Z"></path>
        <path d="M8 16H16V18H8V16Z"></path>
        <path d="M12 2V22"></path>
    </svg>
);


type GovtSchemesProps = {
    state: {
        data: GovernmentSchemeOutput | null;
        error: string | null;
        loading: boolean;
    }
}

const getSchemeIcon = (schemeName: string) => {
    const lowerCaseName = schemeName.toLowerCase();
    if (lowerCaseName.includes('credit')) return TractorIcon;
    if (lowerCaseName.includes('bima') || lowerCaseName.includes('insurance')) return FileText;
    if (lowerCaseName.includes('soil')) return Leaf;
    return Landmark;
};


const getBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 hover:bg-green-100/80';
        case 'seasonal':
            return 'bg-orange-100 text-orange-800 hover:bg-orange-100/80';
        case 'free':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    }
}

const QuickLinkCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </CardContent>
    </Card>
);

export default function GovtSchemes({ state }: GovtSchemesProps) {
  const { t } = useTranslation();
  
  const quickLinks = [
    { icon: FileText, title: 'Document Checklist', description: 'Required documents' },
    { icon: Phone, title: 'Helpline Numbers', description: 'Get assistance' },
    { icon: Building2, title: 'Nearest Office', description: 'Find locations' },
    { icon: RefreshCw, title: 'Track Application', description: 'Real-time status' },
  ];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold font-headline">{t('govtSchemes.title', 'Available Schemes')}</h1>
        </div>
        <SchemeResults state={state} />

        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">Quick Links</h2>
            <div className="grid grid-cols-2 gap-4">
                {quickLinks.map(link => <QuickLinkCard key={link.title} {...link} />)}
            </div>
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
                 <div className="space-y-4 pt-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
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
        <div className="space-y-4">
            {state.data.relevantSchemes.map((scheme, index) => {
                const Icon = getSchemeIcon(scheme.schemeName);
                return (
                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className={cn("p-3 rounded-lg h-12 w-12 flex items-center justify-center", getBadgeClass(scheme.status))}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{scheme.schemeName}</h3>
                                        <Badge variant="outline" className={cn("border", getBadgeClass(scheme.status))}>{scheme.status}</Badge>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{scheme.description}</p>
                                    <ul className="text-sm text-muted-foreground list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                        {scheme.keyFeatures.map((feature, i) => <li key={i}>{feature}</li>)}
                                    </ul>
                                    <div className="pt-2">
                                       <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline">
                                                <ExternalLink className="mr-2 h-4 w-4"/>
                                                {scheme.ctaButton}
                                            </Button>
                                       </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
