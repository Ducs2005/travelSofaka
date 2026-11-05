import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Button } from '@/presentation/components/common';
import { useTripStore } from '@/presentation/stores/tripStore';
import { useExpenseStore } from '@/presentation/stores/expenseStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const TripDetailsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { activeTrip } = useTripStore();
  const { expenses, totalBudget, totalSpent } = useExpenseStore();

  const handleShare = () => {
    Alert.alert('Chia sẻ chuyến đi', 'Đã sao chép liên kết chia sẻ lịch trình nhóm!');
  };

  const percentage = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Card Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' }}
            style={styles.heroImg}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroTopActions}>
              <TouchableOpacity
                style={styles.editPlanBtn}
                onPress={() => navigate('TRIP_PLANNER')}
              >
                <Text style={styles.editPlanText}>← Edit Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareText}>🔗 Share Trip</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.tripTitle}>{activeTrip?.title || 'Da Nang – Hoi An Summer Squad'}</Text>
              <Text style={styles.tripDates}>Oct 24 – Oct 26 • 4 Friends Joined</Text>
            </View>
          </View>
        </View>

        {/* Expense Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.metaLabel}>GROUP EXPENSE SUMMARY</Text>
              <Text style={styles.moneyTitle}>{totalSpent.toLocaleString()} VND</Text>
              <Text style={styles.metaSubtitle}>of {totalBudget.toLocaleString()} VND budget</Text>
            </View>
            <Button
              title="📷 Scan Receipt"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => navigate('RECEIPT_SCANNER')}
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>

          {/* Expenses List */}
          <View style={styles.expenseList}>
            {expenses.map((item) => (
              <View key={item.id} style={styles.expenseRow}>
                <Text style={styles.expenseName}>{item.merchantName}</Text>
                <Text style={styles.expenseAmount}>{item.amount.toLocaleString()} VND</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Daily Schedule Overview */}
        <Card style={styles.scheduleCard}>
          <Text style={styles.scheduleHeader}>Daily Schedule</Text>
          <Text style={styles.dayTagTeal}>DAY 1 • DA NANG</Text>
          <Text style={styles.scheduleDesc}>09:00 AM — My Khe Beach & Specialty Coffee</Text>
          <Text style={styles.dayTagCoral}>DAY 2 • HOI AN</Text>
          <Text style={styles.scheduleDesc}>07:00 PM — Ancient Town Lantern Boat</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  scroll: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  heroBanner: {
    height: 160,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: palette.slate[900],
  },
  heroImg: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: spacing.base,
    justifyContent: 'space-between',
  },
  heroTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editPlanBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  editPlanText: {
    color: palette.common.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  shareBtn: {
    backgroundColor: palette.teal[600],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  shareText: {
    color: palette.common.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  tripTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.common.white,
  },
  tripDates: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[200],
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: palette.common.white,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  moneyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  metaSubtitle: {
    fontSize: typography.fontSizes['2xs'],
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
  expenseList: {
    marginTop: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    paddingTop: spacing.base,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[800],
  },
  expenseAmount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.teal[600],
  },
  scheduleCard: {
    backgroundColor: palette.common.white,
  },
  scheduleHeader: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
    marginBottom: spacing.xs,
  },
  dayTagTeal: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[600],
    marginTop: spacing.xs,
  },
  dayTagCoral: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.coral[500],
    marginTop: spacing.sm,
  },
  scheduleDesc: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[700],
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
  },
});
