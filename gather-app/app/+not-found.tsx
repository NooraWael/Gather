import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text
          style={styles.title}
          lightColor={Colors.light.secondary}
          darkColor={Colors.dark.text}
        >
          This screen doesn't exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text
            style={styles.linkText}
            lightColor={Colors.light.primary}
            darkColor={Colors.dark.accent}
          >
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
