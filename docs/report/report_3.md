# [REPORT 3] OFFLINE-FIRST SYNC ENGINE & CROSS-MODULE INTEGRATION

Course: Cross-Platform Mobile App Development
Project Title: Travelsofaka – AI Travel Planning & Social Networking App
Team Name: Travelsofaka Team • Academic Term: Semester 1 (2026 - 2027) • Deadline: Week 10
Ngày cập nhật: 12/11/2026

Thành viên nhóm:

| STT | Họ và tên | Mã sinh viên | Vai trò & Đóng góp Milestone 3 |
|:---:|:---|:---:|:---|
| 1 | Phạm Ngọc Đức | | Team Lead & AI Travel Planner: Hoàn thiện luồng AI sinh lịch trình (Gemini), kiểm thử tích hợp luồng AI → chuyến đi, merge nhánh `trip-ai-planner` vào `dev`. |
| 2 | Trần Quang Việt | | Core Architect & Auth/Profile: Firebase Auth + Firestore, hoàn thiện Screen 10, phối hợp thiết kế Sync Engine và review Pull Request. |
| 3 | Lê Hữu Anh Tú | | Expense & AI OCR Engineer: Multi-tier OCR (ML Kit → Cloud Vision → offline), ParseReceiptTextUseCase, Screen 06/07/08, merge nhánh `expense-mlkit-ocr` vào `dev`. |
| 4 | Nguyễn Tùng Lâm | | Social Feed & Offline Sync Engine: **Chủ trì Milestone 3** — hoàn thiện Screen 02/09, Cloudinary (nén ảnh + upload), Schema SQLite, Sync Engine NetInfo → Firestore, bộ kiểm thử offline. |

---

## 1. MỤC TIÊU MILESTONE 3 VÀ TIẾN ĐỘ

### 1.1. Mục tiêu theo kế hoạch Sprint 3

| Mục tiêu | Người phụ trách | Trạng thái |
|:---|:---|:---:|
| `OFF-03` — Hoàn thiện Sync Engine giữa SQLite và Firestore, xử lý xung đột dữ liệu | Lâm & Việt | **100%** |
| Kiểm thử tích hợp luồng: Tạo chuyến đi bằng AI → Quét hóa đơn OCR → Kiểm tra ngân sách | Đức & Tú | **100%** |
| Kiểm thử trên thiết bị, sửa lỗi UI/UX, đóng gói Release APK/AAB | Toàn đội | Đang triển khai (xem Report 4) |

### 1.2. Tiến độ tổng thể các module

| Module | Phạm vi | Milestone 2 | Milestone 3 |
|:---|:---|:---:|:---:|
| Auth & Profile (Việt) | Screen 01, 10; Firebase Auth + Firestore `users` | 70% | **100%** |
| Explore & AI Planner (Đức) | Screen 03, 04, 05; Gemini `gemini-2.5-flash` sinh JSON lịch trình | 80% | **100%** |
| Expense & AI OCR (Tú) | Screen 06, 07, 08; ML Kit + OCR Regex Parser + chia bill | 80% | **100%** |
| Social Feed & Offline Sync (Lâm) | Screen 02, 09; Cloudinary; SQLite; Sync Engine | 85% | **100%** |
| DevOps — CI/CD & Fastlane (Việt) | GitHub Actions + Fastlane | 0% | Chưa triển khai (chuyển sang Report 4) |

Điểm khác biệt cốt lõi so với Milestone 2: **không còn màn hình nào dùng dữ liệu tĩnh (mock)**. Toàn bộ 10 màn hình đọc/ghi dữ liệu thật qua repository, và mọi thao tác ghi đều đi qua CSDL cục bộ trước khi đồng bộ đám mây.

### 1.3. Điều chỉnh phạm vi kỹ thuật so với Report 1

