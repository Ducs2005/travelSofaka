import { ITripRepository } from '@/domain/repositories/trip_repository';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';
import { TripLocalDataSource } from '../datasources/local/sqlite/TripLocalDataSource';
import { SyncQueueLocalDataSource } from '../datasources/local/sqlite/SyncQueueLocalDataSource';
import { TripRemoteDataSource } from '../datasources/remote/firestore/TripRemoteDataSource';
import { isConnectivityError } from '../datasources/remote/firestore/firestoreError';
import { generateGeminiItinerary } from '../datasources/remote/ai/gemini_itinerary';

const remote = new TripRemoteDataSource();

export class TripRepositoryImpl implements ITripRepository {
  constructor(
    private readonly localDataSource: TripLocalDataSource = new TripLocalDataSource(),
    private readonly syncQueue: SyncQueueLocalDataSource = new SyncQueueLocalDataSource()
  ) {}

  async getActiveTrip(): Promise<TripPlan | null> {
    // Thử lấy từ local trước (offline-first)
    const localTrip = await this.localDataSource.getActiveTrip();
    if (localTrip) return localTrip;

    // Fallback seed data nếu chưa có gì
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
      isSynced: false,
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

  async getTrips(uid: string): Promise<TripPlan[]> {
    try {
      const remoteTrips = await remote.getTrips(uid);
      if (remoteTrips.length > 0) return remoteTrips;
    } catch (_e) {
      // offline fallback
    }
    const active = await this.getActiveTrip();
    return active ? [active] : [];
  }

  async getTripById(id: string): Promise<TripPlan | null> {
    try {
      return await remote.getTripById(id);
    } catch (_e) {
      const active = await this.getActiveTrip();
      return active?.id === id ? active : null;
    }
  }

  async createTrip(tripData: Omit<TripPlan, 'id' | 'createdAt' | 'isSynced'>): Promise<TripPlan> {
    try {
      const created = await remote.createTrip(tripData);
      await this.localDataSource.saveTrip(created);
      return created;
    } catch (error) {
      // Offline: tạo local trước
      const newTrip: TripPlan = {
        ...tripData,
        id: 'trip_' + Date.now(),
        createdAt: Date.now(),
        isSynced: false,
      };
      await this.localDataSource.saveTrip(newTrip);

      // OFF-03: xếp vào sync_queue để Sync Engine đẩy lên Firestore khi có mạng lại
      if (isConnectivityError(error)) {
        await this.syncQueue.enqueue('trips', 'INSERT', newTrip);
      }
      return newTrip;
    }
  }

  async generateAIItinerary(
    destination: string,
    days: number,
    budget: number,
    preferences?: string
  ): Promise<Activity[]> {
    return generateGeminiItinerary(destination, days, budget, preferences ?? '');
  }

  async saveTrip(trip: TripPlan): Promise<TripPlan> {
    try {
      const syncedTrip = { ...trip, isSynced: true };
      await remote.upsertTrip(syncedTrip);
      await this.localDataSource.saveTrip(syncedTrip);
      return syncedTrip;
    } catch (error) {
      const localTrip = { ...trip, isSynced: false };
      await this.localDataSource.saveTrip(localTrip);

      // OFF-03: xếp bản cập nhật chuyến đi vào sync_queue (Last-Write-Wins theo createdAt)
      if (isConnectivityError(error)) {
        await this.syncQueue.enqueue('trips', 'UPDATE', localTrip);
      }
      return localTrip;
    }
  }

  async saveActivities(tripId: string, activities: Activity[]): Promise<void> {
    const trip = await this.getActiveTrip();
    if (trip && trip.id === tripId) {
      trip.activities = [...trip.activities, ...activities];
      await this.saveTrip(trip);
    }
  }
}
