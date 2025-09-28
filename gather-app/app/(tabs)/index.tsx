import React, { useState } from 'react';
import { FlatList, Keyboard, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import EventCard from '@/components/events/EventCard';
import SearchBar from '@/components/events/SearchBar';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { EventCardProps } from '@/constants/types';
import TopNavigation from '@/components/header/topHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';

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
  {
    id: '5',
    title: 'Jazz Night at The Lounge',
    date: 'Oct 25, 2025',
    time: '8:00 PM',
    location: 'Blue Note Cafe',
    capacity: 80,
    attendees: 45,
    price: 'Paid',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    category: 'Music',
  },
  {
    id: '6',
    title: 'Tech Startup Meetup',
    date: 'Oct 28, 2025',
    time: '6:00 PM',
    location: 'Innovation Hub',
    capacity: 100,
    attendees: 67,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    category: 'Technology',
  },
];

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredEvents = selectedCategory === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.category === CATEGORIES.find(cat => cat.id === selectedCategory)?.name);

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
            <Feather name="calendar" size={48} color={palette.muted} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              No events found
            </Text>
            <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
              Try selecting a different category or check back later
            </Text>
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