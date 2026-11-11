import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase/firebaseConfig';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';

function timestampToMs(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

export class TripRemoteDataSource {
  private col = collection(db, 'trips');

  async getTrips(uid: string): Promise<TripPlan[]> {
    const q = query(
      this.col,
      where('joinedMemberUids', 'array-contains', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: timestampToMs(data.createdAt),
        activities: data.activities ?? [],
      } as TripPlan;
    });
  }

  async getTripById(tripId: string): Promise<TripPlan | null> {
    const snap = await getDoc(doc(this.col, tripId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      id: snap.id,
      createdAt: timestampToMs(data.createdAt),
      activities: data.activities ?? [],
    } as TripPlan;
  }

  async createTrip(tripData: Omit<TripPlan, 'id' | 'createdAt' | 'isSynced'>): Promise<TripPlan> {
    const docRef = await addDoc(this.col, {
      ...tripData,
      isSynced: true,
      createdAt: serverTimestamp(),
    });
    return {
      ...tripData,
      id: docRef.id,
      isSynced: true,
      createdAt: Date.now(),
    };
  }

  async saveActivities(tripId: string, activities: Activity[]): Promise<void> {
    const tripRef = doc(this.col, tripId);
    const snap = await getDoc(tripRef);
    if (!snap.exists()) return;
    const existing: Activity[] = snap.data().activities ?? [];
    await updateDoc(tripRef, { activities: [...existing, ...activities] });
  }

  /** Lưu toàn bộ trip (upsert) — dùng khi sync từ local lên */
  async upsertTrip(trip: TripPlan): Promise<void> {
    const { id, ...rest } = trip;
    await setDoc(doc(this.col, id), { ...rest, isSynced: true }, { merge: true });
  }
}

