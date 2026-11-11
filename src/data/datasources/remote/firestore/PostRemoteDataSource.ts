import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/core/firebase/firebaseConfig';
import { TravelPost } from '@/domain/entities/post';

function timestampToMs(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

function msToTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export class PostRemoteDataSource {
  private col = collection(db, 'posts');

  async getFeedPosts(): Promise<TravelPost[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const createdAt = timestampToMs(data.createdAt);
      return {
        ...data,
        id: d.id,
        createdAt,
        timeAgo: msToTimeAgo(createdAt),
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
      } as TravelPost;
    });
  }

  async createPost(
    postData: Omit<TravelPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'timeAgo'>
  ): Promise<TravelPost> {
    const docRef = await addDoc(this.col, {
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });
    return {
      ...postData,
      id: docRef.id,
      likesCount: 0,
      commentsCount: 0,
      timeAgo: 'Just now',
      createdAt: Date.now(),
    };
  }

  async likePost(postId: string): Promise<void> {
    await updateDoc(doc(this.col, postId), { likesCount: increment(1) });
  }
}

