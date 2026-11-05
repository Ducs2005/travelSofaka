export type ScreenName =
  | 'LOGIN'               // 01. Login / Sign Up
  | 'HOME'                // 02. Home Feed
  | 'EXPLORE'             // 03. Explore Destinations
  | 'DESTINATION_DETAILS' // 04. Destination Details
  | 'TRIP_PLANNER'        // 05. Trip Planner
  | 'TRIP_DETAILS'        // 06. Trip Details & Expense Summary
  | 'RECEIPT_SCANNER'     // 07. Receipt Scanner (AI OCR)
  | 'OCR_REVIEW'          // 08. OCR Expense Review
  | 'CREATE_POST'         // 09. Create Travel Post
  | 'PROFILE';            // 10. User Profile

export type TabName = 'home' | 'explore' | 'trips' | 'profile';

export interface RouteState {
  name: ScreenName;
  params?: Record<string, any>;
}

export interface NavigationContextType {
  currentScreen: ScreenName;
  params: Record<string, any>;
  activeTab: TabName;
  canGoBack: boolean;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  goBack: () => void;
  switchTab: (tab: TabName) => void;
}
