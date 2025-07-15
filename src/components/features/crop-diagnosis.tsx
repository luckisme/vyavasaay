
'use client';

import React, { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { diagnoseCropAction, type DiagnoseState } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { ChatInterface } from './ask-vyavasay';
import type { ChatMessage } from '@/lib/types';
import { useFormState } from 'react-dom';

const initialState: DiagnoseState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? t('cropDiagnosis.button_pending') : t('cropDiagnosis.button')}
    </Button>
  );
}

const DiagnosisResult = ({ result }: { result: DiagnoseState['data'] }) => {
    const { t } = useTranslation();
    if (!result) return null;

    const { diagnosis } = result;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-primary">{diagnosis.disease}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <Progress value={diagnosis.confidence * 100} className="w-full h-3" />
                    <span className="text-sm font-medium">{Math.round(diagnosis.confidence * 100)}% {t('cropDiagnosis.confidence')}</span>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold">{t('cropDiagnosis.recommendedActions')}</h4>
                <p className="whitespace-pre-wrap">{diagnosis.recommendedActions}</p>
            </div>
        </div>
    );
};


export default function CropDiagnosis() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const [state, formAction] = useFormState(diagnoseCropAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (state.data) {
        setInitialMessages([{
            id: 'diagnosis-result-' + Date.now(),
            role: 'assistant',
            content: <DiagnosisResult result={state.data} />
        }]);
    } else if (state.error) {
        // Optionally handle error display, e.g., in a toast
    }
  }, [state]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 items-start">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('cropDiagnosis.uploadTitle')}</CardTitle>
            <CardDescription>{t('cropDiagnosis.uploadDescription')}</CardDescription>
          </CardHeader>
          <form action={formAction}>
              <CardContent>
                  <div className="space-y-4">
                      <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center relative">
                          {preview ? (
                          <>
                              <Image src={preview} alt={t('cropDiagnosis.imagePreviewAlt')} layout="fill" objectFit="contain" className="rounded-md" />
                              <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={handleRemoveImage}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </>
                          ) : (
                          <div className="text-center space-y-2 text-muted-foreground">
                              <UploadCloud className="mx-auto h-12 w-12" />
                              <p>{t('cropDiagnosis.uploadArea')}</p>
                          </div>
                          )}
                      </div>
                      <Input id="photo" name="photo" type="file" accept="image/*" required onChange={handleFileChange} ref={fileInputRef} className="file:text-primary"/>
                      <input type="hidden" name="location" value={user?.location || ''} />
                      <input type="hidden" name="language" value={language} />
                      {state.error && (
                          <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>{t('cropDiagnosis.error')}</AlertTitle>
                              <AlertDescription>{state.error}</AlertDescription>
                          </Alert>
                      )}
                  </div>
              </CardContent>
              <CardFooter>
                  <SubmitButton />
              </CardFooter>
          </form>
        </Card>
      </div>
      
      <div className="md:sticky md:top-24">
        <ChatInterface
            title={t('cropDiagnosis.resultTitle')}
            placeholder={t('cropDiagnosis.chatPlaceholder')}
            initialMessage={t('cropDiagnosis.chatInitialMessage')}
            initialMessages={initialMessages}
            key={initialMessages[0]?.id} // Re-mounts chat when a new diagnosis is made
        />
      </div>
    </div>
  );
}
