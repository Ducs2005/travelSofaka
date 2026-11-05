import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button } from '@/presentation/components/common';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const ProfileScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { user, logout } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'saved' | 'history'>('posts');

  const handleSignOut = () => {
    logout();
    navigate('LOGIN');
  };

  if (!user) {
    return (
      <Card>
        <Text style={{ textAlign: 'center', color: palette.slate[600] }}>
          Chưa đăng nhập.
        </Text>
        <Button
          title="Go to Login"
          variant="primary"
          onPress={() => navigate('LOGIN')}
          style={{ marginTop: spacing.base }}
        />
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <Card style={styles.headerCard}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user.displayName}</Text>
            <Text style={styles.profileRole}>@viet.travels • Senior CS Student</Text>
            <Badge label={`📍 ${user.location}`} variant="teal" style={{ marginTop: 4 }} />
          </View>
        </View>
        <Text style={styles.profileBio}>{user.bio}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.tripsCount}</Text>
            <Text style={styles.statLabel}>TRIPS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.savedCount}</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.friendsCount}</Text>
            <Text style={styles.statLabel}>FRIENDS</Text>
          </View>
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.subTabRow}>
        {(['posts', 'saved', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveSubTab(tab)}
            style={[
              styles.subTabButton,
              activeSubTab === tab && styles.subTabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                activeSubTab === tab && styles.subTabTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid Photos - Click to navigate */}
      <View style={styles.photoGrid}>
        <TouchableOpacity
          style={styles.gridTouch}
          onPress={() => navigate('DESTINATION_DETAILS', { title: 'Da Nang Coastal City' })}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400' }}
            style={styles.gridImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridTouch}
          onPress={() => navigate('DESTINATION_DETAILS', { title: 'Da Lat Pine Hills' })}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' }}
            style={styles.gridImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridTouch}
          onPress={() => navigate('DESTINATION_DETAILS', { title: 'Ha Long Bay' })}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400' }}
            style={styles.gridImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridTouch}
          onPress={() => navigate('DESTINATION_DETAILS', { title: 'Hoi An Ancient Town' })}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=400' }}
            style={styles.gridImage}
          />
        </TouchableOpacity>
      </View>

      <Button
        title="Sign Out"
        variant="outline"
        size="sm"
        onPress={handleSignOut}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: palette.common.white,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: palette.teal[200],
  },
  profileName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  profileRole: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  profileBio: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[600],
    marginTop: spacing.base,
    lineHeight: typography.lineHeights.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    marginTop: spacing.base,
    paddingTop: spacing.base,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  statLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginTop: 2,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: palette.slate[200],
    borderRadius: radii.md,
    padding: 3,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  subTabButtonActive: {
    backgroundColor: palette.common.white,
  },
  subTabText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[600],
  },
  subTabTextActive: {
    color: palette.slate[900],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridTouch: {
    width: '48%',
    height: 120,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});
