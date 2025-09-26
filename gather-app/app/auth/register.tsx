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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { RegisterCredentials, AuthError } from '@/constants/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<AuthError | null>(null);

  const validateForm = (): boolean => {
    // Name validation
    if (!credentials.name.trim()) {
      setErrors({ message: 'Full name is required', field: 'name' });
      return false;
    }

    if (credentials.name.trim().length < 2) {
      setErrors({ message: 'Name must be at least 2 characters', field: 'name' });
      return false;
    }

    // Email validation
    if (!credentials.email.trim()) {
      setErrors({ message: 'Email is required', field: 'email' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setErrors({ message: 'Please enter a valid email address', field: 'email' });
      return false;
    }

    // Password validation
    if (!credentials.password.trim()) {
      setErrors({ message: 'Password is required', field: 'password' });
      return false;
    }

    if (credentials.password.length < 6) {
      setErrors({ message: 'Password must be at least 6 characters', field: 'password' });
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
      setErrors({ 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        field: 'password'
      });
      return false;
    }

    // Confirm password validation
    if (!credentials.confirmPassword.trim()) {
      setErrors({ message: 'Please confirm your password', field: 'confirmPassword' });
      return false;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setErrors({ message: 'Passwords do not match', field: 'confirmPassword' });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setErrors(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - Replace with actual Supabase auth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      console.log('Registration successful:', credentials.email);
      
      // Show success message
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
      
    } catch (error) {
      setErrors({
        message: 'An account with this email already exists. Please try a different email.',
        field: 'email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const getFieldError = (field: keyof RegisterCredentials) => {
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
            <Pressable
              onPress={navigateToLogin}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { backgroundColor: palette.muted + '20' }
              ]}
              disabled={isLoading}
            >
              <Feather name="arrow-left" size={24} color={palette.secondary} />
            </Pressable>
            
            <ThemedView style={styles.headerContent}>
              <Text style={[styles.logo, { color: palette.primary }]}>
                Join Gather
              </Text>
              <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
                Create your account to start discovering events
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Registration Form */}
          <ThemedView style={styles.form}>
            {/* Name Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: palette.secondary }]}>
                Full Name
              </ThemedText>
              <ThemedView 
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: getFieldError('name') ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface 
                  }
                ]}
              >
                <Feather 
                  name="user" 
                  size={20} 
                  color={palette.muted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: palette.primary }]}
                  value={credentials.name}
                  onChangeText={(text) => {
                    setCredentials(prev => ({ ...prev, name: text }));
                    if (errors?.field === 'name') setErrors(null);
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={palette.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>
              {getFieldError('name') && (
                <ThemedText style={styles.errorText}>
                  {getFieldError('name')}
                </ThemedText>
              )}
            </ThemedView>

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
                  placeholder="Create a strong password"
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

            {/* Confirm Password Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: palette.secondary }]}>
                Confirm Password
              </ThemedText>
              <ThemedView 
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: getFieldError('confirmPassword') ? '#EF4444' : palette.muted + '40',
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
                  value={credentials.confirmPassword}
                  onChangeText={(text) => {
                    setCredentials(prev => ({ ...prev, confirmPassword: text }));
                    if (errors?.field === 'confirmPassword') setErrors(null);
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor={palette.muted}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  <Feather 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={palette.muted} 
                  />
                </Pressable>
              </ThemedView>
              {getFieldError('confirmPassword') && (
                <ThemedText style={styles.errorText}>
                  {getFieldError('confirmPassword')}
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

            {/* Password Requirements */}
            <ThemedView style={styles.passwordRequirements}>
              <ThemedText style={[styles.requirementsTitle, { color: palette.muted }]}>
                Password must contain:
              </ThemedText>
              <ThemedText style={[styles.requirementText, { color: palette.muted }]}>
                • At least 6 characters
              </ThemedText>
              <ThemedText style={[styles.requirementText, { color: palette.muted }]}>
                • One uppercase and one lowercase letter
              </ThemedText>
              <ThemedText style={[styles.requirementText, { color: palette.muted }]}>
                • At least one number
              </ThemedText>
            </ThemedView>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.registerButton,
                { 
                  backgroundColor: palette.primary,
                  opacity: isLoading ? 0.7 : pressed ? 0.8 : 1
                }
              ]}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>
          </ThemedView>

          {/* Login Link */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: palette.muted }]}>
              Already have an account?{' '}
            </ThemedText>
            <Pressable 
              onPress={navigateToLogin}
              disabled={isLoading}
            >
              <ThemedText style={[styles.loginLink, { color: palette.accent }]}>
                Sign In
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
    padding: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
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
  passwordRequirements: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  registerButtonText: {
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
  loginLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});