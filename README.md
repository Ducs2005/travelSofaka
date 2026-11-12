# BẢNG PHÂN CHIA NHIỆM VỤ DỰ ÁN TRAVELSOFAKA (TRIPMATE)
**Cross-Platform Mobile App Development - Capstone Project**

---

## 1. THÔNG TIN CHUNG DỰ ÁN

* **Tên dự án:** Travelsofaka (Tên nguyên mẫu UI: *TripMate*)
* **Mô tả:** Ứng dụng di động đa nền tảng kết hợp mạng xã hội du lịch, lập kế hoạch thông minh bằng AI, quản lý chi phí & bóc tách hóa đơn bằng OCR và hỗ trợ ngoại tuyến (Offline-First).
* **Công nghệ chủ đạo:**
  * **Framework & Ngôn ngữ:** React Native, Expo SDK, TypeScript.
  * **Kiến trúc:** Clean Architecture (Domain, Data, Presentation).
  * **Quản lý trạng thái:** Zustand.
  * **Cơ sở dữ liệu & Backend:** Firebase Authentication, Cloud Firestore.
  * **Lưu trữ ảnh (Cloud CDN):** Cloudinary — nén ảnh trên client rồi upload lấy URL.
  * **CSDL cục bộ (Offline-First):** SQLite qua `expo-sqlite`.
  * **Trí tuệ nhân tạo (AI):** LLM API (Google Gemini / OpenAI) & Google ML Kit Text Recognition (On-device OCR).
  * **Giao diện & UI System:** Tailwind CSS / NativeWind, Material Design 3, Figma Prototype.
  * **DevOps:** Git, GitHub Actions, Fastlane.

---

## 2. MA TRẬN PHÂN CÔNG VAI TRÒ TỔNG THỂ

| STT | Thành viên | Vai trò chính | Màn hình UI phụ trách | Module nghiệp vụ & Kỹ thuật cốt lõi |
|:---:|---|---|---|---|
| 1 | **Trần Quang Việt** | **Core Architect & Auth / Profile / DevOps** | • Screen 01: Login / Sign Up<br>• Screen 10: User Profile | • Khởi tạo Base Clean Architecture, Navigation & Design System.<br>• Firebase Authentication & Quản lý hồ sơ người dùng.<br>• Thiết lập pipeline CI/CD (GitHub Actions, Fastlane). |
| 2 | **Phạm Ngọc Đức** | **Team Lead & AI Travel Planner** | • Screen 03: Explore Destinations<br>• Screen 04: Destination Details<br>• Screen 05: Trip Planner | • Quản lý tiến độ dự án, tài liệu & duyệt Pull Request.<br>• Tích hợp LLM API sinh lịch trình du lịch tự động dạng JSON.<br>• Nghiệp vụ khám phá điểm đến & sắp xếp hoạt động theo ngày. |
| 3 | **Lê Hữu Anh Tú** | **Expense & AI OCR Engineer** | • Screen 06: Trip Details & Expense<br>• Screen 07: Receipt Scanner<br>• Screen 08: OCR Expense Review | • Tích hợp Google ML Kit Text Recognition (On-device OCR).<br>• Thuật toán Regex bóc tách thông tin hóa đơn (quán, ngày, tiền).<br>• Quản lý ngân sách nhóm & tính toán phân chia chi phí (split bill). |
| 4 | **Nguyễn Tùng Lâm** | **Social Feed & Offline Sync Engine** | • Screen 02: Home Feed<br>• Screen 09: Create Travel Post | • Tích hợp Cloudinary (nén và tải lên ảnh đa phương tiện).<br>• Bảng tin mạng xã hội, tương tác like, comment.<br>• Thiết kế SQLite Database & Engine đồng bộ ngoại tuyến hai chiều. |

---

## 3. CHI TIẾT CÔNG VIỆC TỪNG THÀNH VIÊN (WORK BREAKDOWN STRUCTURE)

