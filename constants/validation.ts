export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 50,
    requireUppercase: false, // Можна змінити на true для більшої безпеки
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Zа-яА-ЯіІїЇєЄ\s]+$/,
  },
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Електронна пошта обов\'язкова' };
  }
  
  if (email.length < ValidationRules.email.minLength) {
    return { isValid: false, error: 'Електронна пошта занадто коротка' };
  }
  
  if (!ValidationRules.email.pattern.test(email)) {
    return { isValid: false, error: 'Невірний формат електронної пошти (приклад: user@example.com)' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Пароль обов\'язковий' };
  }
  
  if (password.length < ValidationRules.password.minLength) {
    return { isValid: false, error: `Пароль повинен містити мінімум ${ValidationRules.password.minLength} символів` };
  }
  
  if (password.length > ValidationRules.password.maxLength) {
    return { isValid: false, error: `Пароль не повинен перевищувати ${ValidationRules.password.maxLength} символів` };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Ім\'я обов\'язкове' };
  }
  
  if (name.trim().length < ValidationRules.name.minLength) {
    return { isValid: false, error: `Ім\'я повинно містити мінімум ${ValidationRules.name.minLength} символи` };
  }
  
  if (name.trim().length > ValidationRules.name.maxLength) {
    return { isValid: false, error: `Ім\'я не повинно перевищувати ${ValidationRules.name.maxLength} символів` };
  }
  
  if (!ValidationRules.name.pattern.test(name.trim())) {
    return { isValid: false, error: 'Ім\'я може містити тільки літери та пробіли' };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Паролі не співпадають' };
  }
  
  return { isValid: true };
};