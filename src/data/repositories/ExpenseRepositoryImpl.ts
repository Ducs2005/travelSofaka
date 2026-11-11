import { ExpenseItem } from '../../domain/entities/expense';
import {
  IExpenseRepository,
  OCRScanResult,
} from '../../domain/repositories/expense_repository';
import { ParseReceiptTextUseCase } from '../../domain/usecases/ocr/ParseReceiptTextUseCase';
import {
  IOCRDataSource,
  MLKitOCRDataSource,
} from '../datasources/remote/ocr/MLKitOCRDataSource';

export class ExpenseRepositoryImpl implements IExpenseRepository {
  private ocrDataSource: IOCRDataSource;
  private parseReceiptUseCase: ParseReceiptTextUseCase;
  private inMemoryExpenses: ExpenseItem[] = [
    {
      id: 'exp_1',
      tripId: 'trip_danang_hoian_01',
      merchantName: 'Cộng Cà Phê (OCR)',
      date: 'Oct 24, 2026',
      amount: 185000,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
      createdAt: Date.now() - 3600000 * 24,
      isSynced: true,
    },
    {
      id: 'exp_2',
      tripId: 'trip_danang_hoian_01',
      merchantName: 'An Bang Homestay',
      date: 'Oct 24, 2026',
      amount: 1800000,
      category: 'HOMESTAY',
      isFromOCR: false,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: Date.now() - 3600000 * 20,
      isSynced: true,
    },
    {
      id: 'exp_3',
      tripId: 'trip_danang_hoian_01',
      merchantName: 'Motorbike Rentals',
      date: 'Oct 24, 2026',
      amount: 650000,
      category: 'TRANSPORT',
      isFromOCR: false,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: Date.now() - 3600000 * 16,
      isSynced: true,
    },
  ];

  constructor(
    ocrDataSource?: IOCRDataSource,
    parseReceiptUseCase?: ParseReceiptTextUseCase
  ) {
    this.ocrDataSource = ocrDataSource || new MLKitOCRDataSource();
    this.parseReceiptUseCase = parseReceiptUseCase || new ParseReceiptTextUseCase();
  }

  public async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    return this.inMemoryExpenses.filter((e) => e.tripId === tripId);
  }

  public async addExpense(
    expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>
  ): Promise<ExpenseItem> {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      isSynced: false,
    };

    this.inMemoryExpenses.unshift(newExpense);
    return newExpense;
  }

  public async scanReceiptOCR(
    imageUri: string,
    base64Data?: string
  ): Promise<OCRScanResult> {
    // 1. Recognize text from image using On-Device ML Kit or Real Image Vision
    const recognition = await this.ocrDataSource.recognizeText(imageUri, base64Data);

    // 2. Parse raw text with Heuristic Regex Parser UseCase
    const parsedResult = this.parseReceiptUseCase.execute(recognition.text);

    return {
      ...parsedResult,
      imageUri: recognition.imageUri || imageUri,
    };
  }
}
