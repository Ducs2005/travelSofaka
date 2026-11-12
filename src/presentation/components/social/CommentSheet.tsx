import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { formatRelativeTime } from '@/core/utils/relativeTime';
import { PostComment, TravelPost } from '@/domain/entities/post';

interface CommentSheetProps {
  post: TravelPost | null;
  comments: PostComment[];
  onClose: () => void;
  onSubmit: (body: string) => Promise<void>;
}

/** Khung bình luận của một bài viết (Firestore subcollection posts/{id}/comments) */
export const CommentSheet: React.FC<CommentSheetProps> = ({
  post,
  comments,
  onClose,
  onSubmit,
}) => {
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSubmit(trimmed);
      setBody('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={post !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {comments.length === 0 ? (
              <Text style={styles.emptyText}>
                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
              </Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <Image source={{ uri: comment.authorAvatar }} style={styles.avatar} />
                  <View style={styles.commentBody}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.authorName}>{comment.authorName}</Text>
                      <Text style={styles.timeText}>{formatRelativeTime(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.bodyText}>{comment.body}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={body}
                onChangeText={setBody}
                placeholder="Viết bình luận…"
                placeholderTextColor={palette.slate[400]}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!body.trim() || isSending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!body.trim() || isSending}
              >
                <Text style={styles.sendText}>{isSending ? '…' : 'Gửi'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.common.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 28 : spacing.base,
    maxHeight: '75%',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  closeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[500],
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.base,
    paddingBottom: spacing.base,
  },
  emptyText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.slate[100],
  },
  commentBody: {
    flex: 1,
    backgroundColor: palette.slate[50],
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorName: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  timeText: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
  },
  bodyText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[700],
    lineHeight: 17,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    paddingTop: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    backgroundColor: palette.slate[50],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.slate[200],
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: typography.fontSizes.xs,
    color: palette.slate[900],
  },
  sendBtn: {
    backgroundColor: palette.teal[600],
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnDisabled: {
    backgroundColor: palette.slate[300],
  },
  sendText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.common.white,
  },
});
