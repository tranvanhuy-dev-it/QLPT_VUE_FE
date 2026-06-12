<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Back button and Page Title -->
    <div class="flex items-center gap-2 mb-4">
      <FormButton @click="goBack" variant="secondary" class="!p-1.5 no-print">
        <AppIcon name="arrow-left" class="!w-4 !h-4" />
      </FormButton>
      <h2 class="text-base sm:text-xl font-bold text-text-main">
        Ghi Số Điện Nước Hàng Loạt
      </h2>
    </div>

    <!-- Filters Card -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FormSelect
            label="Chọn dãy trọ"
            v-model="selectedBulkBoardingHouseId"
            @change="onBulkBoardingHouseChange"
            required
          >
            <option value="">-- Chọn dãy trọ --</option>
            <option v-for="bh in boardingHouses" :key="bh.id" :value="bh.id">
              {{ bh.name }}
            </option>
          </FormSelect>
        </div>
        <div>
          <FormInput
            type="month"
            label="Tháng tính tiền"
            v-model="bulkBillingMonth"
            @change="adjustBulkDates"
            required
          />
        </div>
        <div>
          <FormInput
            type="date"
            label="Ngày lập hóa đơn"
            v-model="bulkInvoiceDate"
            required
          />
        </div>
      </div>
    </div>

    <!-- Loading / Empty States -->
    <div v-if="isFetchingBulkStatus" class="bg-card border border-border-main rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div class="text-text-sub text-xs">Đang tải danh sách phòng...</div>
    </div>

    <div v-else-if="!selectedBulkBoardingHouseId" class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-xs italic">
      Vui lòng chọn một dãy trọ để bắt đầu ghi số điện nước.
    </div>

    <div v-else-if="bulkRooms.length === 0" class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-xs italic">
      Không có phòng nào đang thuê hoạt động trong dãy trọ này.
    </div>

    <div v-else-if="visibleRooms.length === 0" class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-xs italic">
      Không có phòng nào cần lập hóa đơn trong ngày được chọn (hoặc các phòng đã được lập hóa đơn/chưa đến hạn).
    </div>

    <!-- Bulk Reading Form -->
    <form v-else @submit.prevent="saveBulkInvoices">
      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden md:block bg-card border border-border-main rounded-2xl p-4 shadow-xs mb-4">
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60 text-text-sub font-bold uppercase text-[11px] tracking-wider">
                <th class="py-3 px-4">Phòng</th>
                <th class="py-3 px-4">Điện (kWh)</th>
                <th class="py-3 px-4">Nước (m³)</th>
                <th class="py-3 px-4 min-w-[280px]">Kỳ thanh toán</th>
                <th class="py-3 px-4 w-28 text-right">Giảm giá (đ)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-main/50">
              <tr v-for="room in visibleRooms" :key="room.roomId" class="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                <!-- Room & Tenant -->
                <td class="py-3 px-4 align-middle">
                  <span class="font-bold text-primary block">Phòng {{ room.roomNumber }}</span>
                  <span class="text-[10px] text-text-sub block max-w-[120px] truncate" :title="room.tenantName">
                    {{ room.tenantName }}
                  </span>
                </td>

                <!-- Electricity Indices -->
                <td class="py-3 px-4 align-middle">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] text-text-sub">Cũ: <strong class="text-text-main">{{ room.currentElectricityIndex }}</strong></span>
                    <input
                      type="number"
                      v-model.number="room.newElectricityIndex"
                      min="0"
                      class="w-24 px-2 py-1 border border-border-main rounded bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary font-semibold text-xs"
                      placeholder="Mới"
                      required
                    />
                  </div>
                </td>

                <!-- Water Indices -->
                <td class="py-3 px-4 align-middle">
                  <div v-if="room.waterBillingType === 'BY_INDEX'" class="flex flex-col gap-1">
                    <span class="text-[10px] text-text-sub">Cũ: <strong class="text-text-main">{{ room.currentWaterIndex }}</strong></span>
                    <input
                      type="number"
                      v-model.number="room.newWaterIndex"
                      min="0"
                      class="w-24 px-2 py-1 border border-border-main rounded bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary font-semibold text-xs"
                      placeholder="Mới"
                      required
                    />
                  </div>
                  <div v-else class="align-middle">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-text-sub">
                      Cố định ({{ formatMoney(room.defaultWaterRate) }}đ)
                    </span>
                  </div>
                </td>

                <!-- Billing Period Dates -->
                <td class="py-3 px-4 align-middle">
                  <div class="flex items-center gap-1.5">
                    <div class="flex-1">
                      <input
                        type="date"
                        v-model="room.billingPeriodStart"
                        class="w-full px-2 py-1 border border-border-main rounded bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs"
                        required
                      />
                    </div>
                    <span class="text-text-sub text-[10px]">➜</span>
                    <div class="flex-1">
                      <input
                        type="date"
                        v-model="room.billingPeriodEnd"
                        class="w-full px-2 py-1 border border-border-main rounded bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs"
                        required
                      />
                    </div>
                  </div>
                  <!-- Mini indicator if fixed day is used -->
                  <div v-if="room.fixedBillingDay" class="text-[9px] text-text-sub mt-1">
                    💡 Ngày cố định: ngày {{ room.fixedBillingDay }}
                  </div>
                </td>

                <!-- Discount -->
                <td class="py-3 px-4 align-middle text-right">
                  <input
                    type="number"
                    v-model.number="room.discount"
                    min="0"
                    class="w-24 px-2 py-1 border border-border-main rounded bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs text-right font-semibold"
                    placeholder="Giảm giá"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card List View (hidden on desktop) -->
      <div class="md:hidden flex flex-col gap-4 mb-4">
        <div v-for="room in visibleRooms" :key="room.roomId" class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
          <!-- Room Info Header -->
          <div class="flex justify-between items-center border-b border-border-main pb-2.5 mb-3">
            <div>
              <span class="font-extrabold text-sm text-primary">Phòng {{ room.roomNumber }}</span>
              <span class="text-xs text-text-sub font-semibold block mt-0.5">{{ room.tenantName }}</span>
            </div>
            <div v-if="room.fixedBillingDay" class="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-200/40 font-bold">
              💡 Ngày cố định: {{ room.fixedBillingDay }}
            </div>
          </div>

          <!-- Utility Readings & Inputs -->
          <div class="grid grid-cols-2 gap-3 mb-3">
            <!-- Electricity Input -->
            <div class="bg-slate-50 dark:bg-slate-900/35 border border-border-main/40 rounded-xl p-2.5">
              <span class="text-[11px] font-extrabold text-primary block mb-1">ĐIỆN (kWh)</span>
              <div class="flex flex-col gap-1.5">
                <span class="text-xs font-semibold text-text-sub">Cũ: <strong class="text-text-main font-extrabold">{{ room.currentElectricityIndex }}</strong></span>
                <input
                  type="number"
                  v-model.number="room.newElectricityIndex"
                  min="0"
                  class="w-full px-2 py-1.5 border border-border-main rounded-lg bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary font-bold text-xs"
                  placeholder="Chỉ số mới"
                  required
                />
              </div>
            </div>

            <!-- Water Input -->
            <div class="bg-slate-50 dark:bg-slate-900/35 border border-border-main/40 rounded-xl p-2.5">
              <span class="text-[11px] font-extrabold text-blue-600 block mb-1">NƯỚC (m³)</span>
              <div v-if="room.waterBillingType === 'BY_INDEX'" class="flex flex-col gap-1.5">
                <span class="text-xs font-semibold text-text-sub">Cũ: <strong class="text-text-main font-extrabold">{{ room.currentWaterIndex }}</strong></span>
                <input
                  type="number"
                  v-model.number="room.newWaterIndex"
                  min="0"
                  class="w-full px-2 py-1.5 border border-border-main rounded-lg bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary font-bold text-xs"
                  placeholder="Chỉ số mới"
                  required
                />
              </div>
              <div v-else class="flex flex-col justify-center h-full pt-1">
                <span class="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-text-sub">
                  Cố định ({{ formatMoney(room.defaultWaterRate) }}đ)
                </span>
              </div>
            </div>
          </div>

          <!-- Billing Period & Discount -->
          <div class="space-y-3 pt-2 border-t border-dashed border-border-main/50">
            <!-- Period Inputs -->
            <div>
              <span class="text-[11px] font-extrabold text-text-sub uppercase tracking-wider block mb-1.5">Kỳ thanh toán</span>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-text-sub">Từ ngày</span>
                  <input
                    type="date"
                    v-model="room.billingPeriodStart"
                    class="w-full px-2 py-1.5 border border-border-main rounded-lg bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs"
                    required
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-text-sub">Đến ngày</span>
                  <input
                    type="date"
                    v-model="room.billingPeriodEnd"
                    class="w-full px-2 py-1.5 border border-border-main rounded-lg bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Discount Input -->
            <div class="flex items-center justify-between gap-4 pt-1">
              <span class="text-[11px] font-extrabold text-text-sub uppercase tracking-wider">Số tiền giảm giá (đ)</span>
              <input
                type="number"
                v-model.number="room.discount"
                min="0"
                class="w-32 px-2 py-1.5 border border-border-main rounded-lg bg-white dark:bg-slate-900 text-text-main outline-none focus:border-primary text-xs text-right font-bold"
                placeholder="Giảm giá"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-end mt-4">
        <FormButton type="button" @click="goBack" variant="secondary" :disabled="isSavingBulk">Quay lại</FormButton>
        <FormButton type="submit" :loading="isSavingBulk">Lập hóa đơn hàng loạt</FormButton>
      </div>
    </form>
  </div>
</template>

<script src="./BulkInvoices.js"></script>
