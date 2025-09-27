import { firebaseService } from '@/services/FirebaseService';
import { AuthState, User, UserSettings } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTH_KEY = '@riseup_auth';
const SETTINGS_KEY = '@riseup_settings';

const defaultSettings: UserSettings = {
  musicEnabled: true,
  language: 'uk',
};

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  settings: defaultSettings,
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ ...defaultAuthState, loading: true });
  const isInitialized = useRef(false);
  const loadingPromise = useRef<Promise<void> | null>(null);

  // Завантажуємо стан тільки один раз при ініціалізації
  useEffect(() => {
    if (isInitialized.current || loadingPromise.current) return;
    
    isInitialized.current = true;
    
    const loadAuthState = async () => {
      try {
        console.log('🔄 Loading auth state...');
        
        // Try to load from AsyncStorage first (for offline support)
        const [authData, settingsData] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(SETTINGS_KEY)
        ]);
        
        let user = authData ? JSON.parse(authData) : null;
        let settings = settingsData ? JSON.parse(settingsData) : defaultSettings;
        
        // If user exists, try to sync with Firebase
        if (user) {
          try {
            const firebaseUser = await firebaseService.getUser(user.id);
            if (firebaseUser) {
              user = firebaseUser;
              await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
            }
          } catch (error) {
            console.log('Firebase sync failed, using offline data:', error);
          }
        }

        console.log('✅ Loaded user:', user);
        console.log('✅ Loaded settings:', settings);

        setAuthState({
          isAuthenticated: !!user,
          user,
          settings,
          loading: false,
        });
      } catch (error) {
        console.error('❌ Error loading auth state:', error);
        setAuthState({
          ...defaultAuthState,
          loading: false,
        });
      }
    };

    loadingPromise.current = loadAuthState();
    loadingPromise.current.finally(() => {
      loadingPromise.current = null;
    });
  }, []); // Порожній масив залежностей - ефект виконується тільки один раз

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      // Try Firebase authentication first
      let user = await firebaseService.authenticateUser(email, password);
      
      // Fallback to local storage if Firebase fails
      if (!user) {
        console.log('🔄 Trying local authentication...');
        const usersData = await AsyncStorage.getItem('@riseup_users');
        const users = usersData ? JSON.parse(usersData) : [];
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        if (foundUser) {
          // Видаляємо пароль з відповіді
          const { password: _, ...userWithoutPassword } = foundUser;
          user = userWithoutPassword;
        }
      }
      
      if (user) {
        // Зберігаємо в AsyncStorage
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        // Оновлюємо стан
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: user,
        }));
        
        console.log('✅ Login successful');
        return true;
      }
      
      console.log('❌ Login failed - invalid credentials');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting registration for:', email);
      
      // Check local storage as fallback
      const usersData = await AsyncStorage.getItem('@riseup_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      if (users.find((u: any) => u.email === email)) {
        console.log('❌ Registration failed - user exists');
        return false;
      }

      // Create user in Firebase
      const userId = await firebaseService.createUser({
        email,
        password,
        name,
      });
      
      const newUser = {
        id: userId,
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      // Додаємо користувача з паролем для локального зберігання
      users.push({ ...newUser, password });
      await AsyncStorage.setItem('@riseup_users', JSON.stringify(users));

      // Зберігаємо в AsyncStorage
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      
      // Оновлюємо стан
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: newUser,
      }));
      
      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('❌ Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🔄 Logging out...');
      
      await AsyncStorage.removeItem(AUTH_KEY);
      
      // Оновлюємо стан
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) return false;

    try {
      console.log('🔄 Updating profile:', updates);
      
      const updatedUser = { ...authState.user, ...updates };
      
      // Update in Firebase
      try {
        await firebaseService.updateUser(authState.user.id, updates);
      } catch (error) {
        console.log('Firebase update failed, updating locally:', error);
      }
      
      // Оновлюємо в users storage
      const usersData = await AsyncStorage.getItem('@riseup_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u: any) => u.id === authState.user!.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await AsyncStorage.setItem('@riseup_users', JSON.stringify(users));
      }

      // Зберігаємо в auth storage
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      
      // Оновлюємо стан
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      console.log('✅ Profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return false;
    }
  }, [authState.user]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      console.log('🔄 Updating settings:', updates);
      
      const newSettings = { ...authState.settings, ...updates };
      
      // Зберігаємо в storage
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Оновлюємо стан
      setAuthState(prev => ({
        ...prev,
        settings: newSettings,
      }));
      
      console.log('✅ Settings updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return false;
    }
  }, [authState.settings]);

  return {
    authState,
    loading: authState.loading || false,
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
  };
}