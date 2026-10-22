# [REPORT 1] ĐỀ XUẤT DỰ ÁN VÀ NGUYÊN MẪU GIAO DIỆN TƯƠNG TÁC

**Môn học:** Phát triển ứng dụng di động đa nền tảng (*Cross-Platform Mobile App Development*)

**Tên dự án:** Travelsofaka – Ứng dụng lập kế hoạch và chia sẻ trải nghiệm du lịch (*AI Travel Planning & Social Networking App*)

**Thành viên nhóm:**

| STT | Họ và tên | Mã sinh viên | Nhiệm vụ |
|:---:|---|---|---|
| 1 | Phạm Ngọc Đức |  |  |
| 2 | Trần Quang Việt |  |  |
| 3 | Lê Hữu Anh Tú |  |  |
| 4 | Nguyễn Tùng Lâm |  |  |

---

## 1. ĐỘNG LỰC VÀ VẤN ĐỀ CỦA DỰ ÁN

### 1.1. Bối cảnh và vấn đề thực tế

Khi lên kế hoạch cho một chuyến du lịch, người dùng thường phải sử dụng nhiều ứng dụng khác nhau để tìm kiếm điểm đến, xây dựng lịch trình, quản lý chi phí và chia sẻ trải nghiệm. Điều này khiến quá trình chuẩn bị chuyến đi trở nên mất thời gian, đặc biệt đối với sinh viên, người trẻ và những người chưa có nhiều kinh nghiệm du lịch.

Bên cạnh đó, việc tự xây dựng lịch trình phù hợp với ngân sách, thời gian và sở thích cá nhân có thể gặp nhiều khó khăn. Việc ghi chép chi phí thủ công cũng gây bất tiện và dễ xảy ra sai sót. Người dùng còn có thể gặp vấn đề khi không có kết nối Internet trong quá trình di chuyển.

**Travelsofaka** được phát triển nhằm giải quyết những vấn đề trên bằng cách kết hợp mạng xã hội du lịch, công cụ lập kế hoạch chuyến đi, quản lý chi phí và trí tuệ nhân tạo (AI) trong một ứng dụng di động.

Các mục tiêu chính của dự án:

- Hỗ trợ người dùng khám phá điểm đến và chia sẻ kinh nghiệm du lịch.
- Sử dụng AI để đề xuất lịch trình dựa trên điểm đến, thời gian, ngân sách và sở thích của người dùng.
- Ứng dụng công nghệ OCR để nhận diện thông tin trên hóa đơn, hỗ trợ ghi nhận chi phí.
- Cho phép lưu và truy cập dữ liệu chuyến đi khi không có Internet thông qua cơ chế Offline-First.
- Đồng bộ dữ liệu giữa thiết bị và hệ thống đám mây khi có kết nối mạng.

### 1.2. Chân dung người dùng mục tiêu

**Người dùng chính:**

- **Độ tuổi:** Khoảng 18–30 tuổi.
- **Nghề nghiệp:** Sinh viên, nhân viên văn phòng và người trẻ yêu thích du lịch.
- **Mục tiêu:** Tìm kiếm điểm đến, lập kế hoạch chuyến đi, kiểm soát ngân sách và chia sẻ trải nghiệm.
- **Khó khăn:** Tốn thời gian xây dựng lịch trình, thông tin phân tán trên nhiều ứng dụng, khó theo dõi chi phí và thiếu công cụ hỗ trợ lập kế hoạch cá nhân hóa.

**Tình huống sử dụng điển hình:**

Một sinh viên muốn tổ chức chuyến du lịch ba ngày cùng bạn bè với ngân sách giới hạn. Người dùng nhập điểm đến, thời gian, ngân sách và sở thích vào Travelsofaka. AI đề xuất lịch trình theo từng ngày để người dùng xem xét và chỉnh sửa. Sau khi lưu lịch trình, người dùng có thể chia sẻ kế hoạch với bạn bè, theo dõi chi phí trong chuyến đi và quét hóa đơn để tự động nhận diện thông tin cần thiết. Khi mất kết nối Internet, người dùng vẫn có thể xem lịch trình và dữ liệu đã lưu trên thiết bị.

---

## 2. PHẠM VI HỆ THỐNG VÀ ĐẶC TẢ CHỨC NĂNG

