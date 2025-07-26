
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Upload, AlertTriangle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { diagnoseCropAction, type DiagnoseState, getCommonCropIssuesAction } from '@/app/actions';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Feature } from '@/app/page';
import type { CommonCropIssuesOutput } from '@/ai/flows/get-common-crop-issues';
import { Skeleton } from '../ui/skeleton';


const initialState: DiagnoseState = {
  data: null,
  error: null,
  loading: false
};

interface RecentDiagnosis {
  imageUrl: string;
  diagnosis: string;
  details: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  date: string;
}

const AphidIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <path d="M16 8.9c-.8.8-1.7 1.1-2.5 1.1-1.5 0-2.5-1.7-2.5-3.2 0-1.2.7-2.3 1.5-3 .9-.8 2-1.3 3.5-1.3 2.5 0 4.5 2.8 4.5 5.5 0 1.2-.3 2.3-.8 3.3" stroke="hsl(120, 70%, 50%)"></path>
        <path d="M13.5 10s-1 .5-2.5-1c-1.5-1.5-1.5-2.5-1.5-2.5" stroke="hsl(120, 70%, 50%)"></path><path d="M11 14.5c0 1-.5 1.5-1.5 1.5-1 0-1.5-.5-1.5-1.5" stroke="hsl(120, 70%, 50%)"></path>
        <path d="M7 16.5c-1 0-1.5-.5-1.5-1.5 0-1 .5-1.5 1.5-1.5" stroke="hsl(120, 70%, 50%)"></path><path d="M4.5 18c-1 0-1.5-.5-1.5-1.5 0-1 .5-1.5 1.5-1.5" stroke="hsl(120, 70%, 50%)"></path>
        <path d="M10.5 20c-1 0-1.5-.5-1.5-1.5s.5-1.5 1.5-1.5" stroke="hsl(120, 70%, 50%)"></path><path d="M14.5 20.5c-1 0-1.5-.5-1.5-1.5s.5-1.5 1.5-1.5" stroke="hsl(120, 70%, 50%)"></path>
        <path d="M12 12c-2 0-4.5 1.5-4.5 4v.5c0 2.5 2 4.5 4.5 4.5h5c2.5 0 4.5-2 4.5-4.5v-1c0-2-1.5-3.5-3.5-3.5-1.5 0-2.5 1-2.5 1" stroke="hsl(120, 70%, 50%)"></path>
    </svg>
);

const FungalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C9.23858 2 7 4.23858 7 7V10H17V7C17 4.23858 14.7614 2 12 2Z" fill="#ff6b6b"/>
        <path d="M6 12H18C19.1046 12 20 12.8954 20 14V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V14C4 12.8954 4.89543 12 6 12Z" fill="#ff6b6b"/>
        <circle cx="9" cy="8" r="1.5" fill="white"/>
        <circle cx="15" cy="8" r="1.5" fill="white"/>
        <path d="M10 19H14V22H10V19Z" fill="#ff6b6b"/>
    </svg>
);

