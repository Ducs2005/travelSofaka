import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Button, Card, Input, Badge } from '@/presentation/components/common';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';

export const LoginScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [email, setEmail] = useState('viet.tran@student.edu.vn');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = () => {
    // Navigate straight to Home feed
    navigate('HOME');
  };

  return (
    <View style={styles.container}>
      {/* Hero Banner */}
      <View style={styles.heroWrapper}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Badge label="STUDENT TRAVEL SQUAD" variant="coral" style={{ marginBottom: 6 }} />
          <Text style={styles.heroTitle}>TripMate</Text>
          <Text style={styles.heroSubtitle}>Plan together, split bills easily, travel further.</Text>
        </View>
      </View>

      {/* Login Card */}
      <Card style={styles.formCard}>
        <Input
          label="University or Personal Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@student.edu.vn"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
        <Button
          title="Sign In to TripMate"
          variant="primary"
          onPress={handleLogin}
          style={{ marginTop: spacing.xs }}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Continue with Google"
          variant="outline"
          onPress={handleLogin}
        />

        <Text style={styles.footerPrompt}>
          New to TripMate? <Text style={styles.footerLink}>Create Student Account</Text>
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingBottom: 24,
  },
  heroWrapper: {
    height: 220,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: palette.teal[900],
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(19, 78, 74, 0.75)',
  },
  heroTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.common.white,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.teal[100],
    marginTop: 2,
  },
  formCard: {
    backgroundColor: palette.common.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.slate[200],
  },
  dividerText: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    fontWeight: typography.fontWeights.bold,
  },
  footerPrompt: {
    textAlign: 'center',
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
    marginTop: spacing.xl,
  },
  footerLink: {
    color: palette.coral[500],
    fontWeight: typography.fontWeights.bold,
  },
});
