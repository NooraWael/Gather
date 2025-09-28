import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  View,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { saveUserInterests } from '@/services/user';

interface Interest {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

const INTERESTS: Interest[] = [
  { id: 'food-drink', name: 'Food & Drink', icon: 'coffee' },
  { id: 'health-wellness', name: 'Health & Wellness', icon: 'heart' },
  { id: 'literature', name: 'Literature', icon: 'book-open' },
  { id: 'music', name: 'Music', icon: 'music' },
  { id: 'sports', name: 'Sports', icon: 'activity' },
  { id: 'technology', name: 'Technology', icon: 'smartphone' },
  { id: 'art-culture', name: 'Art & Culture', icon: 'image' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'education', name: 'Education', icon: 'book' },
  { id: 'social', name: 'Social', icon: 'users' },
  { id: 'other', name: 'Other', icon: 'more-horizontal' },
];

export default function InterestsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      return; // Could show an error message here
    }

    setIsLoading(true);

    try {
      // Save the selected interests to the user's profile
      const interestNames = selectedInterests.map(id => 
        INTERESTS.find(interest => interest.id === id)?.name
      ).filter(Boolean);
      
      await saveUserInterests(interestNames as string[]);
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving interests:', error);
      Alert.alert('Error', 'Failed to save your interests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerContent}>
            <Text style={[styles.title, { color: palette.primary }]}>
              What interests you?
            </Text>
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              Choose your interests to discover events you'll love.{'\n'}
              You can always change these later.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Interests Grid */}
        <ThemedView style={styles.interestsContainer}>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              
              return (
                <Pressable
                  key={interest.id}
                  onPress={() => toggleInterest(interest.id)}
                  style={({ pressed }) => [
                    styles.interestCard,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.surface,
                      borderColor: isSelected ? palette.primary : palette.muted + '30',
                      opacity: pressed ? 0.8 : 1,
                    }
                  ]}
                >
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: isSelected ? palette.background + '20' : palette.primary + '15' }
                  ]}>
                    <Feather 
                      name={interest.icon} 
                      size={24} 
                      color={isSelected ? '#FFFFFF' : palette.primary} 
                    />
                  </View>
                  <Text style={[
                    styles.interestText,
                    { color: isSelected ? '#FFFFFF' : palette.secondary }
                  ]}>
                    {interest.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        {/* Selected Count */}
        {selectedInterests.length > 0 && (
          <ThemedView style={styles.selectedCountContainer}>
            <ThemedText style={[styles.selectedCount, { color: palette.primary }]}>
              {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <ThemedView style={[styles.bottomActions, { backgroundColor: palette.background }]}>
        <Pressable
          onPress={handleSkip}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.skipButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={[styles.skipButtonText, { color: palette.muted }]}>
            Skip for now
          </Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          disabled={selectedInterests.length === 0 || isLoading}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: palette.primary,
              opacity: selectedInterests.length === 0 || isLoading ? 0.5 : pressed ? 0.8 : 1,
            }
          ]}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Setting up...' : 'Continue'}
          </Text>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120, // Space for bottom actions
  },
  header: {
    marginBottom: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  interestsContainer: {
    marginBottom: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  interestCard: {
    width: '47%', // Slightly less than 50% to account for gap
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  interestText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedCountContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});