import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventCardProps } from '../../constants/types';

const ICON_SIZE = 16;

const EventCard = ({
  id,
  title,
  date,
  time,
  location,
  capacity,
  attendees,
  price,
  image,
  category,
}: EventCardProps) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const handlePress = () => {
    router.push(`/event/${id}`);
  };

  const iconMutedColor = palette.muted;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        style={[styles.card, { borderColor: palette.muted }]}
        lightColor={Colors.light.surface}
        darkColor={Colors.dark.surface}
      >
        <ThemedView style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedView style={styles.titleRow}>
            <Text style={[styles.title, { color: palette.primary }]} numberOfLines={2}>
              {title}
            </Text>
            <ThemedView
              style={[styles.pricePill, { backgroundColor: palette.accent }]}
              lightColor={palette.accent}
              darkColor={palette.accent}
            >
              <Text style={styles.priceText}>{price}</Text>
            </ThemedView>
          </ThemedView>

          <ThemedView>
            <ThemedView style={[styles.metaRow, styles.rowSpacing]}>
              <Feather name="calendar" size={ICON_SIZE} color={iconMutedColor} />
              <ThemedText style={[styles.metaText, styles.metaTextIndented]}>
                {date} • {time}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.metaRow, styles.rowSpacing]}>
              <Feather name="map-pin" size={ICON_SIZE} color={palette.secondary} />
              <ThemedText
                style={[styles.metaText, styles.metaTextIndented, styles.locationText]}
                numberOfLines={1}
              >
                {location}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.footerRow}>
              <ThemedView style={styles.metaRow}>
                <Feather name="users" size={ICON_SIZE} color={iconMutedColor} />
                <ThemedText style={[styles.capacityText, styles.metaTextIndented]}>
                  {attendees}/{capacity} going
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.metaRow}>
                <Feather name="tag" size={ICON_SIZE - 2} color={iconMutedColor} />
                <ThemedText style={[styles.categoryText, styles.metaTextIndented]}>
                  {category}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  pricePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpacing: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  metaTextIndented: {
    marginLeft: 8,
  },
  locationText: {
    flex: 1,
  },
  footerRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default EventCard;
