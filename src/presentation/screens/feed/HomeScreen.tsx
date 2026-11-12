import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';
import {
  PinIcon,
  HeartIcon,
  CommentIcon,
} from '@/presentation/components/common/MonochromeIcons';
import { CommentSheet } from '@/presentation/components/social/CommentSheet';
import { useSocialStore } from '@/presentation/stores/socialStore';
import { useTripStore } from '@/presentation/stores/tripStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';
import { TravelPost } from '@/domain/entities/post';

interface HomeFeedScreenProps {
  onViewActiveTrip?: () => void;
  onNavTabPress?: (tab: BottomNavTab) => void;
}

/**
 * SOC-01: Screen 02 — Home Feed.
 * Dữ liệu bài đăng lấy từ socialStore (Firestore + cache SQLite), tương tác Like / Comment thật.
 */
export const HomeFeedScreen: React.FC<HomeFeedScreenProps> = ({
  onViewActiveTrip,
  onNavTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const { navigate } = useAppNavigation();
  const { activeTrip } = useTripStore();
  const {
    posts,
    commentsByPost,
    likedPostIds,
    pendingCount,
    isOnline,
    isLoading,
    isRefreshing,
    error,
    loadFeed,
    toggleLike,
    loadComments,
    addComment,
    syncPending,
    clearError,
  } = useSocialStore();

  const [commentTarget, setCommentTarget] = useState<TravelPost | null>(null);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handleRefresh = useCallback(() => {
    void loadFeed({ silent: true });
  }, [loadFeed]);

  const handleSyncNow = useCallback(async () => {
    const result = await syncPending();
    Alert.alert(
      'Đồng bộ dữ liệu',
      result.pushed > 0
        ? `Đã đẩy ${result.pushed} mục lên Firebase Firestore.`
        : 'Chưa có mục nào đồng bộ được. Kiểm tra kết nối mạng và thử lại.'
    );
  }, [syncPending]);

  const openComments = useCallback(
    (post: TravelPost) => {
      setCommentTarget(post);
      void loadComments(post.id);
    },
    [loadComments]
  );

  const activeTripLabel = activeTrip
    ? `ACTIVE TRIP • ${activeTrip.startDate.toUpperCase()}`
    : 'ACTIVE TRIP';

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.teal[600]}
          />
        }
      >
        {/* TOP BRAND BAR WITH SAFE NOTCH INSET */}
        <View style={[styles.topBrandBar, { paddingTop: topInset + 6 }]}>
          <View style={styles.brandTitleRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>T</Text>
            </View>
            <Text style={styles.brandTitleText}>TripMate</Text>
          </View>

          <TouchableOpacity
            style={styles.createPostBtn}
            onPress={() => navigate('CREATE_POST')}
            activeOpacity={0.8}
          >
            <Text style={styles.createPostBtnText}>+ Create Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* TRẠNG THÁI ĐỒNG BỘ NGOẠI TUYẾN */}
          {(!isOnline || pendingCount > 0) && (
            <TouchableOpacity
              style={styles.syncBanner}
              onPress={handleSyncNow}
              activeOpacity={0.85}
            >
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>
                {isOnline
                  ? `${pendingCount} mục chờ đồng bộ lên Firestore`
                  : `Ngoại tuyến • ${pendingCount} mục đang chờ`}
              </Text>
              <Text style={styles.syncAction}>Đồng bộ ↻</Text>
            </TouchableOpacity>
          )}

          {/* LỖI TẢI DỮ LIỆU */}
          {error && (
            <TouchableOpacity style={styles.errorBanner} onPress={clearError}>
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          )}

          {/* ACTIVE TRIP BANNER */}
          {activeTrip && (
            <View style={styles.activeTripCard}>
              <View style={styles.activeTripTopRow}>
                <View style={styles.activeTripPill}>
                  <Text style={styles.activeTripPillText}>{activeTripLabel}</Text>
                </View>

                <TouchableOpacity
                  onPress={onViewActiveTrip}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.viewTripText}>View →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.activeTripTitle}>{activeTrip.title}</Text>
            </View>
          )}

          {/* DANH SÁCH BÀI ĐĂNG */}
          {isLoading && posts.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={palette.teal[600]} />
              <Text style={styles.loadingText}>Đang tải bảng tin…</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
              <Text style={styles.emptyText}>Hãy là người đầu tiên chia sẻ chuyến đi của bạn!</Text>
            </View>
          ) : (
            posts.map((post) => {
              const isLiked = likedPostIds.includes(post.id);
              return (
                <View key={post.id} style={styles.postCard}>
                  {/* Author row */}
                  <View style={styles.authorRow}>
                    <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName}>{post.authorName}</Text>
                      <View style={styles.locationRow}>
                        <PinIcon size={12} color={palette.teal[600]} />
                        <Text style={styles.locationText}>
                          {post.destinationTag.replace('📍 ', '')}
                        </Text>
                      </View>
                    </View>
                    {post.isSynced === false ? (
                      <Text style={styles.pendingTag}>Chờ đồng bộ</Text>
                    ) : (
                      <Text style={styles.timeAgoText}>{post.timeAgo}</Text>
                    )}
                  </View>

                  {/* Post image */}
                  <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

                  {/* Caption */}
                  {!!post.caption && <Text style={styles.captionText}>{post.caption}</Text>}

                  {/* Action Row */}
                  <View style={styles.engagementRow}>
                    <View style={styles.engagementLeft}>
                      <TouchableOpacity
                        style={styles.statBtn}
                        onPress={() => void toggleLike(post.id)}
                      >
                        <HeartIcon
                          size={14}
                          color={isLiked ? palette.coral[500] : palette.slate[400]}
                        />
                        <Text style={[styles.statText, isLiked && styles.statTextLiked]}>
                          {post.likesCount} Likes
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.statBtn} onPress={() => openComments(post)}>
                        <CommentIcon size={14} color={palette.slate[500]} />
                        <Text style={styles.statText}>{post.commentsCount} Comments</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        navigate('DESTINATION_DETAILS', {
                          title: post.destinationTag.replace('📍 ', ''),
                          image: post.imageUrl,
                        })
                      }
                    >
                      <Text style={styles.viewPlaceText}>View Place →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR */}
      <BottomNavBar activeTab="home" onTabPress={onNavTabPress} />

      {/* COMMENT SHEET */}
      <CommentSheet
        post={commentTarget}
        comments={commentTarget ? commentsByPost[commentTarget.id] ?? [] : []}
        onClose={() => setCommentTarget(null)}
        onSubmit={async (body) => {
          if (commentTarget) await addComment(commentTarget.id, body);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: palette.common.white,
    justifyContent: 'space-between',
  },
  scrollArea: {
    flex: 1,
  },
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: palette.common.white,
    fontWeight: '800',
    fontSize: 16,
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.slate[900],
  },
  createPostBtn: {
    backgroundColor: palette.coral[500],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    ...shadows.sm,
  },
  createPostBtnText: {
    color: palette.common.white,
    fontSize: 12,
    fontWeight: '700',
  },
  contentPadding: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  syncText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  syncAction: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.teal[600],
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
  },
  activeTripCard: {
    backgroundColor: palette.teal[600],
    borderRadius: 18,
    padding: 16,
    gap: 10,
    ...shadows.sm,
  },
  activeTripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTripPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeTripPillText: {
    color: palette.common.white,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewTripText: {
    color: palette.common.white,
    fontSize: 12,
    fontWeight: '700',
  },
  activeTripTitle: {
    color: palette.common.white,
    fontSize: 15,
    fontWeight: '800',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: palette.slate[500],
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.slate[100],
    borderRadius: 18,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.slate[900],
  },
  emptyText: {
    fontSize: 12,
    color: palette.slate[500],
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: palette.common.white,
    borderWidth: 1,
    borderColor: palette.slate[100],
    borderRadius: 18,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.slate[100],
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.slate[900],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 10.5,
    color: palette.teal[600],
    fontWeight: '600',
  },
  timeAgoText: {
    fontSize: 11,
    color: palette.slate[400],
  },
  pendingTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  captionText: {
    fontSize: 12,
    color: palette.slate[700],
    lineHeight: 18,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: palette.slate[50],
  },
  engagementLeft: {
    flexDirection: 'row',
    gap: 14,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11.5,
    color: palette.slate[500],
    fontWeight: '600',
  },
  statTextLiked: {
    color: palette.coral[500],
    fontWeight: '700',
  },
  viewPlaceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: palette.teal[600],
  },
});
