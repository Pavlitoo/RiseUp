export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface UserSettings {
  musicEnabled: boolean;
  language: 'uk' | 'en';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  settings: UserSettings;
  loading?: boolean;
}