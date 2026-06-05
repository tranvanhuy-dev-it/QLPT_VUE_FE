# Kế Hoạch Thực Hiện Frontend Quản Lý Phòng Trọ (QLPT_VUE_FE)

Tài liệu này mô tả chi tiết kế hoạch thiết kế và lập trình giao diện người dùng (Frontend) bằng Vue 3 (Vite), Axios và Pinia. Hệ thống tuân thủ nghiêm ngặt yêu cầu phân tách giao diện (.vue) và logic nghiệp vụ (.js).

## Tách Biệt Giao Diện Và Logic (.vue và .js)

Để tách biệt phần hiển thị (Template & Style) và xử lý logic (JS/Composition API), chúng ta sẽ sử dụng cú pháp thuộc tính `src` trong thẻ `<script>` của file `.vue`.

Ví dụ cấu trúc một component `Dashboard`:
- `Dashboard.vue`: Chỉ chứa thẻ `<template>` cho mã HTML và thẻ `<style scoped>` cho CSS thuần.
- `Dashboard.js`: Chứa hàm `setup()`, trạng thái `ref`, các hàm xử lý sự kiện và tích hợp Pinia Store/Vue Router.

---

## Cấu Trúc Thư Mục Frontend Dự Kiến

Chúng ta sẽ tổ chức các file trong thư mục `QLPT_VUE_FE/src` như sau:

- `src/assets/main.css`: Định nghĩa CSS chung và bảng màu chủ đạo (Harmony Theme).
- `src/services/api.js`: Cấu hình Axios instance tự động gắn JWT Token vào header.
- `src/stores/auth.js`: Pinia Store quản lý token, thông tin đăng nhập.
- `src/router/index.js`: Cấu hình Vue Router và Navigation Guards bảo mật trang.
- `src/views/`:
  - `auth/`: Login, Register (Landlord)
  - `admin/`: Quản lý danh sách các chủ trọ
  - `landlord/`: Quản lý dãy trọ, phòng trọ, hợp đồng, lập hóa đơn, thu tiền
  - `tenant/`: Xem thông tin phòng, xem và in hóa đơn tháng
- `src/components/`: navbar, sidebar, card, receipt.

---

## Kịch Bản Kiểm Thử Giao Diện (Verification Plan)

### Kiểm Thử Thủ Công
1. **Kiểm tra đăng nhập & chuyển trang**: Phân quyền router và ngăn truy cập trái phép.
2. **Kiểm tra nghiệp vụ hóa đơn ngày lẻ**: Nhập ngày thuê lệch kỳ cố định và kiểm tra số tiền phòng lẻ tự tính đúng.
3. **Kiểm tra lịch sử hóa đơn**: Đảm bảo hóa đơn cũ đã sinh không đổi giá trị khi sửa giá dịch vụ của dãy trọ.
