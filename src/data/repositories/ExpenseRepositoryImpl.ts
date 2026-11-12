import { ExpenseItem } from '@/domain/entities/expense';
import { IExpenseRepository, OCRScanResult } from '@/domain/repositories/expense_repository';
import { ParseReceiptTextUseCase } from '@/domain/usecases/ocr/ParseReceiptTextUseCase';
import { ExpenseLocalDataSource } from '../datasources/local/sqlite/ExpenseLocalDataSource';
import { ExpenseRemoteDataSource } from '../datasources/remote/firestore/ExpenseRemoteDataSource';
import { IOCRDataSource, MLKitOCRDataSource } from '../datasources/remote/ocr/MLKitOCRDataSource';

const remote = new ExpenseRemoteDataSource();

export class ExpenseRepositoryImpl implements IExpenseRepository {
  private readonly ocrDataSource: IOCRDataSource;
  private readonly parseReceiptUseCase: ParseReceiptTextUseCase;

  constructor(
    private readonly localDataSource: ExpenseLocalDataSource = new ExpenseLocalDataSource(),
    ocrDataSource: IOCRDataSource = new MLKitOCRDataSource(),
    parseReceiptUseCase: ParseReceiptTextUseCase = new ParseReceiptTextUseCase(),
  ) {
    this.ocrDataSource = ocrDataSource;
    this.parseReceiptUseCase = parseReceiptUseCase;
  }

  async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    try {
      const remoteExpenses = await remote.getExpensesByTrip(tripId);
      if (remoteExpenses.length > 0) {
        for (const expense of remoteExpenses) {
          await this.localDataSource.saveExpense(expense);
        }
        return remoteExpenses;
      }
    } catch (_error) {
      const localExpenses = await this.localDataSource.getExpensesByTrip(tripId);
      if (localExpenses.length > 0) return localExpenses;
    }

    const localExpenses = await this.localDataSource.getExpensesByTrip(tripId);
    if (localExpenses.length > 0) return localExpenses;

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

    for (const expense of initialExpenses) {
      await this.localDataSource.saveExpense(expense);
    }
    return initialExpenses;
  }

  async addExpense(
    expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>,
  ): Promise<ExpenseItem> {
    try {
      const saved = await remote.addExpense(expenseData);
      await this.localDataSource.saveExpense(saved);
      return saved;
    } catch (_error) {
      const localExpense: ExpenseItem = {
        ...expenseData,
        id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        isSynced: false,
      };
      await this.localDataSource.saveExpense(localExpense);
      return localExpense;
    }
  }

  async scanReceiptOCR(imageUri: string, base64Data?: string): Promise<OCRScanResult> {
    const recognition = await this.ocrDataSource.recognizeText(imageUri, base64Data);
    const parsed = this.parseReceiptUseCase.execute(recognition.text);
    return {
      ...parsed,
      imageUri: recognition.imageUri ?? imageUri,
    };
  }
}
