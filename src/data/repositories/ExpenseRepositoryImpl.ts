import { IExpenseRepository, OCRScanResult } from '@/domain/repositories/expense_repository';
import { ExpenseItem } from '@/domain/entities/expense';
import { ExpenseLocalDataSource } from '../datasources/local/sqlite/ExpenseLocalDataSource';

export class ExpenseRepositoryImpl implements IExpenseRepository {
  constructor(private readonly localDataSource: ExpenseLocalDataSource = new ExpenseLocalDataSource()) {}

  async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    const list = await this.localDataSource.getExpensesByTrip(tripId);
    if (list.length > 0) return list;

    // Seed default expenses into SQLite
    const initialExpenses: ExpenseItem[] = [
      {
        id: 'exp_01',
        tripId,
        merchantName: 'Cộng Cà Phê (OCR)',
        date: 'Oct 24, 2026',
        amount: 185000,
        category: 'FOOD',
        isFromOCR: true,
        splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
        isSynced: true,
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'exp_02',
        tripId,
        merchantName: 'An Bang Homestay',
        date: 'Oct 24, 2026',
        amount: 1800000,
        category: 'HOMESTAY',
        isFromOCR: false,
        splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
        isSynced: true,
        createdAt: Date.now() - 7200000,
      },
    ];

    for (const exp of initialExpenses) {
      await this.localDataSource.saveExpense(exp);
    }
    return initialExpenses;
  }

  async addExpense(expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>): Promise<ExpenseItem> {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      createdAt: Date.now(),
      isSynced: false,
    };
    await this.localDataSource.saveExpense(newExpense);
    return newExpense;
  }

  async scanReceiptOCR(_imageUri: string): Promise<OCRScanResult> {
    // In production, Google ML Kit Text Recognition on-device regex parsing
    return {
      merchantName: 'Cộng Cà Phê - Bạch Đằng, Da Nang',
      date: 'Oct 24, 2026',
      amount: 185000,
      confidence: 0.95,
    };
  }
}
