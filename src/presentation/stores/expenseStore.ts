import { create } from 'zustand';
import { ExpenseItem } from '@/domain/entities/expense';

interface ExpenseState {
  expenses: ExpenseItem[];
  totalBudget: number;
  totalSpent: number;
  isLoading: boolean;

  // Actions
  addExpense: (expense: ExpenseItem) => void;
  setExpenses: (expenses: ExpenseItem[]) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  totalBudget: 6000000,
  totalSpent: 2635000,
  expenses: [
    {
      id: 'exp_1',
      tripId: 'trip_danang_hoian_01',
      merchantName: 'Cộng Cà Phê (OCR)',
      date: 'Oct 24, 2026',
      amount: 185000,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
      createdAt: Date.now(),
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
      createdAt: Date.now(),
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
      createdAt: Date.now(),
      isSynced: true,
    },
  ],
  isLoading: false,

  addExpense: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses],
      totalSpent: state.totalSpent + expense.amount,
    })),
  setExpenses: (expenses) =>
    set({
      expenses,
      totalSpent: expenses.reduce((sum, item) => sum + item.amount, 0),
    }),
}));
