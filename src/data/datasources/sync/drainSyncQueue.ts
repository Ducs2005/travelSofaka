import type { SyncQueueItem, SyncResult } from '@/domain/entities/sync';

/** Sau ngần này lần thất bại liên tiếp, bản ghi được coi là "hỏng" và bị loại khỏi hàng đợi */
export const MAX_RETRY_COUNT = 5;

/** Phần hàng đợi mà bộ xử lý cần — tách riêng để kiểm thử được bằng Node, không cần SQLite */
export interface SyncQueuePort {
  getPending(limit?: number): Promise<SyncQueueItem[]>;
  remove(id: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
  countPending(): Promise<number>;
}

/**
 * OFF-03: Đẩy tuần tự từng bản ghi trong sync_queue lên Firestore.
 * - Thành công: xoá khỏi hàng đợi.
 * - Thất bại: tăng retry_count; quá MAX_RETRY_COUNT thì loại bỏ để tránh lặp vô hạn.
 */
export async function drainSyncQueue(
  queue: SyncQueuePort,
  push: (item: SyncQueueItem) => Promise<void>
): Promise<SyncResult> {
  let pushed = 0;
  let failed = 0;

  const pending = await queue.getPending();
  for (const item of pending) {
    try {
      await push(item);
      await queue.remove(item.id);
      pushed += 1;
    } catch (_error) {
      failed += 1;
      if (item.retryCount + 1 >= MAX_RETRY_COUNT) {
        await queue.remove(item.id);
      } else {
        await queue.incrementRetry(item.id);
      }
    }
  }

  return { pushed, failed, remaining: await queue.countPending() };
}
