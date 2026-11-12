import { create } from 'zustand';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';
import { TripRepositoryImpl } from '@/data/repositories/TripRepositoryImpl';
import { GenerateAIItineraryUseCase } from '@/domain/usecases/trip/TripUseCases';
import { useAuthStore } from '@/presentation/stores/authStore';

const tripRepository = new TripRepositoryImpl();
const generateAIItinerary = new GenerateAIItineraryUseCase(tripRepository);

interface TripState {
  activeTrip: TripPlan | null;
  trips: TripPlan[];
  selectedDayIndex: number;
  isLoading: boolean;

  // Actions
  setActiveTrip: (trip: TripPlan | null) => void;
  setSelectedDayIndex: (index: number) => void;
  addActivity: (activity: Activity) => Promise<void>;
  updateActivity: (activity: Activity) => Promise<void>;
  removeActivity: (activityId: string) => Promise<void>;
  saveActiveTrip: () => Promise<void>;
  generateItinerary: (destination: string, days: number, budget: number, preferences: string, title?: string, startDate?: string) => Promise<void>;
  updateTrip: (updates: Partial<TripPlan>) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
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
  addActivity: async (activity) => {
    const trip = get().activeTrip;
    if (!trip) return;
    const savedTrip = await tripRepository.saveTrip({
      ...trip,
      activities: [...trip.activities, { ...activity, tripId: trip.id }],
    });
    set((state) => ({
      activeTrip: savedTrip,
      trips: [savedTrip, ...state.trips.filter((item) => item.id !== savedTrip.id)],
    }));
  },
  updateActivity: async (activity) => {
    const trip = get().activeTrip;
    if (!trip) return;
    const savedTrip = await tripRepository.saveTrip({
      ...trip,
      activities: trip.activities.map((item) => item.id === activity.id ? { ...activity, tripId: trip.id } : item),
    });
    set((state) => ({
      activeTrip: savedTrip,
      trips: [savedTrip, ...state.trips.filter((item) => item.id !== savedTrip.id)],
    }));
  },
  removeActivity: async (activityId) => {
    const trip = get().activeTrip;
    if (!trip) return;
    const savedTrip = await tripRepository.saveTrip({
      ...trip,
      activities: trip.activities.filter((item) => item.id !== activityId),
    });
    set((state) => ({
      activeTrip: savedTrip,
      trips: [savedTrip, ...state.trips.filter((item) => item.id !== savedTrip.id)],
    }));
  },
  saveActiveTrip: async () => {
    const trip = get().activeTrip;
    if (!trip) return;
    const savedTrip = await tripRepository.saveTrip(trip);
    set((state) => ({
      activeTrip: savedTrip,
      trips: [savedTrip, ...state.trips.filter((item) => item.id !== savedTrip.id)],
    }));
  },
  generateItinerary: async (destination, days, budget, preferences, title, startDate) => {
    set({ isLoading: true });
    try {
      const activities = await generateAIItinerary.execute(destination, days, budget, preferences);
      const currentTrip = get().activeTrip;
      const tripId = currentTrip?.id ?? `trip_${Date.now()}`;
      const currentUid = useAuthStore.getState().user?.uid ?? currentTrip?.creatorUid ?? 'user_duc_pham';
      const start = startDate ? new Date(startDate) : new Date();
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + days - 1);
      const trip: TripPlan = {
        id: tripId,
        creatorUid: currentUid,
        title: title?.trim() || `${days}-day trip to ${destination}`,
        destinations: [destination],
        startDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        budgetTotal: budget,
        spentTotal: currentTrip?.spentTotal ?? 0,
        joinedMemberUids: Array.from(new Set([...(currentTrip?.joinedMemberUids ?? []), currentUid])),
        activities: activities.map((activity) => ({ ...activity, tripId })),
        isActive: true,
        isSynced: false,
        createdAt: currentTrip?.createdAt ?? Date.now(),
      };
      const savedTrip = await tripRepository.saveTrip(trip);
      set((state) => ({
        activeTrip: savedTrip,
        trips: [savedTrip, ...state.trips.filter((item) => item.id !== savedTrip.id)],
        selectedDayIndex: 1,
      }));
    } finally {
      set({ isLoading: false });
    }
  },
  updateTrip: (updates) => set((state) => state.activeTrip ? { activeTrip: { ...state.activeTrip, ...updates } } : state),
}));
