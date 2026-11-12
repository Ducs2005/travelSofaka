import { ExpenseCategory, ExpenseItem } from '../../entities/expense';

export type BudgetStatus = 'SAFE' | 'WARNING' | 'EXCEEDED';

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  usagePercentage: number;
  status: BudgetStatus;
  statusColor: string;
  categoryBreakdown: Record<ExpenseCategory, number>;
  memberSplitSummary: Record<string, number>;
}

export class CalculateBudgetUseCase {
  public execute(totalBudget: number, expenses: ExpenseItem[]): BudgetSummary {
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    let status: BudgetStatus = 'SAFE';
    let statusColor = '#0D9488'; // Teal 600

    if (usagePercentage >= 100) {
      status = 'EXCEEDED';
      statusColor = '#FF6B6B'; // Coral 500
    } else if (usagePercentage >= 80) {
      status = 'WARNING';
      statusColor = '#F59E0B'; // Amber 500
    }

    // Category breakdown
    const categoryBreakdown: Record<ExpenseCategory, number> = {
      FOOD: 0,
      HOMESTAY: 0,
      ACCOMMODATION: 0,
      TRANSPORT: 0,
      ENTERTAINMENT: 0,
      OTHER: 0,
    };

    // Member split breakdown
    const memberSplitSummary: Record<string, number> = {};

    for (const item of expenses) {
      // Add to category
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.amount;

      // Add to split members
      const members = item.splitMemberUids && item.splitMemberUids.length > 0
        ? item.splitMemberUids
        : ['You'];
      const splitAmount = item.amount / members.length;

      for (const member of members) {
        memberSplitSummary[member] = (memberSplitSummary[member] || 0) + splitAmount;
      }
    }

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      usagePercentage: Number(usagePercentage.toFixed(1)),
      status,
      statusColor,
      categoryBreakdown,
      memberSplitSummary,
    };
  }
}
