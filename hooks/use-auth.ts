import { firebaseService } from '@/services/FirebaseService';
import { AuthState, User, UserSettings } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { createGlobalState } from './use-global-state';

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

// Створюємо глобальний стан
const useGlobalAuthState = createGlobalState(defaultAuthState);

export function useAuth() {
  const [authState, setAuthState] = useGlobalAuthState();

  // Завантажуємо стан тільки один раз при ініціалізації
  useEffect(() => {
    let isMounted = true;
    
    const loadAuthState = async () => {
      try {
        console.log('🔄 Loading auth state...');
        
        // Try to load from AsyncStorage first (for offline support)
        let authData = await AsyncStorage.getItem(AUTH_KEY);
        let settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
        
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

        if (isMounted) {
          setAuthState({
            isAuthenticated: !!user,
            user,
            settings,
          });
        }
      } catch (error) {
        console.error('❌ Error loading auth state:', error);
        if (isMounted) {
          setAuthState(defaultAuthState);
        }
      }
    };

    loadAuthState();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      // Try Firebase authentication first
      let user = await firebaseService.authenticateUser(email, password);
      
      // Fallback to local storage if Firebase fails
      if (!user) {
        const usersData = await AsyncStorage.getItem('@riseup_users');
        const users = usersData ? JSON.parse(usersData) : [];
        user = users.find((u: any) => u.email === email && u.password === password);
      }
      
      if (user) {
        const userWithoutPassword = user;
        
        // Зберігаємо в AsyncStorage
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
        
        // Миттєво оновлюємо глобальний стан
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: userWithoutPassword,
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
  }, [setAuthState]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting registration for:', email);
      
      // Check if user already exists in Firebase
      try {
        const existingUser = await firebaseService.authenticateUser(email, 'dummy');
        if (existingUser) {
          console.log('❌ Registration failed - user exists in Firebase');
          return false;
        }
      } catch (error) {
        // User doesn't exist, continue with registration
      }
      
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

      users.push(newUser);
      await AsyncStorage.setItem('@riseup_users', JSON.stringify(users));

      const userWithoutPassword = newUser;
      
      // Зберігаємо в AsyncStorage
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
      
      // Миттєво оновлюємо глобальний стан
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userWithoutPassword,
      }));
      
      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('❌ Register error:', error);
      return false;
    }
  }, [setAuthState]);

  const logout = useCallback(async () => {
    try {
      console.log('🔄 Logging out...');
      
      await AsyncStorage.removeItem(AUTH_KEY);
      
      // Миттєво оновлюємо глобальний стан
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }, [setAuthState]);

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
      
      // Миттєво оновлюємо глобальний стан
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
  }, [authState.user, setAuthState]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      console.log('🔄 Updating settings:', updates);
      
      const newSettings = { ...authState.settings, ...updates };
      
      // Зберігаємо в storage
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Миттєво оновлюємо глобальний стан
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
  }, [authState.settings, setAuthState]);

  return {
    authState,
    loading: false, // Завжди false, оскільки стан завантажується асинхронно
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
  };
}