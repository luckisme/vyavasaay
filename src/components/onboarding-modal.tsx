
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import { languages, voices } from '@/app/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface OnboardingModalProps {
    isOpen: boolean;
}

export default function OnboardingModal({ isOpen }: OnboardingModalProps) {
    const { setUserProfile } = useUser();
    const { setLanguage, t } = useTranslation();
    const [step, setStep] = useState<'language' | 'details'>('language');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [voice, setVoice] = useState(voices[0]?.value || 'Achernar');

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
        setLanguage(langCode);
        setStep('details');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && location.trim()) {
            setUserProfile({ name, location, language: selectedLanguage, voice });
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                {step === 'language' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Select Your Language</DialogTitle>
                            <DialogDescription>
                                Choose your preferred language to continue.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {languages.map((lang) => (
                                <Button
                                    key={lang.value}
                                    variant="outline"
                                    onClick={() => handleLanguageSelect(lang.value)}
                                >
                                    {lang.label}
                                </Button>
                            ))}
                        </div>
                    </>
                )}
                {step === 'details' && (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{t('onboarding.title', 'Welcome to Vyavasaay')}</DialogTitle>
                            <DialogDescription>
                                {t('onboarding.description', 'Please enter your details to get personalized information.')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    {t('onboarding.name', 'Name')}
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3"
                                    placeholder={t('onboarding.namePlaceholder', 'e.g. Rohan')}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">
                                    {t('onboarding.location', 'Location')}
                                </Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="col-span-3"
                                    placeholder={t('onboarding.locationPlaceholder', 'e.g. Nashik, Maharashtra')}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="voice" className="text-right">
                                    {t('onboarding.voice', 'Voice')}
                                </Label>
                                <Select value={voice} onValueChange={setVoice}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('onboarding.voicePlaceholder', 'Select a voice')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voices.map((v) => (
                                            <SelectItem key={v.value} value={v.value}>
                                                {t(`voices.${v.label.toLowerCase()}`, v.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">{t('onboarding.button', 'Save and Continue')}</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
