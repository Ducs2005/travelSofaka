import { drainSyncQueue, MAX_RETRY_COUNT } from '../src/data/datasources/sync/drainSyncQueue';
import { mergeFeedPosts } from '../src/data/repositories/feedMerge';
import { formatRelativeTime } from '../src/core/utils/relativeTime';
import type { SyncQueueItem } from '../src/domain/entities/sync';
import type { TravelPost } from '../src/domain/entities/post';

/** Hàng đợi giả lập bảng sync_queue của SQLite (chạy thuần Node, không cần thiết bị) */
function createFakeQueue(initial: SyncQueueItem[]) {
  let items = [...initial];
  return {
    items: () => items,
    getPending: async (limit: number = 50) => items.slice(0, limit),
    remove: async (id: string) => {
      items = items.filter((item) => item.id !== id);
    },
    incrementRetry: async (id: string) => {
      items = items.map((item) =>
        item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
      );
    },
    countPending: async () => items.length,
  };
}

function makeQueuedItem(
  id: string,
  createdAt: number,
  retryCount = 0,
  tableName: SyncQueueItem['tableName'] = 'posts'
): SyncQueueItem {
  return {
    id,
    tableName,
    action: 'INSERT',
    payloadJson: JSON.stringify({ id, createdAt, authorUid: 'user_lam_nguyen' }),
    createdAt,
    retryCount,
  };
}

function makePost(id: string, createdAt: number, isSynced = true): TravelPost {
  return {
    id,
    authorUid: 'user_lam_nguyen',
    authorName: 'Tùng Lâm',
    authorAvatar: 'https://example.com/avatar.jpg',
    destinationTag: 'Hoi An Ancient Town',
    imageUrl: 'https://example.com/image.jpg',
    caption: 'Cafe sáng bên sông Hoài',
    likesCount: 0,
    commentsCount: 0,
    timeAgo: 'Just now',
    createdAt,
    isSynced,
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING OFFLINE-FIRST SYNC ENGINE (Nguyễn Tùng Lâm)');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
    }
  }

  // TEST 1: Bài viết tạo lúc ngoại tuyến được đẩy lên cloud khi có mạng
  console.log('--- Test 1: Đồng bộ thành công bài viết đang chờ ---');
  const queue1 = createFakeQueue([makeQueuedItem('sync_1', 1000)]);
  const pushedIds: string[] = [];
  const result1 = await drainSyncQueue(queue1, async (item) => {
    pushedIds.push(item.id);
  });
  assert(result1.pushed === 1, `Đẩy được 1 bản ghi: pushed=${result1.pushed}`);
  assert(result1.failed === 0, `Không có bản ghi lỗi: failed=${result1.failed}`);
  assert(result1.remaining === 0, `Hàng đợi rỗng sau đồng bộ: remaining=${result1.remaining}`);
  assert(pushedIds[0] === 'sync_1', `Đúng bản ghi được đẩy lên: ${pushedIds[0]}`);

  // TEST 2: Mất mạng -> bản ghi vẫn nằm trong hàng đợi và tăng retry_count
  console.log('\n--- Test 2: Đồng bộ thất bại (mất mạng) ---');
  const queue2 = createFakeQueue([makeQueuedItem('sync_2', 2000)]);
  const result2 = await drainSyncQueue(queue2, async () => {
    throw new Error('Network request failed');
  });
  assert(result2.pushed === 0, `Không đẩy được bản ghi nào: pushed=${result2.pushed}`);
  assert(result2.failed === 1, `Ghi nhận 1 lần thất bại: failed=${result2.failed}`);
  assert(result2.remaining === 1, `Bản ghi vẫn nằm trong hàng đợi: remaining=${result2.remaining}`);
  assert(queue2.items()[0].retryCount === 1, `retry_count tăng lên 1: ${queue2.items()[0].retryCount}`);

  // TEST 3: Bản ghi "hỏng" bị loại sau MAX_RETRY_COUNT lần thất bại
  console.log('\n--- Test 3: Loại bản ghi hỏng sau số lần thử tối đa ---');
  const queue3 = createFakeQueue([makeQueuedItem('sync_3', 3000, MAX_RETRY_COUNT - 1)]);
  const result3 = await drainSyncQueue(queue3, async () => {
    throw new Error('Permission denied');
  });
  assert(result3.failed === 1, `Ghi nhận thất bại: failed=${result3.failed}`);
  assert(result3.remaining === 0, `Bản ghi hỏng bị loại bỏ: remaining=${result3.remaining}`);

  // TEST 4: Xử lý tuần tự nhiều bảng, một bản ghi lỗi không chặn bản ghi sau
  console.log('\n--- Test 4: Đồng bộ tuần tự posts → trips → expenses ---');
  const queue4 = createFakeQueue([
    makeQueuedItem('a_post', 4000, 0, 'posts'),
    makeQueuedItem('b_trip', 5000, 0, 'trips'),
    makeQueuedItem('c_expense', 6000, 0, 'expenses'),
  ]);
  const order: string[] = [];
  const result4 = await drainSyncQueue(queue4, async (item) => {
    order.push(item.id);
    if (item.id === 'a_post') throw new Error('Firestore unavailable');
  });
  assert(
    order.join(' → ') === 'a_post → b_trip → c_expense',
    `Thứ tự FIFO theo created_at: ${order.join(' → ')}`
  );
  assert(result4.pushed === 2, `Hai bản ghi sau vẫn đồng bộ được: pushed=${result4.pushed}`);
  assert(result4.failed === 1, `Một bản ghi lỗi: failed=${result4.failed}`);
  assert(result4.remaining === 1, `Chỉ còn bản ghi lỗi trong hàng đợi: remaining=${result4.remaining}`);

  // TEST 5: Gộp bảng tin offline-first
  console.log('\n--- Test 5: Gộp bảng tin SQLite + Firestore (offline-first) ---');
  const cachedPosts = [makePost('local_pending', 9000, false), makePost('remote_old', 1000, true)];
  const remotePosts = [makePost('remote_old', 1000, true), makePost('remote_new', 5000, true)];
  const merged = mergeFeedPosts(cachedPosts, remotePosts);
  assert(merged.length === 3, `Không nhân đôi bài đã có ở cả 2 nguồn: ${merged.length} bài`);
  assert(merged[0].id === 'local_pending', `Bài chờ đồng bộ luôn hiện đầu bảng tin: ${merged[0].id}`);
  assert(
    merged[1].id === 'remote_new' && merged[2].id === 'remote_old',
    `Sắp xếp mới nhất trước: ${merged.map((post) => post.id).join(' → ')}`
  );

  // TEST 6: Nhãn thời gian tương đối
  console.log('\n--- Test 6: Nhãn thời gian tương đối ---');
  const now = 1_700_000_000_000;
  assert(formatRelativeTime(now - 30_000, now) === 'Just now', 'Under 1 minute -> "Just now"');
  assert(formatRelativeTime(now - 5 * 60_000, now) === '5m ago', '5 minutes -> "5m ago"');
  assert(formatRelativeTime(now - 3 * 3_600_000, now) === '3h ago', '3 hours -> "3h ago"');
  assert(formatRelativeTime(now - 2 * 86_400_000, now) === '2d ago', '2 days -> "2d ago"');

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed!`);
  console.log('====================================================');

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runTests().catch((error) => {
  console.error('❌ Test suite crashed:', error);
  process.exitCode = 1;
});
