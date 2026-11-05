import { ITripRepository } from '@/domain/repositories/trip_repository';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';
import { TripLocalDataSource } from '../datasources/local/sqlite/TripLocalDataSource';

export class TripRepositoryImpl implements ITripRepository {
  constructor(private readonly localDataSource: TripLocalDataSource = new TripLocalDataSource()) {}

  async getActiveTrip(): Promise<TripPlan | null> {
    const localTrip = await this.localDataSource.getActiveTrip();
    if (localTrip) return localTrip;

    // Fallback seed data if SQLite is fresh
    const defaultTrip: TripPlan = {
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
      ],
    };

    await this.localDataSource.saveTrip(defaultTrip);
    return defaultTrip;
  }

  async getTrips(): Promise<TripPlan[]> {
    const active = await this.getActiveTrip();
    return active ? [active] : [];
  }

  async getTripById(id: string): Promise<TripPlan | null> {
    const active = await this.getActiveTrip();
    return active?.id === id ? active : null;
  }

  async createTrip(tripData: Omit<TripPlan, 'id' | 'createdAt' | 'isSynced'>): Promise<TripPlan> {
    const newTrip: TripPlan = {
      ...tripData,
      id: 'trip_' + Date.now(),
      createdAt: Date.now(),
      isSynced: false,
    };
    await this.localDataSource.saveTrip(newTrip);
    return newTrip;
  }

  async generateAIItinerary(
    destination: string,
    days: number,
    _budget: number,
    _preferences?: string
  ): Promise<Activity[]> {
    // LLM API simulation returning structured activities
    const generated: Activity[] = [];
    for (let day = 1; day <= days; day++) {
      generated.push(
        {
          id: `ai_act_${day}_1`,
          tripId: 'temp_trip',
          dayIndex: day,
          time: '08:30 AM',
          title: `Breakfast & Coffee at ${destination}`,
          locationName: destination,
          estimatedCost: 75000,
        },
        {
          id: `ai_act_${day}_2`,
          tripId: 'temp_trip',
          dayIndex: day,
          time: '02:00 PM',
          title: `Sightseeing & Exploration Day ${day}`,
          locationName: destination,
          estimatedCost: 200000,
        }
      );
    }
    return generated;
  }

  async saveActivities(tripId: string, activities: Activity[]): Promise<void> {
    const trip = await this.getActiveTrip();
    if (trip && trip.id === tripId) {
      trip.activities = [...trip.activities, ...activities];
      await this.localDataSource.saveTrip(trip);
    }
  }
}
