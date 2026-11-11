import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Button, Input } from '@/presentation/components/common';
import { useSocialStore } from '@/presentation/stores/socialStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const CreatePostScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();
  const { addPost } = useSocialStore();

  const [destinationTag, setDestinationTag] = useState('📍 Ha Long Bay, Quang Ninh');
  const [caption, setCaption] = useState(
    'Kayaking through emerald limestone waters in Ha Long Bay with the uni squad! Student boat tour was only 450k VND each 🛶⛰️✨'
  );

  const handlePublish = () => {
    addPost({
      id: 'post_' + Date.now(),
      authorUid: 'user_viet_tran',
      authorName: 'Trần Quang Việt',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160',
      destinationTag,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600',
      caption,
      likesCount: 0,
      commentsCount: 0,
      timeAgo: 'Just now',
      createdAt: Date.now(),
    });
    Alert.alert('Thành công', 'Bài viết đã được đăng lên bảng tin du lịch!');
    navigate('HOME');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Travel Post</Text>
        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
          <Text style={styles.publishBtnText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Image Preview */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600' }}
        style={styles.postImagePreview}
      />

      {/* Form Card */}
      <Card style={styles.formCard}>
        <Input
          label="Destination Tag"
          value={destinationTag}
          onChangeText={setDestinationTag}
          inputStyle={{ color: palette.teal[600], fontWeight: 'bold' }}
        />

        <Input
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Button
          title="Publish Travel Post"
          variant="secondary"
          size="lg"
          onPress={handlePublish}
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
  postImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: radii.lg,
  },
  formCard: {
    backgroundColor: palette.common.white,
  },
});
