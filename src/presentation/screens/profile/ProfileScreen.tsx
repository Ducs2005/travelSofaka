import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';
import { Card, Badge, Button } from '@/presentation/components/common';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useSocialStore } from '@/presentation/stores/socialStore';
import { useAppNavigation } from '@/presentation/navigation/NavigationContext';
import { AuthRepositoryImpl } from '@/data/repositories/AuthRepositoryImpl';

const authRepo = new AuthRepositoryImpl();

const AVATAR_PLACEHOLDER =
  'https://ui-avatars.com/api/?background=0d9488&color=fff&size=160&name=';

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
interface EditProfileModalProps {
  visible: boolean;
  initialName: string;
  initialBio: string;
  initialLocation: string;
  onClose: () => void;
  onSave: (data: { displayName: string; bio: string; location: string }) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  initialName,
  initialBio,
  initialLocation,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState(initialLocation);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Tên hiển thị không được để trống');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ displayName: name.trim(), bio: bio.trim(), location: location.trim() });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>

          <Text style={styles.inputLabel}>Tên hiển thị *</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn A"
            placeholderTextColor={palette.slate[400]}
          />

          <Text style={styles.inputLabel}>Giới thiệu bản thân</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Chia sẻ đôi điều về bạn..."
            placeholderTextColor={palette.slate[400]}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Vị trí</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Đà Nẵng, Việt Nam"
            placeholderTextColor={palette.slate[400]}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={palette.common.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { user, setUser, logout } = useAuthStore();
  const { posts } = useSocialStore();
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'saved' | 'history'>('posts');
  const [editVisible, setEditVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Posts của chính user hiện tại
  const myPosts = useMemo(
    () => posts.filter((p) => p.authorUid === user?.uid),
    [posts, user?.uid]
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authRepo.logout();
    } catch (_e) {
      // ignore
    } finally {
      logout();
      navigate('LOGIN');
    }
  };

  const handleSaveProfile = async (data: {
    displayName: string;
    bio: string;
    location: string;
  }) => {
    if (!user) return;
    const updated = await authRepo.updateProfile(data);
    setUser(updated);
  };

  if (!user) {
    return (
      <Card>
        <Text style={{ textAlign: 'center', color: palette.slate[600] }}>Chưa đăng nhập.</Text>
        <Button
          title="Đăng nhập"
          variant="primary"
          onPress={() => navigate('LOGIN')}
          style={{ marginTop: spacing.base }}
        />
      </Card>
    );
  }

  const avatarUri = user.avatarUrl
    ? user.avatarUrl
    : `${AVATAR_PLACEHOLDER}${encodeURIComponent(user.displayName)}`;

  return (
    <>
      <View style={styles.container}>
        {/* ── Header Card ── */}
        <Card style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user.displayName}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user.email}
              </Text>
              {user.location ? (
                <Badge label={`📍 ${user.location}`} variant="teal" style={{ marginTop: 4 }} />
              ) : null}
            </View>
            {/* Edit button */}
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}>
              <Text style={styles.editBtnText}>✏️ Sửa</Text>
            </TouchableOpacity>
          </View>

          {user.bio ? (
            <Text style={styles.profileBio}>{user.bio}</Text>
          ) : (
            <TouchableOpacity onPress={() => setEditVisible(true)}>
              <Text style={styles.profileBioPlaceholder}>
                + Thêm giới thiệu bản thân…
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{user.tripsCount}</Text>
              <Text style={styles.statLabel}>TRIPS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{user.savedCount}</Text>
              <Text style={styles.statLabel}>SAVED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{user.friendsCount}</Text>
              <Text style={styles.statLabel}>FRIENDS</Text>
            </View>
          </View>
        </Card>

        {/* ── Tabs ── */}
        <View style={styles.subTabRow}>
          {(['posts', 'saved', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveSubTab(tab)}
              style={[styles.subTabButton, activeSubTab === tab && styles.subTabButtonActive]}
            >
              <Text
                style={[styles.subTabText, activeSubTab === tab && styles.subTabTextActive]}
              >
                {tab === 'posts' ? '📸 POSTS' : tab === 'saved' ? '🔖 SAVED' : '🗺️ HISTORY'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab: POSTS ── */}
        {activeSubTab === 'posts' && (
          <>
            {myPosts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📸</Text>
                <Text style={styles.emptyTitle}>Chưa có bài đăng nào</Text>
                <Text style={styles.emptyDesc}>
                  Chia sẻ những khoảnh khắc du lịch của bạn!
                </Text>
                <Button
                  title="Tạo bài đăng đầu tiên"
                  variant="primary"
                  size="sm"
                  onPress={() => navigate('CREATE_POST')}
                  style={{ marginTop: spacing.base }}
                />
              </Card>
            ) : (
              <View style={styles.photoGrid}>
                {myPosts.map((post) => (
                  <TouchableOpacity key={post.id} style={styles.gridTouch}>
                    <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridLikes}>❤️ {post.likesCount}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Tab: SAVED ── */}
        {activeSubTab === 'saved' && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>Chưa có địa điểm nào được lưu</Text>
            <Text style={styles.emptyDesc}>
              Khám phá và lưu các địa điểm yêu thích để xem lại sau.
            </Text>
            <Button
              title="Khám phá ngay"
              variant="primary"
              size="sm"
              onPress={() => navigate('EXPLORE')}
              style={{ marginTop: spacing.base }}
            />
          </Card>
        )}

        {/* ── Tab: HISTORY ── */}
        {activeSubTab === 'history' && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>Chưa có lịch sử chuyến đi</Text>
            <Text style={styles.emptyDesc}>
              Các chuyến đi đã hoàn thành sẽ hiển thị ở đây.
            </Text>
            <Button
              title="Lên kế hoạch chuyến đi"
              variant="primary"
              size="sm"
              onPress={() => navigate('TRIP_PLANNER')}
              style={{ marginTop: spacing.base }}
            />
          </Card>
        )}

        {/* ── Sign Out ── */}
        <TouchableOpacity
          style={[styles.signOutBtn, signingOut && { opacity: 0.5 }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={palette.coral[500]} size="small" />
          ) : (
            <Text style={styles.signOutText}>🚪 Đăng xuất</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Edit Modal ── */}
      <EditProfileModal
        visible={editVisible}
        initialName={user.displayName}
        initialBio={user.bio ?? ''}
        initialLocation={user.location ?? ''}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingBottom: 24,
  },
  // Header
  headerCard: { backgroundColor: palette.common.white },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: palette.teal[200],
    backgroundColor: palette.slate[200],
  },
  profileName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  profileEmail: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
    marginTop: 1,
  },
  profileBio: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[600],
    marginTop: spacing.base,
    lineHeight: typography.lineHeights.sm,
  },
  profileBioPlaceholder: {
    fontSize: typography.fontSizes.sm,
    color: palette.teal[500],
    marginTop: spacing.base,
    fontStyle: 'italic',
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.slate[200],
    backgroundColor: palette.slate[50],
  },
  editBtnText: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[600],
    fontWeight: typography.fontWeights.semibold,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    marginTop: spacing.base,
    paddingTop: spacing.base,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: palette.slate[100] },
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
  // Tabs
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
  subTabButtonActive: { backgroundColor: palette.common.white },
  subTabText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[500],
  },
  subTabTextActive: { color: palette.slate[900] },
  // Photo grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridTouch: {
    width: '48%',
    height: 130,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  gridLikes: {
    color: palette.common.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  // Empty state
  emptyCard: {
    backgroundColor: palette.common.white,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: { fontSize: 36, marginBottom: spacing.sm },
  emptyTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[400],
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm,
  },
  // Sign out
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.coral[200],
    backgroundColor: palette.coral[50],
    marginTop: spacing.xs,
  },
  signOutText: {
    color: palette.coral[500],
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: palette.common.white,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.slate[300],
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[600],
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: palette.slate[900],
    backgroundColor: palette.slate[50],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: palette.coral[500],
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.slate[200],
    alignItems: 'center',
  },
  cancelBtnText: {
    color: palette.slate[600],
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
  },
  saveBtnText: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
});
