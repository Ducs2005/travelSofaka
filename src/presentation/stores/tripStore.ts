import { create } from 'zustand';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';

interface TripState {
  activeTrip: TripPlan | null;
  trips: TripPlan[];
  selectedDayIndex: number;
  isLoading: boolean;

  // Actions
  setActiveTrip: (trip: TripPlan | null) => void;
  setSelectedDayIndex: (index: number) => void;
  addActivity: (activity: Activity) => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: {
    id: 'trip_danang_hoian_01',
    creatorUid: 'user_viet_tran',
    title: 'Da Nang – Hoi An Summer Squad',
    destinations: ['Da Nang', 'Hoi An'],
    startDate: 'Oct 24, 2026',
    endDate: 'Oct 26, 2026',
    budgetTotal: 6000000,
    spentTotal: 2635000,
    joinedMemberUids: ['user_viet_tran', 'user_duc_pham', 'user_tu_le', 'user_lam_nguyen'],
    isActive: true,
    isSynced: true,
    createdAt: Date.now(),
    activities: [
      {
        id: 'act_1',
        tripId: 'trip_danang_hoian_01',
        dayIndex: 1,
        time: '09:00 AM',
        title: 'Arrive in Da Nang & Beach Coffee',
        locationName: 'My Khe Beach',
        estimatedCost: 150000,
      },
      {
        id: 'act_2',
        tripId: 'trip_danang_hoian_01',
        dayIndex: 1,
        time: '04:30 PM',
        title: 'Son Tra Peninsula Scooter Ride',
        locationName: 'Son Tra',
        estimatedCost: 120000,
      },
      {
        id: 'act_3',
        tripId: 'trip_danang_hoian_01',
        dayIndex: 1,
        time: '07:30 PM',
        title: 'Helio Night Market Seafood',
        locationName: 'Helio Center',
        estimatedCost: 350000,
      },
      {
        id: 'act_4',
        tripId: 'trip_danang_hoian_01',
        dayIndex: 2,
        time: '07:00 PM',
        title: 'Ancient Town Lantern Boat',
        locationName: 'Hoi An',
        estimatedCost: 200000,
      },
    ],
  },
  trips: [],
  selectedDayIndex: 1,
  isLoading: false,

  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
  addActivity: (activity) =>
    set((state) => {
      if (!state.activeTrip) return state;
      return {
        activeTrip: {
          ...state.activeTrip,
          activities: [...state.activeTrip.activities, activity],
        },
      };
    }),
}));
