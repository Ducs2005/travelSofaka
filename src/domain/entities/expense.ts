export type ExpenseCategory = 'FOOD' | 'HOMESTAY' | 'TRANSPORT' | 'ENTERTAINMENT' | 'OTHER';

export interface ExpenseItem {
  id: string;
  tripId: string;
  merchantName: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  isFromOCR: boolean;
  receiptImageUrl?: string;
  splitMemberUids: string[];
  createdAt: number;
  isSynced: boolean;
}
