import { ExpenseItem } from '../entities/expense';

export interface OCRScanResult {
  merchantName: string;
  date: string;
  amount: number;
  confidence: number;
}

export interface IExpenseRepository {
  getExpensesByTrip(tripId: string): Promise<ExpenseItem[]>;
  addExpense(expense: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>): Promise<ExpenseItem>;
  scanReceiptOCR(imageUri: string): Promise<OCRScanResult>;
}
