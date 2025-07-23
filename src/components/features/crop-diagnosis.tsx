
'use client';

import React, { useState, useRef, useEffect, useActionState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, X, AlertCircle, Camera, ArrowLeft, Loader2, Sparkles, Bug, Wind, Sun } from 'lucide-react';
import { diagnoseCropAction, type DiagnoseState } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { ChatInterface } from './ask-vyavasay';
import type { ChatMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const initialState: DiagnoseState = {
  data: null,
  error: null,
};

interface RecentDiagnosis {
  imageUrl: string;
  diagnosis: string;
  date: string;
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('cropDiagnosis.button_pending', 'Diagnosing...')}
          </>
      ) : (
        <>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('cropDiagnosis.button', 'Diagnose Crop')}
        </>
      )}
    </Button>
  );
}

const DiagnosisResult = ({ result }: { result: DiagnoseState['data'] }) => {
    const { t } = useTranslation();
    if (!result) return null;

    const { diagnosis } = result;
    const confidencePercent = Math.round(diagnosis.confidence * 100);
    
    let riskLevel = t('cropDiagnosis.risk.low', 'Low Risk');
    let riskColor = 'text-yellow-600';
    if (confidencePercent > 75) {
        riskLevel = t('cropDiagnosis.risk.high', 'High Risk');
        riskColor = 'text-red-600';
    } else if (confidencePercent > 50) {
        riskLevel = t('cropDiagnosis.risk.medium', 'Medium Risk');
        riskColor = 'text-orange-600';
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>{t('cropDiagnosis.resultTitle', 'Diagnosis Result')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-primary">{diagnosis.disease}</h3>
                    <span className={cn("font-bold", riskColor)}>{riskLevel}</span>
                </div>
                
                <div>
                    <div className="flex items-center gap-2 mt-1">
                        <Progress value={confidencePercent} className="w-full h-2" />
                        <span className="text-sm font-medium">{confidencePercent}% {t('cropDiagnosis.confidence')}</span>
                    </div>
                </div>
                
                <Alert className="bg-green-50 border-green-200 mt-4">
                    <Sparkles className="h-4 w-4 text-green-700" />
                    <AlertTitle className="text-green-800 font-semibold">{t('cropDiagnosis.recommendedActions')}</AlertTitle>
                    <AlertDescription className="text-green-700 whitespace-pre-wrap">
                        {diagnosis.recommendedActions}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
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
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showResultChat, setShowResultChat] = useState(false);
  const [recentDiagnoses, setRecentDiagnoses] = useState<RecentDiagnosis[]>([]);

  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.data) {
        setShowResultChat(true);
        if (preview && state.data.diagnosis.disease) {
            const newDiagnosis: RecentDiagnosis = {
                imageUrl: preview,
                diagnosis: state.data.diagnosis.disease,
                date: new Date().toLocaleDateString(),
            };
            setRecentDiagnoses(prev => [newDiagnosis, ...prev].slice(0, 3));
        }
    } else if (state.error) {
        toast({
          variant: 'destructive',
          title: t('cropDiagnosis.error', 'Error'),
          description: state.error,
        });
    }
  }, [state, t, toast, preview]);

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) return;
            const img = document.createElement('img');
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    }
                }, 'image/jpeg', 0.8);
            };
        };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        const resizedFile = await resizeImage(selectedFile);
        setFile(resizedFile);
        setPreview(URL.createObjectURL(resizedFile));
        setShowResultChat(false);
        setActiveTab('preview');
    }
  };

   const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
        setIsCameraActive(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraActive(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    }
  }, [toast]);
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'camera' && !isCameraActive) {
      startCamera();
    } else if (activeTab !== 'camera' && isCameraActive) {
      stopCamera();
    }
  }, [activeTab, isCameraActive, startCamera, stopCamera]);
  
  // Cleanup camera on component unmount
  useEffect(() => stopCamera, [stopCamera]);

  const handleTakePicture = async () => {
    const video = videoRef.current;
    if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        
        const blob = await (await fetch(dataUrl)).blob();
        const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const resizedFile = await resizeImage(capturedFile);
        setFile(resizedFile);
        setShowResultChat(false);
        stopCamera();
        setActiveTab('preview');
    }
  };


  const handleRemoveImage = () => {
    setPreview(null);
    setFile(null);
    setShowResultChat(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setActiveTab('upload');
  }

  const extendedFormAction = (formData: FormData) => {
    if (!file) {
        toast({
            variant: "destructive",
            title: "No image selected",
            description: "Please upload or capture an image first.",
        });
        return;
    }
    formData.set('photo', file);
    formAction(formData);
  }

  const getInitialChatMessages = (): ChatMessage[] => {
    if (state.data) {
      return [{
        id: 'diagnosis-result-' + Date.now(),
        role: 'assistant',
        content: t('cropDiagnosis.chatInitialMessage', 'This is the diagnosis based on the image provided. Ask me any follow up questions you might have.'),
      }];
    }
    return [];
  };

  const commonIssues = [
    {
      name: 'Powdery Mildew',
      description: 'A fungal disease that appears as white powdery spots on leaves and stems.',
      icon: Wind
    },
    {
      name: 'Aphids',
      description: 'Small sap-sucking insects that can cause leaf curling and transmit viruses.',
      icon: Bug
    },
    {
      name: 'Late Blight',
      description: 'A serious fungal disease affecting tomatoes and potatoes, thriving in cool, moist conditions.',
      icon: Sun
    }
  ];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold font-headline">{t('cropDiagnosis.title', 'Crop Diagnosis')}</h1>
            <p className="text-muted-foreground">{t('cropDiagnosis.descriptionPage', 'AI-powered crop disease and pest detection')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('cropDiagnosis.uploadTitle', 'Diagnose Your Crop')}</CardTitle>
            <CardDescription>{t('cropDiagnosis.uploadDescription', 'Upload a file or use your camera to get an AI-powered diagnosis.')}</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'camera')} className="w-full">
                <TabsList className={cn("grid w-full grid-cols-2", (preview || pending) && "hidden")}>
                    <TabsTrigger value="upload">{t('cropDiagnosis.uploadTab', 'Upload File')}</TabsTrigger>
                    <TabsTrigger value="camera">{t('cropDiagnosis.cameraTab', 'Use Camera')}</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                  <div 
                    className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">{t('cropDiagnosis.uploadArea', 'Drag & drop file or click to upload')}</p>
                  </div>
                </TabsContent>
                <TabsContent value="camera" className="mt-4">
                  <div className="w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center relative bg-black">
                      {hasCameraPermission === false ? (
                            <Alert variant="destructive" className="w-5/6">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Camera Access Denied</AlertTitle>
                              <AlertDescription>Please enable camera permissions in your browser settings.</AlertDescription>
                          </Alert>
                      ) : (
                        <>
                          <video ref={videoRef} className={cn("w-full h-full object-cover", {"hidden": !isCameraActive})} autoPlay playsInline muted />
                          {!isCameraActive && hasCameraPermission && <Loader2 className="h-8 w-8 animate-spin text-white"/>}
                        </>
                      )}
                  </div>
                  <Button type="button" onClick={handleTakePicture} disabled={!hasCameraPermission || !isCameraActive} className="w-full mt-4">
                      <Camera className="mr-2 h-4 w-4" /> {t('cropDiagnosis.takePictureButton', 'Take Picture')}
                  </Button>
                </TabsContent>
              </Tabs>

              <form action={extendedFormAction}>
                  <input id="photo-input" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="sr-only" />
                  <input type="hidden" name="location" value={user?.location || ''} />
                  <input type="hidden" name="language" value={language} />

                  {pending && (
                      <div className="text-center p-8 space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-muted-foreground">{t('cropDiagnosis.loadingMessage', 'Analyzing your crop... This may take a moment.')}</p>
                          <Skeleton className="h-64 w-full" />
                      </div>
                  )}

                  {!pending && preview && (
                    <div className="mt-4">
                      <div className="w-full h-64 border rounded-lg flex items-center justify-center relative">
                          <Image src={preview} alt={t('cropDiagnosis.imagePreviewAlt', 'Image Preview')} layout="fill" objectFit="contain" className="rounded-md" />
                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={handleRemoveImage}>
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                      <SubmitButton disabled={pending} />
                    </div>
                  )}
              </form>
          </CardContent>
        </Card>

        {!pending && state.data && (
            <DiagnosisResult result={state.data} />
        )}
      
        {!pending && showResultChat && (
          <div className="mt-6">
            <ChatInterface
                title={t('cropDiagnosis.chatTitle', 'Discuss with AI Assistant')}
                placeholder={t('cropDiagnosis.chatPlaceholder')}
                initialMessage={t('cropDiagnosis.chatInitialMessage')}
                initialMessages={getInitialChatMessages()}
                key={state.data?.diagnosis.disease} 
            />
          </div>
        )}

        {/* Recent Diagnoses Section */}
        {recentDiagnoses.length > 0 && (
          <div className="space-y-4">
              <h2 className="text-xl font-bold font-headline">Recent Diagnoses</h2>
              <Carousel
                  opts={{
                      align: "start",
                  }}
                  className="w-full"
              >
                  <CarouselContent>
                      {recentDiagnoses.map((item, index) => (
                          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                              <div className="p-1">
                                  <Card>
                                      <CardContent className="flex flex-col items-center justify-center p-0">
                                        <div className="w-full h-32 relative">
                                          <Image src={item.imageUrl} alt={item.diagnosis} layout="fill" objectFit="cover" className="rounded-t-lg" />
                                        </div>
                                        <div className="p-4 w-full">
                                          <h3 className="font-semibold">{item.diagnosis}</h3>
                                          <p className="text-sm text-muted-foreground">{item.date}</p>
                                        </div>
                                      </CardContent>
                                  </Card>
                              </div>
                          </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
              </Carousel>
          </div>
        )}

        {/* Common Issues Section */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline">Common Issues this Season</h2>
            <Card>
                <CardContent className="p-4 space-y-4">
                    {commonIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="bg-muted p-2 rounded-full">
                                <issue.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{issue.name}</h3>
                                <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

