# Offline-First & Social Feed — Nguyễn Tùng Lâm

Tài liệu kỹ thuật cho module **Social Feed & Offline Sync Engine** (Screen 02, Screen 09, SQLite, Sync Engine).
Dùng cho báo cáo Sprint 3 và phần demo trên thiết bị.

---

## 1. Phạm vi công việc

| Mã task | Nội dung | Trạng thái |
|:--|:--|:--|
| `SOC-01` | Screen 02 — Home Feed: header thương hiệu, Active Trip banner, danh sách bài đăng, like/comment | Hoàn thành — dữ liệu thật từ `socialStore` |
| `SOC-02` | Screen 09 — Create Post: chọn ảnh từ máy, gắn Destination Tag, caption, xuất bản | Hoàn thành — ImagePicker + upload Cloudinary |
| `SOC-03` | Nén ảnh client, upload Cloudinary, lưu Firestore `posts`, logic Like/Comment | Hoàn thành |
| `OFF-01` | Schema SQLite: `trips`, `activities`, `expenses`, `posts_cache`, `sync_queue` | Hoàn thành (Sprint 1), bổ sung cột `is_synced` cho `posts_cache` |
| `OFF-02` | Repository đọc/ghi Offline-First, ghi offline đánh dấu `is_synced = 0` | Hoàn thành |
| `OFF-03` | Sync Engine: NetInfo → quét `sync_queue` → đẩy lên Firestore → `is_synced = 1` | Hoàn thành |

---

## 2. Luồng dữ liệu

```
Screen 02 / 09
      │  (chỉ gọi store, không biết Firebase/SQLite)
      ▼
socialStore (Zustand)
      │
      ▼
UseCases: GetFeedPosts / CreatePost / ToggleLikePost / GetPostComments / AddComment
      │
      ▼
PostRepositoryImpl  ──────────────►  Cloudinary         (nén ảnh + upload)
      │                                    │
      │                                    ▼
      ├──────────────►  Firestore `posts` (+ subcollection `comments`)
      │
      ▼
SQLite: posts_cache  +  sync_queue  ◄──── SyncEngine (NetInfo) ────► Firestore
```

### Đọc (offline-first)
1. Đọc ngay `posts_cache` trong SQLite → UI hiển thị tức thì.
2. Gọi Firestore để làm mới; thành công thì ghi đè cache (`INSERT OR REPLACE`).
3. Gộp 2 nguồn bằng `mergeFeedPosts()`: bài `is_synced = 0` trong máy luôn được giữ, bỏ trùng theo `id`, sắp xếp mới nhất trước.
4. Mất mạng → dùng cache; cache trống → dùng dữ liệu mẫu (`seedDemoPosts`) để UI không trắng.

### Ghi (khi đăng bài)
1. Nén ảnh bằng `expo-image-manipulator` (rộng tối đa 1080px, JPEG quality 0.7).
2. Upload lên Cloudinary (unsigned upload preset) → lấy `secure_url`.
3. Ghi Firestore `posts`; thành công → lưu cache với `is_synced = 1`.
4. Nếu upload/Firestore lỗi (ngoại tuyến) → lưu `posts_cache` với `is_synced = 0` và
   `enqueue('posts', 'INSERT', {...post, localImageUri})`.
   Ảnh gốc được giữ lại trong payload để Sync Engine upload bù sau.

---

## 3. Bảng CSDL liên quan (SQLite)

| Bảng | Vai trò | Cột đồng bộ |
|:--|:--|:--|
| `posts_cache` | Bộ đệm bảng tin | `is_synced` (0 = chờ đẩy lên Firestore) |
| `sync_queue` | Hàng đợi thao tác chưa gửi được | `table_name`, `action`, `payload_json`, `retry_count` |

`posts_cache` bản Sprint 1 chưa có cột `is_synced`; `initDatabase()` tự kiểm tra
`PRAGMA table_info(posts_cache)` và chạy `ALTER TABLE ... ADD COLUMN` khi nâng cấp,
nên máy đã cài app cũ không cần xoá dữ liệu.

---

## 4. Sync Engine (`src/data/datasources/sync/`)

- `SyncEngine.start()` đăng ký `NetInfo.addEventListener`. Khi thiết bị **từ offline chuyển sang online** → gọi `syncNow()`.
  Mở app khi đã có mạng cũng đồng bộ ngay các thay đổi tồn đọng.
- `drainSyncQueue()` đẩy **tuần tự theo `created_at`** từng bản ghi lên Firestore:
  `posts` → `postRemote.upsertPost()` (kèm upload bù ảnh nếu có `localImageUri`),
  `trips` → `tripRemote.upsertTrip()`, `expenses` → `expenseRemote.upsertExpense()`.
- Thành công: xoá khỏi `sync_queue`, đánh dấu `is_synced = 1`.
- Thất bại: `retry_count + 1`; sau **5 lần** thì loại bản ghi để tránh lặp vô hạn.
- Đang ngoại tuyến thì `syncNow()` không chạy để không tiêu hao `retry_count`.
- Xung đột: **Last-Write-Wins theo `createdAt`** (bản ghi local mới hơn sẽ ghi đè Firestore bằng `setDoc(..., { merge: true })`).

Các repository khác đã nối vào hàng đợi: `ExpenseRepositoryImpl.addExpense`, `TripRepositoryImpl.createTrip/saveTrip`.
Chỉ xếp hàng khi lỗi thuộc về kết nối (`unavailable`, `failed-precondition`, `deadline-exceeded`) —
lỗi quyền (`permission-denied`) hay tài liệu không tồn tại thì thử lại cũng vô ích nên bỏ qua.

---

## 5. Danh sách file theo tầng

