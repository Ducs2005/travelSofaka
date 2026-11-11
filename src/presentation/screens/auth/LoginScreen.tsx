import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Button, Card, Input, Badge } from '@/presentation/components/common';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';
import { useAuthStore } from '@/presentation/stores/authStore';
import { AuthRepositoryImpl } from '@/data/repositories/AuthRepositoryImpl';

const authRepo = new AuthRepositoryImpl();

export const LoginScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { setUser, setLoading, setError, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await authRepo.loginWithEmail(email.trim(), password);
      setUser(user);
      navigate('HOME');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Đăng nhập thất bại';
      setError(msg.includes('invalid-credential') ? 'Email hoặc mật khẩu không đúng' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await authRepo.registerWithEmail(email.trim(), password, displayName.trim());
      setUser(user);
      navigate('HOME');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Đăng ký thất bại';
      setError(msg.includes('email-already-in-use') ? 'Email đã được sử dụng' : msg);
    } finally {
      setLoading(false);
    }
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

      {/* Auth Card */}
      <Card style={styles.formCard}>
        {isRegisterMode && (
          <Input
            label="Tên hiển thị"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nguyễn Văn A"
            autoCapitalize="words"
          />
        )}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@student.edu.vn"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder={isRegisterMode ? 'Ít nhất 6 ký tự' : 'Nhập mật khẩu'}
          secureTextEntry
        />

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {isLoading ? (
          <ActivityIndicator
            color={palette.teal[600]}
            size="large"
            style={{ marginTop: spacing.md }}
          />
        ) : (
          <Button
            title={isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập'}
            variant="primary"
            onPress={isRegisterMode ? handleRegister : handleLogin}
            style={{ marginTop: spacing.xs }}
          />
        )}

        <Text style={styles.footerPrompt}>
          {isRegisterMode ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <Text
            style={styles.footerLink}
            onPress={() => {
              setIsRegisterMode((prev) => !prev);
              setError(null);
            }}
          >
            {isRegisterMode ? 'Đăng nhập' : 'Đăng ký ngay'}
          </Text>
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
  errorText: {
    color: palette.coral[500],
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
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
