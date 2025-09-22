import { AuthState, User, UserSettings } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const AUTH_KEY = '@riseup_auth';
const SETTINGS_KEY = '@riseup_settings';

const defaultSettings: UserSettings = {
  musicEnabled: true,
  language: 'uk',
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    settings: defaultSettings,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [authData, settingsData] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);

      const user = authData ? JSON.parse(authData) : null;
      const settings = settingsData ? JSON.parse(settingsData) : defaultSettings;

      setAuthState({
        isAuthenticated: !!user,
        user,
        settings,
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAuthState = async (user: User | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_KEY);
      }
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!user,
        user,
      }));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const saveSettings = async (settings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setAuthState(prev => ({
        ...prev,
        settings,
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be an actual API request
      const usersData = await AsyncStorage.getItem('@riseup_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        await saveAuthState(userWithoutPassword);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const usersData = await AsyncStorage.getItem('@riseup_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      if (users.find((u: any) => u.email === email)) {
        return false; // User already exists
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('@riseup_users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      await saveAuthState(userWithoutPassword);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    await saveAuthState(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) return false;

    try {
      const updatedUser = { ...authState.user, ...updates };
      
      // Immediately update state for instant UI feedback
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      // Update in users storage
      const usersData = await AsyncStorage.getItem('@riseup_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u: any) => u.id === authState.user!.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await AsyncStorage.setItem('@riseup_users', JSON.stringify(users));
      }

      // Save to auth storage
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      // Revert state on error
      setAuthState(prev => ({
        ...prev,
        user: authState.user,
      }));
      return false;
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...authState.settings, ...updates };
    
    try {
      // Save to storage first
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Then update state - this will trigger re-renders
      setAuthState(prev => ({
        ...prev,
        settings: newSettings,
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  return {
    authState,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
  };
}