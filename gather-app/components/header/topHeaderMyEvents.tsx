import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const SimpleTopNavigation = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const handleHomePress = () => {
    router.push('/');
  };

  const handleAddPress = () => {
    // Navigate to create event page when ready
     router.push('/event/addEvent');
    console.log('Add event pressed');
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

        <Pressable
          onPress={handleAddPress}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: palette.primary },
            pressed && styles.pressed,
          ]}
        >
          <Feather 
            name="plus" 
            size={20} 
            color="#FFFFFF" 
          />
        </Pressable>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default SimpleTopNavigation;