import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import EventCard from '@/components/events/EventCard';
import SearchBar from '@/components/events/SearchBar';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { EventCardProps, EventWithRegistrations } from '@/constants/types';
import TopNavigation from '@/components/header/topHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { getEvents } from '@/services/event';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'food-drink', name: 'Food & Drink', icon: 'coffee' },
  { id: 'health-wellness', name: 'Health & Wellness', icon: 'heart' },
  { id: 'literature', name: 'Literature', icon: 'book-open' },
  { id: 'music', name: 'Music', icon: 'music' },
  { id: 'sports', name: 'Sports', icon: 'activity' },
  { id: 'technology', name: 'Technology', icon: 'smartphone' },
  { id: 'art-culture', name: 'Art & Culture', icon: 'image' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'education', name: 'Education', icon: 'book' },
  { id: 'social', name: 'Social', icon: 'users' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
];

const formatEventDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatEventTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const toEventCardProps = (event: EventWithRegistrations): EventCardProps => ({
  id: event.id,
  title: event.title,
  date: formatEventDate(event.date_time),
  time: formatEventTime(event.date_time),
  location: event.location,
  capacity: event.capacity,
  attendees: event.current_attendees,
  price: event.is_paid ? 'Paid' : 'Free',
  image: event.image_url,
  category: event.category,
});

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getEvents();
      if (!isMountedRef.current) return;
      setEvents(data.map(toEventCardProps));
    } catch (err) {
      console.error('Failed to load events:', err);
      if (!isMountedRef.current) return;
      setError('Unable to load events right now.');
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      await loadEvents();
      if (isMountedRef.current) {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [loadEvents]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    if (isMountedRef.current) {
      setRefreshing(false);
    }
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') {
      return events;
    }

    const selectedCategoryName = CATEGORIES.find((cat) => cat.id === selectedCategory)?.name;
    if (!selectedCategoryName) {
      return events;
    }

    return events.filter((event) => event.category === selectedCategoryName);
  }, [events, selectedCategory]);

  const CategoryFilterItem = ({ category, isSelected }: { category: Category; isSelected: boolean }) => (
    <Pressable
      onPress={() => setSelectedCategory(category.id)}
      style={({ pressed }) => [
        styles.categoryItem,
        {
          backgroundColor: isSelected ? palette.primary : palette.surface,
          borderColor: isSelected ? palette.primary : palette.muted + '30',
          opacity: pressed ? 0.8 : 1,
        }
      ]}
    >
      <Feather 
        name={category.icon} 
        size={16} 
        color={isSelected ? '#FFFFFF' : palette.muted} 
        style={styles.categoryIcon}
      />
      <Text style={[
        styles.categoryText,
        { color: isSelected ? '#FFFFFF' : palette.text }
      ]}>
        {category.name}
      </Text>
    </Pressable>
  );

  const CategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((category) => (
          <CategoryFilterItem
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <TopNavigation />
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <SearchBar />
            <CategoryFilter />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.secondary }]}>
                Events Around You
              </Text>
              <Text style={[styles.sectionSubtitle, { color: palette.muted }]}>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  Loading events...
                </Text>
                <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
                  Hang tight while we fetch events nearby
                </Text>
              </>
            ) : (
              <>
                <Feather name="calendar" size={48} color={palette.muted} />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {error ? 'Unable to load events' : 'No events found'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
                  {error
                    ? 'Pull to refresh or try again in a moment.'
                    : 'Try selecting a different category or check back later'}
                </Text>
              </>
            )}
          </View>
        }
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
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  separator: {
    height: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingLeft: 16,
  },
  categoryScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
