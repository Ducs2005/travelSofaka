export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  tripsCount: number;
  savedCount: number;
  friendsCount: number;
  createdAt: number;
}