```
                            SƠ ĐỒ PHÂN BỔ MODULE HỆ THỐNG
   ┌────────────────────────────────────────────────────────────────────────┐
   │                            PRESENTATION LAYER                          │
   │  [Việt: Auth & Profile]   [Đức: Explore & Plan]   [Tú: Expense & OCR]  │
   │  [Lâm: Social Feed]       [Chung: Navigation, Material Theme, Zustand] │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                              DOMAIN LAYER                              │
   │   Entities & UseCases: User, TripPlan, Destination, Expense, Post      │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                               DATA LAYER                               │
   │  [SQLite (expo-sqlite)] ◄────── Lâm: Sync ──────► [Firebase Firestore] │
   │  [Google ML Kit OCR] ◄─ Tú           Đức ─► [LLM API (Gemini/OpenAI)]  │
   │  [Firebase Auth] ◄─ Việt             Lâm ─► [Cloudinary CDN]          │
   └────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1. Trần Quang Việt (Core Architect & Auth / Profile / DevOps)

| Mã Task | Tên công việc | Màn hình / Vị trí code | Mô tả & Tiêu chí nghiệm thu (Acceptance Criteria) |
|---|---|---|---|
| `CORE-01` | **Khởi tạo dự án & Clean Architecture** | Toàn bộ dự án | Cấu trúc thư mục 3 lớp (`src/domain`, `src/data`, `src/presentation`), cấu hình TypeScript strict mode, path alias (`@/domain`, `@/data`, v.v.). |
| `CORE-02` | **Navigation & Theme System** | `src/presentation/navigation/` | Cài đặt React Navigation (Bottom Tabs: Home, Explore, Trips, Profile; Stacks: Auth, Modals). Bảng màu chuẩn Teal (`#0D9488`), Coral (`#FF6B6B`), hỗ trợ Dark/Light mode. |
| `CORE-03` | **Base Components dùng chung** | `src/presentation/components/` | Xây dựng các UI component tái sử dụng: `AppButton`, `AppTextInput`, `Card`, `HeaderBar`, `LoadingOverlay`. |
| `AUTH-01` | **UI Screen 01: Login / Sign Up** | Screen 01 (`travelsofaka_ui.html`) | Giao diện màn hình đăng nhập / đăng ký, validation form email/password, switch giữa Sign In và Sign Up, nút Google Sign-In. |
| `AUTH-02` | **Tích hợp Firebase Auth & Google Sign-In** | `src/data/datasources/remote/` | Đăng nhập/đăng ký bằng Email & Password, tích hợp Google Sign-In, lưu phiên đăng nhập với Zustand `authStore`. |
| `PROF-01` | **UI Screen 10: User Profile** | Screen 10 (`travelsofaka_ui.html`) | Header thông tin người dùng, ảnh đại diện, bio sinh viên, số liệu (12 Trips, 8 Saved, 348 Friends), tabs: *Posts*, *Saved*, *History*. |
| `PROF-02` | **Logic Profile & Quản lý tài khoản** | `src/domain/usecases/profile/` | Xem hồ sơ cá nhân, cập nhật bio/avatar, đăng xuất, lưu trữ thông tin người dùng vào Firestore collection `users`. |
| `DEVOPS-01` | **CI/CD Pipeline & Fastlane Setup** | `.github/workflows/` | Thiết lập GitHub Actions tự động chạy `eslint` và `tsc` khi có Pull Request; cấu hình Fastlane build APK thử nghiệm. |

---

### 3.2. Phạm Ngọc Đức (Team Lead & AI Travel Planner / Explore)

