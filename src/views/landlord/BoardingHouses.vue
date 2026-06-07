<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Quản Lý Dãy Trọ" subtitle="Thêm mới và thiết lập đơn giá dịch vụ của từng khu nhà trọ"
      :icon="houseIcon" :showAdd="true" addText="Thêm" :showSearch="false" @add-click="showAddModal = true" />

    <!-- Grid of Boarding Houses -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải danh sách dãy trọ...</span>
    </div>

    <template v-else>
      <div v-if="boardingHouses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="house in boardingHouses" :key="house.id"
          class="bg-card border border-border-main rounded-2xl shadow-xs flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
          <!-- Card Header with gradient -->
          <div
            class="bg-gradient-to-br from-primary/10 via-sky-50 to-blue-50 dark:from-primary/20 dark:via-slate-800 dark:to-slate-900 px-5 pt-5 pb-4 border-b border-border-main/40">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base text-text-main leading-tight mb-1 truncate">{{ house.name }}</h3>
                <p class="text-[11px] text-text-sub flex items-center gap-1 truncate">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    class="w-3 h-3 shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {{ house.address || 'Chưa cập nhật địa chỉ' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="px-5 py-4 flex-1 flex flex-col gap-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-text-sub flex items-center gap-1.5">
                <span class="text-amber-500"></span> Giá điện
              </span>
              <span class="font-bold text-text-main">{{ formatMoney(house.defaultElectricityRate) }} đ/kWh</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-text-sub flex items-center gap-1.5">
                <span class="text-blue-500"></span> Giá nước
              </span>
              <span class="font-bold text-text-main">{{ formatMoney(house.defaultWaterRate) }} đ</span>
            </div>

            <!-- Extra fees preview -->
            <div v-if="house.extraFees && house.extraFees.length > 0" class="pt-2 border-t border-border-main/40">
              <div class="text-[10px] text-text-sub font-semibold uppercase tracking-wider mb-1.5">Dịch vụ đi kèm</div>
              <div class="flex flex-wrap gap-1">
                <span v-for="ef in house.extraFees" :key="ef.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-text-sub">
                  {{ ef.name }}: {{ formatMoney(ef.defaultPrice) }}đ
                </span>
              </div>
            </div>

            <!-- Banking information preview -->
            <div v-if="house.bankAccountNumber" class="pt-2 border-t border-border-main/40 flex flex-col gap-1 text-[11px]">
              <div class="text-[10px] text-text-sub font-semibold uppercase tracking-wider">Tài khoản thanh toán</div>
              <span class="text-text-main font-medium">Ngân hàng: {{ house.bankName }} - {{ house.bankAccountNumber }}</span>
              <span class="text-text-sub font-medium">Chủ TK: {{ house.bankAccountName }}</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="flex border-t border-border-main/50">
            <FormButton variant="custom" @click="editHouse(house)"
              class="flex-1 py-2.5 text-xs font-semibold text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 flex items-center justify-center gap-1.5 border-r border-border-main/50 rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Sửa
            </FormButton>
            <FormButton variant="custom" @click="deleteHouse(house.id)"
              class="flex-1 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-150 flex items-center justify-center gap-1.5 rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Xóa
            </FormButton>
          </div>
        </div>
      </div>

      <EmptyState v-else
        message="Bạn chưa có dãy trọ nào. Hãy nhấn nút 'Thêm Dãy Trọ Mới' ở góc trên bên phải để bắt đầu!" />
    </template>

    <!-- Add/Edit Modal -->
    <Modal v-if="showAddModal || showEditModal" :title="showEditModal ? 'Cập Nhật Dãy Trọ' : 'Thêm Dãy Trọ Mới'" maxWidth="md" @close="closeModal">
      <form @submit.prevent="saveHouse">
        <div class="mb-4">
          <FormInput
            type="text"
            label="Tên dãy trọ"
            v-model="form.name"
            placeholder="Ví dụ: Nhà trọ Green House"
            required
          />
        </div>

        <div class="mb-4">
          <FormInput
            type="text"
            label="Địa chỉ"
            v-model="form.address"
            placeholder="Nhập địa chỉ chi tiết"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá điện mặc định (đ/kWh)"
              v-model="form.defaultElectricityRate"
              min="0"
              required
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Giá nước mặc định"
              v-model="form.defaultWaterRate"
              min="0"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <FormSelect
            label="Cách tính tiền nước"
            v-model="form.waterBillingType"
            required
          >
            <option value="BY_INDEX">Tính theo chỉ số đồng hồ (tiêu thụ thực tế)</option>
            <option value="FIXED_PER_PERSON">Tính cố định theo đầu người (đ/người/tháng)</option>
            <option value="FIXED_PER_ROOM">Tính cố định theo phòng (đ/phòng/tháng)</option>
          </FormSelect>
        </div>

        <div class="mb-4">
          <FormSelect
            label="Thời điểm thu tiền phòng"
            v-model="form.billingTiming"
            required
          >
            <option value="PREPAID">Thu đầu tháng (Tiền phòng trả trước, điện nước trả sau)</option>
            <option value="POSTPAID">Thu cuối tháng (Thu cả tiền phòng và điện nước vào cuối tháng)</option>
          </FormSelect>
        </div>

        <!-- Cấu hình nhận thanh toán bằng QR Code -->
        <div class="mt-6 pt-4 border-t border-border-main">
          <h4 class="text-sm font-bold text-text-main mb-3">Tài Khoản Thanh Toán QR (VietQR)</h4>
          <div class="mb-4">
            <FormSelect
              label="Ngân hàng nhận"
              v-model="form.bankName"
            >
              <option value="">-- Chọn ngân hàng --</option>
              <option v-for="bank in popularBanks" :key="bank.code" :value="bank.code">
                {{ bank.name }}
              </option>
            </FormSelect>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                type="text"
                label="Số tài khoản"
                v-model="form.bankAccountNumber"
                placeholder="Nhập số tài khoản"
              />
            </div>
            <div>
              <FormInput
                type="text"
                label="Tên chủ tài khoản"
                v-model="form.bankAccountName"
                placeholder="Chữ in hoa không dấu"
              />
            </div>
          </div>
        </div>

        <!-- Cấu hình các dịch vụ / phụ phí của dãy trọ -->
        <div class="mt-6 pt-4 border-t border-border-main">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-bold text-text-main m-0">Dịch Vụ & Phụ Phí Của Dãy Trọ</h4>
            <FormButton type="button" @click="addExtraFeeRow" variant="secondary" size="sm">
              + Thêm dịch vụ
            </FormButton>
          </div>

          <div v-if="form.extraFees.length === 0"
            class="text-xs text-text-sub italic text-center py-6 border border-dashed border-border-main rounded-xl bg-slate-50/50">
            Chưa cấu hình dịch vụ nào (Ví dụ: Wifi, rác, gửi xe, vệ sinh...)
          </div>

          <div v-else class="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            <div v-for="(ef, index) in form.extraFees" :key="index" class="flex gap-2 items-center">
              <FormInput
                type="text"
                v-model="ef.name"
                placeholder="Tên dịch vụ (ví dụ: Wifi)"
                required
                size="sm"
                class="flex-2"
              />
              <FormInput
                type="number"
                v-model="ef.defaultPrice"
                placeholder="Đơn giá"
                min="0"
                required
                size="sm"
                class="flex-1.5 w-24 text-right"
              />
              <FormSelect
                v-model="ef.unitType"
                required
                size="sm"
                class="flex-1.5 w-24"
              >
                <option value="FIXED_PER_ROOM">đ/phòng</option>
                <option value="FIXED_PER_PERSON">đ/người</option>
              </FormSelect>
              <FormButton type="button" @click="removeExtraFeeRow(index)" variant="danger" size="sm" class="!p-1.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </FormButton>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Lưu</FormButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script src="./BoardingHouses.js"></script>
