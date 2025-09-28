import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { verifyOTP, resendOTP } from '@/services/auth';

export default function CodeVerificationScreen() {
  const router = useRouter();
const { phone, email, name, type = 'signup' } = useLocalSearchParams<{ 
  phone: string;
  email: string; 
  name: string;
  type?: string; 
}>();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    
    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < pastedCode.length && i < 6; i++) {
        newCode[i] = pastedCode[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-verify if all digits are filled
      if (pastedCode.length === 6) {
        handleVerifyCode(newCode.join(''));
      }
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every(digit => digit !== '') && value) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

 const handleVerifyCode = async (codeString?: string) => {
  const verificationCode = codeString || code.join('');
  
  if (verificationCode.length !== 6) {
    Alert.alert('Invalid Code', 'Please enter the complete 6-digit verification code.');
    return;
  }

  setIsLoading(true);

  try {
const user = await verifyOTP(phone, verificationCode, { email, name });
    
    if (user) {
      Alert.alert(
        'Welcome to Gather!',
        'Your account has been verified successfully.',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/user/interests'), 
          },
        ]
      );
    }
  } catch (error) {
      console.error('Code verification error:', error);
      
      // Clear the code inputs on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      let errorMessage = 'The verification code you entered is incorrect or has expired.';
      if (error instanceof Error && error.message.includes('expired')) {
        errorMessage = 'This verification code has expired. Please request a new one.';
      } else if (error instanceof Error && error.message.includes('invalid')) {
        errorMessage = 'Invalid verification code. Please check and try again.';
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    
    try {
      await resendOTP(phone);
      
      setCountdown(60); // 60 second countdown
      setCode(['', '', '', '', '', '']); // Clear current code
      inputRefs.current[0]?.focus();
      
 Alert.alert(
  'Code Sent',
  'A new 6-digit verification code has been sent to your phone.'
);
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert(
        'Error',
        'Unable to send verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const navigateBack = () => {
    router.back();
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
              onPress={navigateBack}
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
  Verify Your Phone
</Text>
<ThemedText style={[styles.subtitle, { color: palette.muted }]}>
  Enter the 6-digit code we sent to{'\n'}
  <Text style={[styles.emailText, { color: palette.secondary }]}>{phone}</Text>
</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Code Input Section */}
          <ThemedView style={styles.form}>
            <ThemedView style={styles.codeContainer}>
              <ThemedText style={[styles.label, { color: palette.secondary }]}>
                Verification Code
              </ThemedText>
              
              <ThemedView style={styles.codeInputs}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: palette.surface,
                        borderColor: digit 
                          ? palette.primary 
                          : isLoading 
                            ? palette.muted + '20' 
                            : palette.muted + '40',
                        color: palette.primary,
                        borderWidth: digit ? 2 : 1,
                      }
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    editable={!isLoading}
                    autoFocus={index === 0}
                    selectTextOnFocus
                  />
                ))}
              </ThemedView>

              {/* Timer and Resend */}
              <ThemedView style={styles.resendSection}>
                {countdown > 0 ? (
                  <ThemedText style={[styles.countdownText, { color: palette.muted }]}>
                    Resend code in {countdown}s
                  </ThemedText>
                ) : (
                  <ThemedView style={styles.resendContainer}>
                    <ThemedText style={[styles.resendText, { color: palette.muted }]}>
                      Didn't receive the code?{' '}
                    </ThemedText>
                    <Pressable 
                      onPress={handleResendCode}
                      disabled={isResending || isLoading}
                      style={({ pressed }) => [
                        styles.resendButton,
                        pressed && { backgroundColor: palette.muted + '10' }
                      ]}
                    >
                      <ThemedText style={[styles.resendLink, { color: palette.accent }]}>
                        {isResending ? 'Sending...' : 'Resend Code'}
                      </ThemedText>
                    </Pressable>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>

            {/* Verify Button */}
            <Pressable
              onPress={() => handleVerifyCode()}
              disabled={isLoading || code.some(digit => digit === '')}
              style={({ pressed }) => [
                styles.verifyButton,
                {
                  backgroundColor: palette.primary,
                  opacity: isLoading || code.some(digit => digit === '') ? 0.5 : pressed ? 0.8 : 1,
                }
              ]}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </Pressable>

            {/* Help Text */}
            <ThemedView style={styles.helpSection}>
<ThemedText style={[styles.helpText, { color: palette.muted }]}>
  Make sure your phone has signal. The code expires in 10 minutes.
</ThemedText>
            </ThemedView>
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
    lineHeight: 24,
  },
  emailText: {
    fontFamily: 'Inter-SemiBold',
  },
  form: {
    marginBottom: 32,
  },
  codeContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    minHeight: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resendButton: {
    padding: 4,
    borderRadius: 4,
  },
  resendLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  helpSection: {
    alignItems: 'center',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    maxWidth: '100%',
  },
  helpIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    flex: 1,
  },
});