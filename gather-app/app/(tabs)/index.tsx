import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        lightColor={Colors.light.primary}
        darkColor={Colors.dark.accent}>
        Tab One
      </Text>
      <View
        style={styles.separator}
        lightColor={Colors.light.muted}
        darkColor={Colors.dark.muted}
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
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
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
