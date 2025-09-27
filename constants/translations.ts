// Розширені переклади з підтримкою параметрів
export const translations = {
  uk: {
    // Auth
    login: 'Вхід',
    register: 'Реєстрація',
    email: 'Електронна пошта',
    password: 'Пароль',
    confirmPassword: 'Підтвердити пароль',
    name: 'Ім\'я',
    loginButton: 'Увійти',
    registerButton: 'Зареєструватися',
    alreadyHaveAccount: 'Вже маєте акаунт?',
    dontHaveAccount: 'Не маєте акаунту?',
    logout: 'Вийти',
    
    // Profile
    profile: 'Профіль',
    settings: 'Налаштування',
    editProfile: 'Редагувати профіль',
    changeAvatar: 'Змінити аватар',
    music: 'Музика',
    language: 'Мова',
    ukrainian: 'Українська',
    english: 'Англійська',
    save: 'Зберегти',
    cancel: 'Скасувати',
    
    // Habits
    habits: 'Звички',
    progress: 'Прогрес',
    statistics: 'Статистика',
    achievements: 'Досягнення',
    myHabits: 'Мої звички',
    dailyStats: 'Статистика дня',
    viewProgress: 'Переглянути прогрес 📈',
    backToHabits: '← Повернутися до звичок',
    more: 'Більше',
    
    // Common
    loading: 'Завантаження...',
    error: 'Помилка',
    success: 'Успіх',
    confirm: 'Підтвердити',
    delete: 'Видалити',
    edit: 'Редагувати',
    add: 'Додати',
    create: 'Створити',
    update: 'Оновити',
    close: 'Закрити',
    back: 'Назад',
    next: 'Далі',
    finish: 'Завершити',
    
    // Habit related
    createHabit: 'Створити звичку',
    editHabit: 'Редагувати звичку',
    deleteHabit: 'Видалити звичку',
    completeHabit: 'Виконати звичку',
    habitCompleted: 'Звичку виконано',
    habitName: 'Назва звички',
    habitDescription: 'Опис звички',
    frequency: 'Частота',
    daily: 'Щодня',
    weekly: 'Щотижня',
    monthly: 'Щомісяця',
    target: 'Ціль',
    priority: 'Пріоритет',
    low: 'Низький',
    medium: 'Середній',
    high: 'Високий',
    category: 'Категорія',
    
    // Stats
    totalHabits: 'Всього звичок',
    completedToday: 'Виконано сьогодні',
    currentStreak: 'Поточна серія',
    bestStreak: 'Найкраща серія',
    completionRate: 'Відсоток виконання',
    totalDays: 'Всього днів',
    perfectDays: 'Ідеальних днів',
    
    // Messages
    welcomeMessage: 'Ласкаво просимо до RiseUp!',
    noHabitsMessage: 'У вас поки немає звичок. Створіть свою першу звичку!',
    habitCreatedMessage: 'Звичку успішно створено',
    habitUpdatedMessage: 'Звичку оновлено',
    habitDeletedMessage: 'Звичку видалено',
    dataBackedUpMessage: 'Дані збережено',
    dataRestoredMessage: 'Дані відновлено',
    
    // Character
    yourProgress: '📊 Твій прогрес',
    characterDevelopment: 'Дивись, як розвивається твій персонаж!',
    level: 'Рівень',
    health: 'Здоров\'я',
    experience: 'Досвід',
    strong: 'Сильний і енергійний!',
    normal: 'У хорошій формі',
    weak: 'Потребує відпочинку...',
    
    // Stats
    completed: 'Виконано',
    total: 'Всього',
    successRate: 'Успішність',
    experienceGained: 'Досвід',
    streak: 'Серія',
    days: 'днів',
    
    // Tips
    tips: '💡 Поради',
    tip1: '• Виконуй звички щодня, щоб підтримувати здоров\'я персонажа',
    tip2: '• Чим більше звичок виконаєш, тим сильнішим стане персонаж',
    tip3: '• Набирай досвід, щоб підвищити рівень персонажа',
    tip4: '• Не пропускай дні - це впливає на здоров\'я персонажа',
    
    // Errors
    emailRequired: 'Електронна пошта обов\'язкова',
    passwordRequired: 'Пароль обов\'язковий',
    nameRequired: 'Ім\'я обов\'язкове',
    passwordsNotMatch: 'Паролі не співпадають',
    invalidEmail: 'Невірний формат електронної пошти',
    loginFailed: 'Помилка входу. Перевірте дані.',
    registerFailed: 'Помилка реєстрації. Спробуйте ще раз.',
    
    // Validation messages
    fieldRequired: 'Це поле обов\'язкове',
    emailInvalid: 'Невірний формат електронної пошти',
    passwordTooShort: 'Пароль занадто короткий',
    nameInvalid: 'Ім\'я може містити тільки літери',
    
    // Hints
    emailHint: 'Введіть дійсну електронну адресу',
    passwordHint: 'Мінімум 6 символів',
    nameHint: 'Тільки літери та пробіли',
    
    // Shop
    shop: 'Магазин',
    coins: 'Монети',
    buy: 'Купити',
    purchased: 'Куплено',
    notEnoughCoins: 'Недостатньо монет',
    purchaseSuccessful: 'Покупка успішна',
    characterUpgrades: 'Покращення персонажа',
    themes: 'Теми',
    specialEffects: 'Спеціальні ефекти',
  },
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    loginButton: 'Sign In',
    registerButton: 'Sign Up',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: 'Don\'t have an account?',
    logout: 'Logout',
    
    // Profile
    profile: 'Profile',
    settings: 'Settings',
    editProfile: 'Edit Profile',
    changeAvatar: 'Change Avatar',
    music: 'Music',
    language: 'Language',
    ukrainian: 'Ukrainian',
    english: 'English',
    save: 'Save',
    cancel: 'Cancel',
    
    // Habits
    habits: 'Habits',
    progress: 'Progress',
    statistics: 'Statistics',
    achievements: 'Achievements',
    myHabits: 'My Habits',
    dailyStats: 'Daily Stats',
    backToHabits: '← Back to Habits',
    more: 'More',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    
    // Habit related
    createHabit: 'Create Habit',
    editHabit: 'Edit Habit',
    deleteHabit: 'Delete Habit',
    completeHabit: 'Complete Habit',
    habitCompleted: 'Habit Completed',
    habitName: 'Habit Name',
    habitDescription: 'Habit Description',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    target: 'Target',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    category: 'Category',
    
    // Stats
    totalHabits: 'Total Habits',
    completedToday: 'Completed Today',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    completionRate: 'Completion Rate',
    totalDays: 'Total Days',
    perfectDays: 'Perfect Days',
    
    // Messages
    welcomeMessage: 'Welcome to RiseUp!',
    noHabitsMessage: 'You don\'t have any habits yet. Create your first habit!',
    habitCreatedMessage: 'Habit created successfully',
    habitUpdatedMessage: 'Habit updated',
    habitDeletedMessage: 'Habit deleted',
    dataBackedUpMessage: 'Data backed up',
    dataRestoredMessage: 'Data restored',
    
    // Character
    yourProgress: '📊 Your Progress',
    characterDevelopment: 'Watch your character develop!',
    level: 'Level',
    health: 'Health',
    experience: 'Experience',
    strong: 'Strong and energetic!',
    normal: 'In good shape',
    weak: 'Needs rest...',
    
    // Stats
    completed: 'Completed',
    total: 'Total',
    successRate: 'Success',
    experienceGained: 'Experience',
    streak: 'Streak',
    days: 'days',
    
    // Tips
    tips: '💡 Tips',
    tip1: '• Complete habits daily to maintain character health',
    tip2: '• The more habits you complete, the stronger your character becomes',
    tip3: '• Gain experience to level up your character',
    tip4: '• Don\'t skip days - it affects your character\'s health',
    
    // Errors
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    nameRequired: 'Name is required',
    passwordsNotMatch: 'Passwords do not match',
    invalidEmail: 'Invalid email format',
    loginFailed: 'Login failed. Please check your credentials.',
    registerFailed: 'Registration failed. Please try again.',
    
    // Validation messages
    fieldRequired: 'This field is required',
    emailInvalid: 'Invalid email format',
    passwordTooShort: 'Password is too short',
    nameInvalid: 'Name can only contain letters',
    
    // Hints
    emailHint: 'Enter a valid email address',
    passwordHint: 'Minimum 6 characters',
    nameHint: 'Only letters and spaces',
    
    // Shop
    shop: 'Shop',
    coins: 'Coins',
    buy: 'Buy',
    purchased: 'Purchased',
    notEnoughCoins: 'Not enough coins',
    purchaseSuccessful: 'Purchase successful',
    characterUpgrades: 'Character Upgrades',
    themes: 'Themes',
    specialEffects: 'Special Effects',
  },
};

// Функція для отримання перекладу з параметрами
export function getTranslation(
  language: 'uk' | 'en',
  key: string,
  params?: Record<string, string | number>
): string {
  let translation = (translations[language] as Record<string, string>)?.[key] || key;
  
  if (params) {
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
    });
  }
  
  return translation;
}