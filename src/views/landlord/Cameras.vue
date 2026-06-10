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

        <div>
          <FormInput
            type="text"
            label="Tên vị trí đặt Camera"
            v-model="form.name"
            placeholder="Ví dụ: Cổng chính, Nhà xe, Hành lang tầng 1..."
            required
          />
        </div>
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
      maxWidth="md"
      @close="closeGuideModal"
    >
      <div class="space-y-4 text-text-main text-xs sm:text-sm">
        <div class="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary shrink-0 mt-0.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.086L12.5 12.75l.04.02a.75.75 0 11-1.085-1.086l.295-.514zM12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.299 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5z" />
          </svg>
          <div>
            <h4 class="font-bold text-primary text-xs uppercase mb-1">Tổng quan tính năng</h4>
            <p class="text-text-sub text-[11px] leading-relaxed">Hệ thống Camera IP cho phép chủ trọ tích hợp các luồng camera giám sát trực tiếp của các dãy trọ vào ứng dụng quản lý để theo dõi an ninh từ xa trên cả Web và Mobile.</p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-text-main text-xs uppercase border-b border-border-main pb-1.5">Các bước thiết lập và sử dụng:</h4>
          
          <div class="flex gap-2.5 items-start">
            <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-primary shrink-0 mt-0.5">1</span>
            <div>
              <strong class="text-text-main font-semibold text-xs">Thêm camera & Liên kết dãy trọ:</strong>
              <p class="text-text-sub text-[11px] mt-0.5 leading-relaxed">Nhấn nút <strong>"Thêm Camera"</strong>, chọn Dãy trọ muốn giám sát, đặt tên vị trí (ví dụ: Nhà xe, Cổng chính) và điền đường dẫn luồng phát.</p>
            </div>
          </div>

          <div class="flex gap-2.5 items-start">
            <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-primary shrink-0 mt-0.5">2</span>
            <div>
              <strong class="text-text-main font-semibold text-xs">Cấu hình luồng phát trực tiếp:</strong>
              <p class="text-text-sub text-[11px] mt-0.5 leading-relaxed">Hỗ trợ luồng HLS (định dạng URL có đuôi <code>.m3u8</code>) hoặc luồng MJPEG (định dạng URL có đuôi <code>.mjpg</code> hoặc <code>.cgi</code>). Điền Tài khoản & Mật khẩu nếu camera yêu cầu đăng nhập.</p>
            </div>
          </div>

          <div class="flex gap-2.5 items-start">
            <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-primary shrink-0 mt-0.5">3</span>
            <div>
              <strong class="text-text-main font-semibold text-xs">Hiển thị & ẩn nút điều khiển:</strong>
              <p class="text-text-sub text-[11px] mt-0.5 leading-relaxed">Bình thường camera sẽ ẩn các nút để không che video. Bạn chỉ cần <strong>nhấp (hoặc chạm màn hình)</strong> vào luồng phát để hiển thị các nút điều khiển. Chúng sẽ tự động ẩn sau 4 giây.</p>
            </div>
          </div>

          <div class="flex gap-2.5 items-start">
            <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold flex items-center justify-center text-primary shrink-0 mt-0.5">4</span>
            <div>
              <strong class="text-text-main font-semibold text-xs">Xem toàn màn hình & Cài đặt:</strong>
              <p class="text-text-sub text-[11px] mt-0.5 leading-relaxed">
                - Nhấn nút phóng to ở **góc dưới bên phải** để xem tràn màn hình (tự động xoay ngang thiết bị).<br>
                - Nhấn nút bánh răng ở **góc dưới bên trái** để xem chi tiết cấu hình, chỉnh sửa hoặc xóa camera.
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-border-main pt-3">
          <h4 class="font-bold text-text-main text-xs uppercase mb-2 flex items-center gap-1.5 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <span>Cách lấy URL luồng camera tương thích:</span>
          </h4>
          <div class="space-y-2 text-[11px] text-text-sub leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border-main/50">
            <p>Trình duyệt web/di động <strong>không hỗ trợ trực tiếp</strong> giao thức RTSP truyền thống (<code>rtsp://...</code>). Bạn cần cung cấp luồng định dạng tương thích:</p>
            <ul class="list-disc pl-4 space-y-1">
              <li>
                <strong>Luồng MJPEG trực tiếp (Đơn giản nhất)</strong>:<br>
                Nhiều dòng camera IP (như Hikvision, Dahua, KBVision...) hỗ trợ cổng xuất trực tiếp luồng MJPEG qua HTTP. Bạn tìm cấu hình camera để lấy link dạng: <code class="text-primary break-all">http://[IP_Camera]:[Port]/live/mjpeg</code> hoặc <code class="text-primary break-all">http://[IP_Camera]/video.cgi</code>.
              </li>
              <li>
                <strong>Sử dụng bộ chuyển đổi HLS trung gian (Khuyên dùng)</strong>:<br>
                Cài đặt phần mềm miễn phí (như <strong>MediaMTX</strong>, <strong>go2rtc</strong>, hoặc <strong>Agent DVR</strong>) trên PC/Server trong cùng mạng LAN để chuyển luồng <code>rtsp://</code> sang HLS <code>.m3u8</code>. URL dạng: <code class="text-primary break-all">http://[IP_Server]:8554/[camera_name]/index.m3u8</code>.
              </li>
              <li>
                <strong>Lấy luồng chia sẻ Cloud công khai</strong>:<br>
                Các camera EZVIZ, Imou, Yoosee... cho phép lấy luồng phát trực tiếp HLS (link <code>.m3u8</code>) công khai thông qua ứng dụng gốc trên điện thoại. Bạn copy link này dán vào hệ thống.
              </li>
            </ul>
          </div>
        </div>

        <div class="pt-4 border-t border-border-main flex justify-end">
          <FormButton type="button" variant="secondary" size="sm" @click="closeGuideModal">Đóng</FormButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script src="/src/views/landlord/Cameras.js"></script>
