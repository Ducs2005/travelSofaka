# [REPORT 4] FINAL RELEASE, DEMO & PROJECT EVALUATION

Course: Cross-Platform Mobile App Development
Project Title: Travelsofaka – AI Travel Planning & Social Networking App
Team Name: Travelsofaka Team • Academic Term: Semester 1 (2026 - 2027) • Deadline: Week 12
Ngày cập nhật: 12/11/2026 (bản nháp — cập nhật lại sau khi đóng gói Release)

Thành viên nhóm:

| STT | Họ và tên | Mã sinh viên | Vai trò & Đóng góp cuối kỳ |
|:---:|:---|:---:|:---|
| 1 | Phạm Ngọc Đức | | Team Lead & AI Travel Planner: Điều phối 3 sprint, review Pull Request, hoàn thiện luồng AI sinh lịch trình, kiểm thử tích hợp. |
| 2 | Trần Quang Việt | | Core Architect & Auth/Profile: Khung Clean Architecture, Design System, Router 10 màn hình, Firebase Auth/Firestore, Screen 01 & 10. |
| 3 | Lê Hữu Anh Tú | | Expense & AI OCR Engineer: Multi-tier OCR, bộ Regex Parser hóa đơn, chia bill, Screen 06/07/08, bộ 35 test OCR & ngân sách. |
| 4 | Nguyễn Tùng Lâm | | Social Feed & Offline Sync Engine: Screen 02/09, Firebase Storage, Schema SQLite, Sync Engine, bộ 21 test offline, tài liệu kỹ thuật offline-first. |

---

## 1. TỔNG KẾT SẢN PHẨM

### 1.1. Trạng thái 10 màn hình theo nguyên mẫu Figma

| # | Màn hình | File triển khai | Phụ trách | Dữ liệu | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| 01 | Login / Sign Up | `screens/auth/LoginScreen.tsx` | Việt | Firebase Auth (Email/Password) | Hoàn thành |
| 02 | Home Feed | `screens/feed/HomeScreen.tsx` | Lâm | Firestore `posts` + SQLite `posts_cache` | Hoàn thành |
| 03 | Explore Destinations | `screens/explore/ExploreScreen.tsx` | Đức | Bộ dữ liệu điểm đến + Firestore | Hoàn thành |
| 04 | Destination Details | `screens/explore/DestinationDetailsScreen.tsx` | Đức | Tham số điều hướng + dữ liệu điểm đến | Hoàn thành |
| 05 | Trip Planner (AI) | `screens/planner/TripPlannerScreen.tsx` | Đức | Gemini API + `tripStore` + SQLite | Hoàn thành |
| 06 | Trip Details & Expense | `screens/TripDetailsExpenseScreen.tsx` | Tú | `expenseStore` + SQLite `expenses` | Hoàn thành |
| 07 | Receipt Scanner | `screens/ReceiptScannerScreen.tsx` | Tú | Camera + ML Kit / Cloud OCR | Hoàn thành |
| 08 | OCR Expense Review | `screens/OCRExpenseReviewScreen.tsx` | Tú | ParseReceiptTextUseCase + chia bill | Hoàn thành |
| 09 | Create Travel Post | `screens/feed/CreatePostScreen.tsx` | Lâm | ImagePicker + Firebase Storage + Firestore | Hoàn thành |
| 10 | User Profile | `screens/profile/ProfileScreen.tsx` | Việt | Firestore `users` + `socialStore` | Hoàn thành |

### 1.2. Tỷ lệ hoàn thành theo module