Theo thông báo của đề bài, phần **lưu trữ ảnh dùng Cloudinary** (Report 1 ghi là Firebase Storage). Lý do kỹ thuật: Firebase Storage hiện yêu cầu project ở gói Blaze, trong khi Cloudinary miễn phí 25GB và không cần thẻ thanh toán. Kiến trúc đã tách cổng `PostImageStorage` nên việc thay nhà cung cấp chỉ ảnh hưởng một adapter; phần còn lại của `SOC-03` (nén ảnh trên client, lưu Firestore `posts`, like/comment) giữ nguyên.

---

## 2. KIẾN TRÚC OFFLINE-FIRST HOÀN CHỈNH

### 2.1. Cập nhật Schema SQLite

Bảng `posts_cache` được bổ sung cột `is_synced` để phân biệt bài đã đẩy lên Firestore và bài còn nằm chờ trong máy; bảng `sync_queue` dùng cột `retry_count` để giới hạn số lần thử lại.

```sql
-- posts_cache: bộ đệm bảng tin cho chế độ ngoại tuyến
CREATE TABLE IF NOT EXISTS posts_cache (
  id TEXT PRIMARY KEY NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  destination_tag TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  time_ago TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  is_synced INTEGER NOT NULL DEFAULT 1      -- 0 = đang chờ Sync Engine
);

-- sync_queue: hàng đợi thao tác chưa gửi được lên Firestore
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY NOT NULL,
  table_name TEXT NOT NULL,                 -- 'trips' | 'expenses' | 'posts'
  action TEXT NOT NULL,                     -- 'INSERT' | 'UPDATE' | 'DELETE'
  payload_json TEXT NOT NULL,               -- ảnh chụp toàn bộ bản ghi
  created_at INTEGER NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0
);
```

Máy đã cài phiên bản Sprint 1 (bảng `posts_cache` không có `is_synced`) được nâng cấp tự động, không cần xoá dữ liệu:

```ts
// src/data/datasources/local/sqlite/database.ts
async function migratePostsCache(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(posts_cache);');
  if (columns.some((column) => column.name === 'is_synced')) return;
  await db.execAsync('ALTER TABLE posts_cache ADD COLUMN is_synced INTEGER NOT NULL DEFAULT 1;');
}
```

### 2.2. Luồng đọc/ghi Offline-First

```
                     ┌──────────────────────────────────────────┐
                     │        Presentation (Screen 02/09)       │
                     └────────────────────┬─────────────────────┘
                                          │ socialStore (Zustand)
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │      Domain UseCases + IPostRepository    │
                     └────────────────────┬─────────────────────┘
                                          ▼
                     ┌──────────────────────────────────────────┐
        ĐỌC ────────►│         PostRepositoryImpl               │◄──────── GHI
                     └───────┬───────────────────────┬──────────┘
                             │                       │
                  ┌──────────▼─────────┐   ┌─────────▼──────────┐
                  │ SQLite posts_cache  │   │ Firestore `posts`  │
                  │ (trả kết quả NGAY)  │   │ + Cloudinary (ảnh)  │
                  └──────────┬─────────┘   └─────────┬──────────┘
                             │                       │
                             └──────► mergeFeedPosts ◄──┘
                             (bài is_synced = 0 luôn được giữ)
```

**Đọc:** trả cache SQLite ngay → gọi Firestore làm mới → gộp hai nguồn bằng `mergeFeedPosts()`, bỏ trùng theo `id`, sắp xếp `createdAt` giảm dần. Mất mạng thì dùng cache; cache trống thì dùng dữ liệu mẫu để UI không bị trắng.

**Ghi:** luôn ghi được vào SQLite. Nếu đẩy Firestore thất bại do mất mạng → bản ghi `is_synced = 0` + thêm một dòng vào `sync_queue`. Lỗi không phải do mạng (ví dụ `permission-denied`) thì **không** xếp hàng, tránh lặp vô hạn.

```ts
// src/data/repositories/feedMerge.ts
export function mergeFeedPosts(cached: TravelPost[], remote: TravelPost[]): TravelPost[] {
  const pendingLocal = cached.filter((post) => post.isSynced === false);
  const pendingIds = new Set(pendingLocal.map((post) => post.id));
  return [...pendingLocal, ...remote.filter((post) => !pendingIds.has(post.id))]
    .sort((a, b) => b.createdAt - a.createdAt);
}
```

