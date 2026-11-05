import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { palette, spacing } from '@/core/theme';
import { useAppNavigation } from './NavigationContext';
import { BottomTabBar } from './BottomTabBar';
import {
  LoginScreen,
  HomeScreen,
  ExploreScreen,
  DestinationDetailsScreen,
  TripPlannerScreen,
  TripDetailsScreen,
  ReceiptScannerScreen,
  OCRReviewScreen,
  CreatePostScreen,
  ProfileScreen,
} from '@/presentation/screens';

export const RootNavigator: React.FC = () => {
  const { currentScreen } = useAppNavigation();

  // Determine whether to display the bottom tab bar
  const isTabBarVisible =
    currentScreen === 'HOME' ||
    currentScreen === 'EXPLORE' ||
    currentScreen === 'TRIP_DETAILS' ||
    currentScreen === 'PROFILE';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN':
        return <LoginScreen />;
      case 'HOME':
        return <HomeScreen />;
      case 'EXPLORE':
        return <ExploreScreen />;
      case 'DESTINATION_DETAILS':
        return <DestinationDetailsScreen />;
      case 'TRIP_PLANNER':
        return <TripPlannerScreen />;
      case 'TRIP_DETAILS':
        return <TripDetailsScreen />;
      case 'RECEIPT_SCANNER':
        return <ReceiptScannerScreen />;
      case 'OCR_REVIEW':
        return <OCRReviewScreen />;
      case 'CREATE_POST':
        return <CreatePostScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Screens with full-screen custom layout (like Receipt Scanner) don't need outer scroll padding
  const isFullScreenCustom = currentScreen === 'RECEIPT_SCANNER';

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        {isFullScreenCustom ? (
          <View style={styles.fullScreenArea}>{renderScreen()}</View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
});
