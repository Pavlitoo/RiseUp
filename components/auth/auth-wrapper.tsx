import React, { useState } from 'react';
import { LoginScreen } from './login-screen';
import { RegisterScreen } from './register-screen';

export function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
  );
}