import { ExpenseCategory, ExpenseItem } from '../entities/expense';

export interface OCRLineItem {
  name: string;
  amount: number;
  quantity?: number;
}

export interface OCRScanResult {
  merchantName: string;
  date: string;
  amount: number;
  confidence: number;
  category?: ExpenseCategory;
  rawText?: string;
  imageUri?: string;
  lineItems?: OCRLineItem[];
}

export interface IExpenseRepository {
  getExpensesByTrip(tripId: string): Promise<ExpenseItem[]>;
  addExpense(expense: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>): Promise<ExpenseItem>;
  scanReceiptOCR(imageUri: string, base64Data?: string): Promise<OCRScanResult>;
}

