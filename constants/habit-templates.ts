import { HabitTemplate } from '@/types/custom-habit';

export const habitCategories = [
  { id: 'health', name: 'Здоров\'я', icon: '💪', color: '#10b981' },
  { id: 'learning', name: 'Навчання', icon: '📚', color: '#3b82f6' },
  { id: 'productivity', name: 'Продуктивність', icon: '⚡', color: '#f59e0b' },
  { id: 'mindfulness', name: 'Усвідомленість', icon: '🧘', color: '#8b5cf6' },
  { id: 'social', name: 'Соціальне', icon: '👥', color: '#ef4444' },
  { id: 'creativity', name: 'Творчість', icon: '🎨', color: '#ec4899' },
  { id: 'finance', name: 'Фінанси', icon: '💰', color: '#059669' },
  { id: 'other', name: 'Інше', icon: '📝', color: '#6b7280' },
];

export const habitTemplates: HabitTemplate[] = [
  // Health
  {
    id: 'drink_water',
    name: 'Пити воду',
    description: 'Випивати достатньо води щодня',
    icon: '💧',
    color: '#3b82f6',
    category: 'health',
    suggestedFrequency: 'daily',
    suggestedTarget: 8,
  },
  {
    id: 'exercise',
    name: 'Тренування',
    description: 'Фізичні вправи для здоров\'я',
    icon: '🏃',
    color: '#10b981',
    category: 'health',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'walk',
    name: 'Прогулянка',
    description: 'Прогулятися на свіжому повітрі',
    icon: '🚶',
    color: '#059669',
    category: 'health',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'sleep_early',
    name: 'Рано лягати спати',
    description: 'Лягати спати до 23:00',
    icon: '😴',
    color: '#8b5cf6',
    category: 'health',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  
  // Learning
  {
    id: 'read_book',
    name: 'Читати книгу',
    description: 'Читати корисну літературу',
    icon: '📖',
    color: '#f59e0b',
    category: 'learning',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'learn_language',
    name: 'Вивчати мову',
    description: 'Практикувати іноземну мову',
    icon: '🗣️',
    color: '#3b82f6',
    category: 'learning',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'online_course',
    name: 'Онлайн курс',
    description: 'Проходити навчальний курс',
    icon: '💻',
    color: '#6366f1',
    category: 'learning',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  
  // Productivity
  {
    id: 'plan_day',
    name: 'Планувати день',
    description: 'Складати план на день',
    icon: '📅',
    color: '#f59e0b',
    category: 'productivity',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'clean_workspace',
    name: 'Прибрати робоче місце',
    description: 'Підтримувати порядок на столі',
    icon: '🧹',
    color: '#10b981',
    category: 'productivity',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  
  // Mindfulness
  {
    id: 'meditate',
    name: 'Медитувати',
    description: 'Практикувати медитацію',
    icon: '🧘',
    color: '#8b5cf6',
    category: 'mindfulness',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'gratitude',
    name: 'Щоденник вдячності',
    description: 'Записувати за що вдячний',
    icon: '🙏',
    color: '#ec4899',
    category: 'mindfulness',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  
  // Social
  {
    id: 'call_family',
    name: 'Дзвонити родині',
    description: 'Підтримувати зв\'язок з близькими',
    icon: '📞',
    color: '#ef4444',
    category: 'social',
    suggestedFrequency: 'weekly',
    suggestedTarget: 2,
  },
  {
    id: 'meet_friends',
    name: 'Зустрічатися з друзями',
    description: 'Проводити час з друзями',
    icon: '👫',
    color: '#f59e0b',
    category: 'social',
    suggestedFrequency: 'weekly',
    suggestedTarget: 1,
  },
  
  // Creativity
  {
    id: 'draw',
    name: 'Малювати',
    description: 'Займатися малюванням',
    icon: '🎨',
    color: '#ec4899',
    category: 'creativity',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'write_journal',
    name: 'Вести щоденник',
    description: 'Записувати думки та ідеї',
    icon: '✍️',
    color: '#6366f1',
    category: 'creativity',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  
  // Finance
  {
    id: 'track_expenses',
    name: 'Відстежувати витрати',
    description: 'Записувати всі витрати',
    icon: '💰',
    color: '#059669',
    category: 'finance',
    suggestedFrequency: 'daily',
    suggestedTarget: 1,
  },
  {
    id: 'save_money',
    name: 'Відкладати гроші',
    description: 'Відкладати частину доходу',
    icon: '🏦',
    color: '#10b981',
    category: 'finance',
    suggestedFrequency: 'weekly',
    suggestedTarget: 1,
  },
];

export const habitIcons = [
  '💧', '🏃', '🚶', '😴', '📖', '🗣️', '💻', '📅', '🧹', '🧘',
  '🙏', '📞', '👫', '🎨', '✍️', '💰', '🏦', '🍎', '🥗', '🏋️',
  '🚴', '🏊', '⚽', '🎵', '🎸', '📺', '🎮', '🍳', '🧼', '🌱',
  '📱', '💡', '🔬', '🎯', '⭐', '🔥', '💎', '🌟', '✨', '🎪',
  '🎭', '🎬', '📷', '🎤', '🎧', '📚', '📝', '📊', '📈', '📉',
];

export const habitColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e',
  '#64748b', '#6b7280', '#374151', '#1f2937',
];