import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { palette, spacing } from '@/core/theme';
import { useAppNavigation } from './NavigationContext';
import { BottomTabBar } from './BottomTabBar';
import {
  MergedHomeFeedScreen,
  MergedTripDetailsExpenseScreen,
  MergedReceiptScannerScreen,
  MergedOCRExpenseReviewScreen,
} from '@/presentation/screens';
import {
  LoginScreen,
  ExploreScreen,
  DestinationDetailsScreen,
  TripPlannerScreen,
  CreatePostScreen,
  ProfileScreen,
} from '@/presentation/screens';

export const RootNavigator: React.FC = () => {
  const { currentScreen, navigate, goBack, switchTab } = useAppNavigation();

  // Determine whether to display the bottom tab bar
  const isTabBarVisible =
    currentScreen === 'EXPLORE' ||
    currentScreen === 'PROFILE';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN':
        return <LoginScreen />;
      case 'HOME':
        return <MergedHomeFeedScreen onViewActiveTrip={() => navigate('TRIP_DETAILS')} onNavTabPress={switchTab} />;
      case 'EXPLORE':
        return <ExploreScreen />;
      case 'DESTINATION_DETAILS':
        return <DestinationDetailsScreen />;
      case 'TRIP_PLANNER':
        return <TripPlannerScreen />;
      case 'TRIP_DETAILS':
        return <MergedTripDetailsExpenseScreen onEditPlan={() => navigate('TRIP_PLANNER')} onScanReceipt={() => navigate('RECEIPT_SCANNER')} onNavTabPress={switchTab} />;
      case 'RECEIPT_SCANNER':
        return <MergedReceiptScannerScreen onClose={goBack} onScanComplete={() => navigate('OCR_REVIEW')} />;
      case 'OCR_REVIEW':
        return <MergedOCRExpenseReviewScreen onRetake={() => navigate('RECEIPT_SCANNER')} onSaveSuccess={() => navigate('TRIP_DETAILS')} onNavTabPress={switchTab} />;
      case 'CREATE_POST':
        return <CreatePostScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <MergedHomeFeedScreen onViewActiveTrip={() => navigate('TRIP_DETAILS')} onNavTabPress={switchTab} />;
    }
  };

  // Screens with full-screen custom layout (like Receipt Scanner) don't need outer scroll padding
  const isFullScreenCustom = currentScreen === 'RECEIPT_SCANNER';
  const isEmbeddedNavigationScreen = currentScreen === 'HOME' || currentScreen === 'TRIP_DETAILS' || currentScreen === 'OCR_REVIEW';

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        {isFullScreenCustom ? (
          <View style={styles.fullScreenArea}>{renderScreen()}</View>
        ) : isEmbeddedNavigationScreen ? (
          <View style={styles.embeddedScreenArea}>{renderScreen()}</View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderScreen()}
          </ScrollView>
        )}
      </View>

      {/* Persistent Bottom Bar on main screens */}
      {isTabBarVisible && <BottomTabBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  screenArea: {
    flex: 1,
  },
  fullScreenArea: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: palette.slate[950],
  },
  embeddedScreenArea: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
});
