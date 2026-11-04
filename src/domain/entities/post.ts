export interface TravelPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  destinationTag: string; // e.g. "📍 Ha Long Bay, Quang Ninh"
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  createdAt: number;
}
