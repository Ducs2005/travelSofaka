import { TripPlan } from '../entities/trip';
import { Activity } from '../entities/activity';

export interface ITripRepository {
  getActiveTrip(): Promise<TripPlan | null>;
  getTrips(uid?: string): Promise<TripPlan[]>;
  getTripById(id: string): Promise<TripPlan | null>;
  createTrip(trip: Omit<TripPlan, 'id' | 'createdAt' | 'isSynced'>): Promise<TripPlan>;
  saveTrip(trip: TripPlan): Promise<TripPlan>;
  generateAIItinerary(destination: string, days: number, budget: number, preferences?: string): Promise<Activity[]>;
  saveActivities(tripId: string, activities: Activity[]): Promise<void>;
}
