import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { validateEmail, validatePassword } from '@/constants/validation';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
    const success = await login(email.trim(), password);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', t.loginFailed);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🌟 RiseUp
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t.login}
        </ThemedText>

        <ThemedView style={[styles.form, { backgroundColor: cardBackground, borderColor }]}>
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
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: 'white' }]}>
              {loading ? '...' : t.loginButton}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitchToRegister} style={styles.switchButton}>
            <ThemedText style={[styles.switchText, { color: primaryColor }]}>
              {t.dontHaveAccount} {t.register}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
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