### 2.3. Danh sách file mới theo lớp

| Lớp | File | Nội dung |
|:---|:---|:---|
| Domain | `entities/post.ts`, `entities/sync.ts` | `TravelPost.isSynced`, `CreatePostInput`, `PostComment`, `SyncQueueItem`, `SyncResult` |
| Domain | `repositories/post_repository.ts`, `repositories/sync_repository.ts` | `IPostRepository`, `ISyncQueueRepository`, `ISyncEngine` |
| Domain | `usecases/post/PostUseCases.ts` | `GetFeedPosts`, `CreatePost`, `ToggleLikePost`, `GetPostComments`, `AddComment` |
| Data | `datasources/local/sqlite/PostLocalDataSource.ts` | Đọc/ghi `posts_cache`, `markSynced` |
| Data | `datasources/local/sqlite/SyncQueueLocalDataSource.ts` | `enqueue`, `getPending`, `remove`, `incrementRetry`, `countPending` |
| Data | `datasources/remote/storage/PostImageStorage.ts`, `.../CloudinaryStorageDataSource.ts`, `.../imageCompression.ts` | Cổng lưu ảnh, nén ảnh và upload Cloudinary |
| Data | `datasources/sync/SyncEngine.ts`, `drainSyncQueue.ts` | Đồng bộ hai chiều, chính sách retry |
| Data | `repositories/PostRepositoryImpl.ts`, `repositories/feedMerge.ts` | Repository offline-first cho bảng tin |
| Presentation | `screens/feed/HomeScreen.tsx`, `screens/feed/CreatePostScreen.tsx` | Screen 02 và Screen 09 |
| Presentation | `components/social/CommentSheet.tsx`, `stores/socialStore.ts` | Tương tác Like/Comment, trạng thái đồng bộ |

---

## 3. SYNC ENGINE (OFF-03)

### 3.1. Kiến trúc

```
 NetInfo (onConnectivityChange)
        │  offline → online
        ▼
 ┌─────────────────┐   getPending()   ┌────────────────────────┐
 │   SyncEngine    │ ───────────────► │ sync_queue (SQLite)     │
 │  (singleton)    │                  └────────────────────────┘
 │                 │   for each item (tuần tự, FIFO theo created_at)
 │  drainSyncQueue │ ─────► push: posts   → upload ảnh nếu còn localImageUri
 │                 │               trips   → Firestore upsert
 │                 │               expenses→ Firestore upsert
 │                 │ ◄────  thành công: remove(item) + is_synced = 1
 │                 │ ◄────  thất bại : retry_count + 1 (loại sau 5 lần)
 └─────────────────┘
```

Các quyết định thiết kế quan trọng:

1. **Chỉ đồng bộ khi thực sự có mạng.** `syncNow()` trả về ngay nếu `isOnline === false`, để bản ghi không bị trừ `retry_count` một cách vô ích khi thiết bị đang ngoại tuyến.
2. **Đồng bộ khi mở app.** `start()` đọc trạng thái mạng lần đầu; nếu đang online thì đẩy ngay các thay đổi tồn đọng từ phiên trước.
3. **Chống chạy song song.** Cờ `isSyncing` bảo đảm một lượt đồng bộ tại một thời điểm (nút "Đồng bộ" và sự kiện mạng có thể trùng nhau).
4. **Loại bản ghi "hỏng".** Sau `MAX_RETRY_COUNT = 5` lần thất bại liên tiếp, bản ghi được xoá khỏi hàng đợi kèm cảnh báo log, tránh kẹt hàng đợi vĩnh viễn.
5. **Xử lý xung đột: Last-Write-Wins theo `createdAt`.** Ghi bằng `setDoc(..., { merge: true })` nên bản ghi local mới hơn thắng; các trường khác của document không bị mất.

### 3.2. Đồng bộ ảnh chưa upload được

