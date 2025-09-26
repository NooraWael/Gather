import { FlatList, Keyboard, StyleSheet } from 'react-native';

import EventCard from '@/components/events/EventCard';
import SearchBar from '@/components/events/SearchBar';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { EventCardProps } from '@/constants/types';
import TopNavigation from '@/components/header/topHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';

const mockEvents: EventCardProps[] = [
  {
    id: '1',
    title: 'Community Food Festival',
    date: 'Oct 15, 2025',
    time: '12:00 PM',
    location: 'Central Park',
    capacity: 200,
    attendees: 87,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=900&q=80',
    category: 'Food & Drink',
  },
  {
    id: '2',
    title: 'Book Club: Local Authors',
    date: 'Oct 18, 2025',
    time: '6:30 PM',
    location: 'Corner Coffee Shop',
    capacity: 15,
    attendees: 12,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    category: 'Literature',
  },
  {
    id: '3',
    title: 'Morning Yoga in the Park',
    date: 'Oct 20, 2025',
    time: '7:00 AM',
    location: 'Riverside Park',
    capacity: 25,
    attendees: 18,
    price: 'Paid',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    category: 'Health & Wellness',
  },
  {
    id: '4',
    title: 'Weekly Farmers Market',
    date: 'Oct 22, 2025',
    time: '8:00 AM',
    location: 'Town Square',
    capacity: 500,
    attendees: 234,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1472141521881-95dd6f9ae7f6?auto=format&fit=crop&w=900&q=80',
    category: 'Shopping',
  },
];

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <TopNavigation />
      <FlatList
        data={mockEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <SearchBar />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.secondary }]}>Happening Near You</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <EventCard {...item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  separator: {
    height: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});
