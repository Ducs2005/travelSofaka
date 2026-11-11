import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/core/firebase/firebaseConfig';
import { UserProfile } from '@/domain/entities/user';

/** Map Firebase User → UserProfile domain entity */
function mapFirebaseUser(user: User, extra?: Partial<UserProfile>): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    avatarUrl: user.photoURL ?? '',
    tripsCount: 0,
    savedCount: 0,
    friendsCount: 0,
    createdAt: Date.now(),
    ...extra,
  };
}

export class AuthRemoteDataSource {
  /** Đăng nhập bằng email/password */
  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // Lấy thêm thông tin từ Firestore nếu có
    const snap = await getDoc(doc(db, 'users', credential.user.uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return mapFirebaseUser(credential.user);
  }

  /** Đăng ký tài khoản mới */
  async registerWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    const profile: UserProfile = {
      uid: credential.user.uid,
      email,
      displayName: name,
      tripsCount: 0,
      savedCount: 0,
      friendsCount: 0,
      createdAt: Date.now(),
    };

    // Lưu profile lên Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return profile;
  }

  /** Đăng xuất */
  async logout(): Promise<void> {
    await signOut(auth);
  }

  /** Lấy user đang đăng nhập */
  getCurrentUser(): UserProfile | null {
    const user = auth.currentUser;
    if (!user) return null;
    return mapFirebaseUser(user);
  }

  /** Subscribe auth state thay đổi */
  onAuthChanged(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(mapFirebaseUser(firebaseUser));
      }
    });
  }

  /** Cập nhật profile */
  async updateProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), profile as Record<string, unknown>);
    if (profile.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: profile.displayName });
    }
  }
}
