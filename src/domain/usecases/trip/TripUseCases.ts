import { ITripRepository } from '@/domain/repositories/trip_repository';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';

export class GetActiveTripUseCase {
  constructor(private readonly tripRepository: ITripRepository) {}

  async execute(): Promise<TripPlan | null> {
    return this.tripRepository.getActiveTrip();
  }
}

export class CreateTripUseCase {
  constructor(private readonly tripRepository: ITripRepository) {}

  async execute(tripData: Omit<TripPlan, 'id' | 'createdAt' | 'isSynced'>): Promise<TripPlan> {
    if (!tripData.title) {
      throw new Error('Tiêu đề chuyến đi không được để trống.');
    }
    return this.tripRepository.createTrip(tripData);
  }
}

export class GenerateAIItineraryUseCase {
  constructor(private readonly tripRepository: ITripRepository) {}

  async execute(
    destination: string,
    days: number,
    budget: number,
    preferences?: string
  ): Promise<Activity[]> {
    if (!destination || days <= 0) {
      throw new Error('Điểm đến và số ngày du lịch phải hợp lệ.');
    }
    return this.tripRepository.generateAIItinerary(destination, days, budget, preferences);
  }
}
