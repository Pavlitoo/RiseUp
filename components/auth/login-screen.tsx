import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { validateEmail, validatePassword } from '@/constants/validation';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  
  const { login } = useAuth();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const buttonScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 800 });
  }, [formOpacity]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [
        {
          translateY: (1 - formOpacity.value) * 50,
        },
      ],
    };
  });
  const validateField = (field: string, value: string) => {
    let validation;
    switch (field) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      default:
        return;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.error,
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }
    
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleLogin = async () => {
    // Haptic feedback
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Button animation
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 200 });
    });

    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    const newErrors = {
      email: emailValidation.isValid ? undefined : emailValidation.error,
      password: passwordValidation.isValid ? undefined : passwordValidation.error,
    };
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      Alert.alert('Помилка', 'Будь ласка, виправте помилки у формі');
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(email.trim(), password);
      
      if (success) {
        // Login successful - state will update automatically
        console.log('✅ Login successful');
      } else {
        Alert.alert('Помилка', 'Невірний email або пароль');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Помилка', 'Сталася помилка при вході');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.content}>
        <Animated.Text style={[styles.title, { 
          fontSize: 32, 
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 8,
        }]}>
          🌟 RiseUp
        </Animated.Text>
        <ThemedText style={styles.subtitle}>
          {t.login}
        </ThemedText>

        <Animated.View style={[
          styles.form, 
          { backgroundColor: cardBackground, borderColor },
          animatedFormStyle,
        ]}>
          <InputField
            label={t.email}
            value={email}
            onChangeText={(value) => handleFieldChange('email', value)}
            onBlur={() => handleFieldBlur('email', email)}
            placeholder="example@gmail.com"
            error={errors.email}
            hint="Введіть вашу електронну адресу"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <InputField
            label={t.password}
            value={password}
            onChangeText={(value) => handleFieldChange('password', value)}
            onBlur={() => handleFieldBlur('password', password)}
            placeholder="Введіть пароль"
            error={errors.password}
            hint="Ваш пароль"
            isPassword
            showPasswordToggle
            required
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={1}
          >
            <Animated.View style={[
              styles.button, 
              { backgroundColor: primaryColor },
              animatedButtonStyle,
            ]}>
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                {loading ? '⏳ Завантаження...' : `🚀 ${t.loginButton}`}
              </ThemedText>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitchToRegister} style={styles.switchButton}>
            <ThemedText style={[styles.switchText, { color: primaryColor }]}>
              {t.dontHaveAccount} {t.register}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 40,
    opacity: 0.7,
  },
  form: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
  },
});