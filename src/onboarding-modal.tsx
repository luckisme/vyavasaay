
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import { languages } from '@/app/page';

interface OnboardingModalProps {
    isOpen: boolean;
}

export default function OnboardingModal({ isOpen }: OnboardingModalProps) {
    const { user, setUserProfile } = useUser();
    const { setLanguage, t } = useTranslation();
    const [step, setStep] = useState<'language' | 'details'>('language');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
        setLanguage(langCode);
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && location.trim()) {
            await setUserProfile({ name, location, language: selectedLanguage });
        }
    };

    // Don't render if the modal shouldn't be open or if user data is somehow missing.
    if (!isOpen || !user) return null;

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
