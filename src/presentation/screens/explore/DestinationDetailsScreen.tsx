import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';
import { Badge, Button, Card } from '@/presentation/components/common';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const DestinationDetailsScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();

  const title = params.title || 'Da Nang Coastal City';
  const subtitle = params.subtitle || '📍 My Khe Beach & Son Tra Peninsula';
  const region = params.region || 'Central Vietnam';
  const price = params.price || '850k VND/day';
  const rating = params.rating || '★ 4.9 (420)';
  const duration = params.duration || '3–4 Days';
  const about =
    params.about ||
    'Famous for My Khe white-sand beach, vibrant night markets, Dragon Bridge fire show, and budget-friendly student seafood spots.';
  const image =
    params.image || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: image }} style={styles.heroImage} />
          
          {/* Top Actions */}
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.circleBtn} onPress={goBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.circleBtn, { backgroundColor: palette.coral[500] }]}>
              <Text style={{ color: palette.common.white }}>♥</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <View style={styles.heroOverlay}>
            <Badge label={region.toUpperCase()} variant="coral" style={{ marginBottom: 4 }} />
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>EST. BUDGET</Text>
            <Text style={[styles.infoVal, { color: palette.teal[600] }]}>{price}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>RATING</Text>
            <Text style={[styles.infoVal, { color: palette.amber[500] }]}>{rating}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>DURATION</Text>
            <Text style={styles.infoVal}>{duration}</Text>
          </View>
        </View>

        {/* About Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>About Destination</Text>
          <Text style={styles.bodyText}>{about}</Text>
        </Card>

        {/* Student Reviews */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Student Reviews (28)</Text>
          <View style={styles.reviewBox}>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewerName}>Thu Thảo • VKU</Text>
              <Text style={styles.reviewStars}>★★★★★</Text>
            </View>
            <Text style={styles.reviewContent}>
              Rent scooters for 120k VND/day and ride up Son Tra Peninsula before sunset!
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.savedLabel}>SAVED TO BOOKMARKS</Text>
          <Text style={styles.readyText}>Ready to plan?</Text>
        </View>
        <Button
          title="+ Add to Trip"
          variant="secondary"
          size="md"
          fullWidth={false}
          onPress={() => navigate('TRIP_PLANNER', { destinationTitle: title })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  scroll: {
    paddingBottom: 90,
  },
  heroWrapper: {
    height: 260,
    position: 'relative',
    backgroundColor: palette.teal[900],
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topNav: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: palette.common.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backArrow: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  heroTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.common.white,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[200],
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: palette.common.white,
    borderRadius: radii.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: palette.slate[100],
    marginBottom: spacing.base,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 2,
  },
  infoVal: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[800],
  },
  sectionCard: {
    backgroundColor: palette.common.white,
    marginBottom: spacing.base,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[600],
    lineHeight: typography.lineHeights.base,
  },
  reviewBox: {
    backgroundColor: palette.slate[50],
    borderRadius: radii.md,
    padding: spacing.base,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: palette.slate[100],
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[800],
  },
  reviewStars: {
    color: palette.amber[500],
    fontSize: typography.fontSizes.xs,
  },
  reviewContent: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[600],
  },
  bottomBar: {
    backgroundColor: palette.common.white,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radii.lg,
  },
  savedLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
  },
  readyText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
});
