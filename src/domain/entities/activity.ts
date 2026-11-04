export interface Activity {
  id: string;
  tripId: string;
  dayIndex: number; // 1, 2, 3...
  time: string;     // e.g. "09:00 AM"
  title: string;    // e.g. "Arrive in Da Nang & Beach Coffee"
  locationName?: string;
  estimatedCost?: number;
  isCompleted?: boolean;
}
