import { create } from 'zustand';
import { ExpenseCategory, ExpenseItem } from '@/domain/entities/expense';
import { OCRScanResult } from '@/domain/repositories/expense_repository';
import { ExpenseRepositoryImpl } from '@/data/repositories/ExpenseRepositoryImpl';
import {
  CalculateBudgetUseCase,
  BudgetStatus,
} from '@/domain/usecases/expense/CalculateBudgetUseCase';

const expenseRepository = new ExpenseRepositoryImpl();
const calculateBudgetUseCase = new CalculateBudgetUseCase();

export interface ExpenseState {
  expenses: ExpenseItem[];
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUsagePercentage: number;
  budgetStatus: BudgetStatus;
  budgetStatusColor: string;
  isLoading: boolean;
  isScanningOCR: boolean;
  latestOCRResult: OCRScanResult | null;
  activeFriends: string[];

  // Actions
  addExpense: (
    expense: Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'> | ExpenseItem
  ) => Promise<ExpenseItem>;
  deleteExpense: (id: string) => void;
  setBudget: (budget: number) => void;
  setExpenses: (expenses: ExpenseItem[]) => void;
  scanReceipt: (imageUri: string, base64Data?: string) => Promise<OCRScanResult>;
  setLatestOCRResult: (result: OCRScanResult | null) => void;
  getCategoryTotal: (category: ExpenseCategory) => number;
  getSplitSummary: () => Record<string, number>;
}

const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp_1',
    tripId: 'trip_danang_hoian_01',
    merchantName: 'Cộng Cà Phê (OCR)',
    date: 'Oct 24, 2026',
    amount: 185000,
    category: 'FOOD',
    isFromOCR: true,
    splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
    createdAt: Date.now() - 86400000,
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
    createdAt: Date.now() - 72000000,
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
    createdAt: Date.now() - 57600000,
    isSynced: true,
  },
];

const initialBudget = 6000000;
const initialSummary = calculateBudgetUseCase.execute(initialBudget, initialExpenses);

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: initialExpenses,
  totalBudget: initialBudget,
  totalSpent: initialSummary.totalSpent,
  remainingBudget: initialSummary.remainingBudget,
  budgetUsagePercentage: initialSummary.usagePercentage,
  budgetStatus: initialSummary.status,
  budgetStatusColor: initialSummary.statusColor,
  isLoading: false,
  isScanningOCR: false,
  latestOCRResult: null,
  activeFriends: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],

  addExpense: async (expenseInput) => {
    set({ isLoading: true });
    try {
      const isFullItem = 'id' in expenseInput;
      const createdItem: ExpenseItem = isFullItem
        ? (expenseInput as ExpenseItem)
        : await expenseRepository.addExpense(
            expenseInput as Omit<ExpenseItem, 'id' | 'createdAt' | 'isSynced'>
          );

      const updatedExpenses = [createdItem, ...get().expenses];
      const summary = calculateBudgetUseCase.execute(get().totalBudget, updatedExpenses);

      set({
        expenses: updatedExpenses,
        totalSpent: summary.totalSpent,
        remainingBudget: summary.remainingBudget,
        budgetUsagePercentage: summary.usagePercentage,
        budgetStatus: summary.status,
        budgetStatusColor: summary.statusColor,
        isLoading: false,
      });

      return createdItem;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteExpense: (id: string) => {
    const updatedExpenses = get().expenses.filter((e) => e.id !== id);
    const summary = calculateBudgetUseCase.execute(get().totalBudget, updatedExpenses);

    set({
      expenses: updatedExpenses,
      totalSpent: summary.totalSpent,
      remainingBudget: summary.remainingBudget,
      budgetUsagePercentage: summary.usagePercentage,
      budgetStatus: summary.status,
      budgetStatusColor: summary.statusColor,
    });
  },

  setBudget: (newBudget: number) => {
    const summary = calculateBudgetUseCase.execute(newBudget, get().expenses);
    set({
      totalBudget: newBudget,
      remainingBudget: summary.remainingBudget,
      budgetUsagePercentage: summary.usagePercentage,
      budgetStatus: summary.status,
      budgetStatusColor: summary.statusColor,
    });
  },

  setExpenses: (newExpenses: ExpenseItem[]) => {
    const summary = calculateBudgetUseCase.execute(get().totalBudget, newExpenses);
    set({
      expenses: newExpenses,
      totalSpent: summary.totalSpent,
      remainingBudget: summary.remainingBudget,
      budgetUsagePercentage: summary.usagePercentage,
      budgetStatus: summary.status,
      budgetStatusColor: summary.statusColor,
    });
  },

  scanReceipt: async (imageUri: string, base64Data?: string) => {
    set({ isScanningOCR: true });
    try {
      const result = await expenseRepository.scanReceiptOCR(imageUri, base64Data);
      set({
        latestOCRResult: result,
        isScanningOCR: false,
      });
      return result;
    } catch (error) {
      set({ isScanningOCR: false });
      throw error;
    }
  },

  setLatestOCRResult: (result: OCRScanResult | null) => {
    set({ latestOCRResult: result });
  },

  getCategoryTotal: (category: ExpenseCategory) => {
    return get()
      .expenses.filter((e) => e.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  getSplitSummary: () => {
    const summary = calculateBudgetUseCase.execute(get().totalBudget, get().expenses);
    return summary.memberSplitSummary;
  },
}));