| STT | Nhóm chức năng | Chức năng cụ thể | Mức ưu tiên | Logic nghiệp vụ và phạm vi |
|:---:|---|---|:---:|---|
| 1 | Xác thực và hồ sơ | Đăng nhập Google/email, quản lý hồ sơ cá nhân | Bắt buộc | Sử dụng Firebase Authentication để xác thực người dùng. |
| 2 | Chức năng nghiệp vụ chính | Khám phá điểm đến, tạo chuyến đi và quản lý lịch trình | Bắt buộc | Cho phép tìm kiếm, lưu địa điểm, tạo chuyến đi và sắp xếp hoạt động theo ngày. |
| 3 | Trí tuệ nhân tạo (AI) | AI đề xuất kế hoạch du lịch | Bắt buộc | Sử dụng LLM API để đề xuất lịch trình dựa trên điểm đến, thời gian, ngân sách và sở thích. |
| 4 | Trí tuệ nhân tạo (AI) | Nhận diện hóa đơn bằng OCR | Bắt buộc | Sử dụng Google ML Kit để nhận diện văn bản trên thiết bị; người dùng xác nhận thông tin trước khi lưu. |
| 5 | Mạng xã hội du lịch | Đăng bài, thích, bình luận và theo dõi người dùng | Bắt buộc | Cho phép chia sẻ ảnh, kinh nghiệm và tương tác với cộng đồng du lịch. |
| 6 | Quản lý chi phí | Ghi nhận và tổng hợp chi phí chuyến đi | Nên có | Lưu khoản chi, phân loại chi phí và tính tổng ngân sách đã sử dụng. |
| 7 | Chia sẻ chuyến đi | Chia sẻ lịch trình với bạn bè | Nên có | Cho phép người dùng chia sẻ kế hoạch và tham khảo lịch trình của người khác. |
| 8 | Hỗ trợ ngoại tuyến | Cơ sở dữ liệu cục bộ và tự động đồng bộ | Nên có | Sử dụng SQLite để lưu dữ liệu trên thiết bị, Firebase để đồng bộ khi có Internet. |
| 9 | Giao diện và trải nghiệm | Chế độ sáng/tối và giao diện thân thiện | Nên có | Áp dụng Material Design 3, tối ưu thao tác trên thiết bị di động. |
| 10 | Tự động hóa phát hành | Kiểm thử và đóng gói ứng dụng | Nên có | Sử dụng GitHub Actions và Fastlane để tự động hóa quy trình build bản Release. |

**Phạm vi bản MVP:**

- Đăng nhập và quản lý hồ sơ người dùng.
- Khám phá điểm đến và tạo lịch trình.
- AI đề xuất kế hoạch du lịch.
- OCR hóa đơn và quản lý chi phí cơ bản.
- Mạng xã hội du lịch với các chức năng tương tác chính.
- Lưu dữ liệu cục bộ và đồng bộ với Firebase.

**Giới hạn của hệ thống:**

- AI đề xuất lịch trình mới cần Internet nếu sử dụng LLM API trên đám mây.
- AI chỉ cung cấp gợi ý tham khảo; người dùng cần kiểm tra thông tin về giá cả, giờ mở cửa và địa điểm.
- OCR có thể nhận diện sai nội dung hóa đơn nên người dùng phải xác nhận trước khi lưu.
- Phiên bản đầu tiên không bao gồm đặt vé, đặt phòng trực tiếp hoặc định vị thời gian thực.

---

## 3. CÔNG NGHỆ VÀ KIẾN TRÚC BAN ĐẦU

### 3.1. Công nghệ sử dụng

- **Framework:** React Native + Expo + TypeScript.
- **Quản lý trạng thái:** Zustand.
- **Kiến trúc:** Clean Architecture gồm ba lớp Domain, Data và Presentation.
- **Backend:** Firebase Authentication, Cloud Firestore và Firebase Storage.
- **Cơ sở dữ liệu cục bộ:** SQLite thông qua `expo-sqlite`.
- **AI đề xuất lịch trình:** LLM API.
- **AI nhận diện hóa đơn:** Google ML Kit Text Recognition.
- **Thiết kế giao diện:** Figma và Material Design 3, hỗ trợ chế độ sáng/tối.
- **Quản lý mã nguồn:** Git và GitHub.
- **Tự động hóa phát hành:** GitHub Actions và Fastlane.

### 3.2. Kiến trúc hệ thống

Hệ thống được tổ chức theo ba lớp:

- **Domain:** Chứa các thực thể nghiệp vụ, giao diện repository và Use Case như tạo chuyến đi, đề xuất lịch trình, quản lý chi phí và đồng bộ dữ liệu. Lớp này không phụ thuộc vào giao diện người dùng hoặc các dịch vụ bên ngoài.
- **Data:** Triển khai các repository, truy cập SQLite và Firebase, tích hợp dịch vụ AI/OCR và xử lý đồng bộ dữ liệu.
- **Presentation:** Chứa màn hình, thành phần giao diện, điều hướng và quản lý trạng thái; gọi Use Case để thực hiện nghiệp vụ.

Đối với cơ chế Offline-First, ứng dụng ưu tiên đọc và lưu dữ liệu chuyến đi trong SQLite. Khi có kết nối Internet, hệ thống đồng bộ các thay đổi với Firebase. Các yêu cầu tạo lịch trình mới bằng LLM API vẫn cần kết nối mạng, trong khi lịch trình đã lưu có thể được xem ngoại tuyến.

### 3.3. Nguyên mẫu giao diện trên Figma

**Liên kết Figma Prototype:** [TravelSofaka Figma Prototype](https://www.figma.com/design/tQLmUT5MypIl3TH9zBgh9Y/TravelSofaka?node-id=0-1&t=WfU9Jkd7J3qR8PT3-1)

Các màn hình dự kiến:

1. Đăng nhập và đăng ký.
2. Trang chủ và bảng tin du lịch.
3. Tìm kiếm và chi tiết điểm đến.
4. Nhập thông tin chuyến đi để AI đề xuất lịch trình.
5. Xem, chỉnh sửa và lưu lịch trình AI.
6. Chi tiết chuyến đi và quản lý chi phí.
7. Quét hóa đơn và xác nhận kết quả OCR.
8. Tạo bài đăng và chia sẻ trải nghiệm.
9. Hồ sơ cá nhân và danh sách địa điểm yêu thích.