| Mã Task | Tên công việc | Màn hình / Vị trí code | Mô tả & Tiêu chí nghiệm thu (Acceptance Criteria) |
|---|---|---|---|
| `LEAD-01` | **Điều phối & Quản lý chất lượng** | GitHub / Repo | Quản lý tiến độ theo Sprint, chủ trì họp nhóm, review code các Pull Request của thành viên trước khi merge vào `develop`. |
| `EXPL-01` | **UI Screen 03: Explore Destinations** | Screen 03 (`travelsofaka_ui.html`) | Thanh tìm kiếm địa điểm du lịch, bộ lọc tag (*All, Beaches, Mountains*), danh sách thẻ địa điểm (ảnh, giá ước tính/ngày, sao đánh giá). |
| `EXPL-02` | **UI Screen 04: Destination Details** | Screen 04 (`travelsofaka_ui.html`) | Chi tiết địa điểm: Ảnh lớn, thông tin tổng quan, ngân sách ước tính, rating, danh sách đánh giá sinh viên, nút *"+ Add to Trip"*. |
| `PLAN-01` | **UI Screen 05: Trip Planner** | Screen 05 (`travelsofaka_ui.html`) | Form nhập thông tin chuyến đi: Tiêu đề, khoảng ngày, ngân sách. Giao diện chia tab theo ngày (*Day 1, Day 2, Day 3*) và danh sách hoạt động. |
| `PLAN-02` | **Quản lý trạng thái chuyến đi (`tripStore`)** | `src/presentation/stores/tripStore.ts` | Thêm, xóa, sửa các hoạt động trong ngày, lưu thông tin chuyến đi vào trạng thái cục bộ và CSDL. |
| `AI-01` | **Tích hợp LLM API đề xuất lịch trình** | `src/data/datasources/remote/ai/` | Gửi prompt (điểm đến, số ngày, ngân sách, sở thích) lên LLM API (Gemini/OpenAI); ép format kết quả trả về là cấu trúc JSON chuẩn lịch trình. |
| `AI-02` | **Xử lý & Chuyển đổi dữ liệu AI vào Trip** | `src/domain/usecases/trip/` | Nhận JSON từ AI, bóc tách thành các thực thể `Activity` gắn theo từng ngày, hiển thị lên Screen 05 cho phép người dùng xem và chỉnh sửa. |

---

### 3.3. Lê Hữu Anh Tú (Expense Management & AI OCR Engineer)

| Mã Task | Tên công việc | Màn hình / Vị trí code | Mô tả & Tiêu chí nghiệm thu (Acceptance Criteria) |
|---|---|---|---|
| `EXP-01` | **UI Screen 06: Trip Details & Expense Summary** | Screen 06 (`travelsofaka_ui.html`) | Thẻ tóm tắt chi phí nhóm, thanh tiến độ ngân sách (`2,635,000 / 6,000,000 VND`), danh sách các khoản chi tiêu gần đây, nút *Share Trip*. |
| `EXP-02` | **Logic Quản lý ngân sách & `expenseStore`** | `src/presentation/stores/expenseStore.ts` | Tính tổng chi phí, tính tỷ lệ phần trăm ngân sách đã sử dụng, đổi màu cảnh báo khi ngân sách vượt ngưỡng 80% và 100%. |
| `OCR-01` | **UI Screen 07: Receipt Scanner (Camera)** | Screen 07 (`travelsofaka_ui.html`) | Giao diện máy ảnh quét hóa đơn, khung ngắm canh góc chụp, nút chụp ảnh và nút chọn ảnh từ thư viện thiết bị. |
| `OCR-02` | **Tích hợp Google ML Kit Text Recognition** | `src/data/datasources/remote/ocr/` | Cài đặt và tích hợp thư viện Google ML Kit trên thiết bị (On-device OCR) để nhận diện toàn bộ khối văn bản từ ảnh hóa đơn. |
| `OCR-03` | **Bộ Parser Regex bóc tách thông tin hóa đơn** | `src/domain/usecases/ocr/` | Viết regex và thuật toán heuristics tự động trích xuất: Tên quán/cửa hàng (Merchant), Ngày tháng (Date), Tổng tiền thanh toán (Total Amount). |
| `EXP-03` | **UI Screen 08: OCR Expense Review & Chia bill** | Screen 08 (`travelsofaka_ui.html`) | Form xác nhận/sửa đổi thông tin sau khi quét OCR; chọn phân loại chi phí (*Food, Transport, Stay...*); chọn bạn bè trong danh sách để chia tiền (split bill). |

