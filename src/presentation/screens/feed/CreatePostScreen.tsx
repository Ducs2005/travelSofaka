import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { ImageIcon, CameraIcon } from '@/presentation/components/common/MonochromeIcons';
import { useSocialStore } from '@/presentation/stores/socialStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

const DEFAULT_DESTINATION = 'Ha Long Bay, Quang Ninh';

/**
 * SOC-02: Screen 09 — Create Travel Post.
 * Chọn ảnh từ thiết bị, gắn thẻ địa điểm, nhập caption rồi xuất bản lên cộng đồng.
 */
export const CreatePostScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();
  const { publishPost, isPublishing } = useSocialStore();

  const [destinationTag, setDestinationTag] = useState(DEFAULT_DESTINATION);
  const [caption, setCaption] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'TripMate cần quyền ảnh để chọn ảnh cho bài viết.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền camera', 'TripMate cần quyền camera để chụp ảnh cho bài viết.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!localImageUri) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chọn ảnh cho bài viết du lịch.');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập caption cho bài viết.');
      return;
    }

    try {
      const published = await publishPost({
        caption,
        destinationTag: destinationTag.trim() || DEFAULT_DESTINATION,
        localImageUri,
      });

      if (published.isSynced === false) {
        Alert.alert(
          'Đã lưu ngoại tuyến',
          'Bài viết được lưu trên thiết bị và sẽ tự động đồng bộ lên Firebase khi có mạng trở lại.'
        );
      } else {
        Alert.alert('Thành công', 'Bài viết đã được đăng lên bảng tin du lịch!');
      }
      navigate('HOME');
    } catch (error) {
      Alert.alert(
        'Không đăng được bài viết',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.'
      );
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Travel Post</Text>
        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={isPublishing}>
          <Text style={styles.publishBtnText}>{isPublishing ? 'Đang đăng…' : 'Publish'}</Text>
        </TouchableOpacity>
      </View>

      {/* ẢNH BÀI VIẾT */}
      {localImageUri ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: localImageUri }} style={styles.postImagePreview} />
          <TouchableOpacity
            style={styles.changeImageBtn}
            onPress={pickFromLibrary}
            activeOpacity={0.85}
          >
            <Text style={styles.changeImageText}>Đổi ảnh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderTitle}>Chọn ảnh cho bài viết</Text>
          <Text style={styles.placeholderText}>
            Ảnh sẽ được nén tự động trước khi tải lên Firebase Storage.
          </Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerBtn} onPress={pickFromLibrary} activeOpacity={0.85}>
              <ImageIcon size={16} color={palette.teal[700]} />
              <Text style={styles.pickerBtnText}>Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerBtn, styles.pickerBtnPrimary]}
              onPress={takePhoto}
              activeOpacity={0.85}
            >
              <CameraIcon size={16} color={palette.common.white} />
              <Text style={[styles.pickerBtnText, styles.pickerBtnTextPrimary]}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* FORM */}
      <View style={styles.formCard}>
        <View>
          <Text style={styles.label}>DESTINATION TAG</Text>
          <TextInput
            style={styles.tagInput}
            value={destinationTag}
            onChangeText={setDestinationTag}
            placeholder="Ví dụ: Hoi An Ancient Town"
            placeholderTextColor={palette.slate[400]}
          />
        </View>

        <View>
          <Text style={styles.label}>CAPTION</Text>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Kể lại chuyến đi của bạn cùng hội bạn thân…"
            placeholderTextColor={palette.slate[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, isPublishing && styles.submitBtnDisabled]}
        onPress={handlePublish}
        disabled={isPublishing}
        activeOpacity={0.85}
      >
        {isPublishing ? (
          <ActivityIndicator color={palette.common.white} />
        ) : (
          <Text style={styles.submitText}>Publish Travel Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    gap: spacing.base,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
    fontWeight: typography.fontWeights.semibold,
  },
  headerTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  publishBtn: {
    backgroundColor: palette.coral[500],
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  publishBtnText: {
    color: palette.common.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  imageWrapper: {
    position: 'relative',
  },
  postImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: palette.slate[100],
  },
  changeImageBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  changeImageText: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.common.white,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderStyle: 'dashed',
    backgroundColor: palette.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.base,
  },
  placeholderTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
  },
  placeholderText: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[500],
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.teal[50],
    borderWidth: 1,
    borderColor: palette.teal[200],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  pickerBtnPrimary: {
    backgroundColor: palette.teal[600],
    borderColor: palette.teal[600],
  },
  pickerBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[700],
  },
  pickerBtnTextPrimary: {
    color: palette.common.white,
  },
  formCard: {
    backgroundColor: palette.common.white,
    borderWidth: 1,
    borderColor: palette.slate[100],
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.base,
    ...shadows.sm,
  },
  label: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagInput: {
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[600],
  },
  captionInput: {
    minHeight: 90,
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.fontSizes.xs,
    color: palette.slate[700],
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: palette.coral[500],
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.sm,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.common.white,
  },
});
