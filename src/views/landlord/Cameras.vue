<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Page Header -->
    <PageHeader 
      title="Hệ thống Camera IP" 
      :subtitle="`Giám sát an ninh và quản lý luồng camera của các dãy trọ (${filteredCameras.length} camera)`"
      :icon="cameraIcon" 
      :showAdd="true" 
      addText="Thêm Camera" 
      :showSearch="false" 
      @add-click="openAddModal" 
    >
      <template #filter-addons>
        <select 
          v-model="selectedHouseId" 
          class="px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border-main rounded-xl bg-slate-50 dark:bg-slate-900 text-text-main text-[11px] sm:text-xs font-semibold outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:border-primary cursor-pointer max-w-[150px] sm:max-w-[200px]"
        >
          <option value="">Tất cả dãy trọ</option>
          <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
            {{ house.name }}
          </option>
        </select>
      </template>

      <template #custom-actions>
        <button 
          type="button" 
          @click="openGuideModal"
          class="inline-flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer gap-1.5 transition-all shadow-xs shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          <span>Hướng dẫn</span>
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-medium">Đang tải danh sách camera...</span>
    </div>

    <!-- Main List/Grid -->
    <template v-else>
      <div v-if="filteredCameras.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CameraPlayer 
          v-for="cam in filteredCameras" 
          :key="cam.id" 
          :camera="cam"
          @settings-click="openEditModal"
        >
          <!-- Display name of boarding house in camera header/body -->
          <template #header-extra>
            <span class="px-2 py-0.5 text-[9px] font-bold rounded-md bg-sky-50 dark:bg-sky-950/40 text-primary border border-primary/10 max-w-[150px] truncate">
              {{ getHouseName(cam.boardingHouseId) }}
            </span>
          </template>
        </CameraPlayer>
      </div>

      <!-- Empty State -->
      <EmptyState 
        v-else 
        :message="selectedHouseId ? 'Chưa có camera nào được cấu hình cho dãy trọ này.' : 'Chưa có camera nào trong hệ thống của bạn.'"
      >
        <template #actions>
          <FormButton 
            type="button" 
            @click="openAddModal" 
            variant="primary" 
            size="sm" 
            class="mt-4"
          >
            + Thêm camera mới
          </FormButton>
        </template>
      </EmptyState>
    </template>

    <!-- Camera Config Modal -->
    <Modal 
      v-if="showModal" 
      :title="editingCamera ? 'Cập nhật Camera' : 'Thêm Camera mới'" 
      maxWidth="md" 
      @close="closeModal"
    >
      <form @submit.prevent="saveCamera" class="space-y-4">
        <!-- Boarding House Selector (Required when editing/adding) -->
        <div>
          <label class="block text-xs font-bold text-text-sub uppercase mb-1.5">Liên kết với Dãy trọ <span class="text-danger">*</span></label>
          <select 
            v-model="form.boardingHouseId" 
            required
            :disabled="editingCamera !== null"
            class="w-full px-3.5 py-2.5 border border-border-main rounded-xl bg-slate-50 dark:bg-slate-900 text-text-main text-xs font-medium outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- Chọn dãy nhà trọ --</option>
            <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </select>
        </div>

        <!-- Hãng sản xuất / Loại camera -->
        <div>
          <label class="block text-xs font-bold text-text-sub uppercase mb-1.5">Loại Camera (Hãng sản xuất) <span class="text-danger">*</span></label>
          <select 
            v-model="form.brand" 
            required
            class="w-full px-3.5 py-2.5 border border-border-main rounded-xl bg-slate-50 dark:bg-slate-900 text-text-main text-xs font-medium outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] cursor-pointer"
          >
            <option value="CUSTOM">Nhập link trực tiếp (CUSTOM - HLS/MJPEG)</option>
            <option value="IMOU">Tự động Imou Cloud (Plug & Play)</option>
            <option value="EZVIZ" disabled>Tự động EZVIZ Cloud (Sắp ra mắt)</option>
          </select>
        </div>

        <div>
          <FormInput
            type="text"
            label="Tên vị trí đặt Camera"
            v-model="form.name"
            placeholder="Ví dụ: Cổng chính, Nhà xe, Hành lang tầng 1..."
            required
          />
        </div>

        <!-- Chế độ nhập link thủ công (CUSTOM) -->
        <template v-if="form.brand === 'CUSTOM'">
          <div>
            <FormInput
              type="text"
              label="Đường dẫn luồng phát (HLS .m3u8 hoặc MJPEG .mjpg/.cgi)"
              v-model="form.streamUrl"
              placeholder="Ví dụ: http://192.168.1.50/stream.mjpg hoặc link cloud"
              required
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                type="text"
                label="Tài khoản truy cập (nếu có)"
                v-model="form.username"
                placeholder="Username"
              />
            </div>
            <div>
              <FormInput
                type="password"
                label="Mật khẩu truy cập (nếu có)"
                v-model="form.password"
                placeholder="Password"
              />
            </div>
          </div>
        </template>

        <!-- Chế độ Plug & Play (IMOU) -->
        <template v-else-if="form.brand === 'IMOU'">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                type="text"
                label="Mã Serial Number (S/N) *"
                v-model="form.serialNumber"
                placeholder="Ví dụ: 8L02B97PAYXXXXX"
                required
              />
            </div>
            <div>
              <FormInput
                type="text"
                label="Mã an toàn (Safety Code / Verification Code) *"
                v-model="form.safetyCode"
                placeholder="Mã bảo mật 8 ký tự in hoa dưới đáy camera"
                required
              />
            </div>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-[11px] text-text-sub leading-normal">
            <span class="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">💡 Cắm và chạy (Plug & Play)</span>
            Chỉ cần nhập mã S/N và Mã an toàn (thường được in dưới mã vạch/QR của camera Imou), hệ thống sẽ tự động liên kết và cập nhật luồng phát trực tiếp.
          </div>
        </template>

        <div class="flex justify-between items-center pt-4 border-t border-border-main">
          <div>
            <FormButton 
              v-if="editingCamera" 
              type="button" 
              variant="danger" 
              size="sm" 
              class="!px-3.5 !py-2 flex items-center gap-1.5"
              @click="deleteCamera(editingCamera)"
            >
              <AppIcon name="trash" class="!w-4 !h-4" />
              <span>Xóa Camera</span>
            </FormButton>
          </div>
          <div class="flex gap-3">
            <FormButton type="button" variant="secondary" @click="closeModal">Hủy</FormButton>
            <FormButton type="submit" :disabled="saving">
              {{ saving ? 'Đang lưu...' : 'Xác nhận' }}
            </FormButton>
          </div>
        </div>
      </form>
    </Modal>

    <!-- Confirm Modal -->
    <ConfirmModal 
      :show="confirmModal.show" 
      :title="confirmModal.title" 
      :message="confirmModal.message"
      :type="confirmModal.type" 
      :confirm-text="confirmModal.confirmText" 
      :cancel-text="confirmModal.cancelText"
      :show-cancel="confirmModal.showCancel" 
      @confirm="onConfirmModal" 
      @cancel="closeConfirmModal" 
    />

    <!-- Guide Modal -->
    <Modal
      v-if="showGuideModal"
      title="Hướng dẫn sử dụng Hệ thống Camera IP"
      maxWidth="lg"
      @close="closeGuideModal"
    >
      <div class="flex flex-col gap-4">
        <!-- Tab Selectors -->
        <div class="flex border-b border-border-main gap-1 sm:gap-2">
          <button 
            type="button"
            @click="activeGuideTab = 'general'"
            :class="['px-3 py-2 text-xs font-bold transition-all duration-150 border-b-2 cursor-pointer', 
              activeGuideTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-text-sub hover:text-text-main']"
          >
            Tổng quan & Vận hành
          </button>
          <button 
            type="button"
            @click="activeGuideTab = 'imou_auto'"
            :class="['px-3 py-2 text-xs font-bold transition-all duration-150 border-b-2 cursor-pointer flex items-center gap-1.5', 
              activeGuideTab === 'imou_auto' ? 'border-primary text-primary' : 'border-transparent text-text-sub hover:text-text-main']"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Cách 1: Tự động (IMOU Cloud)
          </button>
          <button 
            type="button"
            @click="activeGuideTab = 'custom'"
            :class="['px-3 py-2 text-xs font-bold transition-all duration-150 border-b-2 cursor-pointer', 
              activeGuideTab === 'custom' ? 'border-primary text-primary' : 'border-transparent text-text-sub hover:text-text-main']"
          >
            Cách 2: Thủ công (CUSTOM)
          </button>
        </div>

        <!-- Tab Content: General -->
        <div v-if="activeGuideTab === 'general'" class="space-y-4 text-xs sm:text-sm text-text-main animate-in fade-in duration-150">
          <div class="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary shrink-0 mt-0.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.086L12.5 12.75l.04.02a.75.75 0 11-1.085-1.086l.295-.514zM12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.299 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5z" />
            </svg>
            <div>
              <h4 class="font-bold text-primary text-xs uppercase mb-1">Tổng quan tính năng</h4>
              <p class="text-text-sub text-[11px] leading-relaxed">
                Hệ thống Camera IP cho phép chủ trọ tích hợp các luồng camera giám sát trực tiếp của các dãy trọ vào ứng dụng quản lý. 
                Giúp theo dõi an ninh từ xa trên cả Web và Mobile mà không cần cài đặt nhiều app camera riêng lẻ.
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-text-main text-xs uppercase border-b border-border-main pb-1.5">Quy trình vận hành:</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="border border-border-main rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center mb-2">1</span>
                <strong class="text-text-main font-semibold text-xs block mb-1">Thêm Camera & Chọn dãy trọ</strong>
                <p class="text-text-sub text-[11px] leading-normal m-0">Nhấn nút "Thêm Camera" ở góc trên, liên kết với dãy trọ tương ứng, đặt tên vị trí lắp đặt để dễ theo dõi.</p>
              </div>

              <div class="border border-border-main rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center mb-2">2</span>
                <strong class="text-text-main font-semibold text-xs block mb-1">Điều khiển trình phát Video</strong>
                <p class="text-text-sub text-[11px] leading-normal m-0">Khi di chuột hoặc nhấp vào khung hình, các nút chức năng sẽ hiện lên: Phóng to (toàn màn hình), Cài đặt camera. Nút điều khiển tự động ẩn sau 4 giây.</p>
              </div>

              <div class="border border-border-main rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center mb-2">3</span>
                <strong class="text-text-main font-semibold text-xs block mb-1">Trình phát HLS.js Tự động</strong>
                <p class="text-text-sub text-[11px] leading-normal m-0">Hệ thống sử dụng thư viện Hls.js để giải mã luồng phát của camera. Nếu luồng bị gián đoạn do mất điện hoặc đổi IP, nút "Thử lại" sẽ xuất hiện để tải lại luồng.</p>
              </div>

              <div class="border border-border-main rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center mb-2">4</span>
                <strong class="text-text-main font-semibold text-xs block mb-1">Xem cho cả người thuê</strong>
                <p class="text-text-sub text-[11px] leading-normal m-0">Người thuê phòng tại dãy trọ tương ứng sẽ được quyền xem trực tiếp luồng camera chung của dãy trọ đó trên tài khoản của họ (họ chỉ có quyền xem, không được sửa/xóa cấu hình).</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Content: Imou Auto -->
        <div v-if="activeGuideTab === 'imou_auto'" class="space-y-4 text-xs sm:text-sm text-text-main animate-in fade-in duration-150">
          <div class="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4">
            <span class="font-bold text-emerald-700 dark:text-emerald-400 text-xs block mb-1">⚡ Ưu điểm của Cấu hình Tự động (Plug & Play)</span>
            <p class="text-text-sub text-[11px] leading-relaxed m-0">
              Trình duyệt web không thể phát trực tiếp giao thức RTSP truyền thống của camera. 
              Bằng cách kết nối qua Imou Cloud Developer, hệ thống sẽ tự động liên kết camera với tài khoản của bạn, tự động bật dịch vụ đám mây, 
              và tự động tạo link HLS phát trực tiếp cho trình duyệt. Bạn không cần biết kỹ thuật hay cài đặt cấu hình router mạng phức tạp!
            </p>
          </div>

          <div class="space-y-4">
            <h4 class="font-bold text-text-main text-xs uppercase border-b border-border-main pb-1">Các bước đăng ký & cấu hình chi tiết:</h4>

            <!-- Step 1 -->
            <div class="flex gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
              <div>
                <strong class="text-text-main text-xs font-bold block">Đăng ký tài khoản Imou Developer</strong>
                <p class="text-text-sub text-[11px] mt-1 leading-relaxed">
                  - Truy cập trang chủ nhà phát triển Imou tại: <a href="https://open.imoulife.com" target="_blank" class="text-primary hover:underline font-semibold">https://open.imoulife.com</a>.<br>
                  - Nhấn nút <strong>Register</strong> (Đăng ký) ở góc trên cùng bên phải màn hình.<br>
                  - Điền thông tin Email, Mật khẩu.<br>
                  - <strong class="text-danger">Lưu ý quan trọng:</strong> Ở phần chọn Quốc gia/Vùng lãnh thổ (Country/Region), bạn bắt buộc phải chọn **Vietnam** (hoặc khu vực Đông Nam Á). Việc chọn đúng vùng giúp máy chủ luồng video được cấp phát gần bạn nhất, mang lại tốc độ tải nhanh và độ trễ thấp nhất.<br>
                  - Kích hoạt tài khoản bằng mã xác nhận gửi qua email của bạn để hoàn tất.
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
              <div>
                <strong class="text-text-main text-xs font-bold block">Tạo Ứng dụng & Lấy khóa kết nối (App ID / App Secret)</strong>
                <p class="text-text-sub text-[11px] mt-1 leading-relaxed">
                  - Đăng nhập vào tài khoản vừa tạo tại <a href="https://open.imoulife.com" target="_blank" class="text-primary hover:underline font-semibold">open.imoulife.com</a>.<br>
                  - Nhấp vào nút **Console** (Bảng điều khiển) ở thanh menu trên cùng.<br>
                  - Chọn mục **Create App** (Tạo ứng dụng mới). Điền Tên App (ví dụ: `QLPT_Cam`), chọn Loại ứng dụng (ví dụ: Smart Home / Security) và viết mô tả ngắn.<br>
                  - Bấm **Confirm**. Hệ thống sẽ hiển thị bảng thông tin chi tiết ứng dụng gồm:<br>
                    &nbsp;&nbsp;&bull; <strong>App ID:</strong> Mã định danh ứng dụng của bạn.<br>
                    &nbsp;&nbsp;&bull; <strong>App Secret:</strong> Mã bảo mật ứng dụng của bạn.<br>
                  - Hãy sao chép (copy) lại hai chuỗi ký tự này.
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
              <div>
                <strong class="text-text-main text-xs font-bold block">Lưu khóa cấu hình vào hệ thống Quản lý trọ</strong>
                <p class="text-text-sub text-[11px] mt-1 leading-relaxed">
                  - Trên hệ thống quản lý phòng trọ của bạn, đi tới **Cài Đặt Hệ Thống** (từ menu bên trái hoặc góc trên).<br>
                  - Chọn tab **"Cấu hình Imou Cloud"** (chỉ hiển thị với tài khoản Chủ trọ).<br>
                  - Dán thông tin **App ID** và **App Secret** tương ứng vừa copy ở bước 2 vào.<br>
                  - Bấm **Lưu cấu hình**. Trạng thái lưu thành công sẽ ẩn mã Secret của bạn dưới dạng các dấu hoa thị `********` để bảo mật.
                </p>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="flex gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
              <div>
                <strong class="text-text-main text-xs font-bold block">Thêm Camera vào danh sách (Cắm và chạy)</strong>
                <p class="text-text-sub text-[11px] mt-1 leading-relaxed">
                  - Quay lại trang **Hệ thống Camera IP**, bấm nút **"Thêm Camera"**.<br>
                  - Tại ô **Loại Camera**, chọn **"Tự động Imou Cloud (Plug & Play)"**.<br>
                  - Điền **S/N (Serial Number)** và **Safety Code (Mã an toàn / Lớp mã hóa)** được in dưới đáy camera Imou của bạn (hoặc trên vỏ hộp).<br>
                  - Nhấn **Xác nhận**. Hệ thống backend sẽ tự động giao tiếp với Imou API để đăng ký thiết bị vào tài khoản developer của bạn, kích hoạt luồng HLS phát trực tiếp và hiển thị video trên màn hình ngay lập tức!
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Content: Custom -->
        <div v-if="activeGuideTab === 'custom'" class="space-y-4 text-xs sm:text-sm text-text-main animate-in fade-in duration-150">
          <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4">
            <span class="font-bold text-amber-700 dark:text-amber-400 text-xs block mb-1">💡 Khi nào nên dùng cấu hình thủ công (CUSTOM)?</span>
            <p class="text-text-sub text-[11px] leading-relaxed m-0">
              Dành cho các loại camera khác không phải thương hiệu Imou (như EZVIZ, Hikvision, Dahua, KBVision...) hoặc bạn đã thiết lập máy chủ stream video riêng (như go2rtc, MediaMTX, NVR, Synology Surveillance Station) cung cấp sẵn link luồng HLS (`.m3u8`) hoặc hình ảnh động (`.mjpg`).
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-text-main text-xs uppercase border-b border-border-main pb-1">Các định dạng luồng phát hỗ trợ trực tiếp trên trình duyệt:</h4>

            <div class="space-y-2.5">
              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary shrink-0 mt-0.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong class="text-text-main text-xs">Luồng HLS (.m3u8 - Khuyên dùng):</strong>
                  <p class="text-text-sub text-[11px] mt-0.5 leading-normal">
                    Định dạng truyền phát video chất lượng cao phổ biến nhất. Link có dạng: <br>
                    <code>https://domain.com/live/camera1/index.m3u8</code> hoặc link xuất từ camera cloud.
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary shrink-0 mt-0.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong class="text-text-main text-xs">Luồng MJPEG (Motion JPEG):</strong>
                  <p class="text-text-sub text-[11px] mt-0.5 leading-normal">
                    Truyền tải chuỗi ảnh JPEG liên tục. Thường là link truy cập trực tiếp IP camera trong mạng LAN hoặc qua NAT port. Ví dụ:<br>
                    <code>http://192.168.1.50:8080/videostream.cgi</code>
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary shrink-0 mt-0.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong class="text-text-main text-xs">Lưu ý về giao thức RTSP (rtsp://...):</strong>
                  <p class="text-text-sub text-[11px] mt-0.5 leading-normal">
                    Mặc định trình duyệt Chrome, Safari, Firefox **không hỗ trợ** phát trực tiếp link `rtsp://`. 
                    Để sử dụng camera IP RTSP thông thường, bạn cần cài đặt một Gateway trung gian ở máy tính/mạng LAN của dãy trọ (ví dụ chạy docker `go2rtc` hoặc `MediaMTX`) để chuyển đổi luồng RTSP sang HLS trước khi dán vào phần mềm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="pt-4 border-t border-border-main flex justify-end">
          <FormButton type="button" variant="secondary" size="sm" @click="closeGuideModal">Đóng hướng dẫn</FormButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script src="/src/views/landlord/Cameras.js"></script>