export default function CropDiagnosis({ setActiveFeature }: { setActiveFeature: (feature: Feature) => void; }) {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [state, setState] = useState<DiagnoseState>(initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState<RecentDiagnosis[]>([]);
  const [commonIssues, setCommonIssues] = useState<CommonCropIssuesOutput['issues']>([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);

  useEffect(() => {
    if (user?.location) {
      getCommonCropIssuesAction(user.location, language)
        .then(data => {
            setCommonIssues(data.issues);
        })
        .catch(console.error)
        .finally(() => setIsIssuesLoading(false));
    }
  }, [user, language]);


  useEffect(() => {
    if (state.data) {
        if (preview && state.data.disease) {
            const newDiagnosis: RecentDiagnosis = {
                imageUrl: preview,
                diagnosis: state.data.disease,
                details: state.data.detectionDetails,
                riskLevel: state.data.riskLevel,
                date: "Just now",
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
        await handleDiagnose(resizedFile);
    }
  };

  const startCamera = useCallback(async () => {
    setIsCameraActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
    return () => stopCamera();
  }, [stopCamera]);


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
        stopCamera();
        await handleDiagnose(resizedFile);
    }
  };

  const handleDiagnose = async (fileToDiagnose: File) => {
      if (!fileToDiagnose) {
          toast({ variant: "destructive", title: "No image selected" });
          return;
      }
      setState({ ...initialState, loading: true });
      const formData = new FormData();
      formData.append('photo', fileToDiagnose);
      formData.append('location', user?.location || '');
      formData.append('language', language);

      const result = await diagnoseCropAction(initialState, formData);
      setState(result);
  }

  const RiskBadge = ({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
    const styles = {
      Low: 'text-yellow-600',
      Medium: 'text-orange-600',
      High: 'text-red-600',
    };
    return <span className={cn("font-semibold", styles[level])}>{level} Risk</span>;
  };
  
  if (isCameraActive) {
    return (
        <div className="bg-black fixed inset-0 z-50 flex flex-col items-center justify-center">
             <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10 text-white" onClick={stopCamera}>
                 <ArrowLeft />
             </Button>
            <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
            <div className="absolute bottom-10">
                <Button size="lg" className="rounded-full w-20 h-20 border-4 border-white" onClick={handleTakePicture}>
                    <Camera className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <header className="flex items-center gap-4 mt-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveFeature('discover')}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">{t('cropDiagnosis.title', 'Crop Diagnosis')}</h1>
                <p className="text-muted-foreground">{t('cropDiagnosis.descriptionPage', 'AI-powered crop disease and pest detection')}</p>
            </div>
        </header>

        <Card className="bg-green-600 text-white overflow-hidden shadow-lg">
            <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-3">
                    <h2 className="text-xl font-bold">Quick Diagnosis</h2>
                    <p className="text-sm opacity-90 max-w-[200px]">Upload a photo of your crop for instant analysis</p>
                    <div className="flex gap-2 pt-2">
                        <Button variant="secondary" className="bg-white/30 text-white" onClick={startCamera}>
                            <Camera className="mr-2 h-4 w-4"/>
                            Take Photo
                        </Button>
                         <Button variant="secondary" className="bg-white/30 text-white" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4"/>
                            Upload Image
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        <input id="photo-input" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="sr-only" />

        {state.loading && (
             <div className="text-center p-8 space-y-4">
                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                 <p className="text-muted-foreground">{t('cropDiagnosis.loadingMessage', 'Analyzing your crop... This may take a moment.')}</p>
                 {preview && <Image src={preview} alt="Diagnosing" width={200} height={200} className="rounded-lg mx-auto" />}
             </div>
        )}

        {state.data && (
            <div className="space-y-4">
                 <h2 className="text-xl font-bold">Diagnosis Result</h2>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-4">
                           {preview && <Image src={preview} alt={state.data.disease} width={80} height={80} className="rounded-lg object-cover" />}
                           <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{state.data.disease}</h3>
                                    <RiskBadge level={state.data.riskLevel} />
                                </div>
                                <p className="text-sm text-muted-foreground">{state.data.detectionDetails}</p>
                           </div>
                        </div>
                        <Alert className="bg-green-50 border-green-200 mt-4">
                            <Sparkles className="h-4 w-4 text-green-700" />
                            <AlertTitle className="text-green-800 font-semibold">{t('cropDiagnosis.recommendedActions')}</AlertTitle>
                            <AlertDescription className="text-green-700 whitespace-pre-wrap">
                                {state.data.recommendedActions}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        )}

        {recentDiagnoses.length > 0 && (
          <div className="space-y-4">
              <h2 className="text-xl font-bold">Recent Diagnoses</h2>
              <div className="space-y-3">
                {recentDiagnoses.map((item, index) => (
                    <Card key={index}>
                        <CardContent className="p-3 flex items-center gap-3">
                            <Image src={item.imageUrl} alt={item.diagnosis} width={64} height={64} className="rounded-lg object-cover h-16 w-16" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold">{item.diagnosis}</h3>
                                    <RiskBadge level={item.riskLevel} />
                                </div>
                                <p className="text-sm text-muted-foreground">{item.details}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
              </div>
          </div>
        )}

        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-orange-500 h-5 w-5" />
                Common Issues This Season
            </h2>
            <div className="grid grid-cols-2 gap-4">
                 {isIssuesLoading ? (
                    <>
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </>
                ) : commonIssues.length > 0 ? (
                    commonIssues.map((issue, index) => {
                        const Icon = issue.name.toLowerCase().includes('aphid') ? AphidIcon : FungalIcon;
                        return (
                             <Card key={index} className="text-center flex flex-col items-center p-4">
                                <Icon className="h-10 w-10 mb-2"/>
                                <p className="font-semibold">{issue.name}</p>
                                <p className="text-xs text-muted-foreground">{issue.reason}</p>
                            </Card>
                        )
                    })
                ) : (
                    <p className="text-muted-foreground col-span-2">No common issues found for your location at this time.</p>
                )}
            </div>
        </div>
    </div>
  );
}