| Module | Chức năng chính | Hoàn thành | Ghi chú |
|:---|:---|:---:|:---|
| Core Architecture | Clean Architecture 3 lớp, Theme MD3 Teal/Coral, Router 10 màn hình, base widgets | **100%** | Không còn màn hình dùng dữ liệu tĩnh |
| Auth & Profile | Đăng ký/đăng nhập Email, phiên đăng nhập, cập nhật hồ sơ, đăng xuất | **95%** | Google Sign-In mới ở mức giao diện (xem 6.2) |
| Explore & AI Planner | Tìm kiếm/lọc điểm đến, chi tiết, tạo lịch trình bằng Gemini, sửa hoạt động theo ngày | **100%** | Cần `EXPO_PUBLIC_GEMINI_API_KEY` |
| Expense & AI OCR | Quét hóa đơn (camera/thư viện), bóc tách Regex, chia bill, cảnh báo ngưỡng 80%/100% | **100%** | 35/35 assertion PASS |
| Social Feed | Bảng tin, like/unlike, bình luận, tạo bài có ảnh, nén ảnh + Storage | **100%** | Cần bật bucket Storage (xem 3.3) |
| Offline-First Sync | Schema SQLite 5 bảng, repository offline-first, Sync Engine NetInfo → Firestore | **100%** | 21/21 assertion PASS |
| DevOps & Release | GitHub Actions, Fastlane, ký số, APK/AAB | **20%** | Xem 3.3 — hạng mục chính còn lại của dự án |

---

## 2. KIẾN TRÚC CUỐI CÙNG VÀ SỐ LIỆU MÃ NGUỒN

### 2.1. Số liệu mã nguồn (đo trên nhánh `feature/social-offline-sync`, sau khi merge đủ 3 module)

| Lớp | Số file | Số dòng | Nội dung |
|:---|:---:|:---:|:---|
| `src/domain` | 23 | 959 | Entities, repository interfaces, use cases (không phụ thuộc React Native) |
| `src/data` | 24 | 1.716 | SQLite, Firestore, Storage, AI, OCR, repositories |
| `src/presentation` | 34 | 6.698 | 10 màn hình, base components, 5 store Zustand, router |
| `src/core` | 6 | 267 | Theme, Firebase config, tiện ích thời gian |
| **Tổng** | **87** | **9.640** | + `scripts/` (2 bộ test), `docs/`, `report/` |

### 2.2. Công nghệ sử dụng (phiên bản thực tế trong `package.json`)

| Nhóm | Thư viện | Phiên bản |
|:---|:---|:---|
| Nền tảng | Expo SDK / React Native / React / TypeScript | 58.0.23 / 0.88.1 / 19.3.0 / 6.0.3 |
| Trạng thái | Zustand | 5.0.3 |
| Backend | Firebase (Auth, Firestore, Storage) | 13.2.0 |
| CSDL cục bộ | expo-sqlite | 58.0.15 |
| Đồng bộ ngoại tuyến | @react-native-community/netinfo | 12.0.1 |
| Ảnh | expo-image-picker / expo-image-manipulator | 58.0.10 / 58.0.16 |
| AI lịch trình | Gemini `gemini-2.5-flash` (REST) | — |
| OCR | @react-native-ml-kit/text-recognition + Cloud OCR dự phòng | 2.0.0 |
| UI | react-native-svg, @expo/vector-icons | 15.16.0 / 15.0.2 |

### 2.3. Quy trình Git

- Nhánh: `main` (release) ← `dev` (tích hợp) ← 4 nhánh tính năng (`feat/firebase-integration-profile`, `trip-ai-planner`, `expense-mlkit-ocr`, `social-offline-sync`).
- Tổng **21 commit** trên lịch sử nhánh làm việc; mọi module đều merge qua `dev` bằng nhánh riêng, không commit trực tiếp lên `main`.
- Mỗi module có ít nhất một vòng review chéo (Đức/Việt review trước khi merge vào `dev`).

---

## 3. ĐÓNG GÓI VÀ PHÁT HÀNH

### 3.1. Thông tin đóng gói hiện có (`app.json`)

| Trường | Giá trị |
|:---|:---|
| name / slug | Travelsofaka / `travel-sofaka` |
| version | 1.0.0 |
| Android package | `com.travelsofaka.app` |
| iOS bundleIdentifier | `com.travelsofaka.app` |
| Kiến trúc mới | `newArchEnabled: true` |
| EAS projectId | `fee0d3ab-dcc0-4642-9a8c-6e49a10fbfde` (owner: `lhatu`) |
| Plugin native | `expo-sqlite`, `expo-image-picker` (quyền camera/thư viện) |

