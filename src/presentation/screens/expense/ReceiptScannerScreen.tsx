import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { Badge, Button } from '@/presentation/components/common';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const ReceiptScannerScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={goBack}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Badge label="AI RECEIPT OCR" variant="teal" />
        <View style={{ width: 32 }} />
      </View>

      {/* Camera Viewfinder Box */}
      <View style={styles.viewfinder}>
        {/* Receipt Paper Simulation */}
        <View style={styles.receiptPaper}>
          <Text style={styles.merchantHeader}>CỘNG CÀ PHÊ</Text>
          <Text style={styles.merchantSub}>98 Bạch Đằng, Đà Nẵng</Text>
          <Text style={styles.merchantSub}>Date: 24/10/2026</Text>

          <View style={styles.dashedLine} />

          <View style={styles.itemRow}>
            <Text style={styles.itemText}>3x Cốt Dừa Cà Phê</Text>
            <Text style={styles.itemText}>165,000</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>1x Hướng Dương</Text>
            <Text style={styles.itemText}>20,000</Text>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL:</Text>
            <Text style={styles.totalText}>185,000 VND</Text>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomArea}>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            💡 <Text style={{ color: palette.teal[300], fontWeight: 'bold' }}>OCR Explanation:</Text> Tự động nhận diện cửa hàng, ngày và số tiền từ ảnh hóa đơn.
          </Text>
        </View>

        <Button
          title="📷 Scan Receipt"
          variant="secondary"
          size="lg"
          onPress={() => navigate('OCR_REVIEW')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate[950],
    padding: spacing.base,
    justifyContent: 'space-between',
    borderRadius: radii['2xl'],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: palette.common.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  viewfinder: {
    height: 380,
    borderWidth: 2,
    borderColor: palette.teal[400],
    borderRadius: radii['2xl'],
    backgroundColor: palette.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.base,
  },
  receiptPaper: {
    backgroundColor: '#FEF9C3', // Warm receipt yellow paper
    width: 220,
    padding: spacing.base,
    borderRadius: radii.sm,
    ...shadows.lg,
  },
  merchantHeader: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.extrabold,
    textAlign: 'center',
    color: palette.slate[900],
    paddingBottom: 4,
  },
  merchantSub: {
    fontSize: 9,
    color: palette.slate[600],
    textAlign: 'center',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: palette.slate[400],
    marginVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  itemText: {
    fontSize: 10,
    color: palette.slate[800],
    fontFamily: 'monospace',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  bottomArea: {
    gap: spacing.base,
    paddingBottom: spacing.sm,
  },
  infoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.lg,
    padding: spacing.base,
  },
  infoPillText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[200],
    textAlign: 'center',
    lineHeight: typography.lineHeights.xs,
  },
});
