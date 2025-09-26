import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import MyEventCard from '@/components/events/MyEventCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MyEventCardProps } from '@/constants/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import SimpleTopNavigation from '@/components/header/topHeaderMyEvents';

// Mock data for created events
const mockCreatedEvents: MyEventCardProps[] = [
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
    isCreated: true,
    status: 'accepted',
  },
  {
    id: '2',
    title: 'Morning Yoga in the Park',
    date: 'Oct 20, 2025',
    time: '7:00 AM',
    location: 'Riverside Park',
    capacity: 25,
    attendees: 18,
    price: 'Paid',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    category: 'Health & Wellness',
    isCreated: true,
    status: 'pending',
  },
];

// Mock data for joined events
const mockJoinedEvents: MyEventCardProps[] = [
  {
    id: '3',
    title: 'Book Club: Local Authors',
    date: 'Oct 18, 2025',
    time: '6:30 PM',
    location: 'Corner Coffee Shop',
    capacity: 15,
    attendees: 12,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    category: 'Literature',
    isCreated: false,
    status: 'registered',
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
    isCreated: false,
    status: 'pending approval',
  },
];

type TabType = 'created' | 'joined';

export default function MyEventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabType>('created');

  const currentEvents = activeTab === 'created' ? mockCreatedEvents : mockJoinedEvents;

  const TabButton = ({ 
    title, 
    isActive, 
    onPress 
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { borderBottomColor: isActive ? palette.primary : 'transparent' }
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.tabText,
          { color: isActive ? palette.primary : palette.muted }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <SimpleTopNavigation />
      
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        <TabButton
          title="My Created Events"
          isActive={activeTab === 'created'}
          onPress={() => setActiveTab('created')}
        />
        <TabButton
          title="Events I'm Joining"
          isActive={activeTab === 'joined'}
          onPress={() => setActiveTab('joined')}
        />
      </View>

      <FlatList
        data={currentEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.secondary }]}>
              {activeTab === 'created' 
                ? `${currentEvents.length} Created Events` 
                : `${currentEvents.length} Joined Events`
              }
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              {activeTab === 'created' 
                ? "You haven't created any events yet" 
                : "You haven't joined any events yet"
              }
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MyEventCard {...item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    paddingBottom: 120,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});