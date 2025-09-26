import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        lightColor={Colors.light.secondary}
        darkColor={Colors.dark.text}
      >
        Tab Two
      </Text>
      <View
        style={styles.separator}
        lightColor={Colors.light.accent}
        darkColor={Colors.dark.accent}
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
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
    letterSpacing: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
