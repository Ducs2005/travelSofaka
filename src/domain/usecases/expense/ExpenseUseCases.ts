import { IExpenseRepository, OCRScanResult } from '@/domain/repositories/expense_repository';
import { ExpenseItem } from '@/domain/entities/expense';

export class AddExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>): Promise<ExpenseItem> {
    if (expenseData.amount <= 0) {
      throw new Error('Số tiền chi tiêu phải lớn hơn 0.');
    }
    return this.expenseRepository.addExpense(expenseData);
  }
}

export class ScanReceiptOCRUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(imageUri: string): Promise<OCRScanResult> {
    if (!imageUri) {
      throw new Error('Hình ảnh hóa đơn không hợp lệ.');
    }
    return this.expenseRepository.scanReceiptOCR(imageUri);
  }
}
