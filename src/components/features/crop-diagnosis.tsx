
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
import { UploadCloud, X, AlertCircle, Camera, Upload } from 'lucide-react';
import { diagnoseCropAction, type DiagnoseState } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { ChatInterface } from './ask-vyavasay';
import type { ChatMessage } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';

const initialState: DiagnoseState = {
  data: null,
  error: null,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
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
  const { toast } = useToast();
  const [state, formAction] = useActionState(diagnoseCropAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'camera') {
        startCamera();
    } else {
        stopCamera();
    }
  }

  useEffect(() => {
    // Cleanup camera on component unmount
    return () => stopCamera();
  }, []);
  
  const handleTakePicture = () => {
    const video = videoRef.current;
    if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (blob) {
                const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
                setFile(capturedFile);
            }
        }, 'image/jpeg');
        setPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
    }
  };


  const handleRemoveImage = () => {
    setPreview(null);
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const extendedFormAction = (formData: FormData) => {
    if (file) {
      formData.set('photo', file);
    }
    formAction(formData);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 items-start">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('cropDiagnosis.uploadTitle')}</CardTitle>
            <CardDescription>{t('cropDiagnosis.uploadDescription')}</CardDescription>
          </CardHeader>
          <form action={extendedFormAction}>
              <CardContent>
                  <div className="space-y-4">
                      {preview ? (
                          <div className="w-full h-64 border rounded-lg flex items-center justify-center relative">
                              <Image src={preview} alt={t('cropDiagnosis.imagePreviewAlt')} layout="fill" objectFit="contain" className="rounded-md" />
                              <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={handleRemoveImage}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      ) : (
                        <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/> {t('cropDiagnosis.uploadTab', 'Upload File')}</TabsTrigger>
                                <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/> {t('cropDiagnosis.cameraTab', 'Use Camera')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload">
                                <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center relative">
                                    <div className="text-center space-y-2 text-muted-foreground">
                                        <UploadCloud className="mx-auto h-12 w-12" />
                                        <p>{t('cropDiagnosis.uploadArea')}</p>
                                        <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="file:text-primary sr-only" />
                                        <Button type="button" variant="link" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="camera">
                                <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center relative bg-black">
                                    {hasCameraPermission === false && (
                                         <Alert variant="destructive" className="w-5/6">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Camera Access Denied</AlertTitle>
                                            <AlertDescription>Please enable camera permissions in your browser settings.</AlertDescription>
                                        </Alert>
                                    )}
                                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                </div>
                                <Button type="button" onClick={handleTakePicture} disabled={!hasCameraPermission} className="w-full mt-4">
                                    <Camera className="mr-2 h-4 w-4" /> Take Picture
                                </Button>
                            </TabsContent>
                        </Tabs>
                      )}
                     
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
                  <SubmitButton disabled={!file && !preview} />
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

    