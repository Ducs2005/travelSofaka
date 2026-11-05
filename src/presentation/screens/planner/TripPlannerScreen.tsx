import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button, Input } from '@/presentation/components/common';
import { useTripStore } from '@/presentation/stores/tripStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const TripPlannerScreen: React.FC = () => {
  const { goBack, navigate, params } = useAppNavigation();
  const { activeTrip, selectedDayIndex, setSelectedDayIndex, addActivity } = useTripStore();
  const [newActivityTitle, setNewActivityTitle] = useState('');

  const initialTitle = params.destinationTitle
    ? `${params.destinationTitle} Summer Squad`
    : activeTrip?.title || 'Da Nang – Hoi An Summer Squad';

  const handleAddActivity = () => {
    if (!newActivityTitle || !activeTrip) return;
    addActivity({
      id: 'act_' + Date.now(),
      tripId: activeTrip.id,
      dayIndex: selectedDayIndex,
      time: '10:00 AM',
      title: newActivityTitle,
      locationName: activeTrip.destinations[0],
      estimatedCost: 100000,
      isCompleted: false,
    });
    setNewActivityTitle('');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planner</Text>
        <TouchableOpacity onPress={() => navigate('TRIP_DETAILS')}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Trip Meta Card */}
        <Card style={styles.metaCard}>
          <Text style={styles.inputLabel}>TRIP TITLE</Text>
          <View style={styles.mockInput}>
            <Text style={styles.mockInputText}>{initialTitle}</Text>
          </View>

          <View style={styles.rowGrid}>
            <View style={styles.gridBox}>
              <Text style={styles.boxText}>📅 Oct 24 – Oct 26</Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={[styles.boxText, { color: palette.teal[600], fontWeight: 'bold' }]}>
                💰 6,000,000 VND
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <Badge label="📍 Da Nang" variant="teal" />
            <Badge label="📍 Hoi An" variant="teal" />
          </View>
        </Card>

        {/* Day Selector */}
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
        <Card style={styles.activitiesCard}>
          <Text style={styles.sectionTitle}>Daily Schedule (Day {selectedDayIndex})</Text>
          {activeTrip?.activities
            .filter((a) => a.dayIndex === selectedDayIndex)
            .map((act) => (
              <View key={act.id} style={styles.activityItem}>
                <Text style={styles.activityTime}>{act.time}</Text>
                <Text style={styles.activityTitle}>{act.title}</Text>
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
  scroll: {
    gap: spacing.base,
  },
  metaCard: {
    backgroundColor: palette.common.white,
  },
  inputLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  mockInput: {
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  mockInputText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[800],
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
  boxText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[700],
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
});
