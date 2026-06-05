<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Quản Lý Phòng Trọ" subtitle="Thêm mới, sửa thông tin phòng trọ và theo dõi trạng thái phòng"
      :icon="roomIcon" :showAdd="true" addText="Thêm" :disableAdd="boardingHouses.length === 0"
      searchPlaceholder="Tìm theo số phòng..." v-model="searchQuery" @add-click="openAddModal">
      <template #filter-addons>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="font-medium text-[0.85rem] text-text-sub whitespace-nowrap hidden sm:inline">Dãy trọ:</span>
          <select class="w-[120px] sm:w-[200px] px-2 sm:px-3 py-1 sm:py-1.5 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-[11px] sm:text-[0.85rem] outline-none focus:bg-white focus:border-primary"
            v-model="selectedHouseId" @change="onHouseFilterChange">
            <option :value="null">-- Tất cả --</option>
            <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </select>
        </div>
      </template>
    </PageHeader>

    <!-- Rooms Table List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách phòng...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Số phòng</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Dãy trọ</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Giá thuê cơ bản</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Chỉ số điện</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Chỉ số nước</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Sức chứa</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Trạng thái</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                <td class="py-2.5 px-4 font-semibold text-primary">Phòng {{ room.roomNumber }}</td>
                <td class="py-2.5 px-4 text-text-sub">{{ room.boardingHouse.name }}</td>
                <td class="py-2.5 px-4 font-semibold text-text-main">{{ formatMoney(room.basePrice) }} VNĐ</td>
                <td class="py-2.5 px-4 text-text-sub">{{ room.currentElectricityIndex }} kWh</td>
                <td class="py-2.5 px-4 text-text-sub">{{ room.currentWaterIndex }} m³</td>
                <td class="py-2.5 px-4 text-text-sub">Tối đa {{ room.maxPeople }} người</td>
                <td class="py-2.5 px-4">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', room.status === 'VACANT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400']">
                    {{ room.status === 'VACANT' ? 'Còn trống' : 'Đang thuê' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-right">
                  <div class="inline-flex gap-2 justify-end">
                    <button @click="editRoom(room)" class="inline-flex items-center px-2.5 py-1 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 cursor-pointer transition-all duration-150">
                      Sửa
                    </button>
                    <button @click="deleteRoom(room.id)" class="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-danger text-white rounded-lg hover:bg-red-600 disabled:bg-slate-100 disabled:text-text-sub/40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="room.status === 'OCCUPIED'">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRooms.length === 0">
                <td colspan="8" class="text-center text-text-sub py-12">
                  Không tìm thấy phòng trọ nào. Hãy tạo phòng trọ mới!
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} phòng)
          </span>
          <div class="flex gap-2">
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page === 0"
              @click="changePage(page - 1)">
              Trước
            </button>
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page >= totalPages - 1"
              @click="changePage(page + 1)">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Room Modal -->
    <div v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[500px] p-6 relative">
        <h3 class="text-lg font-bold text-text-main mb-6">{{ showEditModal ? 'Cập Nhật Phòng Trọ' : 'Thêm Phòng Trọ Mới' }}</h3>

        <form @submit.prevent="saveRoom">
          <!-- Chọn dãy trọ khi thêm mới -->
          <div class="flex flex-col gap-1.5 mb-4" v-if="!showEditModal">
            <label class="text-xs font-semibold text-text-sub uppercase">Chọn dãy trọ *</label>
            <select class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.boardingHouseId" required>
              <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Số phòng / Tên phòng *</label>
            <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.roomNumber" placeholder="Ví dụ: 101, 102" required />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Giá thuê / tháng (VNĐ) *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.basePrice" min="0" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Số người tối đa *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.maxPeople" min="1" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Điện hiện tại *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.currentElectricityIndex" min="0" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Nước hiện tại *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.currentWaterIndex" min="0" required />
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit" class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./Rooms.js"></script>
