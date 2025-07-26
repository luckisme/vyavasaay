
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm, Controller } from "react-hook-form";
import { useUser, type UserProfile } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import { languages } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Tractor, Camera, RotateCcw } from 'lucide-react';
import type { Feature } from '@/app/page';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfileAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const StatCard = ({ value, label }: { value: string | number; label: string }) => (
    <div className="flex flex-col items-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-white/80">{label}</p>
    </div>
);

type FormValues = Omit<UserProfile, 'profilePicture'> & { profilePicture: FileList | null };


function EditProfileSheet({ isOpen, onOpenChange, user, onProfileUpdate }: { isOpen: boolean; onOpenChange: (open: boolean) => void; user: UserProfile, onProfileUpdate: (data: UserProfile) => void; }) {
    const { t } = useTranslation();
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
      defaultValues: {
        name: user.name,
        location: user.location,
        language: user.language,
        landArea: user.landArea,
        soilType: user.soilType,
        primaryCrops: user.primaryCrops,
      }
    });
    const { toast } = useToast();
  
    const onSubmit = async (data: FormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'profilePicture' && value instanceof FileList && value.length > 0) {
                // handle file upload if necessary
            } else if (value) {
                formData.append(key, String(value));
            }
        });

        const result = await updateUserProfileAction(formData);

        if (result.success) {
            onProfileUpdate({
                ...user,
                ...data,
                // if you had a new picture URL from server, you'd set it here
            });
            toast({ title: t('profile.updateSuccess.title', "Profile Updated"), description: t('profile.updateSuccess.description', "Your information has been saved successfully.") });
            onOpenChange(false);
        } else {
            toast({ variant: "destructive", title: t('profile.updateError.title', "Update Failed"), description: result.error });
        }
    };
  
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('profile.editSheet.title', 'Edit Profile')}</SheetTitle>
            <SheetDescription>
              {t('profile.editSheet.description', 'Make changes to your profile here. Click save when you\'re done.')}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-120px)] pr-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="name">{t('onboarding.name', 'Name')}</Label>
                <Input id="name" {...register("name", { required: t('profile.editSheet.errors.nameRequired', "Name is required") })} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="location">{t('onboarding.location', 'Location')}</Label>
                <Input id="location" {...register("location", { required: t('profile.editSheet.errors.locationRequired', "Location is required") })} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                <Label>{t('header.language', 'Language')}</Label>
                <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('profile.editSheet.selectLanguage', "Select language")} />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="landArea">{t('profile.landArea', 'Land Area (in acres)')}</Label>
                    <Input id="landArea" type="number" step="0.1" {...register("landArea")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="soilType">{t('profile.soilType', 'Soil Type')}</Label>
                    <Input id="soilType" {...register("soilType")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="primaryCrops">{t('profile.primaryCrops', 'Primary Crops (comma-separated)')}</Label>
                    <Input id="primaryCrops" {...register("primaryCrops")} />
                </div>
                <div className="hidden">
                    {/* Keep the button here to connect it to the form but hide it */}
                     <Button type="submit" />
                </div>
            </form>
          </ScrollArea>
           <SheetFooter>
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? t('profile.editSheet.saving', 'Saving...') : t('profile.editSheet.saveButton', 'Save Changes')}
                </Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

export default function Profile({ setActiveFeature }: { setActiveFeature: (feature: Feature) => void; }) {
    const { user, setUserProfile } = useUser();
    const { t } = useTranslation();
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    if (!user) {
        return null;
    }

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newProfile: UserProfile = {
                    ...user,
                    profilePicture: reader.result as string,
                };
                setUserProfile(newProfile);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleResetPicture = () => {
        const newProfile: UserProfile = {
            ...user,
            profilePicture: '/images/image.png',
        };
        setUserProfile(newProfile);
    }

    return (
        <div className="space-y-6">
             <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveFeature('discover')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline">{t('profile.title', 'Profile')}</h1>
                </div>
            </header>

            <div className="relative bg-[#f0eada] rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <Image src={user.profilePicture || "/images/image.png"} data-ai-hint="man in glasses" alt={user.name} width={80} height={80} className="rounded-full border-4 border-white object-cover" />
                         <div className="absolute bottom-0 right-0 flex gap-1">
                             <Button size="icon" className="h-7 w-7 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                <Camera className="h-4 w-4" />
                            </Button>
                            {user.profilePicture !== '/images/image.png' && (
                                <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full" onClick={handleResetPicture}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}
                         </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfilePictureChange} />
                    </div>
                    <div className="flex-grow">
                        <h2 className="text-xl font-bold text-green-800">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{t('profile.role', 'Farmer')} &bull; {user.location}</p>
                        <Badge className="mt-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400/90">{t('profile.membership', 'Premium Member')}</Badge>
                    </div>
                </div>
            </div>

            <Card className="bg-green-600 text-white shadow-lg rounded-xl">
                <CardContent className="p-4 flex justify-around">
                    <StatCard value={15} label={t('profile.stats.queries', 'AI Queries')} />
                    <StatCard value={user.landArea || 0} label={t('profile.stats.acres', 'Acres Tracked')} />
                    <StatCard value={user.primaryCrops?.split(',').length || 0} label={t('profile.stats.crops', 'Crops Grown')} />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Tractor className="h-5 w-5 text-primary" /> {t('profile.farm.title', 'My Farm')}
                    </h2>
                    <Button variant="ghost" onClick={() => setIsEditSheetOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> {t('profile.farm.editButton', 'Edit')}
                    </Button>
                </div>
                <Card className="overflow-hidden">
                    <div className="relative h-40 w-full">
                         <Image src="/images/WhatsApp Image 2025-07-10 at 5.26.22 PM (2).jpeg" alt="Wheat farm" layout="fill" objectFit="cover" data-ai-hint="compost fertilizer" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold text-lg">{user.name}{t('profile.farm.farmNameSuffix', "'s Family Farm")}</h3>
                            <p className="text-white/90 text-sm">{t('profile.farm.est', 'Est. 1985')} &bull; {user.landArea} {t('profile.farm.acres', 'acres')}</p>
                        </div>
                    </div>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('profile.primaryCrops', 'Primary Crops')}</p>
                            <p className="font-semibold">{user.primaryCrops}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">{t('profile.soilType', 'Soil Type')}</p>
                            <p className="font-semibold">{user.soilType}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <EditProfileSheet 
                isOpen={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                user={user}
                onProfileUpdate={handleProfileUpdate}
            />
        </div>
    );
}