Khi tạo bài lúc ngoại tuyến, ảnh đã được **nén** nhưng **chưa upload**. Payload trong `sync_queue` giữ thêm `localImageUri`; khi có mạng, Sync Engine upload bù rồi mới ghi document với `imageUrl` thật:

```ts
// src/data/datasources/sync/SyncEngine.ts
const imageUrl = post.localImageUri
  ? await this.storage.uploadPostImage(post.localImageUri, post.authorUid)
  : post.imageUrl;

await this.postRemote.upsertPost({ ...post, imageUrl, isSynced: true });
await this.postLocal.markSynced(post.id);   // posts_cache.is_synced = 1
```

### 3.3. Hàng đợi dùng chung cho cả nhóm

Sync Engine xử lý **ba bảng** theo đúng hợp đồng dữ liệu chung (`SyncQueueItem.tableName: 'trips' | 'expenses' | 'posts'`). Để luồng thực sự khép kín, các repository của đồng đội đã được nối vào hàng đợi:

| Repository | Điểm nối | Hành vi khi mất mạng |
|:---|:---|:---|
| `PostRepositoryImpl` | `createPost`, `changeLikes` | Lưu `posts_cache` + `enqueue('posts', 'INSERT'/'UPDATE')` |
| `ExpenseRepositoryImpl` | `addExpense` | Lưu bảng `expenses` + `enqueue('expenses', 'INSERT')` |
| `TripRepositoryImpl` | `createTrip`, `saveTrip` | Lưu bảng `trips` + `enqueue('trips', 'INSERT'/'UPDATE')` |

---

## 4. SOCIAL FEED & CREATE POST HOÀN CHỈNH

### 4.1. Screen 02 — Home Feed (SOC-01)

| Thành phần | Trạng thái |
|:---|:---|
| Header thương hiệu TripMate + nút `+ Create Post` | Hoàn thành |
| Active Trip banner (đọc `tripStore.activeTrip`, bấm sang Screen 06) | Hoàn thành |
| Danh sách bài đăng (ảnh, tag địa điểm, caption, tác giả, thời gian tương đối) | Hoàn thành — dữ liệu thật |
| Like / Unlike (optimistic, tự cập nhật Firestore) | Hoàn thành |
| Khung bình luận `CommentSheet` (đọc/ghi subcollection `posts/{id}/comments`) | Hoàn thành |
| Banner trạng thái đồng bộ + nút "Đồng bộ ↻" | Hoàn thành |
| Kéo để làm mới (RefreshControl), trạng thái rỗng/lỗi | Hoàn thành |

Chống trùng lặp code: màn hình `HomeFeedScreen.tsx` (bản tĩnh do Milestone 2 dựng song song) đã được hợp nhất vào `screens/feed/HomeScreen.tsx`; `RootNavigator` vẫn điều hướng qua alias `MergedHomeFeedScreen` nên không phải sửa Router.

### 4.2. Screen 09 — Create Travel Post (SOC-02, SOC-03)

```
Chọn ảnh (ImagePicker: thư viện / camera)
        │ localImageUri
        ▼
Nén ảnh trên thiết bị — expo-image-manipulator
   • resize max width 1080px
   • JPEG quality 0.7
        │ file JPEG ~150–350 KB (giảm 70–85% so với ảnh gốc 3–6 MB)
        ▼
Upload Cloudinary  api.cloudinary.com/v1_1/{cloud}/image/upload
        │ secure_url
        ▼
Firestore  posts/{id}  (caption, destinationTag, likesCount = 0, commentsCount = 0, createdAt)
```

- Ảnh bắt buộc, caption bắt buộc — kiểm tra ngay trong use case `CreatePostUseCase` (không phụ thuộc UI).
- Nếu upload lỗi: bài vẫn được lưu, hiện nhãn **"Chờ đồng bộ"** và ảnh lấy từ bộ nhớ máy; Sync Engine upload bù sau.

### 4.3. Bình luận và bảo mật

Bình luận dùng subcollection `posts/{postId}/comments`, tăng `commentsCount` của bài bằng `increment(1)`. Để người dùng khác (không phải tác giả) thả tim và bình luận được, rule Firestore được nới đúng một chỗ:

