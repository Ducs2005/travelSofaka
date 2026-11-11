import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { Badge, Card } from '@/presentation/components/common';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';
import {
  PinIcon,
  HeartIcon,
  CalendarIcon,
  WalletIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { useAuthStore } from '@/presentation/stores/authStore';
import {
  HomeFeedScreen,
  TripDetailsExpenseScreen,
  ReceiptScannerScreen,
  OCRExpenseReviewScreen,
  TripPlannerScreen,
} from '@/presentation/screens';

type TripsSubView = 'details' | 'planner' | 'scanner' | 'review';

export default function App() {
  const [currentTab, setCurrentTab] = useState<BottomNavTab>('trips');
  const [tripsView, setTripsView] = useState<TripsSubView>('details');

  const { user } = useAuthStore();

  const handleNavTabPress = (tab: BottomNavTab) => {
    setCurrentTab(tab);
    if (tab === 'trips') {
      setTripsView('details');
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <StatusBar style="dark" />

      {/* 1. HOME TAB */}
      {currentTab === 'home' && (
        <HomeFeedScreen
          onViewActiveTrip={() => {
            setCurrentTab('trips');
            setTripsView('details');
          }}
          onNavTabPress={handleNavTabPress}
        />
      )}

      {/* 2. EXPLORE TAB */}
      {currentTab === 'explore' && (
        <View style={styles.tabScreenContainer}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.exploreHeader}>
              <Text style={styles.exploreTitle}>Explore Destinations</Text>
              <Text style={styles.exploreSubtitle}>Find student-friendly spots in Vietnam</Text>
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  placeholder="Search beaches, mountains, cafes..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                />
              </View>
            </View>

            <View style={styles.exploreContent}>
              <View style={styles.destinationCard}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
                  }}
                  style={styles.destImage}
                />
                <View style={styles.destCardBody}>
                  <View style={styles.destCardTop}>
                    <Text style={styles.destName}>My Khe Beach & Son Tra</Text>
                    <Text style={styles.destPrice}>~450k / day</Text>
                  </View>
                  <View style={styles.destLocationRow}>
                    <PinIcon size={13} color="#0D9488" />
                    <Text style={styles.destLocationText}>Da Nang City</Text>
                  </View>
                </View>
              </View>

              <View style={styles.destinationCard}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
                  }}
                  style={styles.destImage}
                />
                <View style={styles.destCardBody}>
                  <View style={styles.destCardTop}>
                    <Text style={styles.destName}>Hoi An Ancient Lantern Town</Text>
                    <Text style={styles.destPrice}>~600k / day</Text>
                  </View>
                  <View style={styles.destLocationRow}>
                    <PinIcon size={13} color="#0D9488" />
                    <Text style={styles.destLocationText}>Quang Nam Province</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <BottomNavBar activeTab="explore" onTabPress={handleNavTabPress} />
        </View>
      )}

      {/* 3. TRIPS TAB (TRIP FLOW: DETAILS -> PLANNER -> SCANNER -> REVIEW) */}
      {currentTab === 'trips' && (
        <View style={styles.tabScreenContainer}>
          {tripsView === 'details' && (
            <TripDetailsExpenseScreen
              onEditPlan={() => setTripsView('planner')}
              onScanReceipt={() => setTripsView('scanner')}
              onNavTabPress={handleNavTabPress}
            />
          )}

          {tripsView === 'planner' && (
            <TripPlannerScreen
              onBack={() => setTripsView('details')}
              onOpenDashboard={() => setTripsView('details')}
              onNavTabPress={handleNavTabPress}
            />
          )}

          {tripsView === 'scanner' && (
            <ReceiptScannerScreen
              onClose={() => setTripsView('details')}
              onScanComplete={() => setTripsView('review')}
            />
          )}

          {tripsView === 'review' && (
            <OCRExpenseReviewScreen
              onRetake={() => setTripsView('scanner')}
              onSaveSuccess={() => setTripsView('details')}
              onNavTabPress={handleNavTabPress}
            />
          )}
        </View>
      )}

      {/* 4. PROFILE TAB */}
      {currentTab === 'profile' && (
        <View style={styles.tabScreenContainer}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.profileContainer}>
              <View style={styles.profileHeaderCard}>
                <Image
                  source={{
                    uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                  }}
                  style={styles.profileAvatar}
                />
                <Text style={styles.profileName}>{user?.displayName || 'Trần Quang Việt'}</Text>
                <Text style={styles.profileBio}>
                  Senior CS Student • Travel & Expense Tracker
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user?.tripsCount || 12}</Text>
                    <Text style={styles.statLabel}>TRIPS</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user?.savedCount || 8}</Text>
                    <Text style={styles.statLabel}>SAVED</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user?.friendsCount || 348}</Text>
                    <Text style={styles.statLabel}>FRIENDS</Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileMenuCard}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>My Active Trips</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Expense & Bill History</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Settings & Preferences</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <BottomNavBar activeTab="profile" onTabPress={handleNavTabPress} />
        </View>
      )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  exploreHeader: {
    padding: 16,
    paddingTop: 54,
    gap: 6,
  },
  exploreTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  exploreSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
  },
  exploreContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.sm,
  },
  destImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  destCardBody: {
    padding: 14,
    gap: 6,
  },
  destCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  destPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  destLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  profileContainer: {
    padding: 16,
    paddingTop: 54,
    gap: 16,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...shadows.sm,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileBio: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  profileMenuCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 18,
    paddingVertical: 6,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuArrow: {
    fontSize: 18,
    color: '#94A3B8',
  },
});
