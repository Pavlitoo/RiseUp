import { translations } from '@/constants/translations';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export function useTranslations() {
  const { authState } = useAuth();
  const [currentTranslations, setCurrentTranslations] = useState(
    translations[authState.settings.language]
  );
  
  // Update translations immediately when language changes
  useEffect(() => {
    setCurrentTranslations(translations[authState.settings.language]);
  }, [authState.settings.language]);
  
  // Return stable reference to translations
  return currentTranslations;
}

// Hook to force component re-render when language changes
export function useLanguageKey() {
  const { authState } = useAuth();
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [authState.settings.language]);
  
  return key;
}