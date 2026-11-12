import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase/firebaseConfig';
import { ExpenseItem } from '@/domain/entities/expense';

function timestampToMs(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

export class ExpenseRemoteDataSource {
  private col = collection(db, 'expenses');

  async getExpensesByTrip(tripId: string): Promise<ExpenseItem[]> {
    const q = query(
      this.col,
      where('tripId', '==', tripId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: timestampToMs(data.createdAt),
        isSynced: true,
      } as ExpenseItem;
    });
  }

  async addExpense(
    expenseData: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>
  ): Promise<ExpenseItem> {
    const docRef = await addDoc(this.col, {
      ...expenseData,
      isSynced: true,
      createdAt: serverTimestamp(),
    });
    return {
      ...expenseData,
      id: docRef.id,
      isSynced: true,
      createdAt: Date.now(),
    };
  }

  /** Ghi đè/tạo mới theo id cục bộ — Sync Engine dùng khi đẩy khoản chi tạo lúc ngoại tuyến */
  async upsertExpense(expense: ExpenseItem): Promise<void> {
    const { id, ...rest } = expense;
    await setDoc(
      doc(this.col, id),
      { ...rest, isSynced: true, createdAt: expense.createdAt },
      { merge: true }
    );
  }
}

