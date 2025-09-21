import { translations } from '@/constants/translations';
import { useAuth } from '@/hooks/use-auth';

export function useTranslations() {
  const { authState } = useAuth();
  const language = authState.settings.language;
  
  return translations[language];
}