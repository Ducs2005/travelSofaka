import NetInfo from '@react-native-community/netinfo';
import { ISyncEngine } from '@/domain/repositories/sync_repository';
import { SyncQueueItem, SyncResult, SyncTableName, TravelPost } from '@/domain/entities';
import { getDatabase } from '../local/sqlite/database';
import { PostLocalDataSource } from '../local/sqlite/PostLocalDataSource';
import { SyncQueueLocalDataSource } from '../local/sqlite/SyncQueueLocalDataSource';
import { PostRemoteDataSource } from '../remote/firestore/PostRemoteDataSource';
import { ExpenseRemoteDataSource } from '../remote/firestore/ExpenseRemoteDataSource';
import { TripRemoteDataSource } from '../remote/firestore/TripRemoteDataSource';
import { PostStorageDataSource } from '../remote/storage/PostStorageDataSource';
import { drainSyncQueue } from './drainSyncQueue';

/** Bài viết nằm trong sync_queue có thể còn giữ ảnh cục bộ chưa upload được lúc tạo */
interface QueuedPost extends TravelPost {
  localImageUri?: string;
}

/** Cho phép truyền NetInfo giả trong lúc kiểm thử */
export interface NetworkMonitor {
  fetch(): Promise<{ isConnected: boolean | null }>;
  addEventListener(listener: (state: { isConnected: boolean | null }) => void): () => void;
}

export type SyncListener = (result: SyncResult) => void;

const defaultNetworkMonitor: NetworkMonitor = {
  fetch: async () => {
    const state = await NetInfo.fetch();
    return { isConnected: state.isConnected };
  },
  addEventListener: (listener) =>
    NetInfo.addEventListener((state) => listener({ isConnected: state.isConnected })),
};

/**
 * OFF-03: Sync Engine — lắng nghe kết nối mạng bằng NetInfo, khi thiết bị có mạng trở lại thì
 * quét bảng sync_queue và đẩy tuần tự từng bản ghi lên Cloud Firestore (Last-Write-Wins theo
 * createdAt), sau đó đánh dấu is_synced = 1 trong SQLite.
 */
export class SyncEngine implements ISyncEngine {
  private online = true;
  private isSyncing = false;
  private stopNetworkListener: (() => void) | null = null;
  private readonly listeners = new Set<SyncListener>();

  constructor(
    private readonly queue: SyncQueueLocalDataSource = new SyncQueueLocalDataSource(),
    private readonly postLocal: PostLocalDataSource = new PostLocalDataSource(),
    private readonly postRemote: PostRemoteDataSource = new PostRemoteDataSource(),
    private readonly storage: PostStorageDataSource = new PostStorageDataSource(),
    private readonly tripRemote: TripRemoteDataSource = new TripRemoteDataSource(),
    private readonly expenseRemote: ExpenseRemoteDataSource = new ExpenseRemoteDataSource(),
    private readonly network: NetworkMonitor = defaultNetworkMonitor
  ) {}

  isOnline(): boolean {
    return this.online;
  }

  /** Đăng ký nhận kết quả mỗi lượt đồng bộ (dùng cho store/UI) */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): () => void {
    if (this.stopNetworkListener) return this.stopNetworkListener;

    this.network
      .fetch()
      .then((state) => {
        this.online = state.isConnected !== false;
        // Mở app khi đã có mạng: đẩy ngay các thay đổi còn tồn đọng từ phiên trước
        if (this.online) void this.syncNow();
      })
      .catch(() => undefined);

    const unsubscribe = this.network.addEventListener((state) => {
      const wasOffline = !this.online;
      this.online = state.isConnected !== false;
      // Chỉ đồng bộ khi vừa chuyển từ offline sang online
      if (this.online && wasOffline) {
        void this.syncNow();
      }
    });

    this.stopNetworkListener = () => {
      unsubscribe();
      this.stopNetworkListener = null;
    };
    return this.stopNetworkListener;
  }

  async syncNow(): Promise<SyncResult> {
    const remaining = await this.queue.countPending();
    // Đang ngoại tuyến: không thử để tránh tiêu hao retry_count vô ích
    if (!this.online) return { pushed: 0, failed: 0, remaining };
    if (this.isSyncing) return { pushed: 0, failed: 0, remaining };

    this.isSyncing = true;
    try {
      const result = await drainSyncQueue(this.queue, (item) => this.pushItem(item));
      this.listeners.forEach((listener) => listener(result));
      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushItem(item: SyncQueueItem): Promise<void> {
    try {
      const payload = JSON.parse(item.payloadJson);
      switch (item.tableName) {
        case 'posts':
          await this.pushPost(item.action, payload as QueuedPost);
          return;
        case 'trips':
          await this.tripRemote.upsertTrip(payload);
          await this.markRowSynced('trips', payload.id);
          return;
        case 'expenses':
          await this.expenseRemote.upsertExpense(payload);
          await this.markRowSynced('expenses', payload.id);
          return;
        default:
          return;
      }
    } catch (error) {
      console.warn(`[SyncEngine] Đồng bộ thất bại (${item.tableName}/${item.action}):`, error);
      throw error;
    }
  }

  private async pushPost(action: SyncQueueItem['action'], post: QueuedPost): Promise<void> {
    if (action === 'DELETE') {
      await this.postRemote.deletePost(post.id);
      await this.postLocal.deletePost(post.id);
      return;
    }

    // Ảnh chưa upload được lúc tạo bài (ngoại tuyến) — nén & upload lại ở đây
    const imageUrl = post.localImageUri
      ? await this.storage.uploadPostImage(post.localImageUri, post.authorUid)
      : post.imageUrl;

    await this.postRemote.upsertPost({ ...post, imageUrl, isSynced: true });
    await this.postLocal.markSynced(post.id);
  }

  private async markRowSynced(
    table: Extract<SyncTableName, 'trips' | 'expenses'>,
    id?: string
  ): Promise<void> {
    if (!id) return;
    const db = await getDatabase();
    await db.runAsync(`UPDATE ${table} SET is_synced = 1 WHERE id = ?`, [id]);
  }
}
