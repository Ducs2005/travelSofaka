import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Input } from '@/presentation/components/common';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const ExploreScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Beaches' | 'Mountains'>('All');

  const destinations = [
    {
      id: 'dest_1',
      title: 'Da Nang Coastal City',
      subtitle: 'My Khe Beach & Son Tra Peninsula',
      region: 'Central Vietnam',
      price: '850,000 VND/day',
      rating: '★ 4.9 (420)',
      duration: '3–4 Days',
      about: 'Famous for My Khe white-sand beach, vibrant night markets, Dragon Bridge fire show, and budget-friendly student seafood spots.',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    },
    {
      id: 'dest_2',
      title: 'Hoi An Ancient Town',
      subtitle: 'Quang Nam • Lantern Heritage',
      region: 'Central Vietnam',
      price: '650,000 VND/day',
      rating: '★ 4.9 (310)',
      duration: '2–3 Days',
      about: 'Well-preserved ancient town with yellow historic houses, colorful silk lantern boats on Hoai River, and tasty Cao Lau.',
      image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800',
    },
    {
      id: 'dest_3',
      title: 'Ha Long Bay',
      subtitle: 'Quang Ninh • Natural Wonder',
      region: 'Northern Vietnam',
      price: '1,200,000 VND/day',
      rating: '★ 4.9 (580)',
      duration: '2–3 Days',
      about: 'Emerald waters and thousands of towering limestone islands topped by rainforests. Amazing kayaking and boat tours.',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    },
  ];

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <Text style={styles.headerTitle}>Explore Vietnam 🇻🇳</Text>
        <Input placeholder="🔍 Search Da Nang, Hoi An, Da Lat..." />

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {(['All', 'Beaches', 'Mountains'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat === 'Beaches' ? '🏖️ Beaches' : cat === 'Mountains' ? '⛰️ Mountains' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Destination Cards */}
      {destinations.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.88}
          onPress={() => navigate('DESTINATION_DETAILS', item)}
        >
          <Card padding="none" style={styles.destCard}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image }} style={styles.destImage} />
              <Badge label={item.price} variant="teal" style={styles.priceBadge} />
            </View>
            <View style={styles.cardInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.destTitle}>{item.title}</Text>
                <Text style={styles.destSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.ratingText}>{item.rating.split(' ')[0]} {item.rating.split(' ')[1]}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  searchCard: {
    backgroundColor: palette.common.white,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
    marginBottom: spacing.base,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: palette.slate[100],
  },
  categoryPillActive: {
    backgroundColor: palette.teal[600],
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[600],
  },
  categoryTextActive: {
    color: palette.common.white,
  },
  destCard: {
    backgroundColor: palette.common.white,
  },
  imageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  destImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  destTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  destSubtitle: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[500],
    marginTop: 2,
  },
  ratingText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.amber[500],
  },
});
