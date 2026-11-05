import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button, Input } from '@/presentation/components/common';
import { useExpenseStore } from '@/presentation/stores/expenseStore';

export const ExpenseScreen: React.FC = () => {
  const { expenses, totalBudget, totalSpent, addExpense } = useExpenseStore();
  const [showScannerMock, setShowScannerMock] = useState(false);
  const [scannedMerchant, setScannedMerchant] = useState('Cộng Cà Phê - Bạch Đằng');
  const [scannedAmount, setScannedAmount] = useState('185000');

  const handleSimulateOCR = () => {
    setShowScannerMock(true);
  };

  const handleSaveScannedExpense = () => {
    addExpense({
      id: 'exp_' + Date.now(),
      tripId: 'trip_danang_hoian_01',
      merchantName: scannedMerchant + ' (OCR)',
      date: 'Oct 24, 2026',
      amount: parseInt(scannedAmount, 10) || 0,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
      createdAt: Date.now(),
      isSynced: false,
    });
    setShowScannerMock(false);
    Alert.alert('Thành công', 'Đã lưu hóa đơn OCR vào chuyến đi!');
  };

  const percentage = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <View style={styles.container}>
      {/* Group Expense Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.metaLabel}>GROUP EXPENSE SUMMARY</Text>
            <Text style={styles.moneyTitle}>{totalSpent.toLocaleString()} VND</Text>
            <Text style={styles.metaSubtitle}>of {totalBudget.toLocaleString()} VND budget ({percentage}%)</Text>
          </View>
          <Button
            title="📷 Scan Receipt"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={handleSimulateOCR}
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>

        {/* Expense List */}
        <View style={{ marginTop: spacing.base, gap: spacing.base }}>
          {expenses.map((item) => (
            <View key={item.id} style={styles.expenseRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.merchantRow}>
                  <Text style={styles.expenseName}>{item.merchantName}</Text>
                  {item.isFromOCR && <Badge label="OCR" variant="teal" style={{ marginLeft: 6 }} />}
                </View>
                <Text style={styles.expenseDate}>
                  {item.date} • Split: {item.splitMemberUids.join(', ')}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>{item.amount.toLocaleString()} VND</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Screen 07 & 08 OCR Review Mock Modal Card */}
      {showScannerMock && (
        <Card style={styles.ocrReviewCard}>
          <View style={styles.ocrHeader}>
            <Badge label="AI RECEIPT OCR VERIFIED" variant="teal" />
            <Text style={styles.ocrTitle}>OCR Expense Review</Text>
          </View>

          <Input
            label="Merchant Name"
            value={scannedMerchant}
            onChangeText={setScannedMerchant}
          />
          <Input
            label="Amount (VND)"
            value={scannedAmount}
            onChangeText={setScannedAmount}
            keyboardType="numeric"
          />

          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Split With Friends:</Text>
            <View style={styles.friendsRow}>
              <Badge label="✓ Việt" variant="teal" />
              <Badge label="✓ Minh Anh" variant="teal" />
              <Badge label="✓ Bảo" variant="teal" />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Save Expense to Trip"
              variant="primary"
              onPress={handleSaveScannedExpense}
            />
            <Button
              title="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => setShowScannerMock(false)}
            />
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  summaryCard: {
    backgroundColor: palette.common.white,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  moneyTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  metaSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: palette.slate[100],
    borderRadius: radii.full,
    overflow: 'hidden',
    marginTop: spacing.base,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.teal[600],
    borderRadius: radii.full,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[100],
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  expenseDate: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.teal[600],
  },
  ocrReviewCard: {
    backgroundColor: palette.slate[50],
    borderWidth: 2,
    borderColor: palette.teal[500],
  },
  ocrHeader: {
    marginBottom: spacing.base,
  },
  ocrTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
    marginTop: spacing.xs,
  },
  splitRow: {
    marginVertical: spacing.sm,
  },
  splitLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  friendsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  buttonRow: {
    gap: spacing.xs,
    marginTop: spacing.base,
  },
});
