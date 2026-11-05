import { getDatabase } from './database';
import { TripPlan } from '@/domain/entities/trip';
import { Activity } from '@/domain/entities/activity';

export class TripLocalDataSource {
  async getActiveTrip(): Promise<TripPlan | null> {
    const db = await getDatabase();
    const tripRow = await db.getFirstAsync<any>(
      'SELECT * FROM trips WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!tripRow) return null;

    const activityRows = await db.getAllAsync<any>(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY day_index ASC, time ASC',
      [tripRow.id]
    );

    return {
      id: tripRow.id,
      creatorUid: tripRow.creator_uid,
      title: tripRow.title,
      destinations: JSON.parse(tripRow.destinations),
      startDate: tripRow.start_date,
      endDate: tripRow.end_date,
      budgetTotal: tripRow.budget_total,
      spentTotal: tripRow.spent_total,
      joinedMemberUids: JSON.parse(tripRow.joined_member_uids),
      isActive: Boolean(tripRow.is_active),
      isSynced: Boolean(tripRow.is_synced),
      createdAt: tripRow.created_at,
      activities: activityRows.map((a) => ({
        id: a.id,
        tripId: a.trip_id,
        dayIndex: a.day_index,
        time: a.time,
        title: a.title,
        locationName: a.location_name,
        estimatedCost: a.estimated_cost,
        isCompleted: Boolean(a.is_completed),
      })),
    };
  }

  async saveTrip(trip: TripPlan): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO trips 
      (id, creator_uid, title, destinations, start_date, end_date, budget_total, spent_total, joined_member_uids, is_active, is_synced, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id,
        trip.creatorUid,
        trip.title,
        JSON.stringify(trip.destinations),
        trip.startDate,
        trip.endDate,
        trip.budgetTotal,
        trip.spentTotal,
        JSON.stringify(trip.joinedMemberUids),
        trip.isActive ? 1 : 0,
        trip.isSynced ? 1 : 0,
        trip.createdAt,
      ]
    );

    if (trip.activities && trip.activities.length > 0) {
      for (const act of trip.activities) {
        await db.runAsync(
          `INSERT OR REPLACE INTO activities 
          (id, trip_id, day_index, time, title, location_name, estimated_cost, is_completed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            act.id,
            act.tripId,
            act.dayIndex,
            act.time,
            act.title,
            act.locationName || null,
            act.estimatedCost || 0,
            act.isCompleted ? 1 : 0,
          ]
        );
      }
    }
  }
}
