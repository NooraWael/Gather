import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        lightColor={Colors.light.primary}
        darkColor={Colors.dark.accent}
      >
        Modal
      </Text>
      <View
        style={styles.separator}
        lightColor={Colors.light.muted}
        darkColor={Colors.dark.muted}
      />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1.2,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
