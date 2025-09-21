import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  required?: boolean;
}

export function InputField({
  label,
  error,
  hint,
  isPassword = false,
  showPasswordToggle = false,
  required = false,
  style,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(!isPassword);
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const getBorderColor = () => {
    if (error) return errorColor;
    if (props.value) return primaryColor;
    return borderColor;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}
          {required && <ThemedText style={[styles.required, { color: errorColor }]}> *</ThemedText>}
        </ThemedText>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: getBorderColor(),
              color: textColor,
              backgroundColor: cardBackground,
            },
            style,
          ]}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={borderColor}
          {...props}
        />
        
        {showPasswordToggle && isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <ThemedText style={[styles.passwordToggleText, { color: primaryColor }]}>
              {showPassword ? '🙈' : '👁️'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <ThemedText style={[styles.errorText, { color: errorColor }]}>
          ⚠️ {error}
        </ThemedText>
      )}
      
      {hint && !error && (
        <ThemedText style={[styles.hintText, { color: borderColor }]}>
          💡 {hint}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});