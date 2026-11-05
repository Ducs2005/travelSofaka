import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge } from '@/presentation/components/common';
import { useSocialStore } from '@/presentation/stores/socialStore';
import { useTripStore } from '@/presentation/stores/tripStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const HomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { posts, likePost } = useSocialStore();
  const { activeTrip } = useTripStore();

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.headerTitle}>Traval Sofaka</Text>
        </View>
        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => navigate('CREATE_POST')}
          activeOpacity={0.8}
        >
          <Text style={styles.createPostBtnText}>+ Create Post</Text>
        </TouchableOpacity>
      </View>

      {/* Active Trip Banner */}
      {activeTrip && (
        <TouchableOpacity
          style={styles.activeTripBanner}
          onPress={() => navigate('TRIP_DETAILS')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Badge label="Active Trip • Oct 24–26" variant="teal" style={{ marginBottom: 4 }} />
            <Text style={styles.activeTripTitle}>{activeTrip.title}</Text>
          </View>
          <Text style={styles.viewTripArrow}>View →</Text>
        </TouchableOpacity>
      )}

      {/* Feed Post List */}
      {posts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.destinationTag}>{post.destinationTag}</Text>
            </View>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>

          {/* Post Image */}
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

          {/* Caption */}
          <Text style={styles.captionText}>{post.caption}</Text>

          {/* Interactions */}
          <View style={styles.interactionRow}>
            <TouchableOpacity onPress={() => likePost(post.id)}>
              <Text style={styles.likeText}>♥ {post.likesCount} Likes</Text>
            </TouchableOpacity>
            <Text style={styles.commentText}>💬 {post.commentsCount} Comments</Text>
            <TouchableOpacity
              onPress={() =>
                navigate('DESTINATION_DETAILS', {
                  title: post.destinationTag.replace('📍 ', ''),
                  image: post.imageUrl,
                })
              }
            >
              <Text style={styles.placeText}>View Place →</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
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
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.extrabold,
    fontSize: typography.fontSizes.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  createPostBtn: {
    backgroundColor: palette.coral[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  createPostBtnText: {
    color: palette.common.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  activeTripBanner: {
    backgroundColor: palette.teal[600],
    borderRadius: radii.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTripTitle: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.base,
  },
  viewTripArrow: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  postCard: {
    backgroundColor: palette.common.white,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
  },
  authorName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  destinationTag: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.teal[600],
    fontWeight: typography.fontWeights.semibold,
  },
  timeAgo: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
  },
  postImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    marginBottom: spacing.base,
  },
  captionText: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[700],
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.base,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
  },
  likeText: {
    fontSize: typography.fontSizes.xs,
    color: palette.coral[500],
    fontWeight: typography.fontWeights.semibold,
  },
  commentText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
    fontWeight: typography.fontWeights.semibold,
  },
  placeText: {
    fontSize: typography.fontSizes.xs,
    color: palette.teal[600],
    fontWeight: typography.fontWeights.semibold,
  },
});
