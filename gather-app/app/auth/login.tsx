import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { LoginCredentials, AuthError } from '@/constants/auth';
import { AuthStorage } from '@/utils/async';
import { signIn as signInService } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthError | null>(null);

  const validateForm = (): boolean => {
    if (!credentials.email.trim()) {
      setErrors({ message: 'Email is required', field: 'email' });
      return false;
    }

    if (!credentials.email.includes('@')) {
      setErrors({ message: 'Please enter a valid email address', field: 'email' });
      return false;
    }

    if (!credentials.password.trim()) {
      setErrors({ message: 'Password is required', field: 'password' });
      return false;
    }

    if (credentials.password.length < 6) {
      setErrors({ message: 'Password must be at least 6 characters', field: 'password' });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setErrors(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await signInService(credentials);

      if (!user) {
        setErrors({ message: 'Unable to sign you in right now. Please try again.' });
        return;
      }

      await AuthStorage.setLoggedIn(true);
      await AuthStorage.setUserInfo(user);

      console.log('Login successful:', credentials.email);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);

      let message = 'Invalid email or password. Please try again.';
      if (error instanceof Error && error.message) {
        message = error.message;
      }

      setErrors({ message });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  const navigateToForgotPassword = () => {
    Alert.alert('Forgot Password', 'Forgot password feature coming soon!');
  };

  const getFieldError = (field: keyof LoginCredentials) => {
    return errors?.field === field ? errors.message : null;
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <Image 
              source={require('@/assets/images/icon-2.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              Welcome back! Sign in to continue.
            </ThemedText>
          </ThemedView>

          {/* Login Form */}
          <ThemedView style={styles.form}>
            {/* Email Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: palette.secondary }]}>
                Email Address
              </ThemedText>
              <ThemedView 
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: getFieldError('email') ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface 
                  }
                ]}
              >
                <Feather 
                  name="mail" 
                  size={20} 
                  color={palette.muted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: palette.primary }]}
                  value={credentials.email}
                  onChangeText={(text) => {
                    setCredentials(prev => ({ ...prev, email: text }));
                    if (errors?.field === 'email') setErrors(null);
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={palette.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>
              {getFieldError('email') && (
                <ThemedText style={styles.errorText}>
                  {getFieldError('email')}
                </ThemedText>
              )}
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: palette.secondary }]}>
                Password
              </ThemedText>
              <ThemedView 
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: getFieldError('password') ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface 
                  }
                ]}
              >
                <Feather 
                  name="lock" 
                  size={20} 
                  color={palette.muted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: palette.primary }]}
                  value={credentials.password}
                  onChangeText={(text) => {
                    setCredentials(prev => ({ ...prev, password: text }));
                    if (errors?.field === 'password') setErrors(null);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  <Feather 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={palette.muted} 
                  />
                </Pressable>
              </ThemedView>
              {getFieldError('password') && (
                <ThemedText style={styles.errorText}>
                  {getFieldError('password')}
                </ThemedText>
              )}
            </ThemedView>

            {/* General Error */}
            {errors && !errors.field && (
              <ThemedView style={styles.generalErrorContainer}>
                <ThemedText style={styles.errorText}>
                  {errors.message}
                </ThemedText>
              </ThemedView>
            )}

            {/* Forgot Password Link */}
            <Pressable
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={isLoading}
            >
              <ThemedText style={[styles.forgotPasswordText, { color: palette.accent }]}>
                Forgot your password?
              </ThemedText>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginButton,
                { 
                  backgroundColor: palette.primary,
                  opacity: isLoading ? 0.7 : pressed ? 0.8 : 1
                }
              ]}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </Pressable>
          </ThemedView>

          {/* Register Link */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: palette.muted }]}>
              Don't have an account?{' '}
            </ThemedText>
            <Pressable 
              onPress={navigateToRegister}
              disabled={isLoading}
            >
              <ThemedText style={[styles.registerLink, { color: palette.accent }]}>
                Sign Up
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  generalErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  registerLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
