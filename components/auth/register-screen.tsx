import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from '@/constants/validation';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  
  const { register } = useAuth();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const validateField = (field: string, value: string) => {
    let validation;
    switch (field) {
      case 'name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'confirmPassword':
        validation = validatePasswordMatch(password, value);
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
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        // Re-validate confirm password if it's been touched
        if (touched.confirmPassword) {
          validateField('confirmPassword', confirmPassword);
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
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

  const handleRegister = async () => {
    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validatePasswordMatch(password, confirmPassword);
    
    const newErrors = {
      name: nameValidation.isValid ? undefined : nameValidation.error,
      email: emailValidation.isValid ? undefined : emailValidation.error,
      password: passwordValidation.isValid ? undefined : passwordValidation.error,
      confirmPassword: confirmPasswordValidation.isValid ? undefined : confirmPasswordValidation.error,
    };
    
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      Alert.alert('Помилка', 'Будь ласка, виправте помилки у формі');
      return;
    }

    setLoading(true);
    
    try {
      const success = await register(email.trim(), password, name.trim());
      
      if (success) {
        // Registration successful - state will update automatically
        console.log('✅ Registration successful');
      } else {
        Alert.alert('Помилка', 'Користувач з таким email вже існує');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Помилка', 'Сталася помилка при реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🌟 RiseUp
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t.register}
        </ThemedText>

        <ThemedView style={[styles.form, { backgroundColor: cardBackground, borderColor }]}>
          <InputField
            label={t.name}
            value={name}
            onChangeText={(value) => handleFieldChange('name', value)}
            onBlur={() => handleFieldBlur('name', name)}
            placeholder="Введіть ваше ім'я"
            error={errors.name}
            hint="Тільки літери та пробіли, мінімум 2 символи"
            autoCapitalize="words"
            required
          />

          <InputField
            label={t.email}
            value={email}
            onChangeText={(value) => handleFieldChange('email', value)}
            onBlur={() => handleFieldBlur('email', email)}
            placeholder="example@gmail.com"
            error={errors.email}
            hint="Введіть дійсну електронну адресу"
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
            hint="Мінімум 6 символів"
            isPassword
            showPasswordToggle
            required
          />

          <InputField
            label={t.confirmPassword}
            value={confirmPassword}
            onChangeText={(value) => handleFieldChange('confirmPassword', value)}
            onBlur={() => handleFieldBlur('confirmPassword', confirmPassword)}
            placeholder="Повторіть пароль"
            error={errors.confirmPassword}
            hint="Повинен співпадати з паролем вище"
            isPassword
            showPasswordToggle
            required
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: 'white' }]}>
              {loading ? '...' : t.registerButton}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitchToLogin} style={styles.switchButton}>
            <ThemedText style={[styles.switchText, { color: primaryColor }]}>
              {t.alreadyHaveAccount} {t.login}
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
    paddingTop: 60,
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