---

### 3.4. Nguyễn Tùng Lâm (Social Feed & Offline-First Sync Engine)

| Mã Task | Tên công việc | Màn hình / Vị trí code | Mô tả & Tiêu chí nghiệm thu (Acceptance Criteria) |
|---|---|---|---|
| `SOC-01` | **UI Screen 02: Home Feed** | Screen 02 (`travelsofaka_ui.html`) | Header thương hiệu, Active Trip banner, danh sách bài đăng từ cộng đồng (ảnh, tag địa điểm, caption, tác giả, nút tương tác like/comment). |
| `SOC-02` | **UI Screen 09: Create Travel Post** | Screen 09 (`travelsofaka_ui.html`) | Giao diện đăng bài du lịch: Chọn ảnh từ máy, gắn thẻ địa điểm (Destination Tag), nhập caption và xuất bản bài viết lên cộng đồng. |
| `SOC-03` | **Tích hợp Cloudinary & Social Feed Store** | `src/presentation/stores/socialStore.ts` | Nén ảnh trên client trước khi upload lên Cloudinary; lưu bài viết vào Firestore collection `posts`; logic tương tác Like / Comment. |
| `OFF-01` | **Thiết kế Schema CSDL SQLite cục bộ** | `src/data/datasources/local/sqlite/` | Tạo các bảng SQLite qua `expo-sqlite`: `trips`, `activities`, `expenses`, `posts_cache`, `sync_queue`. |
| `OFF-02` | **Xây dựng Repository đọc ghi Offline-First** | `src/data/repositories/` | Ưu tiên đọc dữ liệu tức thì từ SQLite. Khi thiết bị ngoại tuyến, các thao tác thêm/sửa/xóa vẫn ghi thành công vào SQLite và đánh dấu `is_synced = 0`. |
| `OFF-03` | **Engine đồng bộ dữ liệu (Sync Engine)** | `src/data/datasources/sync/` | Dùng `@react-native-community/netinfo` nhận diện khi có mạng: Quét bảng `sync_queue` và tuần tự đẩy dữ liệu lên Cloud Firestore, cập nhật `is_synced = 1`. |

---

## 4. LỘ TRÌNH THỰC HIỆN THEO SPRINT (3 SPRINTS)

### 🚀 Sprint 1: Setup Kiến trúc, Navigation & Màn hình UI (Tuần 1 – Tuần 2)
* **Trần Quang Việt:** Hoàn thành `CORE-01`, `CORE-02`, `CORE-03`, `AUTH-01`, `PROF-01`. Cung cấp repo khung có sẵn navigation và style cho cả nhóm.
* **Phạm Ngọc Đức:** Hoàn thành `EXPL-01`, `EXPL-02`, `PLAN-01` (dựng xong 3 màn hình Explore và Planner theo đúng UI nguyên mẫu).
* **Lê Hữu Anh Tú:** Hoàn thành `EXP-01`, `OCR-01`, `EXP-03` (dựng xong giao diện tóm tắt chi phí, camera scanner và review OCR).
* **Nguyễn Tùng Lâm:** Hoàn thành `SOC-01`, `SOC-02`, `OFF-01` (dựng xong UI Home Feed, Create Post và tạo cấu trúc bảng SQLite).

