import { Activity } from './activity';

export interface TripPlan {
  id: string;
  creatorUid: string;
  title: string;
  destinations: string[];
  startDate: string; // "Oct 24, 2026"
  endDate: string;   // "Oct 26, 2026"
  budgetTotal: number;
  spentTotal: number;
  joinedMemberUids: string[];
  activities: Activity[];
  isActive?: boolean;
  isSynced: boolean;
  createdAt: number;
}
