import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
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

interface HomeFeedScreenProps {
  onViewActiveTrip?: () => void;
  onNavTabPress?: (tab: BottomNavTab) => void;
}

export const HomeFeedScreen: React.FC<HomeFeedScreenProps> = ({
  onViewActiveTrip,
  onNavTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const [likesCount1, setLikesCount1] = useState(128);
  const [isLiked1, setIsLiked1] = useState(true);
  const [likesCount2, setLikesCount2] = useState(94);
  const [isLiked2, setIsLiked2] = useState(false);

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
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
            onPress={() => Alert.alert('Tạo bài viết', 'Mở giao diện đăng bài du lịch mới.')}
            activeOpacity={0.8}
          >
            <Text style={styles.createPostBtnText}>+ Create Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          {/* ACTIVE TRIP BANNER */}
          <View style={styles.activeTripCard}>
            <View style={styles.activeTripTopRow}>
              <View style={styles.activeTripPill}>
                <Text style={styles.activeTripPillText}>
                  ACTIVE TRIP • OCT 24–26
                </Text>
              </View>

              <TouchableOpacity
                onPress={onViewActiveTrip}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.viewTripText}>View →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.activeTripTitle}>
              Da Nang – Hoi An Summer Squad
            </Text>
          </View>

          {/* POST 1: TÙNG LÂM */}
          <View style={styles.postCard}>
            {/* Author row */}
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
                }}
                style={styles.authorAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>Tùng Lâm</Text>
                <View style={styles.locationRow}>
                  <PinIcon size={12} color="#0D9488" />
                  <Text style={styles.locationText}>Hoi An Ancient Town</Text>
                </View>
              </View>
              <Text style={styles.timeAgoText}>2h ago</Text>
            </View>

            {/* Post image */}
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
              }}
              style={styles.postImage}
            />

            {/* Caption */}
            <Text style={styles.captionText}>
              Night lantern boat ride with the CS uni squad! Best Cao Lầu & Bánh Mì Phượng
            </Text>

            {/* Action Row */}
            <View style={styles.engagementRow}>
              <View style={styles.engagementLeft}>
                <TouchableOpacity
                  style={styles.statBtn}
                  onPress={() => {
                    setIsLiked1(!isLiked1);
                    setLikesCount1(isLiked1 ? likesCount1 - 1 : likesCount1 + 1);
                  }}
                >
                  <HeartIcon size={14} color={isLiked1 ? '#FF6B6B' : '#94A3B8'} />
                  <Text
                    style={[
                      styles.statText,
                      isLiked1 && { color: '#FF6B6B', fontWeight: '700' },
                    ]}
                  >
                    {likesCount1} Likes
                  </Text>
                </TouchableOpacity>

                <View style={styles.statBtn}>
                  <CommentIcon size={14} color="#64748B" />
                  <Text style={styles.statText}>14 Comments</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Alert.alert('Hoi An Ancient Town', 'Xem chi tiết địa điểm Hội An.')}
              >
                <Text style={styles.viewPlaceText}>View Place →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* POST 2: NANASHI */}
          <View style={styles.postCard}>
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
                }}
                style={styles.authorAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>Nanashi</Text>
                <View style={styles.locationRow}>
                  <PinIcon size={12} color="#0D9488" />
                  <Text style={styles.locationText}>Da Lat Pine Hills</Text>
                </View>
              </View>
              <Text style={styles.timeAgoText}>1d ago</Text>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
              }}
              style={styles.postImage}
            />

            <View style={styles.engagementRow}>
              <View style={styles.engagementLeft}>
                <TouchableOpacity
                  style={styles.statBtn}
                  onPress={() => {
                    setIsLiked2(!isLiked2);
                    setLikesCount2(isLiked2 ? likesCount2 - 1 : likesCount2 + 1);
                  }}
                >
                  <HeartIcon size={14} color={isLiked2 ? '#FF6B6B' : '#94A3B8'} />
                  <Text style={styles.statText}>{likesCount2} Likes</Text>
                </TouchableOpacity>

                <View style={styles.statBtn}>
                  <CommentIcon size={14} color="#64748B" />
                  <Text style={styles.statText}>8 Comments</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV BAR */}
      <BottomNavBar activeTab="home" onTabPress={onNavTabPress} />
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
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  createPostBtn: {
    backgroundColor: '#FF6B6B', // Salmon/coral
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    ...shadows.sm,
  },
  createPostBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contentPadding: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16,
  },
  activeTripCard: {
    backgroundColor: '#0D9488', // Teal
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
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewTripText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTripTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: '#F1F5F9',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 10.5,
    color: '#0D9488',
    fontWeight: '600',
  },
  timeAgoText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  captionText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
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
    color: '#64748B',
    fontWeight: '600',
  },
  viewPlaceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D9488',
  },
});
