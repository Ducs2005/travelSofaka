import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';
import {
  CalendarIcon,
  WalletIcon,
  PinIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { useTripStore } from '@/presentation/stores/tripStore';

interface TripPlannerScreenProps {
  onBack?: () => void;
  onOpenDashboard?: () => void;
  onNavTabPress?: (tab: BottomNavTab) => void;
}

export const TripPlannerScreen: React.FC<TripPlannerScreenProps> = ({
  onBack,
  onOpenDashboard,
  onNavTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const { activeTrip, selectedDayIndex, setSelectedDayIndex } = useTripStore();

  const [tripTitle, setTripTitle] = useState(
    activeTrip?.title || 'Da Nang – Hoi An Summer Squad'
  );
  const [activitiesByDay, setActivitiesByDay] = useState<Record<number, string[]>>({
    1: [
      '09:00 AM — Arrive in Da Nang & Beach Coffee',
      '04:30 PM — Son Tra Peninsula Scooter Ride',
      '07:30 PM — Helio Night Market Seafood',
    ],
    2: [
      '08:30 AM — An Bang Beach & Breakfast',
      '02:00 PM — Hoi An Ancient Town Walking Tour',
      '07:00 PM — Ancient Town Lantern Boat on Hoai River',
    ],
    3: [
      '09:00 AM — Ba Na Hills Golden Bridge',
      '03:30 PM — Han Market Souvenirs & Speciality',
      '06:00 PM — Airport Departure',
    ],
  });

  const currentActivities = activitiesByDay[selectedDayIndex] || [];

  const handleAddActivity = () => {
    Alert.prompt
      ? Alert.prompt(
          `Thêm hoạt động Day ${selectedDayIndex}`,
          'Nhập giờ và nội dung (VD: 10:00 AM — Check-in Ngũ Hành Sơn)',
          (text) => {
            if (text && text.trim()) {
              setActivitiesByDay({
                ...activitiesByDay,
                [selectedDayIndex]: [...currentActivities, text.trim()],
              });
            }
          }
        )
      : Alert.alert(
          'Thêm hoạt động',
          `Đã thêm hoạt động mẫu vào Day ${selectedDayIndex}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setActivitiesByDay({
                  ...activitiesByDay,
                  [selectedDayIndex]: [
                    ...currentActivities,
                    '10:30 AM — Check-in Ngũ Hành Sơn & Marble Mountains',
                  ],
                });
              },
            },
          ]
        );
  };

  const handleSave = () => {
    Alert.alert('Thành công', 'Đã lưu kế hoạch chuyến đi!');
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* TOP HEADER WITH SAFE NOTCH INSET */}
        <View style={[styles.topHeader, { paddingTop: topInset + 6 }]}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Trip Planner</Text>

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* CARD 1: TRIP META */}
          <View style={styles.cardContainer}>
            <Text style={styles.fieldLabel}>TRIP TITLE</Text>
            <TextInput
              style={styles.tripTitleInput}
              value={tripTitle}
              onChangeText={setTripTitle}
              placeholder="Nhập tên chuyến đi"
              placeholderTextColor="#94A3B8"
            />

            {/* DATES & BUDGET ROW */}
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <CalendarIcon size={14} color="#64748B" />
                <Text style={styles.metaPillText}>
                  {activeTrip?.startDate || 'Oct 24'} –{' '}
                  {activeTrip?.endDate || 'Oct 26'}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <WalletIcon size={14} color="#0D9488" />
                <Text style={styles.metaPillText}>
                  <Text style={styles.budgetAmountText}>
                    {activeTrip?.budgetTotal.toLocaleString() || '6,000,000'} VND
                  </Text>
                </Text>
              </View>
            </View>

            {/* DESTINATIONS ROW */}
            <View style={styles.destinationRow}>
              <View style={styles.destBadge}>
                <PinIcon size={12} color="#0F766E" />
                <Text style={styles.destBadgeText}>Da Nang</Text>
              </View>
              <View style={styles.destBadge}>
                <PinIcon size={12} color="#0F766E" />
                <Text style={styles.destBadgeText}>Hoi An</Text>
              </View>
            </View>
          </View>

          {/* CARD 2: DAILY SCHEDULE TABS & ACTIVITIES */}
          <View style={styles.cardContainer}>
            {/* DAY SELECTOR TABS */}
            <View style={styles.dayTabsRow}>
              {[1, 2, 3].map((day) => {
                const isActive = selectedDayIndex === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayTabBtn,
                      isActive ? styles.dayTabBtnActive : styles.dayTabBtnInactive,
                    ]}
                    onPress={() => setSelectedDayIndex(day)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayTabBtnText,
                        isActive
                          ? styles.dayTabBtnTextActive
                          : styles.dayTabBtnTextInactive,
                      ]}
                    >
                      Day {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ACTIVITY LIST */}
            <View style={styles.activityList}>
              {currentActivities.map((act, idx) => (
                <View key={idx} style={styles.activityCard}>
                  <Text style={styles.activityText}>{act}</Text>
                </View>
              ))}

              {/* DASHED ADD ACTIVITY BUTTON */}
              <TouchableOpacity
                style={styles.dashedAddBtn}
                onPress={handleAddActivity}
                activeOpacity={0.7}
              >
                <Text style={styles.dashedAddText}>
                  + Add Activity to Day {selectedDayIndex}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BIG SALMON/CORAL ACTION BUTTON */}
          <TouchableOpacity
            style={styles.coralDashboardBtn}
            onPress={onOpenDashboard}
            activeOpacity={0.85}
          >
            <Text style={styles.coralDashboardBtnText}>
              Open Trip Itinerary Dashboard →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR WITH ICONS */}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveBtn: {
    paddingVertical: 4,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488', // Teal
  },
  contentPadding: {
    padding: 16,
    gap: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    ...shadows.sm,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tripTitleInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  budgetAmountText: {
    color: '#0D9488',
    fontWeight: '800',
  },
  destinationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  destBadge: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  dayTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabBtnActive: {
    backgroundColor: '#0D9488', // Teal 600
  },
  dayTabBtnInactive: {
    backgroundColor: '#F1F5F9',
  },
  dayTabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  dayTabBtnTextActive: {
    color: palette.common.white,
  },
  dayTabBtnTextInactive: {
    color: '#475569',
  },
  activityList: {
    gap: 10,
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityText: {
    fontSize: 12.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  dashedAddBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    marginTop: 4,
  },
  dashedAddText: {
    color: '#0D9488',
    fontSize: 12.5,
    fontWeight: '700',
  },
  coralDashboardBtn: {
    backgroundColor: '#FF6B6B', // Exact salmon/coral
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  coralDashboardBtnText: {
    color: palette.common.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
