import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';
import {
  ReceiptIcon,
  HomeIcon,
  MotorbikeIcon,
  TicketIcon,
  ShareIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { useExpenseStore } from '@/presentation/stores/expenseStore';

interface TripDetailsExpenseScreenProps {
  onScanReceipt?: () => void;
  onEditPlan?: () => void;
  onNavTabPress?: (tab: BottomNavTab) => void;
}

export const TripDetailsExpenseScreen: React.FC<TripDetailsExpenseScreenProps> = ({
  onScanReceipt,
  onEditPlan,
  onNavTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const {
    expenses,
    totalBudget,
    totalSpent,
    budgetUsagePercentage,
    budgetStatusColor,
  } = useExpenseStore();

  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShareTrip = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
    Alert.alert(
      'Liên kết chuyến đi',
      'Đã sao chép liên kết chuyến đi: https://trip.travelsofaka.app/danang-hoian\nBạn bè có thể xem và tham gia chia bill.',
      [{ text: 'Đóng' }]
    );
  };

  const renderMonochromeCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return <ReceiptIcon size={16} color="#0D9488" />;
      case 'HOMESTAY':
      case 'ACCOMMODATION':
        return <HomeIcon size={16} color="#64748B" />;
      case 'TRANSPORT':
        return <MotorbikeIcon size={16} color="#64748B" />;
      case 'ENTERTAINMENT':
        return <TicketIcon size={16} color="#64748B" />;
      default:
        return <ReceiptIcon size={16} color="#64748B" />;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE HEADER (Supports Notch / Dynamic Island Safe Insets) */}
        <View style={[styles.heroContainer, { height: 180 + topInset }]}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient}>
            {/* Top Action Pills padded safely below the camera / notch */}
            <View style={[styles.heroTopActions, { paddingTop: topInset + 4 }]}>
              <TouchableOpacity
                style={styles.blurPillBtn}
                onPress={onEditPlan}
                activeOpacity={0.8}
              >
                <Text style={styles.blurPillText}>← Edit Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tealPillBtn}
                onPress={handleShareTrip}
                activeOpacity={0.8}
              >
                <ShareIcon size={13} color="#FFFFFF" />
                <Text style={styles.tealPillText}>
                  {shareSuccess ? 'Copied' : 'Share Trip'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title & Metadata on Image */}
            <View style={styles.heroBottomContent}>
              <Text style={styles.heroTitle}>Da Nang – Hoi An Summer Squad</Text>
              <Text style={styles.heroSubtitle}>
                Oct 24 – Oct 26 • 4 Friends Joined
              </Text>
            </View>
          </View>
        </View>

        {/* BODY CARDS */}
        <View style={styles.contentPadding}>
          {/* CARD 1: GROUP EXPENSE SUMMARY */}
          <View style={styles.card}>
            <View style={styles.summaryTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.overlineLabel}>GROUP EXPENSE SUMMARY</Text>
                <Text style={styles.spentAmountText}>
                  {totalSpent.toLocaleString()} VND
                </Text>
                <Text style={styles.budgetText}>
                  of {totalBudget.toLocaleString()} VND budget
                </Text>
              </View>

              <TouchableOpacity
                style={styles.coralScanBtn}
                onPress={onScanReceipt}
                activeOpacity={0.85}
              >
                <Text style={styles.coralScanBtnText}>Scan Receipt</Text>
              </TouchableOpacity>
            </View>

            {/* Thin Sleek Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.max(4, budgetUsagePercentage))}%`,
                    backgroundColor: budgetStatusColor || '#0D9488',
                  },
                ]}
              />
            </View>

            {/* Recent Expenses List with Clean Monochrome Icons */}
            <View style={styles.expensesList}>
              {expenses.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.expenseItemRow}>
                  <View style={styles.expenseLeft}>
                    {renderMonochromeCategoryIcon(item.category)}
                    <Text style={styles.expenseNameText}>
                      {item.merchantName}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.expenseAmountText,
                      item.isFromOCR && styles.ocrAmountHighlight,
                    ]}
                  >
                    {item.amount.toLocaleString()} VND
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CARD 2: DAILY SCHEDULE */}
          <View style={styles.card}>
            <Text style={styles.dailyScheduleTitle}>Daily Schedule</Text>

            <View style={styles.scheduleSection}>
              <Text style={styles.dayHeaderTeal}>DAY 1 • DA NANG</Text>
              <Text style={styles.activityDesc}>
                09:00 AM — My Khe Beach & Specialty Coffee
              </Text>
            </View>

            <View style={styles.scheduleSection}>
              <Text style={styles.dayHeaderCoral}>DAY 2 • HOI AN</Text>
              <Text style={styles.activityDesc}>
                07:00 PM — Ancient Town Lantern Boat
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR WITH ACTIVE TRIPS */}
      <BottomNavBar activeTab="trips" onTabPress={onNavTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  scrollArea: {
    flex: 1,
  },
  heroContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'space-between',
    padding: 16,
  },
  heroTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  blurPillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  blurPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tealPillBtn: {
    backgroundColor: '#0D9488', // Teal
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...shadows.sm,
  },
  tealPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroBottomContent: {
    paddingBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  contentPadding: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    ...shadows.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overlineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  spentAmountText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  budgetText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  coralScanBtn: {
    backgroundColor: '#FF6B6B', // Exact Coral
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    ...shadows.sm,
  },
  coralScanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  expensesList: {
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  expenseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  expenseNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  expenseAmountText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  ocrAmountHighlight: {
    color: '#0D9488', // Teal highlight like screenshot
  },
  dailyScheduleTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleSection: {
    gap: 3,
  },
  dayHeaderTeal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  dayHeaderCoral: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B6B',
    letterSpacing: 0.5,
  },
  activityDesc: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
});
