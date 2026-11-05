import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { palette, typography, radii, spacing } from '@/core/theme';
import { ScreenContainer, Badge } from '@/presentation/components/common';
import { NavigationProvider, useAppNavigation } from '@/presentation/navigation/NavigationContext';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { ScreenName } from '@/presentation/navigation/types';

const MainShell: React.FC = () => {
  const { currentScreen, navigate, canGoBack, goBack } = useAppNavigation();

  const allScreens: { id: ScreenName; label: string }[] = [
    { id: 'LOGIN', label: '01. Login' },
    { id: 'HOME', label: '02. Feed' },
    { id: 'EXPLORE', label: '03. Explore' },
    { id: 'DESTINATION_DETAILS', label: '04. Details' },
    { id: 'TRIP_PLANNER', label: '05. Planner' },
    { id: 'TRIP_DETAILS', label: '06. Trip' },
    { id: 'RECEIPT_SCANNER', label: '07. OCR' },
    { id: 'OCR_REVIEW', label: '08. Review' },
    { id: 'CREATE_POST', label: '09. Post' },
    { id: 'PROFILE', label: '10. Profile' },
  ];

  return (
    <View style={styles.shell}>
      {/* Top Test Bar / Route Switcher */}
      <View style={styles.topControlBar}>
        <View style={styles.topMetaRow}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>TripMate</Text>
              <Text style={styles.activeScreenIndicator}>
                Screen: <Text style={{ color: palette.teal[400], fontWeight: 'bold' }}>{currentScreen}</Text>
              </Text>
            </View>
          </View>
          {canGoBack && (
            <TouchableOpacity style={styles.goBackPill} onPress={goBack}>
              <Text style={styles.goBackText}>⮌ Go Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick jump tabs across all 10 screens */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickNavScroll}
        >
          {allScreens.map((s) => {
            const isActive = currentScreen === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.quickNavBtn, isActive && styles.quickNavBtnActive]}
                onPress={() => navigate(s.id)}
              >
                <Text style={[styles.quickNavText, isActive && styles.quickNavTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Screen Router */}
      <View style={styles.screenContainer}>
        <RootNavigator />
      </View>
    </View>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <ScreenContainer backgroundColor={palette.slate[900]} isDark>
        <StatusBar style="light" />
        <MainShell />
      </ScreenContainer>
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: palette.slate[900],
  },
  topControlBar: {
    backgroundColor: palette.slate[900],
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[800],
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.extrabold,
    fontSize: typography.fontSizes.sm,
  },
  brandTitle: {
    color: palette.common.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
  },
  activeScreenIndicator: {
    color: palette.slate[400],
    fontSize: 10,
  },
  goBackPill: {
    backgroundColor: palette.slate[800],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: palette.slate[700],
  },
  goBackText: {
    color: palette.slate[300],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  quickNavScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
    paddingTop: 4,
  },
  quickNavBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: palette.slate[800],
  },
  quickNavBtnActive: {
    backgroundColor: palette.teal[600],
  },
  quickNavText: {
    fontSize: 10,
    color: palette.slate[400],
    fontWeight: typography.fontWeights.semibold,
  },
  quickNavTextActive: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
  },
  screenContainer: {
    flex: 1,
  },
});