### ⚙️ Sprint 2: Core Logic, Backend Services & Tích hợp AI (Tuần 3 – Tuần 4)
* **Trần Quang Việt:** Hoàn thành `AUTH-02`, `PROF-02`, `DEVOPS-01` (chạy thực tế đăng nhập Google/Email Firebase, quản trị CI/CD).
* **Phạm Ngọc Đức:** Hoàn thành `AI-01`, `AI-02`, `PLAN-02` (gọi LLM API sinh JSON lịch trình, bind dữ liệu thật vào Day 1, Day 2...).
* **Lê Hữu Anh Tú:** Hoàn thành `OCR-02`, `OCR-03`, `EXP-02` (kích hoạt ML Kit nhận diện ảnh thật, bóc tách chính xác số tiền và ngày, lưu chi phí).
* **Nguyễn Tùng Lâm:** Hoàn thành `SOC-03`, `OFF-02` (upload ảnh lên Cloudinary, load feed realtime, hoàn tất ghi offline vào SQLite).

### 🔄 Sprint 3: Offline-First Sync, Kiểm thử & Đóng gói (Tuần 5 – Tuần 6)
* **Lâm & Việt:** Hoàn thành `OFF-03` (hoàn thiện Sync Engine giữa SQLite và Firestore; xử lý xung đột dữ liệu).
* **Đức & Tú:** Kiểm thử tích hợp luồng AI: Tạo chuyến đi bằng AI -> Quét hóa đơn chi tiêu OCR -> Kiểm tra tính toán ngân sách.
* **Toàn đội:** Kiểm thử trên thiết bị thật (Android & iOS), sửa lỗi UI/UX, chạy Fastlane xuất bản Release APK/AAB và nghiệm thu báo cáo.

---

## 5. ĐẶC TẢ GIAO DIỆN DỮ LIỆU DÙNG CHUNG (SHARED DATA CONTRACTS)

Tất cả các thành viên sử dụng chung các interface định nghĩa tại `src/domain/entities/`:

```typescript
// 1. Module Auth & Profile (Phụ trách: Việt)
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  tripsCount: number;
  savedCount: number;
  friendsCount: number;
}

// 2. Module Trip & AI Planning (Phụ trách: Đức)
export interface Activity {
  id: string;
  dayIndex: number; // 1, 2, 3...
  time: string;     // ví dụ: "09:00 AM"
  title: string;    // ví dụ: "Check-in My Khe Beach"
  locationName: string;
  estimatedCost?: number;
}

export interface TripPlan {
  id: string;
  creatorUid: string;
  title: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  budgetTotal: number;
  activities: Activity[];
  isSynced: boolean;
}

// 3. Module Expense & OCR (Phụ trách: Tú)
export interface ExpenseItem {
  id: string;
  tripId: string;
  merchantName: string;
  date: string;
  amount: number;
  category: 'FOOD' | 'ACCOMMODATION' | 'TRANSPORT' | 'ENTERTAINMENT' | 'OTHER';
  isFromOCR: boolean;
  splitMemberUids: string[];
}

// 4. Module Social Feed & Sync (Phụ trách: Lâm)
export interface TravelPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  destinationTag: string;
  caption: string;
  imageUrl: string;
  likes: number;
  commentsCount: number;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  tableName: 'trips' | 'expenses' | 'posts';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payloadJson: string;
  createdAt: number;
}
```

---

## 6. QUY TẮC QUẢN LÝ GIT & CHUẨN MỰC PHỐI HỢP

1. **Phân nhánh Git (Git Flow):**
   * Nhánh chính: `main` (Production/Release), `develop` (Integration).
   * Nhánh cá nhân theo module:
     * `feature/core-auth-profile` (Trần Quang Việt)
     * `feature/trip-ai-planner` (Phạm Ngọc Đức)
     * `feature/expense-mlkit-ocr` (Lê Hữu Anh Tú)
     * `feature/social-offline-sync` (Nguyễn Tùng Lâm)
2. **Quy tắc Pull Request:**
   * Không commit trực tiếp lên `main` hoặc `develop`.
   * Mọi PR gửi vào `develop` phải được ít nhất **Trần Quang Việt (Core)** hoặc **Phạm Ngọc Đức (Lead)** review và duyệt.
   * CI tự động chạy kiểm tra lint và build trước khi cho phép merge.
