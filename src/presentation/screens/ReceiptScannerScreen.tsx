import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import {
  CameraIcon,
  ImageIcon,
  LightbulbIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { useExpenseStore } from '@/presentation/stores/expenseStore';
import { OCRScanResult } from '@/domain/repositories/expense_repository';

interface ReceiptScannerScreenProps {
  onClose?: () => void;
  onScanComplete?: (result: OCRScanResult) => void;
}

export const ReceiptScannerScreen: React.FC<ReceiptScannerScreenProps> = ({
  onClose,
  onScanComplete,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  const { scanReceipt, isScanningOCR } = useExpenseStore();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatusText, setProcessingStatusText] = useState<string>(
    'Đang quét & nhận diện hóa đơn thực tế...'
  );

  const hasAutoLaunchedRef = useRef(false);

  // Auto-launch Camera on Screen Mount
  useEffect(() => {
    if (!hasAutoLaunchedRef.current) {
      hasAutoLaunchedRef.current = true;
      const timer = setTimeout(() => {
        handleLaunchCamera();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  // 1. Launch Real Device Camera
  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền truy cập Camera',
          'Vui lòng cấp quyền truy cập Camera để chụp hóa đơn thực tế.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5, // Compressed to ~300KB for fast AI OCR upload
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedImageUri(asset.uri);
        setCapturedBase64(asset.base64 || null);
        // Automatically start real scanning process
        processRealReceipt(asset.uri, asset.base64 || undefined);
      }
    } catch {
      Alert.alert('Thông báo', 'Không thể khởi động camera trên thiết bị này.');
    }
  };

  // 2. Launch Photo Library / Gallery to pick real receipt
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền thư viện ảnh',
          'Vui lòng cấp quyền truy cập Thư viện ảnh để chọn ảnh hóa đơn.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedImageUri(asset.uri);
        setCapturedBase64(asset.base64 || null);
        processRealReceipt(asset.uri, asset.base64 || undefined);
      }
    } catch {
      Alert.alert('Thông báo', 'Không thể mở thư viện ảnh.');
    }
  };

  // 3. Process the actual receipt via OCR
  const processRealReceipt = async (imageUri: string, base64?: string) => {
    setIsProcessing(true);
    setProcessingStatusText('Đang gửi ảnh tới AI OCR Engine...');

    try {
      const result = await scanReceipt(imageUri, base64);
      setProcessingStatusText('Trích xuất thành công!');

      setTimeout(() => {
        setIsProcessing(false);
        if (onScanComplete) {
          onScanComplete(result);
        }
      }, 500);
    } catch {
      setIsProcessing(false);
      Alert.alert(
        'Lỗi nhận diện',
        'Không thể nhận diện văn bản từ ảnh. Bạn vẫn có thể nhập thông tin hóa đơn thủ công.',
        [
          {
            text: 'Nhập thủ công',
            onPress: () => {
              if (onScanComplete) {
                onScanComplete({
                  merchantName: 'Hóa đơn chưa nhận diện',
                  date: new Date().toLocaleDateString('vi-VN'),
                  amount: 0,
                  confidence: 0,
                  category: 'OTHER',
                  rawText: '',
                  imageUri,
                });
              }
            },
          },
          { text: 'Chụp lại', onPress: handleLaunchCamera },
        ]
      );
    }
  };

  // 4. Primary Button Trigger
  const handlePrimaryScanButton = () => {
    if (capturedImageUri) {
      processRealReceipt(capturedImageUri, capturedBase64 || undefined);
    } else {
      handleLaunchCamera();
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* TOP BAR WITH SAFE NOTCH INSET */}
      <View style={[styles.topBar, { paddingTop: topInset + 4 }]}>
        <TouchableOpacity
          style={styles.circleCloseBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.circleCloseText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.ocrBadge}>
          <Text style={styles.ocrBadgeText}>AI RECEIPT OCR</Text>
        </View>

        <View style={{ width: 32 }} />
      </View>

      {/* VIEWFINDER FRAME */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinderFrame}>
          {capturedImageUri ? (
            // REAL CAPTURED PHOTO PREVIEW
            <View style={styles.capturedPhotoWrapper}>
              <Image
                source={{ uri: capturedImageUri }}
                style={styles.capturedPhoto}
              />
              <TouchableOpacity
                style={styles.retakePhotoBtn}
                onPress={handleLaunchCamera}
              >
                <Text style={styles.retakePhotoText}>↺ Chụp lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // REAL CAMERA VIEWFINDER RETICLE & GUIDELINES (NO MOCK RECEIPTS)
            <TouchableOpacity
              style={styles.liveViewfinderBox}
              onPress={handleLaunchCamera}
              activeOpacity={0.85}
            >
              {/* 4 Glowing Corner Target Marks */}
              <View style={[styles.cornerBracket, styles.topLeftCorner]} />
              <View style={[styles.cornerBracket, styles.topRightCorner]} />
              <View style={[styles.cornerBracket, styles.bottomLeftCorner]} />
              <View style={[styles.cornerBracket, styles.bottomRightCorner]} />

              <View style={styles.viewfinderPromptContainer}>
                <View style={styles.cameraIconCircle}>
                  <CameraIcon size={32} color="#2DD4BF" />
                </View>
                <Text style={styles.viewfinderTitle}>
                  Căn chỉnh hóa đơn vào khung ngắm
                </Text>
                <Text style={styles.viewfinderSubtitle}>
                  Chạm để mở camera và quét hóa đơn thực tế
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ACTIVE PROCESSING OVERLAY */}
          {(isProcessing || isScanningOCR) && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color={palette.teal[400]} />
              <Text style={styles.scanningText}>
                {processingStatusText}
              </Text>
              <Text style={styles.scanningSub}>Google ML Kit & Cloud AI Vision</Text>
            </View>
          )}
        </View>

        {/* REAL CAMERA & GALLERY SHORTCUTS ONLY */}
        <View style={styles.cameraShortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={handleLaunchCamera}
            activeOpacity={0.8}
          >
            <CameraIcon size={15} color="#E2E8F0" />
            <Text style={styles.shortcutBtnText}>Mở Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={handlePickFromGallery}
            activeOpacity={0.8}
          >
            <ImageIcon size={15} color="#E2E8F0" />
            <Text style={styles.shortcutBtnText}>Chọn ảnh từ máy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM ACTION SECTION */}
      <View style={styles.bottomSection}>
        {/* OCR EXPLANATION BOX */}
        <View style={styles.explanationCard}>
          <View style={styles.explanationRow}>
            <LightbulbIcon size={16} color="#2DD4BF" />
            <Text style={styles.explanationText}>
              <Text style={styles.explanationHighlight}>OCR Explanation: </Text>
              Tự động nhận diện tên quán, ngày tháng và tổng tiền từ ảnh chụp thật.
            </Text>
          </View>
        </View>

        {/* SCAN / CAPTURE BUTTON */}
        <TouchableOpacity
          style={styles.coralScanButton}
          onPress={handlePrimaryScanButton}
          disabled={isProcessing || isScanningOCR}
          activeOpacity={0.85}
        >
          <Text style={styles.coralScanButtonText}>
            {isProcessing
              ? 'Đang phân tích...'
              : capturedImageUri
              ? 'Quét lại ảnh này'
              : 'Chụp hóa đơn bằng Camera'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16', // Deep dark slate background like design
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  circleCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCloseText: {
    color: palette.common.white,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
  ocrBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ocrBadgeText: {
    color: '#2DD4BF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  viewfinderFrame: {
    width: '94%',
    height: 340,
    borderRadius: 26,
    borderWidth: 1.8,
    borderColor: '#2DD4BF', // Glowing teal border matching screenshot
    backgroundColor: '#0E1626',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.lg,
  },
  liveViewfinderBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 24,
  },
  cornerBracket: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#2DD4BF',
  },
  topLeftCorner: {
    top: 18,
    left: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  topRightCorner: {
    top: 18,
    right: 18,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bottomLeftCorner: {
    bottom: 18,
    left: 18,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bottomRightCorner: {
    bottom: 18,
    right: 18,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  viewfinderPromptContainer: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  cameraIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewfinderTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  viewfinderSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  capturedPhotoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  capturedPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  retakePhotoBtn: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2DD4BF',
  },
  retakePhotoText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '700',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 13, 22, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  scanningText: {
    color: '#2DD4BF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  scanningSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  cameraShortcutsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  shortcutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shortcutBtnText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '600',
  },
  bottomSection: {
    gap: 12,
    paddingBottom: 4,
  },
  explanationCard: {
    backgroundColor: '#131B2A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  explanationText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    lineHeight: 16,
    textAlign: 'center',
  },
  explanationHighlight: {
    color: '#2DD4BF',
    fontWeight: '700',
  },
  coralScanButton: {
    backgroundColor: '#FF6B6B', // Exact salmon/coral color from design
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  coralScanButtonText: {
    color: palette.common.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
