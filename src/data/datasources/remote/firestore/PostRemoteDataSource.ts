import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/core/firebase/firebaseConfig';
import { formatRelativeTime } from '@/core/utils/relativeTime';
import { CommentInput, PostComment, TravelPost } from '@/domain/entities/post';

/** Dữ liệu tối thiểu để ghi một bài viết lên Firestore (ảnh đã có URL sau khi upload) */
export interface PostPayload {
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  destinationTag: string;
  caption: string;
  imageUrl: string;
}

function timestampToMs(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

export class PostRemoteDataSource {
  private col = collection(db, 'posts');

  async getFeedPosts(): Promise<TravelPost[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const createdAt = timestampToMs(data.createdAt);
      return {
        ...data,
        id: d.id,
        createdAt,
        timeAgo: formatRelativeTime(createdAt),
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
        isSynced: true,
      } as TravelPost;
    });
  }

  async createPost(payload: PostPayload): Promise<TravelPost> {
    const docRef = await addDoc(this.col, {
      ...payload,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });
    return {
      ...payload,
      id: docRef.id,
      likesCount: 0,
      commentsCount: 0,
      timeAgo: 'Just now',
      createdAt: Date.now(),
      isSynced: true,
    };
  }

  /** Ghi đè/tạo mới theo id cục bộ — dùng cho Sync Engine đẩy bài viết đã tạo khi offline */
  async upsertPost(post: TravelPost): Promise<void> {
    const { id, ...rest } = post;
    await setDoc(
      doc(this.col, id),
      { ...rest, isSynced: true, createdAt: post.createdAt },
      { merge: true }
    );
  }

  async likePost(postId: string): Promise<void> {
    await updateDoc(doc(this.col, postId), { likesCount: increment(1) });
  }

  async unlikePost(postId: string): Promise<void> {
    await updateDoc(doc(this.col, postId), { likesCount: increment(-1) });
  }

  async getComments(postId: string): Promise<PostComment[]> {
    const commentsCol = collection(db, 'posts', postId, 'comments');
    const snap = await getDocs(query(commentsCol, orderBy('createdAt', 'asc'), limit(100)));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        postId,
        authorUid: data.authorUid ?? '',
        authorName: data.authorName ?? 'Ẩn danh',
        authorAvatar: data.authorAvatar ?? '',
        body: data.body ?? '',
        createdAt: timestampToMs(data.createdAt),
      } as PostComment;
    });
  }

  async addComment(postId: string, comment: CommentInput): Promise<PostComment> {
    const commentsCol = collection(db, 'posts', postId, 'comments');
    const docRef = await addDoc(commentsCol, { ...comment, createdAt: serverTimestamp() });
    await updateDoc(doc(this.col, postId), { commentsCount: increment(1) });
    return {
      ...comment,
      id: docRef.id,
      postId,
      createdAt: Date.now(),
    };
  }

  async deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(this.col, postId));
  }
}
