import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button, Input } from '@/presentation/components/common';
import { useTripStore } from '@/presentation/stores/tripStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';
import { Activity } from '@/domain/entities/activity';

export const TripPlannerScreen: React.FC = () => {
  const { goBack, navigate, params } = useAppNavigation();
  const { activeTrip, selectedDayIndex, setSelectedDayIndex, addActivity, updateActivity, removeActivity, saveActiveTrip, generateItinerary, isLoading, updateTrip } = useTripStore();
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [tripTitle, setTripTitle] = useState(params.destinationTitle ? `${params.destinationTitle} Summer Squad` : activeTrip?.title ?? 'Da Nang – Hoi An Summer Squad');
  const [destination, setDestination] = useState(params.destinationTitle ?? activeTrip?.destinations.join(', ') ?? 'Da Nang');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState(String(activeTrip?.budgetTotal ?? 3000000));
  const [startDate, setStartDate] = useState(activeTrip?.startDate ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const [preferences, setPreferences] = useState('Ẩm thực địa phương, văn hóa và thiên nhiên');
  const [plannerError, setPlannerError] = useState('');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingActivityTitle, setEditingActivityTitle] = useState('');

  const handleAddActivity = async () => {
    if (!newActivityTitle.trim() || !activeTrip) return;
    try {
      await addActivity({
        id: 'act_' + Date.now(),
        tripId: activeTrip.id,
        dayIndex: selectedDayIndex,
        time: '10:00 AM',
        title: newActivityTitle.trim(),
        locationName: activeTrip.destinations[0],
        estimatedCost: 100000,
        isCompleted: false,
      });
      setNewActivityTitle('');
    } catch {
      Alert.alert('Lưu chưa thành công', 'Không thể lưu hoạt động vào chuyến đi.');
    }
  };

  const handleSaveTrip = async () => {
    const dayCount = Number(days);
    const parsedStartDate = new Date(startDate);
    if (!tripTitle.trim() || !destination.trim() || !Number(budget.replace(/[\s,]/g, '')) || !Number.isInteger(dayCount) || dayCount < 1 || dayCount > 14 || Number.isNaN(parsedStartDate.getTime())) {
      Alert.alert('Thiếu thông tin', 'Kiểm tra tên chuyến đi, điểm đến, ngày khởi hành, số ngày và ngân sách.');
      return;
    }
    const parsedEndDate = new Date(parsedStartDate);
    parsedEndDate.setDate(parsedEndDate.getDate() + dayCount - 1);
    updateTrip({
      title: tripTitle.trim(),
      destinations: destination.split(',').map((item: string) => item.trim()).filter(Boolean),
      budgetTotal: Number(budget.replace(/[\s,]/g, '')),
      startDate: parsedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: parsedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    try {
      await saveActiveTrip();
      Alert.alert('Đã lưu', 'Chuyến đi đã được lưu trên thiết bị và đồng bộ nếu có mạng.');
    } catch {
      Alert.alert('Lưu chưa thành công', 'Không thể lưu chuyến đi vào bộ nhớ thiết bị.');
    }
  };

  const handleGenerateItinerary = async () => {
    const dayCount = Number(days);
    const budgetAmount = Number(budget.replace(/[\s,]/g, ''));
    if (!tripTitle.trim() || !destination.trim() || !Number.isInteger(dayCount) || dayCount < 1 || dayCount > 14 || budgetAmount <= 0 || Number.isNaN(new Date(startDate).getTime())) {
      setPlannerError('Nhập tên chuyến đi, điểm đến, ngày khởi hành hợp lệ, 1–14 ngày và ngân sách lớn hơn 0.');
      return;
    }
    setPlannerError('');
    try {
      await generateItinerary(destination.trim().split(',')[0], dayCount, budgetAmount, preferences, tripTitle.trim(), startDate);
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : 'Không thể tạo lịch trình. Vui lòng thử lại.');
    }
  };

  const handleEditActivity = async (activity: Activity) => {
    if (editingActivityId === activity.id) {
      if (!editingActivityTitle.trim()) return;
      try {
        await updateActivity({ ...activity, title: editingActivityTitle.trim() });
        setEditingActivityId(null);
        setEditingActivityTitle('');
      } catch {
        Alert.alert('Lưu chưa thành công', 'Không thể cập nhật hoạt động.');
      }
      return;
    }
    setEditingActivityId(activity.id);
    setEditingActivityTitle(activity.title);
  };

  const visibleDayCount = Math.max(
    Math.min(Number(days) || 1, 14),
    ...(activeTrip?.activities ?? []).map((activity) => activity.dayIndex),
    1,
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planner</Text>
        <TouchableOpacity onPress={handleSaveTrip}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Trip Meta Card */}
        <Card style={styles.metaCard}>
          <Input label="TRIP TITLE" value={tripTitle} onChangeText={setTripTitle} placeholder="Summer trip" />
          <Input label="DESTINATIONS (separate with commas)" value={destination} onChangeText={setDestination} placeholder="Da Nang, Hoi An" />
          <Input label="START DATE" value={startDate} onChangeText={setStartDate} placeholder="Nov 12, 2026" />

          <View style={styles.rowGrid}>
            <View style={styles.gridBox}>
              <Input label="DAYS" value={days} onChangeText={setDays} keyboardType="number-pad" containerStyle={{ marginBottom: 0 }} />
            </View>
            <View style={styles.gridBox}><Input label="BUDGET (VND)" value={budget} onChangeText={setBudget} keyboardType="number-pad" containerStyle={{ marginBottom: 0 }} /></View>
          </View>

          <Input label="PREFERENCES" value={preferences} onChangeText={setPreferences} multiline placeholder="Ẩm thực, thiên nhiên..." />
          <Button title={isLoading ? 'Đang tạo lịch trình…' : '✨ Generate itinerary with AI'} variant="primary" isLoading={isLoading} onPress={handleGenerateItinerary} />
          {plannerError ? <Text style={styles.errorText}>{plannerError}</Text> : <Text style={styles.helperText}>Cần EXPO_PUBLIC_GEMINI_API_KEY để gọi Gemini.</Text>}

          <View style={styles.badgeRow}>
            {(activeTrip?.destinations ?? []).map((item) => <Badge key={item} label={`📍 ${item}`} variant="teal" />)}
          </View>
        </Card>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {Array.from({ length: visibleDayCount }, (_, index) => index + 1).map((day) => (
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
        <Card style={styles.activitiesCard}>
          <Text style={styles.sectionTitle}>Daily Schedule (Day {selectedDayIndex})</Text>
          {(activeTrip?.activities ?? [])
            .filter((a) => a.dayIndex === selectedDayIndex)
            .map((act) => (
              <View key={act.id} style={styles.activityItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTime}>{act.time} · {act.locationName ?? destination}</Text>
                  {editingActivityId === act.id ? <Input value={editingActivityTitle} onChangeText={setEditingActivityTitle} containerStyle={{ marginTop: spacing.xs, marginBottom: 0 }} /> : <Text style={styles.activityTitle}>{act.title}</Text>}
                  {typeof act.estimatedCost === 'number' && <Text style={styles.activityCost}>{act.estimatedCost.toLocaleString()} VND</Text>}
                </View>
                <View style={styles.activityActions}>
                  <TouchableOpacity onPress={() => void handleEditActivity(act)}><Text style={styles.activityAction}>{editingActivityId === act.id ? 'Save' : 'Edit'}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={async () => {
                    try {
                      await removeActivity(act.id);
                    } catch {
                      Alert.alert('Xóa chưa thành công', 'Không thể xóa hoạt động.');
                    }
                  }}><Text style={styles.removeAction}>Remove</Text></TouchableOpacity>
                </View>
              </View>
            ))}

          <Input
            placeholder="Thêm hoạt động mới vào Day..."
            value={newActivityTitle}
            onChangeText={setNewActivityTitle}
            containerStyle={{ marginTop: spacing.md }}
          />
          <Button
            title="+ Add Activity to Day"
            variant="outline"
            size="sm"
            onPress={handleAddActivity}
          />
        </Card>

        {/* Big Dashboard Button */}
        <Button
          title="Open Trip Itinerary Dashboard →"
          variant="secondary"
          size="lg"
          onPress={() => navigate('TRIP_DETAILS')}
          style={{ marginTop: spacing.base }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.common.white,
    padding: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.slate[100],
  },
  backBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
  },
  headerTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  saveBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[600],
  },
  errorText: {
    color: palette.rose[500],
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  helperText: {
    color: palette.slate[500],
    fontSize: typography.fontSizes['2xs'],
    marginTop: spacing.xs,
  },
  scroll: {
    gap: spacing.base,
  },
  metaCard: {
    backgroundColor: palette.common.white,
  },
  rowGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  gridBox: {
    flex: 1,
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    padding: spacing.base,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  activitiesCard: {
    backgroundColor: palette.common.white,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
    marginBottom: spacing.base,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  activityCost: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[500],
    marginTop: spacing.xs,
  },
  activityActions: {
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  activityAction: {
    color: palette.teal[700],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  removeAction: {
    color: palette.rose[500],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
});
