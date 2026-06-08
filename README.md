# Nhà Trọ Thông Minh - Frontend (Vue 3 + Vite + Capacitor)

Đây là mã nguồn Frontend của hệ thống **Nhà Trọ Thông Minh** - giải pháp client-side đa nền tảng (Web & Android Mobile App) chạy trên Vue 3, Vite và Capacitor.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

* **Framework**: Vue 3 (Composition API)
* **Build Tool**: Vite 8.x
* **State Management**: Pinia 3.x
* **Routing**: Vue Router 5.x
* **HTTP Client**: Axios (Tích hợp global interceptor xử lý lỗi JWT hết hạn và gói cước quá hạn `402 Payment Required`)
* **Styling**: Vanilla CSS + Tailwind CSS 4.x
* **Mobile Packaging**: Capacitor JS (Đóng gói ứng dụng Hybrid Android)

---

## 2. Đặc Điểm Giao Diện & Trải Nghiệm (UX/UI Highlights)

Ứng dụng được thiết kế tối ưu hóa mạnh mẽ cho thiết bị di động (Mobile First):
* **PageHeader Tinh Gọn**: Trên điện thoại di động, tiêu đề trang rườm rà được ẩn hoàn toàn. Ô tìm kiếm, bộ lọc dãy trọ và nút thêm được xếp gọn gàng trên một hàng ngang duy nhất. Nút "Thêm" hiển thị với nhãn chữ compact "Thêm" để tối ưu hóa diện tích thao tác.
* **Responsive Card Grid**: Các bảng biểu dữ liệu (`DataTable.vue`) tự động chuyển thành dạng lưới thẻ (Card Grid) 1 cột trên điện thoại nhỏ và 2 cột trên máy tính bảng để ngăn việc cắt chữ hoặc tràn viền. Các khoảng cách dòng, độ cao đệm được tinh chỉnh mật độ thông tin cao (High-density).
* **Chỉ Số Trạng Thái Chấm Tròn**: Thay thế nhãn văn bản trạng thái phòng dài dòng bằng chấm tròn màu trực quan nhấp nháy (Emerald biểu thị phòng trống, Rose biểu thị phòng đã có người ở).
* **BottomBar Bằng Phẳng**: Thanh menu dưới cùng của điện thoại di động được thiết kế phẳng gọn gàng, tích hợp logic nhận diện trang active tuyệt đối ngăn việc sáng xanh đồng thời nhiều tab.
* **VietQR Động**: Khách thuê thanh toán hóa đơn và Chủ trọ nâng cấp gói cước được hiển thị mã QR VietQR động tạo tự động điền sẵn thông tin số tiền và nội dung chuyển khoản chi tiết.

---

## 3. Cấu Trúc Mã Nguồn (Project Structure)

```text
src
├── assets/                     # Tài nguyên CSS, hình ảnh dùng chung
├── components/
│   ├── layout/                 # Bố cục giao diện: Header, Sidebar, BottomBar, Footer
│   └── ui/                     # Thành phần giao diện dùng chung: PageHeader, DataTable, FormInput, Modal
├── router/                     # Khai báo các routes, Navigation Guards bảo mật vai trò người dùng
├── services/                   # Định nghĩa các cuộc gọi API (api.js, roomService, invoiceService...)
├── stores/                     # Pinia store lưu trữ trạng thái người dùng (auth, settings)
└── views/                      # Các trang giao diện chính
    ├── admin/                  # Giao diện dành cho Quản trị viên
    ├── auth/                   # Các trang đăng nhập, đăng ký
    ├── landlord/               # Giao diện quản lý của Chủ trọ (Dãy trọ, Phòng, Hợp đồng, Hóa đơn...)
    └── tenant/                 # Giao diện tra cứu của Khách thuê (Hợp đồng, Hóa đơn của tôi, Nội quy...)
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy Dự Án

### 4.1. Yêu cầu Hệ thống
* Node.js phiên bản 18.x trở lên.
* Trình quản lý gói `npm`.

### 4.2. Khởi chạy môi trường phát triển (Web)
1. Cài đặt các dependencies:
   ```bash
   npm install
   ```
2. Chạy Dev server:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy ở địa chỉ mặc định `http://localhost:5173`.

### 4.3. Đóng gói & Đồng bộ ứng dụng Android (Capacitor)
Mỗi khi có thay đổi mã nguồn Vue, bạn cần build lại và đồng bộ sang thư mục assets của Android trước khi chạy/debug trên thiết bị di động bằng Android Studio:
1. Biên dịch tối ưu hóa mã nguồn tĩnh:
   ```bash
   npm run build
   ```
   Tài nguyên biên dịch sẽ được đưa vào thư mục `dist/`.
2. Đồng bộ sang Android project:
   ```bash
   npx cap sync
   ```
3. Mở và biên dịch ứng dụng trên Android Studio:
   ```bash
   npx cap open android
   ```
