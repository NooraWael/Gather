import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const TopNavigation = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const handleHomePress = () => {
    router.push('/');
  };

  const handleMyEventsPress = () => {
    // router.push('/my-events');
  };

  const handleProfilePress = () => {
    // Add profile navigation when ready
    console.log('Profile pressed');
  };

  return (
    <ThemedView 
      style={[
        styles.container, 
        { 
          backgroundColor: palette.background,
          borderBottomColor: palette.muted + '40' 
        }
      ]}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      <View style={styles.content}>
        <Pressable
          onPress={handleHomePress}
          style={({ pressed }) => [
            styles.logoButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.logo, { color: palette.primary }]}>
            Gather
          </Text>
        </Pressable>

        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleMyEventsPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && { backgroundColor: palette.muted + '20' },
            ]}
          >
            <Feather 
              name="bell" 
              size={24} 
              color={palette.secondary} 
            />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 400, // Equivalent to max-w-md
    width: '100%',
    alignSelf: 'center',
  },
  logoButton: {
    padding: 4,
    borderRadius: 8,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold', // Using your heading font
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default TopNavigation;