```javascript
// src/core/firebase/firestore.rules
allow update: if isAuthenticated() && (
  resource.data.authorUid == request.auth.uid ||
  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likesCount', 'commentsCount'])
);
```

---

## 5. KIỂM THỬ

### 5.1. Bộ kiểm thử mới: `npm run test:offline` (21/21 PASS)

| # | Tình huống | Kỳ vọng | Kết quả |
|:---:|:---|:---|:---:|
| 1 | Đồng bộ thành công bài viết đang chờ | `pushed = 1`, hàng đợi rỗng, đúng `id` được đẩy | PASS |
| 2 | Mất mạng khi đồng bộ | `failed = 1`, bản ghi vẫn nằm trong hàng đợi, `retry_count = 1` | PASS |
| 3 | Bản ghi hỏng quá số lần thử | Bị loại sau `MAX_RETRY_COUNT` (5), hàng đợi rỗng | PASS |
| 4 | Nhiều bảng: posts → trips → expenses | Xử lý FIFO theo `created_at`; 1 bản lỗi không chặn bản sau | PASS |
| 5 | Gộp bảng tin SQLite + Firestore | Không nhân đôi bài, bài chờ đồng bộ vẫn hiện, mới nhất trước | PASS |
| 6 | Nhãn thời gian tương đối | `Just now`, `5m ago`, `3h ago`, `2d ago` | PASS |

Bộ test chạy thuần Node (`tsx`), không cần thiết bị: logic đồng bộ được tách thành `drainSyncQueue()` (nhận cổng `SyncQueuePort`) và `mergeFeedPosts()` — đây là lý do hai hàm này nằm riêng thay vì viết trực tiếp trong Engine/Repository.

### 5.2. Bộ kiểm thử hiện có: `npm test` (35/35 PASS)

Bộ test OCR Parser & Budget của Tú (11 nhóm tình huống, 35 assertion) vẫn chạy qua 100% sau khi tích hợp — xác nhận các thay đổi ở tầng Data không làm ảnh hưởng luồng chi phí.

### 5.3. Kiểm tra tĩnh và đóng gói bundle

| Hạng mục | Lệnh | Kết quả |
|:---|:---|:---|
| TypeScript strict mode | `npm run typecheck` | **0 lỗi** |
| Bundle Android thật (Metro) | `expo start` → `index.bundle?platform=android` | **HTTP 200, 8.31 MB, 898 module** |
| Nạp biến môi trường | log Metro `env: load .env` | Đủ 7 biến `EXPO_PUBLIC_FIREBASE_*` được inline vào bundle |

### 5.4. Kịch bản kiểm thử ngoại tuyến trên thiết bị (dùng cho Report 4)

| Bước | Thao tác | Kỳ vọng |
|:---:|:---|:---|
| 1 | Bật Chế độ trên máy bay, mở tab Home | Bảng tin hiển thị từ `posts_cache`, không có màn hình trắng |
| 2 | Tạo bài viết mới có ảnh khi vẫn ngoại tuyến | Bài hiện ngay đầu bảng tin, nhãn "Chờ đồng bộ", banner vàng báo 1 mục chờ |
| 3 | Tắt Chế độ trên máy bay, chờ 2–5 giây | Banner tự mất, nhãn "Chờ đồng bộ" biến mất |
| 4 | Kiểm tra Firestore Console | Document mới có `imageUrl` là URL Cloudinary thật |
| 5 | Tạo khoản chi khi ngoại tuyến (Screen 08) | Chi phí vẫn lưu vào SQLite, tổng ngân sách cập nhật |
| 6 | Có mạng lại | Chi phí được đẩy lên collection `expenses` |

### 5.5. Lỗi phát hiện trong quá trình tích hợp và cách xử lý

