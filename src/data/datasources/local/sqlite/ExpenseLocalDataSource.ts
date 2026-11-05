import { getDatabase } from './database';
import { ExpenseItem, ExpenseCategory } from '@/domain/entities/expense';

export class ExpenseLocalDataSource {
  async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM expenses WHERE trip_id = ? ORDER BY created_at DESC',
      [tripId]
    );

    return rows.map((r) => ({
      id: r.id,
      tripId: r.trip_id,
      merchantName: r.merchant_name,
      date: r.date,
      amount: r.amount,
      category: r.category as ExpenseCategory,
      isFromOCR: Boolean(r.is_from_ocr),
      receiptImageUrl: r.receipt_image_url || undefined,
      splitMemberUids: JSON.parse(r.split_member_uids),
      isSynced: Boolean(r.is_synced),
      createdAt: r.created_at,
    }));
  }

  async saveExpense(expense: ExpenseItem): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO expenses 
      (id, trip_id, merchant_name, date, amount, category, is_from_ocr, receipt_image_url, split_member_uids, is_synced, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.id,
        expense.tripId,
        expense.merchantName,
        expense.date,
        expense.amount,
        expense.category,
        expense.isFromOCR ? 1 : 0,
        expense.receiptImageUrl || null,
        JSON.stringify(expense.splitMemberUids),
        expense.isSynced ? 1 : 0,
        expense.createdAt,
      ]
    );

    // Also update spent_total in trips table
    await db.runAsync(
      'UPDATE trips SET spent_total = spent_total + ? WHERE id = ?',
      [expense.amount, expense.tripId]
    );
  }
}
