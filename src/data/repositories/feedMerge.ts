import type { TravelPost } from '@/domain/entities/post';

/**
 * OFF-02: Gộp bảng tin offline-first.
 * Bài viết tạo lúc ngoại tuyến (isSynced = false) trong SQLite luôn được giữ lại;
 * các bài còn lại lấy từ Firestore, bỏ trùng theo id, sắp xếp mới nhất trước.
 */
export function mergeFeedPosts(cached: TravelPost[], remote: TravelPost[]): TravelPost[] {
  const pendingLocal = cached.filter((post) => post.isSynced === false);
  const pendingIds = new Set(pendingLocal.map((post) => post.id));

  return [...pendingLocal, ...remote.filter((post) => !pendingIds.has(post.id))].sort(
    (a, b) => b.createdAt - a.createdAt
  );
}
