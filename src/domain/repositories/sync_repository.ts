import { SyncAction, SyncQueueItem, SyncResult, SyncTableName } from '../entities/sync';

/** Hàng đợi ghi offline: mọi thao tác khi mất mạng được xếp vào sync_queue */
export interface ISyncQueueRepository {
  enqueue(tableName: SyncTableName, action: SyncAction, payload: object): Promise<SyncQueueItem>;
  getPending(limit?: number): Promise<SyncQueueItem[]>;
  remove(id: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
  countPending(): Promise<number>;
}

export interface ISyncEngine {
  /** Lắng nghe kết nối mạng, tự động đẩy hàng đợi khi thiết bị online trở lại */
  start(): () => void;
  /** Chạy đồng bộ ngay (dùng cho nút "Đồng bộ" hoặc khi mở app) */
  syncNow(): Promise<SyncResult>;
  isOnline(): boolean;
}
