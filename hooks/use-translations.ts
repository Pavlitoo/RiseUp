import { translations } from '@/constants/translations';
import { useAuth } from '@/hooks/use-auth';
import * as Localization from 'expo-localization';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Функція для автоматичного визначення мови
const getDeviceLanguage = (): 'uk' | 'en' => {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';
  if (deviceLocale.startsWith('uk') || deviceLocale.startsWith('ru')) {
    return 'uk';
  }
  return 'en';
};

// Кеш для перекладів
const translationCache = new Map<string, any>();
export function useTranslations() {
  const { authState } = useAuth();
  const currentLanguage = authState.settings.language || getDeviceLanguage();
  
  // Мемоізуємо переклади для кращої продуктивності
  const currentTranslations = useMemo(() => {
    const cacheKey = currentLanguage;
    
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
    
    const translationData = translations[currentLanguage] || translations['uk'];
    translationCache.set(cacheKey, translationData);
    
    return translationData;
  }, [currentLanguage]);
  
  return currentTranslations;
}

// Функція для отримання перекладу з ключем
export function useTranslation() {
  const translations = useTranslations();
  
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let translation = translations[key] || key;
    
    // Підтримка параметрів у перекладах
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    
    return translation;
  }, [translations]);
  
  return t;
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

// Hook для отримання поточної мови
export function useCurrentLanguage() {
  const { authState } = useAuth();
  return authState.settings.language || getDeviceLanguage();
}

// Hook для зміни мови
export function useLanguageChanger() {
  const { updateSettings } = useAuth();
  
  const changeLanguage = useCallback(async (language: 'uk' | 'en') => {
    // Очищуємо кеш при зміні мови
    translationCache.clear();
    
    await updateSettings({ language });
  }, [updateSettings]);
  
  return changeLanguage;
}