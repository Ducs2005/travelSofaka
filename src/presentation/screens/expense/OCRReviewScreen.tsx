import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button, Input } from '@/presentation/components/common';
import { useExpenseStore } from '@/presentation/stores/expenseStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const OCRReviewScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();
  const { addExpense } = useExpenseStore();

  const [merchant, setMerchant] = useState('Cộng Cà Phê - Bạch Đằng, Da Nang');
  const [date, setDate] = useState('Oct 24, 2026');
  const [amount, setAmount] = useState('185,000 VND');

  const handleSave = () => {
    addExpense({
      id: 'exp_' + Date.now(),
      tripId: 'trip_danang_hoian_01',
      merchantName: merchant + ' (OCR)',
      date,
      amount: 185000,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
      createdAt: Date.now(),
      isSynced: false,
    });
    Alert.alert('Thành công', 'Đã lưu hóa đơn OCR vào ngân sách chuyến đi!');
    navigate('TRIP_DETAILS');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backBtnText}>← Retake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OCR Expense Review</Text>
        <Badge label="Verified" variant="teal" />
      </View>

      {/* Info Notice Banner */}
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeText}>
          ✓ Extracted from receipt photo. Review or edit fields before saving.
        </Text>
      </View>

      {/* Form Card */}
      <Card style={styles.formCard}>
        <Input
          label="Merchant Name"
          value={merchant}
          onChangeText={setMerchant}
        />

        <View style={styles.rowGrid}>
          <View style={{ flex: 1 }}>
            <Input label="Date" value={date} onChangeText={setDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              inputStyle={{ color: palette.teal[600], fontWeight: 'bold' }}
            />
          </View>
        </View>

        <View style={styles.categoryBox}>
          <Text style={styles.fieldLabel}>EXPENSE CATEGORY</Text>
          <View style={styles.dropdownMock}>
            <Text style={styles.dropdownText}>☕ Food & Drink ▾</Text>
          </View>
        </View>

        <View style={styles.splitBox}>
          <Text style={styles.fieldLabel}>SPLIT WITH FRIENDS</Text>
          <View style={styles.friendsRow}>
            <Badge label="✓ Việt" variant="teal" />
            <Badge label="✓ Minh Anh" variant="teal" />
            <Badge label="✓ Bảo" variant="teal" />
          </View>
        </View>

        <Button
          title="Save Expense to Trip"
          variant="primary"
          size="lg"
          onPress={handleSave}
          style={{ marginTop: spacing.base }}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.common.white,
    padding: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.slate[100],
  },
  backBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
  },
  headerTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  noticeBanner: {
    backgroundColor: palette.teal[50],
    borderWidth: 1,
    borderColor: palette.teal[200],
    borderRadius: radii.lg,
    padding: spacing.base,
  },
  noticeText: {
    fontSize: typography.fontSizes.xs,
    color: palette.teal[800],
    fontWeight: typography.fontWeights.medium,
  },
  formCard: {
    backgroundColor: palette.common.white,
  },
  rowGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryBox: {
    marginBottom: spacing.base,
  },
  fieldLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  dropdownMock: {
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    padding: spacing.base,
  },
  dropdownText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[700],
  },
  splitBox: {
    marginBottom: spacing.base,
  },
  friendsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