| Tầng | File |
|:--|:--|
| Domain | `src/domain/entities/post.ts`, `src/domain/entities/sync.ts`, `src/domain/repositories/post_repository.ts`, `src/domain/repositories/sync_repository.ts`, `src/domain/usecases/post/PostUseCases.ts` |
| Data | `src/data/datasources/local/sqlite/PostLocalDataSource.ts`, `.../SyncQueueLocalDataSource.ts`, `src/data/datasources/remote/storage/PostImageStorage.ts`, `.../CloudinaryStorageDataSource.ts`, `.../imageCompression.ts`, `src/data/datasources/remote/firestore/PostRemoteDataSource.ts`, `src/data/datasources/sync/SyncEngine.ts`, `.../drainSyncQueue.ts`, `src/data/repositories/PostRepositoryImpl.ts`, `.../feedMerge.ts` |
| Presentation | `src/presentation/screens/feed/HomeScreen.tsx` (Screen 02), `src/presentation/screens/feed/CreatePostScreen.tsx` (Screen 09), `src/presentation/components/social/CommentSheet.tsx`, `src/presentation/stores/socialStore.ts` |
| Hạ tầng | `src/core/utils/relativeTime.ts`, `src/core/firebase/firestore.rules` (rule cho `likesCount` / `commentsCount`), `App.tsx` (khởi động Sync Engine) |
| Kiểm thử | `scripts/test_offline_sync.ts` → `npm run test:offline` |

---

## 6. Cách demo trên thiết bị

1. `npm install` → `npm start`, quét QR bằng Expo Go (hoặc `a` để mở Android).
2. **Đăng nhập** (Screen 01) để có `uid` khớp `authorUid` — Firestore rules yêu cầu điều này.
3. Tab **Home**: bảng tin tải từ Firestore; kéo xuống để refresh; thả tim; bấm số comment để mở khung bình luận.
4. **+ Create Post**: chọn ảnh từ thư viện (hoặc chụp), nhập caption → **Publish**.
   Ảnh được nén 1080px rồi upload Cloudinary; bài viết xuất hiện ngay đầu bảng tin.
5. **Demo ngoại tuyến:** bật Chế độ trên máy bay → tạo bài viết mới → bài hiện ngay với nhãn **“Chờ đồng bộ”**,
   banner vàng báo *“1 mục chờ đồng bộ lên Firestore”*.
6. Tắt Chế độ trên máy bay → Sync Engine tự đẩy hàng đợi; bấm **“Đồng bộ ↻”** để chủ động kiểm tra.
   Nhãn “Chờ đồng bộ” biến mất, ảnh trên Firestore là URL Cloudinary thật.

### Kiểm thử tự động
```bash
npm run typecheck   # TypeScript strict — 0 lỗi
npm run test:offline  # 21 assertion cho drain queue + merge feed + nhãn thời gian
npm test            # bộ test OCR & ngân sách của Tú (35 assertion)
```

---

## 7. Giới hạn đã biết

- **Bình luận không có chế độ offline** (không lưu bảng riêng): khi mất mạng UI báo “Cần kết nối mạng để bình luận”.
  Lý do: schema Sprint 1 đã chốt 5 bảng, thêm bảng comment sẽ lệch ERD trong báo cáo.
- **Lượt thích** lưu bằng `increment(±1)` trên document `posts`, chưa lưu danh sách `uid` đã thích
  (đủ cho demo; muốn chống thích trùng cần bảng `post_likes`).
- **Rule Firestore phải deploy** (`firebase deploy --only firestore:rules`) thì người khác mới thả tim /
  tăng `commentsCount` được; file trong repo mới là bản nguồn.
- Ảnh trong `sync_queue` trỏ tới file cache của `expo-image-manipulator`; nếu hệ điều hành dọn cache
  trước khi có mạng lại thì lần đồng bộ đó thất bại và bản ghi bị loại sau 5 lần thử.
- Danh sách bài viết trong cache không tự xoá bài đã bị xoá trên Firestore cho tới lần đọc online kế tiếp.

---

## 8. Thiết lập Firebase (bắt buộc trước khi demo)

1. **Biến môi trường:** copy `.env.example` → `.env` và điền 7 khóa `EXPO_PUBLIC_FIREBASE_*`.
   File `.env` đã nằm trong `.gitignore`, không commit. Sau khi sửa `.env` phải khởi động lại
   Metro (`npx expo start --clear`) vì biến được inline lúc bundle.

2. **Firestore rules:** `firebase deploy --only firestore:rules` (file nguồn: `src/core/firebase/firestore.rules`).

3. **Tài khoản Cloudinary** (miễn phí 25GB, không cần thẻ): Settings → Upload → *Add upload preset* →
   Signing mode **Unsigned** → điền `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` và
   `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` vào `.env`.
   Nếu thiếu 2 biến này, mọi lần upload ảnh đều thất bại (bài viết nằm ở trạng thái “Chờ đồng bộ”
   rồi bị loại sau 5 lần thử).

4. **Kiểm tra nhanh bằng Node** (không cần mở app):
   ```bash
   node --input-type=module -e "
   const key='<API_KEY>';
   const r = await fetch('https://firestore.googleapis.com/v1/projects/<PROJECT_ID>/databases/(default)/documents/posts?key='+key);
   console.log('Firestore:', r.status);
   const s = await fetch('https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload', { method: 'POST' });
   console.log('Cloudinary:', s.status);
   "
   ```
   - Firestore trả `403 PERMISSION_DENIED` → project sống và rules đã deploy (đúng).
   - Cloudinary trả `400`/`401` cho POST rỗng → cloud name đúng và endpoint truy cập được.

