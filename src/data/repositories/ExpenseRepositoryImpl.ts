import { IExpenseRepository, OCRScanResult } from '@/domain/repositories/expense_repository';
import { ExpenseItem } from '@/domain/entities/expense';
import { ExpenseRemoteDataSource } from '../datasources/remote/firestore/ExpenseRemoteDataSource';
import { ExpenseLocalDataSource } from '../datasources/local/sqlite/ExpenseLocalDataSource';

const remote = new ExpenseRemoteDataSource();

export class ExpenseRepositoryImpl implements IExpenseRepository {
  constructor(private readonly localDataSource: ExpenseLocalDataSource = new ExpenseLocalDataSource()) {}

  async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    try {
      // Ưu tiên lấy từ Firestore
      const remoteList = await remote.getExpensesByTrip(tripId);
      if (remoteList.length > 0) {
        // Sync về local
        for (const exp of remoteList) {
          await this.localDataSource.saveExpense(exp);
        }
        return remoteList;
      }
    } catch (_e) {
      // Offline fallback: đọc từ SQLite local
      const localList = await this.localDataSource.getExpensesByTrip(tripId);
      if (localList.length > 0) return localList;
    }

    // Seed data mặc định lần đầu
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
        isSynced: false,
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
        isSynced: false,
        createdAt: Date.now() - 7200000,
      },
    ];

    for (const exp of initialExpenses) {
      await this.localDataSource.saveExpense(exp);
    }
    return initialExpenses;
  }

  async addExpense(expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>): Promise<ExpenseItem> {
    try {
      // Thêm lên Firestore
      const saved = await remote.addExpense(expenseData);
      // Sync về local
      await this.localDataSource.saveExpense(saved);
      return saved;
    } catch (_e) {
      // Offline: lưu local trước, đánh dấu isSynced = false
      const newExpense: ExpenseItem = {
        ...expenseData,
        id: 'exp_' + Date.now(),
        createdAt: Date.now(),
        isSynced: false,
      };
      await this.localDataSource.saveExpense(newExpense);
      return newExpense;
    }
  }

  async scanReceiptOCR(_imageUri: string): Promise<OCRScanResult> {
    // TODO: tích hợp Google ML Kit Text Recognition
    return {
      merchantName: 'Cộng Cà Phê - Bạch Đằng, Da Nang',
      date: 'Oct 24, 2026',
      amount: 185000,
      confidence: 0.95,
    };
  }
}
