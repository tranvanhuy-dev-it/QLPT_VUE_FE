<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <button @click="goBack"
          class="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4 text-text-sub">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <span>Chi Tiết Phòng</span>
          <span v-if="room" class="text-primary">Phòng {{ room.roomNumber }}</span>
          <span v-if="room" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border',
            room.status === 'OCCUPIED'
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
          ]">
            {{ room.status === 'OCCUPIED' ? 'Đang thuê' : 'Còn trống' }}
          </span>
        </h2>
      </div>

      <div v-if="room" class="flex flex-row items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">
        <!-- Tab Switcher -->
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button @click="activeTab = 'info'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'info' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Thông tin & Chỉnh sửa
          </button>
          <button @click="activeTab = 'history'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Lịch sử thuê phòng
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading"
      class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải dữ liệu phòng trọ...</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-else-if="room" class="flex flex-col gap-4">
      <!-- INFO & EDIT TAB -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Edit Form -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs lg:col-span-2">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            <span>Chỉnh sửa thông tin phòng</span>
          </h3>

          <form @submit.prevent="handleSave" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-semibold text-text-sub mb-1.5">Dãy trọ hiện tại (Không thể thay
                đổi)</label>
              <input type="text" :value="room.boardingHouse?.name" disabled
                class="w-full px-3 py-2 text-xs border border-border-main bg-slate-50 dark:bg-slate-900/50 text-text-sub rounded-lg cursor-not-allowed" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-main mb-1.5">Số phòng / Tên phòng <span
                  class="text-danger">*</span></label>
              <input type="text" v-model="form.roomNumber" required
                class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-text-main mb-1.5">Giá thuê cơ bản (VNĐ) <span
                    class="text-danger">*</span></label>
                <input type="number" v-model="form.basePrice" min="0" required
                  class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-text-main mb-1.5">Số người tối đa <span
                    class="text-danger">*</span></label>
                <input type="number" v-model="form.maxPeople" min="1" required
                  class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-text-main mb-1.5">Chỉ số điện hiện tại (kWh) <span
                    class="text-danger">*</span></label>
                <input type="number" v-model="form.currentElectricityIndex" min="0" required
                  class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-text-main mb-1.5">Chỉ số nước hiện tại (m³) <span
                    class="text-danger">*</span></label>
                <input type="number" v-model="form.currentWaterIndex" min="0" required
                  class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div class="flex justify-between items-center mt-4 pt-4 border-t border-border-main">
              <div>
                <button v-if="room.status !== 'OCCUPIED'" type="button" @click="deleteRoom"
                  class="px-4 py-2 rounded-lg border border-danger bg-card text-xs font-semibold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer">
                  Xóa phòng
                </button>
              </div>
              <div class="flex gap-3">
                <button type="button" @click="goBack"
                  class="px-4 py-2 rounded-lg border border-border-main bg-card text-xs font-semibold text-text-sub hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                  Hủy
                </button>
                <button type="submit"
                  class="px-4 py-2 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary-hover transition cursor-pointer shadow-sm">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Right: Fast Summary Stats -->
        <div class="flex flex-col gap-4">
          <!-- Overview Card -->
          <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
            <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Thông tin nhanh</h3>
            <div class="flex flex-col gap-4 text-xs">
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Trạng thái:</span>
                <span :class="[
                  'font-semibold px-2 py-0.5 rounded text-[10px]',
                  room.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                ]">{{ room.status === 'OCCUPIED' ? 'Đang cho thuê' : 'Đang trống' }}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Giá cơ bản:</span>
                <span class="font-bold text-text-main">{{ formatMoney(room.basePrice) }} đ/tháng</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Sức chứa:</span>
                <span class="font-semibold text-text-main">Tối đa {{ room.maxPeople }} người</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Dãy trọ:</span>
                <span class="font-semibold text-text-main text-right truncate max-w-[150px]"
                  :title="room.boardingHouse?.name">
                  {{ room.boardingHouse?.name }}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-text-sub">Địa chỉ:</span>
                <span class="font-semibold text-text-sub text-right truncate max-w-[150px]"
                  :title="room.boardingHouse?.address">
                  {{ room.boardingHouse?.address || '---' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Tip -->
          <div class="bg-[rgba(0,102,204,0.04)] border border-primary/20 rounded-2xl p-5">
            <h4 class="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 18v-5.25m0-3h.008v.008H12V9.75zm0.5 7.5a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0z" />
              </svg>
              <span>Lưu ý</span>
            </h4>
            <p class="text-[11px] leading-relaxed text-text-sub">
              Khi chỉnh sửa chỉ số điện/nước hiện tại của phòng, hệ thống sẽ sử dụng chỉ số này làm mốc tính chỉ số cũ
              cho lần lập hóa đơn tiền phòng tiếp theo.
            </p>
          </div>
        </div>
      </div>

      <!-- CONTRACT HISTORY TAB -->
      <div v-if="activeTab === 'history'" class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-border-main/55">
          <h3 class="text-sm font-bold text-text-main flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Danh sách hợp đồng thuê phòng</span>
          </h3>
          <span
            class="text-[11px] font-semibold text-text-sub px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            Tổng cộng: {{ contracts.length }} hợp đồng
          </span>
        </div>

        <DataTable :headers="tableHeaders" :items="contracts" :loading="loading"
          loadingText="Đang tải lịch sử thuê phòng..." emptyText="Phòng trọ này chưa từng phát sinh hợp đồng thuê nào."
          clickable @row-click="viewContractDetails" />
      </div>
    </div>
  </div>
</template>

<script src="./RoomDetail.js"></script>
