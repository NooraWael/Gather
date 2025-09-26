import type { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type FloatingActionButtonProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  iconName?: ComponentProps<typeof Feather>['name'];
};

const FloatingActionButton = ({ onPress, style, iconName = 'plus' }: FloatingActionButtonProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Pressable onPress={onPress} style={[styles.pressable, style]} accessibilityRole="button">
      <View
        style={[styles.container, { backgroundColor: palette.primary }]}
        lightColor={palette.primary}
        darkColor={palette.primary}
      >
        <Feather name={iconName} size={22} color="#fff" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  container: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;