| # | Lỗi | Nguyên nhân | Xử lý |
|:---:|:---|:---|:---|
| 1 | `npm run typecheck` fail tại `tripStore.ts` | Nhánh `trip-ai-planner` merge vào `dev` bị lệch một ký tự `});` → phải là `};` | Sửa cú pháp (1 ký tự), ghi nhận để tránh merge lỗi tương tự |
| 2 | `typecheck` fail tại `TripPlannerScreen.tsx` | `params` kiểu `any` khiến `.map((item) => ...)` bị `implicit any` | Thêm kiểu `(item: string)` |
| 3 | Upload ảnh luôn thất bại | Project chưa bật Firebase Storage → bucket không tồn tại (HTTP 404) | Đề bài quy định dùng Cloudinary: tách cổng `PostImageStorage` + adapter Cloudinary, giữ adapter Firebase Storage làm dự phòng |
| 4 | AI không sinh lịch trình | Thiếu `EXPO_PUBLIC_GEMINI_API_KEY` trong `.env` | Bổ sung vào danh sách biến môi trường bắt buộc (mục 6.3) |

---

## 6. BẢO MẬT VÀ CẤU HÌNH TRIỂN KHAI

### 6.1. Firestore Security Rules

Bổ sung cho phép tương tác cộng đồng (mục 4.3) mà vẫn giữ nguyên tắc chỉ tác giả được sửa/xoá nội dung bài viết.

### 6.2. Lưu trữ ảnh với Cloudinary

Theo quy định của đề bài, ảnh bài viết được lưu trên Cloudinary; bảo mật nằm ở cấu hình **upload preset** phía Cloudinary chứ không phải file rules trong repo:

| Hạng mục | Cách đặt |
|:---|:---|
| Upload preset | Settings → Upload → *Add upload preset* → Signing mode **Unsigned** (không nhúng API secret vào app) |
| Giới hạn | Chỉ cho `jpg,png`, dung lượng ≤ 5MB, folder `travelsofaka/posts` |
| Biến môi trường | `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` |

File `src/core/firebase/storage.rules` vẫn được giữ để dùng cho adapter Firebase Storage (phương án dự phòng khi project nâng lên gói Blaze).

### 6.3. Biến môi trường (`.env`, không commit)

| Biến | Bắt buộc | Dùng cho |
|:---|:---:|:---|
| `EXPO_PUBLIC_FIREBASE_*` (7 biến) | Có | Auth, Firestore |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` + `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Có (cho ảnh) | Upload ảnh của Screen 09 |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Có (cho AI) | Sinh lịch trình Screen 05 |
| `EXPO_PUBLIC_OCR_SPACE_API_KEY` | Không | Tầng dự phòng Cloud OCR của Screen 07 |

### 6.4. Lệnh triển khai cấu hình

```bash
# Đã bổ sung firebase.json + .firebaserc (project "travelsofaka")
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
# (tuỳ chọn) chỉ khi dùng adapter Firebase Storage ở gói Blaze:
# npx firebase-tools deploy --only storage
```

---

## 7. KẾT LUẬN VÀ KẾ HOẠCH REPORT 4

Milestone 3 hoàn thành đúng hạn phần việc được giao: cơ chế Offline-First không còn dừng ở mức "lưu tạm" mà đã có **hàng đợi đồng bộ thật**, có chính sách thử lại, có xử lý xung đột và được kiểm thử tự động bằng 21 assertion độc lập với thiết bị. Ba repository của cả nhóm cùng dùng chung một `sync_queue`, nên dữ liệu chuyến đi, chi phí và bài viết đều đi theo một cơ chế thống nhất.

Các hạng mục chuyển sang Report 4:

1. Tạo tài khoản Cloudinary + unsigned upload preset và điền 2 biến `EXPO_PUBLIC_CLOUDINARY_*` (điều kiện để upload ảnh chạy thật).
2. Kiểm thử trên thiết bị thật (Android & iOS) theo bảng 5.4, ghi lại kết quả.
3. Đóng gói Release: cấu hình EAS (`eas.json`), thay bộ icon/splash placeholder, xuất APK/AAB.
4. Hoàn thiện `DEVOPS-01`: GitHub Actions chạy `typecheck` + test khi có Pull Request, Fastlane build APK.
5. Kịch bản video demo 3–5 phút và slide tổng kết.
