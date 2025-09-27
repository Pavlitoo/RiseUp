import AsyncStorage from '@react-native-async-storage/async-storage';

interface TranslationCache {
  [key: string]: {
    [language: string]: string;
  };
}

class TranslationService {
  private static instance: TranslationService;
  private cache: TranslationCache = {};
  private readonly CACHE_KEY = '@riseup_translation_cache';

  private constructor() {
    this.loadCache();
  }

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private async loadCache() {
    try {
      const cacheData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheData) {
        this.cache = JSON.parse(cacheData);
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  private async saveCache() {
    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  // Простий переклад на основі словника
  private getSimpleTranslation(text: string, targetLanguage: 'uk' | 'en'): string {
    const translations: { [key: string]: { uk: string; en: string } } = {
      // Звички
      'Пити воду': { uk: 'Пити воду', en: 'Drink water' },
      'Тренування': { uk: 'Тренування', en: 'Exercise' },
      'Медитація': { uk: 'Медитація', en: 'Meditation' },
      'Читання': { uk: 'Читання', en: 'Reading' },
      'Прогулянка': { uk: 'Прогулянка', en: 'Walk' },
      'Рано лягати спати': { uk: 'Рано лягати спати', en: 'Sleep early' },
      'Вивчати мову': { uk: 'Вивчати мову', en: 'Learn language' },
      'Онлайн курс': { uk: 'Онлайн курс', en: 'Online course' },
      'Планувати день': { uk: 'Планувати день', en: 'Plan day' },
      'Прибрати робоче місце': { uk: 'Прибрати робоче місце', en: 'Clean workspace' },
      'Щоденник вдячності': { uk: 'Щоденник вдячності', en: 'Gratitude journal' },
      'Дзвонити родині': { uk: 'Дзвонити родині', en: 'Call family' },
      'Зустрічатися з друзями': { uk: 'Зустрічатися з друзями', en: 'Meet friends' },
      'Малювати': { uk: 'Малювати', en: 'Draw' },
      'Вести щоденник': { uk: 'Вести щоденник', en: 'Write journal' },
      'Відстежувати витрати': { uk: 'Відстежувати витрати', en: 'Track expenses' },
      'Відкладати гроші': { uk: 'Відкладати гроші', en: 'Save money' },

      // Описи звичок
      'Випивати достатньо води щодня': { uk: 'Випивати достатньо води щодня', en: 'Drink enough water daily' },
      'Фізичні вправи для здоров\'я': { uk: 'Фізичні вправи для здоров\'я', en: 'Physical exercises for health' },
      'Практикувати медитацію': { uk: 'Практикувати медитацію', en: 'Practice meditation' },
      'Читати корисну літературу': { uk: 'Читати корисну літературу', en: 'Read useful literature' },
      'Прогулятися на свіжому повітрі': { uk: 'Прогулятися на свіжому повітрі', en: 'Walk in fresh air' },
      'Лягати спати до 23:00': { uk: 'Лягати спати до 23:00', en: 'Go to bed before 11 PM' },
      'Практикувати іноземну мову': { uk: 'Практикувати іноземну мову', en: 'Practice foreign language' },
      'Проходити навчальний курс': { uk: 'Проходити навчальний курс', en: 'Take educational course' },
      'Складати план на день': { uk: 'Складати план на день', en: 'Make daily plan' },
      'Підтримувати порядок на столі': { uk: 'Підтримувати порядок на столі', en: 'Keep desk organized' },
      'Записувати за що вдячний': { uk: 'Записувати за що вдячний', en: 'Write what you\'re grateful for' },
      'Підтримувати зв\'язок з близькими': { uk: 'Підтримувати зв\'язок з близькими', en: 'Stay in touch with loved ones' },
      'Проводити час з друзями': { uk: 'Проводити час з друзями', en: 'Spend time with friends' },
      'Займатися малюванням': { uk: 'Займатися малюванням', en: 'Do drawing' },
      'Записувати думки та ідеї': { uk: 'Записувати думки та ідеї', en: 'Write thoughts and ideas' },
      'Записувати всі витрати': { uk: 'Записувати всі витрати', en: 'Record all expenses' },
      'Відкладати частину доходу': { uk: 'Відкладати частину доходу', en: 'Save part of income' },

      // Категорії
      'Здоров\'я': { uk: 'Здоров\'я', en: 'Health' },
      'Навчання': { uk: 'Навчання', en: 'Learning' },
      'Продуктивність': { uk: 'Продуктивність', en: 'Productivity' },
      'Усвідомленість': { uk: 'Усвідомленість', en: 'Mindfulness' },
      'Соціальне': { uk: 'Соціальне', en: 'Social' },
      'Творчість': { uk: 'Творчість', en: 'Creativity' },
      'Фінанси': { uk: 'Фінанси', en: 'Finance' },
      'Інше': { uk: 'Інше', en: 'Other' },

      // Частота
      'Щодня': { uk: 'Щодня', en: 'Daily' },
      'Щотижня': { uk: 'Щотижня', en: 'Weekly' },
      'Щомісяця': { uk: 'Щомісяця', en: 'Monthly' },

      // Пріоритети
      'Низький': { uk: 'Низький', en: 'Low' },
      'Середній': { uk: 'Середній', en: 'Medium' },
      'Високий': { uk: 'Високий', en: 'High' },
    };

    const translation = translations[text];
    if (translation) {
      return translation[targetLanguage];
    }

    return text; // Повертаємо оригінальний текст, якщо переклад не знайдено
  }

  async translateText(text: string, targetLanguage: 'uk' | 'en'): Promise<string> {
    if (!text || text.trim() === '') return text;

    // Перевіряємо кеш
    if (this.cache[text] && this.cache[text][targetLanguage]) {
      return this.cache[text][targetLanguage];
    }

    // Спробуємо простий переклад
    const simpleTranslation = this.getSimpleTranslation(text, targetLanguage);
    
    // Зберігаємо в кеш
    if (!this.cache[text]) {
      this.cache[text] = {};
    }
    this.cache[text][targetLanguage] = simpleTranslation;
    
    await this.saveCache();
    
    return simpleTranslation;
  }

  async translateHabit(habit: any, targetLanguage: 'uk' | 'en'): Promise<any> {
    const translatedHabit = { ...habit };
    
    if (habit.name) {
      translatedHabit.name = await this.translateText(habit.name, targetLanguage);
    }
    
    if (habit.description) {
      translatedHabit.description = await this.translateText(habit.description, targetLanguage);
    }

    // Перекладаємо категорію
    if (habit.category) {
      const categoryTranslations: { [key: string]: { uk: string; en: string } } = {
        'health': { uk: 'Здоров\'я', en: 'Health' },
        'learning': { uk: 'Навчання', en: 'Learning' },
        'productivity': { uk: 'Продуктивність', en: 'Productivity' },
        'mindfulness': { uk: 'Усвідомленість', en: 'Mindfulness' },
        'social': { uk: 'Соціальне', en: 'Social' },
        'creativity': { uk: 'Творчість', en: 'Creativity' },
        'finance': { uk: 'Фінанси', en: 'Finance' },
        'other': { uk: 'Інше', en: 'Other' },
      };
      
      const categoryTranslation = categoryTranslations[habit.category];
      if (categoryTranslation) {
        translatedHabit.categoryName = categoryTranslation[targetLanguage];
      }
    }

    // Перекладаємо частоту
    if (habit.frequency) {
      const frequencyTranslations: { [key: string]: { uk: string; en: string } } = {
        'daily': { uk: 'Щодня', en: 'Daily' },
        'weekly': { uk: 'Щотижня', en: 'Weekly' },
        'monthly': { uk: 'Щомісяця', en: 'Monthly' },
      };
      
      const frequencyTranslation = frequencyTranslations[habit.frequency];
      if (frequencyTranslation) {
        translatedHabit.frequencyName = frequencyTranslation[targetLanguage];
      }
    }

    // Перекладаємо пріоритет
    if (habit.priority) {
      const priorityTranslations: { [key: string]: { uk: string; en: string } } = {
        'low': { uk: 'Низький', en: 'Low' },
        'medium': { uk: 'Середній', en: 'Medium' },
        'high': { uk: 'Високий', en: 'High' },
      };
      
      const priorityTranslation = priorityTranslations[habit.priority];
      if (priorityTranslation) {
        translatedHabit.priorityName = priorityTranslation[targetLanguage];
      }
    }
    
    return translatedHabit;
  }

  async clearCache(): Promise<void> {
    this.cache = {};
    await AsyncStorage.removeItem(this.CACHE_KEY);
  }
}

export const translationService = TranslationService.getInstance();