### 3.2. Quy trình build dự kiến

```bash
# 1) Build & chạy trực tiếp trên máy Android đang cắm cáp (không cần EAS)
npx expo run:android

# 2) Build APK nội bộ qua EAS (sau khi tạo eas.json — xem 3.3)
npx eas-cli build -p android --profile preview
npx eas-cli build -p android --profile production   # AAB để nộp / phát hành
```

Nội dung `eas.json` cần bổ sung:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true }
  }
}
```

### 3.3. Hạng mục còn thiếu để phát hành (bảng theo dõi)

| # | Hạng mục | Trạng thái | Việc cần làm |
|:---:|:---|:---:|:---|
| 1 | Bật bucket Firebase Storage | **Chưa** (bucket trả HTTP 404) | Console → Storage → *Get Started*; sau đó `firebase deploy --only storage` |
| 2 | Deploy Firestore rules | **Đã deploy** (truy vấn trả `403 PERMISSION_DENIED` đúng như thiết kế) | Duy trì file `src/core/firebase/firestore.rules` |
| 3 | Bộ icon & splash | **Chưa** — 4 file trong `assets/` chỉ 70 byte (placeholder) | Thay bằng PNG 1024×1024 (icon), 288×288 (adaptive), splash theo hướng dẫn Expo |
| 4 | `eas.json` | **Chưa có** | Thêm file ở mục 3.2 |
| 5 | GitHub Actions (lint + typecheck khi có PR) | **Chưa** | `.github/workflows/ci.yml`: `npm ci` → `npm run typecheck` → `npm test` → `npm run test:offline` |
| 6 | Fastlane build APK | **Chưa** | `fastlane/Fastfile` + lane `build_apk` gọi `expo prebuild` + `gradle assembleRelease` |
| 7 | Khoá ký keystore | **Chưa** | Sinh keystore, lưu secret trên EAS/GitHub, không commit vào repo |

---

## 4. KỊCH BẢN DEMO (5 PHÚT)

**Chuẩn bị:** máy có mạng, đã đăng nhập sẵn, tài khoản có sẵn 1 chuyến đi; đặt sẵn 1 ảnh du lịch trong thư viện; hai tài khoản (một để bình luận chéo nếu muốn thể hiện tương tác cộng đồng).

| Thời lượng | Màn hình | Thao tác | Điểm nhấn cần nói |
|:---:|:---|:---|:---|
| 0:00 – 0:30 | Screen 01 | Đăng nhập bằng Email | Firebase Auth, phiên đăng nhập được giữ qua `authStore` |
| 0:30 – 1:30 | Screen 03 → 05 | Tìm "Đà Nẵng" → chọn điểm đến → nhập 3 ngày, ngân sách 6.000.000đ → **Generate AI Itinerary** | Kết quả là JSON chuẩn từ Gemini, tự tách thành `Activity` theo từng ngày, sửa/xoá được |
| 1:30 – 2:30 | Screen 06 → 07 → 08 | Mở chuyến đi → **Scan Receipt** → chụp/chọn hóa đơn → xem thông tin bóc tách → lưu | Multi-tier OCR, thanh ngân sách đổi màu theo ngưỡng 80%/100% |
| 2:30 – 3:30 | Screen 02 | Cuộn bảng tin, thả tim, mở bình luận và gửi 1 bình luận | Like/Comment ghi thẳng Firestore, `CommentSheet` |
| 3:30 – 4:15 | Screen 09 | **+ Create Post** → chọn ảnh → nhập caption → **Publish** | Nén 1080px/quality 0.7 rồi upload Storage, bài hiện ngay đầu bảng tin |
| 4:15 – 5:00 | Screen 02 | **Bật Chế độ trên máy bay** → tạo bài mới → bài hiện nhãn "Chờ đồng bộ" → **tắt máy bay** → banner tự xử lý | Điểm nhấn kỹ thuật: Offline-First + Sync Engine NetInfo |

**Phương án dự phòng khi mất mạng/ lỗi dịch vụ:** demo offline trước (bước 5) để chứng minh cache + hàng đợi; dùng dữ liệu mẫu có sẵn trong `posts_cache` và `trips`; nếu Gemini lỗi, dùng lịch trình đã sinh sẵn trong chuyến đi mẫu.

---

## 5. KẾT QUẢ KIỂM THỬ TỔNG HỢP

| Bộ kiểm thử | Lệnh | Số assertion | Kết quả |
|:---|:---|:---:|:---:|
| OCR Parser & Ngân sách (Tú) | `npm test` | 35 | **35/35 PASS** |
| Offline-First Sync Engine (Lâm) | `npm run test:offline` | 21 | **21/21 PASS** |
| TypeScript strict mode | `npm run typecheck` | — | **0 lỗi** |
| Bundle Metro (Android) | `expo start` → `index.bundle` | — | **HTTP 200 · 8.31 MB · 898 module** |
| Nạp biến môi trường | log Metro | 7 biến | **`env: load .env` OK** |
| Kiểm thử thiết bị thật (6 bước ở Report 3 – mục 5.4) | — | 6 | *Chờ chạy — điền kết quả trước khi nộp* |

---

## 6. ĐÁNH GIÁ DỰ ÁN

### 6.1. Điểm mạnh

1. **Kiến trúc rõ ràng, có thể kiểm thử:** toàn bộ logic nghiệp vụ nằm ở Domain (29 use case/entity file) và không import React Native, nhờ vậy 56 assertion chạy được bằng Node mà không cần giả lập thiết bị.
2. **Offline-First thực chất, không phải "lưu tạm":** có `sync_queue`, chính sách retry, loại bản ghi hỏng, xử lý xung đột Last-Write-Wins và cơ chế upload bù ảnh khi có mạng.
3. **Một hợp đồng dữ liệu dùng chung:** ba module Trip/Expense/Social cùng đi qua một hàng đợi đồng bộ, chứng minh thiết kế `SyncQueueItem` từ Milestone 1 là đúng.
4. **Tách phần dễ lỗi ra khỏi phụ thuộc nền tảng:** `drainSyncQueue()` và `mergeFeedPosts()` là hàm thuần, không phụ thuộc SQLite/Firebase — vừa dễ test vừa dễ thay đổi.
5. **Có tài liệu kỹ thuật kèm theo:** `docs/offline-sync.md` mô tả luồng, chính sách và kịch bản demo, giúp người khác tiếp nhận module nhanh.

### 6.2. Hạn chế đã biết

| # | Hạn chế | Ảnh hưởng | Hướng xử lý |
|:---:|:---|:---|:---|
| 1 | Google Sign-In chưa có provider thật (`loginWithGoogle` báo chưa hỗ trợ trong Expo Go) | Chỉ đăng nhập được bằng Email/Password | Tích hợp `@react-native-google-signin` khi có EAS build |
| 2 | Bình luận không có chế độ ngoại tuyến | Mất mạng thì không bình luận được (có thông báo rõ) | Thêm bảng `post_comments_cache` + queue `INSERT` |
| 3 | Lượt thích lưu bằng `increment(±1)`, không lưu danh sách người đã thích | Không chống được thích trùng khi đổi thiết bị | Bảng `post_likes/{postId}_{uid}` |
| 4 | Bộ icon/splash còn là placeholder 70 byte | Không thể phát hành lên store | Thay asset thật trước khi build Release |
| 5 | Chưa có CI/CD, Fastlane, `eas.json` | Đóng gói thủ công, dễ sai sót | Xem mục 3.3 |
| 6 | AI và Cloud OCR cần Internet + API key | Mất key hoặc hết hạn mức thì tính năng AI/OCR dừng | Bổ sung key dự phòng + thông báo lỗi thân thiện (đã có ở Screen 05) |
| 7 | Firebase Storage cần bật bucket | Upload ảnh thất bại cho tới khi bật | Bật Console + deploy `storage.rules` |

### 6.3. Bài học kinh nghiệm

1. **Chốt hợp đồng dữ liệu trước khi code:** `SyncQueueItem` được định nghĩa từ Milestone 1 giúp việc nối 3 module ở Sprint 3 chỉ mất vài chục dòng.
2. **Nhánh `dev` phải luôn xanh:** một dấu `}` sai trong `tripStore.ts` sau khi merge làm `typecheck` fail cho cả nhóm — cần CI chặn merge (chính là hạng mục `DEVOPS-01` còn thiếu).
3. **Kiểm thử phải chạy được ngoài thiết bị:** tách hàm thuần giúp phát hiện lỗi hàng đợi/merge chỉ trong vài giây thay vì quay video thủ công.
4. **Ngoại tuyến phải được thiết kế từ đầu:** nếu chỉ thêm `is_synced` vào cuối dự án thì phải sửa cả repository, store và UI; làm từ Milestone 1 giúp Sprint 3 chỉ còn việc nối dây.
5. **Không đánh giá tính năng qua giao diện:** upload ảnh "trông vẫn chạy" vì ảnh lấy từ bộ nhớ máy — chỉ khi kiểm tra Firestore Console mới phát hiện bucket chưa bật.

---

## 7. HƯỚNG PHÁT TRIỂN

1. **Hoàn thiện phát hành:** bộ icon/splash thật, `eas.json`, APK/AAB ký số, cập nhật README với link tải.
2. **CI/CD:** GitHub Actions chạy `typecheck` + 2 bộ test cho mọi Pull Request vào `dev`; Fastlane lane build APK.
3. **Mạng xã hội đầy đủ:** bảng `post_likes` chống thích trùng, lưu bình luận offline, thông báo đẩy khi có tương tác.
4. **Đồng bộ thông minh hơn:** đồng bộ theo delta (`updatedAt`), nén hàng đợi theo khoá (coalescing), xử lý xung đột theo trường thay vì cả document.
5. **Tối ưu chi phí & hiệu năng:** phân trang bảng tin (`limit` + `startAfter`), cache ảnh (`expo-image`), đo kích thước bundle.
6. **Mở rộng nghiệp vụ:** chia sẻ chuyến đi qua deep link, gợi ý địa điểm theo vị trí, xuất báo cáo chi phí PDF.

---

## 8. PHỤ LỤC

### 8.1. Liên kết

| Mục | Liên kết |
|:---|:---|
| Repository | https://github.com/Ducs2005/travelSofaka |
| Nhánh tích hợp | `dev` |
| Nhánh module Social/Offline | `feature/social-offline-sync` |
| Tài liệu kỹ thuật offline | `docs/offline-sync.md` |
| Nguyên mẫu UI 10 màn hình | `travelsofaka_ui.html` |
| Video demo | *(cập nhật link YouTube sau khi quay)* |

### 8.2. Lệnh chạy nhanh

```bash
npm install                 # cài phụ thuộc
cp .env.example .env        # điền 7 biến Firebase + GEMINI + OCR_SPACE
npm run typecheck           # 0 lỗi
npm test                    # 35 assertion OCR/ngân sách
npm run test:offline        # 21 assertion sync engine
npm start                   # mở Expo, quét QR hoặc bấm "a" cho Android
```

### 8.3. Cấu trúc thư mục

```
travelSofaka/
├── App.tsx                       # Khởi động Sync Engine + Navigation
├── src/
│   ├── core/                     # theme, firebase config, utils
│   ├── domain/                   # entities, repository interfaces, use cases
│   ├── data/                     # sqlite, firestore, storage, ai, ocr, sync, repositories
│   └── presentation/             # screens, components, stores, navigation
├── scripts/                      # test_ocr_and_budget.ts, test_offline_sync.ts
├── docs/                         # tasks.md, offline-sync.md, report/
└── src/core/firebase/            # firestore.rules, storage.rules
```
