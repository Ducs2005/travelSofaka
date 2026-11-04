export interface DestinationReview {
  id: string;
  authorName: string;
  authorUniversity?: string;
  rating: number;
  content: string;
  createdAt: number;
}

export interface Destination {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  imageUrl: string;
  estimatedBudgetPerDay: number;
  rating: number;
  reviewsCount: number;
  durationRecommend: string; // e.g. "3-4 Days"
  about: string;
  category: 'ALL' | 'BEACHES' | 'MOUNTAINS' | 'HERITAGE';
  reviews?: DestinationReview[];
}
