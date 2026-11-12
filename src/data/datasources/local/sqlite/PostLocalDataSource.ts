import { getDatabase } from './database';
import { TravelPost } from '@/domain/entities/post';
import { formatRelativeTime } from '@/core/utils/relativeTime';

interface PostCacheRow {
  id: string;
  author_uid: string;
  author_name: string;
  author_avatar: string;
  destination_tag: string;
  caption: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  time_ago: string;
  created_at: number;
  is_synced: number;
}

function rowToPost(row: PostCacheRow): TravelPost {
  return {
    id: row.id,
    authorUid: row.author_uid,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    destinationTag: row.destination_tag,
    imageUrl: row.image_url,
    caption: row.caption,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    timeAgo: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    isSynced: Boolean(row.is_synced),
  };
}

/** Đọc/ghi bảng posts_cache — bộ đệm bảng tin cho chế độ ngoại tuyến */
export class PostLocalDataSource {
  async getCachedPosts(): Promise<TravelPost[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PostCacheRow>(
      'SELECT * FROM posts_cache ORDER BY created_at DESC'
    );
    return rows.map(rowToPost);
  }

  async savePost(post: TravelPost): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO posts_cache
      (id, author_uid, author_name, author_avatar, destination_tag, caption, image_url, likes_count, comments_count, time_ago, created_at, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.id,
        post.authorUid,
        post.authorName,
        post.authorAvatar,
        post.destinationTag,
        post.caption,
        post.imageUrl,
        post.likesCount,
        post.commentsCount,
        post.timeAgo,
        post.createdAt,
        post.isSynced === false ? 0 : 1,
      ]
    );
  }

  async savePosts(posts: TravelPost[]): Promise<void> {
    for (const post of posts) {
      await this.savePost(post);
    }
  }

  async markSynced(postId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE posts_cache SET is_synced = 1 WHERE id = ?', [postId]);
  }

  async deletePost(postId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM posts_cache WHERE id = ?', [postId]);
  }

  async countCachedPosts(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM posts_cache');
    return row?.total ?? 0;
  }
}
