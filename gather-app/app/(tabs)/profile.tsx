import { ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';

const profile = {
  name: 'Noora Qasim',
  email: 'noora.qasim@example.com',
  location: 'San Francisco, CA',
  bio: 'Community builder focused on connecting neighbors through shared experiences and creative events.',
  memberSince: 'Joined January 2024',
};

const stats = [
  { label: 'Events Hosting', value: 6 },
  { label: 'Joined Events', value: 18 },
  { label: 'People Connected', value: 142 },
];

const upcomingRegistrations = [
  {
    id: 'reg-1',
    title: 'Morning Yoga in the Park',
    date: 'Oct 20 • 7:00 AM',
    location: 'Riverside Park',
    status: 'Registered',
    statusType: 'registered',
  },
  {
    id: 'reg-2',
    title: 'Community Food Festival',
    date: 'Oct 15 • 12:00 PM',
    location: 'Central Park',
    status: 'Hosting',
    statusType: 'hosting',
  },
];

const interests = ['Community', 'Health & Wellness', 'Outdoor', 'Food & Drink', 'Workshops'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const getStatusPillStyle = (statusType: string) => {
    if (statusType === 'hosting') {
      return { backgroundColor: palette.primary };
    }
    return { backgroundColor: palette.accent };
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            console.log('User logged out');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, events, and connections will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure you want to delete your account? This cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: () => {
                    // Handle account deletion logic here
                    console.log('Account deletion confirmed');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Profile Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
          <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
            <Text style={styles.avatarText}>{profile.name.split(' ').map((n) => n[0]).join('')}</Text>
          </View>

          <View style={[styles.profileContent, {backgroundColor: palette.surface}]}>
            <Text style={[styles.name, { color: palette.text }]}>{profile.name}</Text>
            <Text style={[styles.email, { color: palette.muted }]}>{profile.email}</Text>
            
            <View style={[styles.metaContainer, {backgroundColor: palette.surface}]}>
              <View style={[styles.metaRow, {backgroundColor: palette.surface}]}>
                <Feather name="map-pin" size={14} color={palette.muted}  />
                <Text style={[styles.metaText, { color: palette.muted, backgroundColor: palette.surface }]}>{profile.location}</Text>
              </View>
                 <View style={[styles.metaRow, {backgroundColor: palette.surface}]}>
                <Feather name="calendar" size={14} color={palette.muted} />
                <Text style={[styles.metaText, { color: palette.muted }]}>{profile.memberSince}</Text>
              </View>
            </View>
            
            <Text style={[styles.bio, { color: palette.text }]}>{profile.bio}</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Interests</Text>
          <View style={styles.chipContainer}>
            {interests.map((interest) => (
              <View key={interest} style={[styles.chip, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}>
                <Text style={[styles.chipText, { color: palette.text }]}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Your Impact</Text>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
                <Text style={[styles.statValue, { color: palette.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: palette.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Plans */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Upcoming Plans</Text>
          <View style={styles.upcomingPlansContainer}>
            {upcomingRegistrations.map((event, index) => (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  { backgroundColor: palette.surface, borderColor: palette.muted + '30' }
                ]}
              >
                <View style={[styles.eventContent, {backgroundColor: palette.surface}]}>
                  <View style={[styles.eventHeader, {backgroundColor: palette.surface}]}>
                    <Text style={[styles.eventTitle, { color: palette.text }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={[styles.statusPill, getStatusPillStyle(event.statusType)]}>
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.eventMetaContainer, {backgroundColor: palette.surface}]}>
                    <View style={[styles.metaRow, {backgroundColor: palette.surface}]}>
                      <Feather name="calendar" size={14} color={palette.secondary} />
                      <Text style={[styles.eventMeta, { color: palette.muted }]}>{event.date}</Text>
                    </View>
                    <View style={[styles.metaRow, {backgroundColor: palette.surface}]}>
                      <Feather name="map-pin" size={14} color={palette.secondary} />
                      <Text style={[styles.eventMeta, { color: palette.muted }]} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Account</Text>
          
          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.actionButton,
              styles.logoutButton,
              { 
                backgroundColor: palette.surface,
                borderColor: palette.muted + '40',
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <Feather name="log-out" size={20} color={palette.secondary} />
            <Text style={[styles.actionButtonText, { color: palette.text }]}>Logout</Text>
          </Pressable>

          {/* Delete Account Button */}
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              { 
                backgroundColor: '#FEF2F2',
                borderColor: '#FCA5A5',
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <Feather name="trash-2" size={20} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
    gap: 36,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    color: '#fff',
  },
  profileContent: {
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  bio: {
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  section: {
    gap: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  eventRow: {
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  profileHeaderCard: {
    borderRadius: 0,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 30,
  },
  upcomingPlansContainer: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 0,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  eventContent: {
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eventTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    flex: 1,
    lineHeight: 24,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  eventMetaContainer: {
    gap: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 0,
    gap: 12,
    marginBottom: 12,
  },
  logoutButton: {
    // Styles handled dynamically in component
  },
  deleteButton: {
    // Delete-specific styles handled in component
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#DC2626',
  },
});