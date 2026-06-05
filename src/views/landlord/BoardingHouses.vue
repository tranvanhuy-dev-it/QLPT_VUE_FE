<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Quản Lý Dãy Trọ" subtitle="Thêm mới và thiết lập đơn giá dịch vụ của từng khu nhà trọ"
      :icon="houseIcon" :showAdd="true" addText="Thêm" :showSearch="false"
      @add-click="showAddModal = true" />

    <!-- Grid of Boarding Houses -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải danh sách dãy trọ...</span>
    </div>

    <template v-else>
      <div v-if="boardingHouses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="house in boardingHouses" :key="house.id" class="bg-card border border-border-main rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div>
            <h3 class="font-bold text-lg text-primary mb-2">
              {{ house.name }}
            </h3>
            <p class="text-xs text-text-sub mb-4 min-h-[40px]">
              Địa chỉ: {{ house.address || 'Chưa cập nhật địa chỉ' }}
            </p>
            <div class="border-t border-border-main/50 pt-3.5 text-xs flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="text-text-sub font-medium">Giá điện mặc định:</span>
                <span class="font-bold text-text-main">{{ formatMoney(house.defaultElectricityRate) }} đ/kWh</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-text-sub font-medium">Giá nước mặc định:</span>
                <span class="font-bold text-text-main">{{ formatMoney(house.defaultWaterRate) }} đ</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-text-sub font-medium">Cách tính nước:</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                  {{ formatWaterBillingType(house.waterBillingType) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-border-main/50">
            <button @click="editHouse(house)" class="flex-1 py-2 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 cursor-pointer transition-all duration-150">
              Sửa
            </button>
            <button @click="deleteHouse(house.id)" class="flex-1 py-2 text-xs font-bold bg-danger text-white rounded-lg hover:bg-red-600 cursor-pointer transition-all duration-150">
              Xóa
            </button>
          </div>
        </div>
      </div>

      <EmptyState v-else
        message="Bạn chưa có dãy trọ nào. Hãy nhấn nút 'Thêm Dãy Trọ Mới' ở góc trên bên phải để bắt đầu!" />
    </template>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[500px] p-6 relative">
        <h3 class="text-lg font-bold text-text-main mb-6">{{ showEditModal ? 'Cập Nhật Dãy Trọ' : 'Thêm Dãy Trọ Mới' }}</h3>

        <form @submit.prevent="saveHouse">
          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Tên dãy trọ *</label>
            <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.name" placeholder="Ví dụ: Nhà trọ Green House"
              required />
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Địa chỉ</label>
            <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.address" placeholder="Nhập địa chỉ chi tiết" />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Giá điện mặc định (đ/kWh) *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.defaultElectricityRate" min="0" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Giá nước mặc định *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.defaultWaterRate" min="0" required />
            </div>
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Cách tính tiền nước *</label>
            <select class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.waterBillingType" required>
              <option value="BY_INDEX">Tính theo chỉ số đồng hồ (tiêu thụ thực tế)</option>
              <option value="FIXED_PER_PERSON">Tính cố định theo đầu người (đ/người/tháng)</option>
              <option value="FIXED_PER_ROOM">Tính cố định theo phòng (đ/phòng/tháng)</option>
            </select>
          </div>

          <!-- Cấu hình các dịch vụ / phụ phí của dãy trọ -->
          <div class="mt-6 pt-4 border-t border-border-main">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-bold text-text-main m-0">Dịch Vụ & Phụ Phí Của Dãy Trọ</h4>
              <button type="button" @click="addExtraFeeRow" class="inline-flex items-center px-2.5 py-1 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 cursor-pointer transition-all duration-150">
                + Thêm dịch vụ
              </button>
            </div>

            <div v-if="form.extraFees.length === 0" class="text-xs text-text-sub italic text-center py-6 border border-dashed border-border-main rounded-xl bg-slate-50/50">
              Chưa cấu hình dịch vụ nào (Ví dụ: Wifi, rác, gửi xe, vệ sinh...)
            </div>

            <div v-else class="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
              <div v-for="(ef, index) in form.extraFees" :key="index" class="flex gap-2 items-center">
                <input type="text" class="flex-2 w-full px-2 py-1.5 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-xs outline-none focus:bg-white focus:border-primary" v-model="ef.name" placeholder="Tên dịch vụ (ví dụ: Wifi)" required />
                <input type="number" class="flex-1.5 w-24 px-2 py-1.5 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-xs outline-none focus:bg-white focus:border-primary text-right" v-model.number="ef.defaultPrice" placeholder="Đơn giá" min="0" required />
                <select class="flex-1.5 w-24 px-2 py-1.5 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-xs outline-none focus:bg-white focus:border-primary" v-model="ef.unitType" required>
                  <option value="FIXED_PER_ROOM">đ/phòng</option>
                  <option value="FIXED_PER_PERSON">đ/người</option>
                </select>
                <button type="button" @click="removeExtraFeeRow(index)" class="p-1.5 bg-danger text-white rounded-lg hover:bg-red-600 flex items-center justify-center shrink-0 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit" class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./BoardingHouses.js"></script>
