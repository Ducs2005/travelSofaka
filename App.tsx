import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  palette,
  typography,
  radii,
  spacing,
  shadows,
} from '@/core/theme';
import {
  Button,
  Card,
  Input,
  Badge,
  ScreenContainer,
} from '@/presentation/components/common';
import {
  useAuthStore,
  useTripStore,
  useExpenseStore,
  useSocialStore,
} from '@/presentation/stores';

type TabView = 'overview' | 'auth' | 'trip' | 'expense' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('overview');

  const { user } = useAuthStore();
  const { activeTrip, selectedDayIndex, setSelectedDayIndex } = useTripStore();
  const { expenses, totalBudget, totalSpent } = useExpenseStore();
  const { posts } = useSocialStore();

  return (
    <ScreenContainer backgroundColor={palette.slate[800]} isDark>
      <StatusBar style="light" />

      {/* Top Brand Bar */}
      <View style={styles.topBrandBar}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>TripMate</Text>
            <Text style={styles.brandSubtitle}>Clean Architecture & Theme Preview</Text>
          </View>
        </View>
        <Badge label="MVP READY" variant="coral" />
      </View>

      {/* Screen Selector Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {(
            [
              { id: 'overview', label: '🎨 Theme & Core' },
              { id: 'auth', label: '01. Login' },
              { id: 'trip', label: '05. Planner' },
              { id: 'expense', label: '06. Expense' },
              { id: 'profile', label: '10. Profile' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area styled like the 390px artboard in travelsofaka_ui.html */}
      <View style={styles.phoneFrame}>
        <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: THEME & CLEAN ARCHITECTURE OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <Badge label="CLEAN ARCHITECTURE READY" variant="teal" style={{ marginBottom: spacing.md }} />
                <Text style={styles.headline}>Travelsofaka Core System</Text>
                <Text style={styles.bodyText}>
                  Codebase đã hoàn tất cấu trúc 3 lớp: Domain, Data, Presentation với hệ thống màu và typography chuẩn theo prototype.
                </Text>
              </Card>

              {/* Color Palette Visualizer */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Bảng màu chủ đạo (Brand Palette)</Text>
                <View style={styles.paletteRow}>
                  <View style={[styles.colorBox, { backgroundColor: palette.teal[600] }]}>
                    <Text style={styles.colorTextLight}>Teal 600</Text>
                    <Text style={styles.colorHexLight}>#0D9488</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.coral[500] }]}>
                    <Text style={styles.colorTextLight}>Coral 500</Text>
                    <Text style={styles.colorHexLight}>#FF6B6B</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.slate[900] }]}>
                    <Text style={styles.colorTextLight}>Slate 900</Text>
                    <Text style={styles.colorHexLight}>#0F172A</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.amber[500] }]}>
                    <Text style={styles.colorTextLight}>Amber 500</Text>
                    <Text style={styles.colorHexLight}>#F59E0B</Text>
                  </View>
                </View>
              </Card>

              {/* UI Component Showcase */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Common UI Components</Text>
                <View style={{ gap: spacing.base }}>
                  <Button title="Primary Button (Teal 600)" variant="primary" />
                  <Button title="Action Button (Coral 500)" variant="secondary" />
                  <Button title="Outline Button" variant="outline" />
                  <View style={styles.badgeRow}>
                    <Badge label="Active Trip" variant="teal" />
                    <Badge label="OCR Verified" variant="teal" />
                    <Badge label="★ 4.9 Rating" variant="amber" />
                    <Badge label="Student Squad" variant="coral" />
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* TAB 2: SCREEN 01 LOGIN PREVIEW */}
          {activeTab === 'auth' && (
            <View style={styles.sectionContainer}>
              <View style={styles.heroImageWrapper}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' }}
                  style={styles.heroImage}
                />
                <View style={styles.heroOverlay}>
                  <Badge label="STUDENT TRAVEL SQUAD" variant="coral" style={{ marginBottom: 6 }} />
                  <Text style={styles.heroTitle}>TripMate</Text>
                  <Text style={styles.heroSubtitle}>Plan together, split bills easily, travel further.</Text>
                </View>
              </View>

              <Card style={styles.cardItem}>
                <Input
                  label="University or Personal Email"
                  defaultValue="viet.tran@student.edu.vn"
                  placeholder="name@student.edu.vn"
                />
                <Input
                  label="Password"
                  defaultValue="••••••••••••"
                  placeholder="Enter password"
                  secureTextEntry
                />
                <Button title="Sign In to TripMate" variant="primary" style={{ marginTop: spacing.xs }} />

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button title="Continue with Google" variant="outline" />
              </Card>
            </View>
          )}

          {/* TAB 3: SCREEN 05 TRIP PLANNER PREVIEW */}
          {activeTab === 'trip' && activeTrip && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <Text style={styles.metaLabel}>ACTIVE TRIP</Text>
                <Text style={styles.cardTitle}>{activeTrip.title}</Text>
                <View style={styles.tripMetaRow}>
                  <Text style={styles.tagText}>📅 {activeTrip.startDate} – {activeTrip.endDate}</Text>
                  <Text style={[styles.tagText, { color: palette.teal[700], fontWeight: 'bold' }]}>
                    💰 {activeTrip.budgetTotal.toLocaleString()} VND
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  {activeTrip.destinations.map((d) => (
                    <Badge key={d} label={`📍 ${d}`} variant="teal" />
                  ))}
                </View>
              </Card>

              {/* Day Tabs */}
              <View style={styles.daySelector}>
                {[1, 2, 3].map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDayIndex(day)}
                    style={[
                      styles.dayButton,
                      selectedDayIndex === day && styles.dayButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDayIndex === day && styles.dayButtonTextActive,
                      ]}
                    >
                      Day {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Day Activities */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Daily Schedule (Day {selectedDayIndex})</Text>
                {activeTrip.activities
                  .filter((a) => a.dayIndex === selectedDayIndex)
                  .map((act) => (
                    <View key={act.id} style={styles.activityItem}>
                      <Text style={styles.activityTime}>{act.time}</Text>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                    </View>
                  ))}
                <Button title="+ Add Activity" variant="outline" size="sm" style={{ marginTop: spacing.md }} />
              </Card>
            </View>
          )}

          {/* TAB 4: SCREEN 06 EXPENSE PREVIEW */}
          {activeTab === 'expense' && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.metaLabel}>GROUP EXPENSE SUMMARY</Text>
                    <Text style={styles.moneyTitle}>{totalSpent.toLocaleString()} VND</Text>
                    <Text style={styles.metaSubtitle}>of {totalBudget.toLocaleString()} VND budget</Text>
                  </View>
                  <Button title="📷 Scan Receipt" variant="secondary" size="sm" fullWidth={false} />
                </View>

                {/* Budget Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` },
                    ]}
                  />
                </View>

                {/* Expense List */}
                <View style={{ marginTop: spacing.base, gap: spacing.base }}>
                  {expenses.map((item) => (
                    <View key={item.id} style={styles.expenseRow}>
                      <View>
                        <Text style={styles.expenseName}>{item.merchantName}</Text>
                        <Text style={styles.expenseDate}>{item.date} • Split: {item.splitMemberUids.join(', ')}</Text>
                      </View>
                      <Text style={styles.expenseAmount}>{item.amount.toLocaleString()} VND</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {/* TAB 5: SCREEN 10 USER PROFILE PREVIEW */}
          {activeTab === 'profile' && user && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <View style={styles.profileHeader}>
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{user.displayName}</Text>
                    <Text style={styles.profileRole}>@viet.travels • Senior CS Student</Text>
                    <Badge label={`📍 ${user.location}`} variant="teal" style={{ marginTop: 4 }} />
                  </View>
                </View>
                <Text style={styles.profileBio}>{user.bio}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.tripsCount}</Text>
                    <Text style={styles.statLabel}>TRIPS</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.savedCount}</Text>
                    <Text style={styles.statLabel}>SAVED</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.friendsCount}</Text>
                    <Text style={styles.statLabel}>FRIENDS</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    backgroundColor: palette.slate[900],
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.extrabold,
    fontSize: typography.fontSizes.lg,
  },
  brandTitle: {
    color: palette.common.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
  },
  brandSubtitle: {
    color: palette.slate[400],
    fontSize: typography.fontSizes['2xs'],
  },
  tabContainer: {
    backgroundColor: palette.slate[900],
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[800],
  },
  tabScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: palette.slate[800],
  },
  tabButtonActive: {
    backgroundColor: palette.teal[600],
  },
  tabButtonText: {
    color: palette.slate[400],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  tabButtonTextActive: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
  },
  phoneFrame: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  screenScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  sectionContainer: {
    gap: spacing.xl,
  },
  cardItem: {
    backgroundColor: palette.common.white,
  },
  headline: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: typography.fontSizes.base,
    color: palette.slate[600],
    lineHeight: typography.lineHeights.base,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
    marginBottom: spacing.base,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorBox: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorTextLight: {
    color: palette.common.white,
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
  },
  colorHexLight: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroImageWrapper: {
    height: 190,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: palette.teal[900],
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(19, 78, 74, 0.75)',
  },
  heroTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.common.white,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.teal[100],
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.slate[200],
  },
  dividerText: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    fontWeight: typography.fontWeights.bold,
  },
  metaLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  tripMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[700],
  },
  daySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: palette.slate[200],
    borderRadius: radii.md,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: palette.teal[600],
  },
  dayButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
  },
  dayButtonTextActive: {
    color: palette.common.white,
  },
  activityItem: {
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[100],
    borderRadius: radii.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  activityTime: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[700],
  },
  activityTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[800],
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moneyTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  metaSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: palette.slate[100],
    borderRadius: radii.full,
    overflow: 'hidden',
    marginTop: spacing.base,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.teal[600],
    borderRadius: radii.full,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[100],
  },
  expenseName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  expenseDate: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.teal[600],
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: palette.teal[200],
  },
  profileName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  profileRole: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  profileBio: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[600],
    marginTop: spacing.base,
    lineHeight: typography.lineHeights.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    marginTop: spacing.base,
    paddingTop: spacing.base,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  statLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginTop: 2,
  },
});
