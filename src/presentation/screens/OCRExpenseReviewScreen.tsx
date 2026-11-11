import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';
import {
  CoffeeIcon,
  HomeIcon,
  MotorbikeIcon,
  TicketIcon,
  ReceiptIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { useExpenseStore } from '@/presentation/stores/expenseStore';
import { OCRScanResult } from '@/domain/repositories/expense_repository';
import { ExpenseCategory } from '@/domain/entities/expense';

interface OCRExpenseReviewScreenProps {
  initialScanResult?: OCRScanResult | null;
  onRetake?: () => void;
  onSaveSuccess?: () => void;
  onNavTabPress?: (tab: BottomNavTab) => void;
}

export const OCRExpenseReviewScreen: React.FC<OCRExpenseReviewScreenProps> = ({
  initialScanResult,
  onRetake,
  onSaveSuccess,
  onNavTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const { addExpense, latestOCRResult } = useExpenseStore();

  const scanData = initialScanResult || latestOCRResult || {
    merchantName: '',
    date: new Date().toLocaleDateString('vi-VN'),
    amount: 0,
    confidence: 0,
    category: 'FOOD' as ExpenseCategory,
    rawText: '',
  };

  const [merchantName, setMerchantName] = useState<string>(scanData.merchantName || '');
  const [date, setDate] = useState<string>(scanData.date || 'Oct 24, 2026');
  const [amountStr, setAmountStr] = useState<string>(
    scanData.amount > 0 ? `${scanData.amount.toLocaleString()} VND` : ''
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    scanData.category || 'FOOD'
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([
    'Lâm',
    'Tú',
    'Đức',
  ]);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Available friends matching screenshot
  const allFriends = ['Lâm', 'Tú', 'Đức', 'Việt', 'Minh Anh'];

  const toggleFriend = (friend: string) => {
    if (selectedFriends.includes(friend)) {
      if (selectedFriends.length > 1) {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend));
      } else {
        Alert.alert('Lưu ý', 'Cần ít nhất 1 thành viên chịu chi phí này.');
      }
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleAmountChange = (text: string) => {
    const digitsOnly = text.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      setAmountStr('');
      return;
    }
    const val = parseInt(digitsOnly, 10);
    setAmountStr(`${val.toLocaleString()} VND`);
  };

  const numericAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSave = async () => {
    if (!merchantName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cửa hàng / địa điểm chi tiêu.');
      return;
    }

    if (numericAmount <= 0) {
      Alert.alert('Thiếu số tiền', 'Vui lòng nhập số tiền cho hóa đơn này.');
      return;
    }

    setIsSaving(true);
    try {
      await addExpense({
        tripId: 'trip_danang_hoian_01',
        merchantName: merchantName.trim(),
        date: date.trim() || 'Oct 24, 2026',
        amount: numericAmount,
        category,
        isFromOCR: true,
        splitMemberUids: selectedFriends,
        receiptImageUrl: scanData.imageUri,
      });

      setIsSaving(false);
      Alert.alert(
        'Đã lưu thành công! 🎉',
        `Khoản chi "${merchantName}" (${numericAmount.toLocaleString()} VND) đã được ghi nhận vào chuyến đi.\nMỗi bạn chi trả: ${Math.round(
          numericAmount / selectedFriends.length
        ).toLocaleString()} VND.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSaveSuccess) onSaveSuccess();
            },
          },
        ]
      );
    } catch {
      setIsSaving(false);
      Alert.alert('Lỗi', 'Không thể lưu khoản chi.');
    }
  };

  const confidencePercent = Math.round((scanData.confidence || 0.95) * 100);

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* TOP BAR WITH SAFE NOTCH INSET */}
        <View style={[styles.topBar, { paddingTop: topInset + 6 }]}>
          <TouchableOpacity
            onPress={onRetake}
            style={styles.retakeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.retakeText}>← Retake</Text>
          </TouchableOpacity>

          <Text style={styles.screenTitle}>OCR Expense Review</Text>

          <View style={styles.verifiedBadgeRow}>
            <Text style={styles.verifiedText}>Verified</Text>
            <Text style={styles.confidenceText}>({confidencePercent}%)</Text>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* BANNER: EXTRACTED FROM RECEIPT PHOTO */}
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>
              ✓ Extracted from receipt photo. Review or edit fields before saving.
            </Text>
          </View>

          {/* REAL RECEIPT PHOTO THUMBNAIL (IF CAPTURED) */}
          {scanData.imageUri && !scanData.imageUri.startsWith('sample:') && (
            <View style={styles.photoPreviewCard}>
              <Image
                source={{ uri: scanData.imageUri }}
                style={styles.photoThumbnail}
              />
              <View style={styles.photoInfoColumn}>
                <Text style={styles.photoInfoTitle}>Ảnh hóa đơn chụp thực tế</Text>
                <Text style={styles.photoInfoSub}>Đã phân tích bằng AI OCR</Text>
              </View>
            </View>
          )}

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* MERCHANT NAME */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>MERCHANT NAME</Text>
              <TextInput
                style={styles.inputBoxBold}
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Tên quán / Nhà hàng / Dịch vụ"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* DATE & AMOUNT (2 COLUMNS) */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>DATE</Text>
                <TextInput
                  style={styles.inputBox}
                  value={date}
                  onChangeText={setDate}
                  placeholder="Oct 24, 2026"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                <TextInput
                  style={[styles.inputBox, styles.amountInputHighlight]}
                  value={amountStr}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="185,000 VND"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* EXPENSE CATEGORY DROPDOWN */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>EXPENSE CATEGORY</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => {
                  const catList: ExpenseCategory[] = [
                    'FOOD',
                    'HOMESTAY',
                    'TRANSPORT',
                    'ENTERTAINMENT',
                    'OTHER',
                  ];
                  const currentIdx = catList.indexOf(category);
                  const nextCat = catList[(currentIdx + 1) % catList.length];
                  setCategory(nextCat);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownInnerRow}>
                  {category === 'FOOD' && <CoffeeIcon size={16} color="#0D9488" />}
                  {category === 'HOMESTAY' && <HomeIcon size={16} color="#0D9488" />}
                  {category === 'TRANSPORT' && <MotorbikeIcon size={16} color="#0D9488" />}
                  {category === 'ENTERTAINMENT' && <TicketIcon size={16} color="#0D9488" />}
                  {category === 'OTHER' && <ReceiptIcon size={16} color="#0D9488" />}
                  <Text style={styles.dropdownText}>
                    {category === 'FOOD' && 'Food & Drink'}
                    {category === 'HOMESTAY' && 'Homestay & Hotel'}
                    {category === 'TRANSPORT' && 'Transport'}
                    {category === 'ENTERTAINMENT' && 'Entertainment'}
                    {category === 'OTHER' && 'Other'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* SPLIT WITH FRIENDS */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>SPLIT WITH FRIENDS</Text>
              <View style={styles.splitChipsRow}>
                {allFriends.map((friend) => {
                  const isChecked = selectedFriends.includes(friend);
                  return (
                    <TouchableOpacity
                      key={friend}
                      onPress={() => toggleFriend(friend)}
                      style={[
                        styles.splitChip,
                        isChecked ? styles.splitChipActive : styles.splitChipInactive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.splitChipText,
                          isChecked
                            ? styles.splitChipTextActive
                            : styles.splitChipTextInactive,
                        ]}
                      >
                        {isChecked ? `✓ ${friend}` : `+ ${friend}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* COLLAPSIBLE RAW OCR TEXT INSPECTOR */}
            {scanData.rawText ? (
              <View style={styles.rawTextContainer}>
                <TouchableOpacity
                  style={styles.rawTextToggleBtn}
                  onPress={() => setShowRawText(!showRawText)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rawTextToggleTitle}>
                    {showRawText ? '▾ Ẩn văn bản OCR gốc' : '▸ Xem chi tiết văn bản AI OCR đã đọc'}
                  </Text>
                </TouchableOpacity>

                {showRawText && (
                  <View style={styles.rawTextBox}>
                    <Text style={styles.rawTextContent}>{scanData.rawText}</Text>
                  </View>
                )}
              </View>
            ) : null}

            {/* SAVE BUTTON */}
            <TouchableOpacity
              style={styles.saveTealButton}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveTealButtonText}>
                {isSaving ? 'Đang lưu...' : 'Save Expense to Trip'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR WITH ICONS */}
      <BottomNavBar activeTab="trips" onTabPress={onNavTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  scrollArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  retakeBtn: {
    paddingVertical: 4,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  screenTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488', // Teal 600
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
  },
  contentPadding: {
    padding: 16,
    gap: 14,
  },
  alertBanner: {
    backgroundColor: '#E6F8F5',
    borderWidth: 1,
    borderColor: '#99E6D9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  alertBannerText: {
    fontSize: 11.5,
    color: '#0D9488',
    fontWeight: '500',
    lineHeight: 17,
  },
  photoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  photoInfoColumn: {
    flex: 1,
  },
  photoInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  photoInfoSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  formCard: {
    gap: 14,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputBoxBold: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountInputHighlight: {
    color: '#0D9488',
    fontWeight: '800',
  },
  dropdownBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropdownArrow: {
    color: '#64748B',
    fontSize: 13,
    marginLeft: 'auto',
  },
  splitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  splitChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  splitChipActive: {
    backgroundColor: '#CCFBF1', // Teal 100
  },
  splitChipInactive: {
    backgroundColor: '#F1F5F9',
  },
  splitChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  splitChipTextActive: {
    color: '#0F766E', // Teal 700
  },
  splitChipTextInactive: {
    color: '#64748B',
  },
  rawTextContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rawTextToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
  },
  rawTextToggleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  rawTextBox: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    maxHeight: 140,
  },
  rawTextContent: {
    fontSize: 10.5,
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  saveTealButton: {
    backgroundColor: '#0D9488', // Exact teal button from design
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...shadows.sm,
  },
  saveTealButtonText: {
    color: palette.common.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
