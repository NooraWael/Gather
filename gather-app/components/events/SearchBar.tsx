import { useEffect, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { SearchBarProps } from '../../constants/types';

const DEFAULT_PLACEHOLDER = 'Find events around you';

const SearchBar = ({ value, placeholder = DEFAULT_PLACEHOLDER, onChangeText, onSubmit }: SearchBarProps) => {
  const [text, setText] = useState(value ?? '');
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  useEffect(() => {
    if (value !== undefined && value !== text) {
      setText(value);
    }
  }, [value, text]);

  const handleChangeText = (nextValue: string) => {
    if (value === undefined) {
      setText(nextValue);
    }

    onChangeText?.(nextValue);
  };

  const displayValue = value ?? text;

  const handleSubmitEditing = (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    const submittedValue = event.nativeEvent.text;

    if (value === undefined) {
      setText(submittedValue);
    }

    onSubmit?.(submittedValue);
  };

  return (
    <ThemedView style={styles.wrapper}>
      <ThemedView
        style={[styles.container, { borderColor: palette.muted }]}
        lightColor={palette.surface}
        darkColor={palette.surface}
      >
        <Feather name="search" size={20} color={palette.muted} style={styles.icon} />
        <TextInput
          value={displayValue}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          style={[styles.input, { color: palette.text }]}
          returnKeyType="search"
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

export default SearchBar;
