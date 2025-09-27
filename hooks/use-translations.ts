import { translations } from '@/constants/translations';
import { useAuth } from '@/hooks/use-auth';
import { useCallback, useMemo } from 'react';
import { createGlobalState } from './use-global-state';

// Глобальний стан для мови
const useGlobalLanguageState = createGlobalState<'uk' | 'en'>('uk');

// Функція для автоматичного визначення мови
const getDeviceLanguage = (): 'uk' | 'en' => {
  return 'uk'; // За замовчуванням українська
};

// Кеш для перекладів
const translationCache = new Map<string, any>();

export function useTranslations() {
  const { authState } = useAuth();
  const [globalLanguage] = useGlobalLanguageState();
  const currentLanguage = authState.settings.language || globalLanguage || getDeviceLanguage();
  
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

// Hook для примусового оновлення компонентів при зміні мови
export function useLanguageKey() {
  const { authState } = useAuth();
  const [globalLanguage] = useGlobalLanguageState();
  return `${authState.settings.language || globalLanguage}-${Date.now()}`;
}

// Hook для отримання поточної мови
export function useCurrentLanguage() {
  const { authState } = useAuth();
  const [globalLanguage] = useGlobalLanguageState();
  return authState.settings.language || globalLanguage || getDeviceLanguage();
}

// Hook для зміни мови
export function useLanguageChanger() {
  const { updateSettings } = useAuth();
  const [, setGlobalLanguage] = useGlobalLanguageState();
  
  const changeLanguage = useCallback(async (language: 'uk' | 'en') => {
    // Очищуємо кеш при зміні мови
    translationCache.clear();
    
    // Оновлюємо глобальний стан мови
    setGlobalLanguage(language);
    
    // Оновлюємо налаштування користувача
    await updateSettings({ language });
  }, [updateSettings, setGlobalLanguage]);
  
  return changeLanguage;
}