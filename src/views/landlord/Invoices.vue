<template>
  <div class="p-4 bg-bg-main min-h-full">
    <PageHeader title="Hóa Đơn & Thanh Toán"
      subtitle="Ghi chỉ số điện nước, lập hóa đơn phòng hàng tháng và theo dõi nợ" :icon="invoiceIcon" :showAdd="true"
      addText="Thêm" :disableAdd="activeContracts.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..." v-model="searchQuery" @add-click="openCreateModal" />

    <!-- Invoices List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredInvoices"
        :loading="isTableLoading"
        loadingText="Đang tải danh sách hóa đơn..."
        emptyText="Không tìm thấy hóa đơn nào."
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="hóa đơn"
        clickable
        @change-page="changePage"
        @row-click="viewDetails"
      />
    </div>

    <!-- Create Invoice Modal -->
    <Modal v-if="showCreateModal" title="Lập Hóa Đơn Tiền Phòng" maxWidth="lg" @close="closeModal">
      <div v-if="isLoadingModalData" class="flex flex-col items-center justify-center py-12 gap-3">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải cấu hình hợp đồng...</div>
      </div>
      <form v-else @submit.prevent="saveInvoice">
        <div class="mb-4">
          <FormSelect
            label="Chọn Hợp Đồng Thuê Hoạt Động"
            v-model="form.contractId"
            @change="onContractChange"
            required
          >
            <option v-for="c in activeContracts" :key="c.id" :value="c.id">
              Phòng {{ c.room.roomNumber }} - {{ c.tenant.fullName }} ({{ c.room.boardingHouse.name }})
            </option>
          </FormSelect>
        </div>

        <!-- Preview details of the room index -->
        <div v-if="selectedContract"
          class="bg-[rgba(0,102,204,0.05)] border border-border-main/50 rounded-xl p-4 mb-4 text-xs flex flex-col gap-2">
          <div class="text-text-main">Chỉ số điện cũ: <span class="font-bold">{{
            selectedContract.room.currentElectricityIndex }} kWh</span></div>
          <div v-if="selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-text-main">
            Chỉ số nước cũ: <span class="font-bold">{{ selectedContract.room.currentWaterIndex }} m³</span>
          </div>
          <div class="text-text-main" v-else>
            Tiền nước cố định:
            <span class="font-bold">
              {{ formatMoney(selectedContract.room.boardingHouse.defaultWaterRate) }} đ
              ({{ selectedContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ?
                'mỗi người' : 'mỗi phòng' }})
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Chỉ số điện mới (tháng này)"
              v-model="form.newElectricityIndex"
              min="0"
              required
            />
          </div>

          <div v-if="selectedContract && selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
            <FormInput
              type="number"
              label="Chỉ số nước mới (tháng này)"
              v-model="form.newWaterIndex"
              min="0"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="date"
              label="Kỳ thanh toán từ ngày"
              v-model="form.billingPeriodStart"
              required
            />
          </div>

          <div>
            <FormInput
              type="date"
              label="Kỳ thanh toán đến ngày"
              v-model="form.billingPeriodEnd"
              required
            />
          </div>
        </div>

        <div class="mb-5">
          <FormInput
            type="date"
            label="Ngày lập hóa đơn"
            v-model="form.invoiceDate"
            required
          />
        </div>

        <div class="mb-5">
          <FormInput
            type="number"
            label="Số tiền giảm giá (VNĐ) - Nếu có"
            v-model="form.discount"
            min="0"
          />
        </div>

        <!-- Advanced options (e.g., checkout/final billing) -->
        <div v-if="selectedContract"
          class="mb-6 p-4 rounded-xl border border-border-main/50 bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
          <div class="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">Cấu hình nâng cao (Kỳ cuối /
            Trả phòng)</div>

          <Checkbox
            v-if="selectedContract.room.boardingHouse.billingTiming === 'PREPAID'"
            v-model="form.excludeRoomPrice"
            label="Không thu tiền phòng (Chỉ tính điện nước)"
            description="Sử dụng cho kỳ hóa đơn cuối cùng trước khi trả phòng (do tiền phòng đã đóng trước đó)."
            class="text-xs font-medium text-text-main"
          />

          <Checkbox
            v-model="form.excludeExtraFees"
            label="Không thu các phụ phí dịch vụ"
            description="Sử dụng để bỏ qua các phí dịch vụ định kỳ (Wifi, vệ sinh...) khi thanh lý hợp đồng."
            class="text-xs font-medium text-text-main"
          />
        </div>

        <!-- Preview Estimated Cost Breakdown -->
        <div v-if="selectedContract" class="mb-6 border border-border-main rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/5">
          <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-border-main flex justify-between items-center">
            <h4 class="text-xs font-bold text-text-main flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-primary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Tạm tính các khoản thu</span>
            </h4>
            <span class="text-[10px] text-text-sub italic">Cập nhật theo chỉ số và ngày nhập</span>
          </div>

          <div class="p-4 space-y-2.5 text-xs text-text-main">
            <!-- Tiền phòng -->
            <div class="flex justify-between items-center">
              <span class="text-text-sub font-medium flex items-center gap-1">
                Tiền phòng 
                <span v-if="form.excludeRoomPrice" class="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-200/50">Bỏ qua</span>
              </span>
              <span class="font-semibold" :class="form.excludeRoomPrice ? 'text-text-sub line-through' : ''">
                {{ formatMoney(computedRoomPrice) }} đ
              </span>
            </div>

            <!-- Tiền điện -->
            <div class="flex justify-between items-center">
              <span class="text-text-sub font-medium">
                Điện (Tiêu thụ: <span class="font-bold text-text-main">{{ computedElectricityUsage }} kWh</span>)
              </span>
              <span class="font-semibold">{{ formatMoney(computedElectricityCost) }} đ</span>
            </div>

            <!-- Tiền nước -->
            <div class="flex justify-between items-center">
              <span class="text-text-sub font-medium">
                Nước 
                <span v-if="selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                  (Tiêu thụ: <span class="font-bold text-text-main">{{ computedWaterUsage }} m³</span>)
                </span>
                <span v-else-if="selectedContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                  (Cố định: <span class="font-bold text-text-main">{{ selectedContract.numberOfTenants }} người</span>)
                </span>
                <span v-else>
                  (Cố định theo phòng)
                </span>
              </span>
              <span class="font-semibold">{{ formatMoney(computedWaterCost) }} đ</span>
            </div>

            <!-- Phụ phí dịch vụ -->
            <template v-if="computedExtraFeesList.length > 0">
              <div class="border-t border-border-main/50 my-1 pt-1.5">
                <span class="text-[10px] text-text-sub font-bold uppercase tracking-wider block mb-1.5">Phụ phí & Dịch vụ đi kèm</span>
                <div class="space-y-2">
                  <div v-for="(item, index) in computedExtraFeesList" :key="index" class="flex justify-between items-center pl-2">
                    <span class="text-text-sub">
                      • {{ item.name }} 
                      <span class="text-[10px] text-text-sub">({{ formatMoney(item.price) }} đ x {{ item.quantity }})</span>
                    </span>
                    <span class="font-semibold text-text-main">{{ formatMoney(item.subtotal) }} đ</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else-if="contractExtraFees.length > 0 && form.excludeExtraFees" class="border-t border-border-main/50 my-1 pt-1.5 flex justify-between items-center">
              <span class="text-text-sub font-medium">Dịch vụ đi kèm</span>
              <span class="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-200/50">Bỏ qua</span>
            </div>

            <!-- Giảm giá -->
            <div v-if="form.discount > 0" class="flex justify-between items-center text-rose-600 dark:text-rose-400 font-semibold border-t border-border-main/30 pt-2 mt-2">
              <span>Giảm giá:</span>
              <span>-{{ formatMoney(form.discount) }} đ</span>
            </div>
          </div>

          <!-- Total Row -->
          <div class="px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-border-main flex justify-between items-center">
            <span class="text-xs font-bold text-text-main">Tổng cộng ước tính:</span>
            <span class="text-base font-extrabold text-primary">{{ formatMoney(computedTotalAmount) }} đ</span>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closeModal" variant="secondary" :disabled="isSaving">Hủy</FormButton>
          <FormButton type="submit" :loading="isSaving">Lập hóa đơn</FormButton>
        </div>
      </form>
    </Modal>

    <!-- Record Payment Modal -->
    <Modal v-if="showPayModal" title="Ghi Nhận Thanh Toán" maxWidth="sm" @close="closeModal">
      <p class="text-xs text-text-sub mb-5">
        Phòng {{ payForm.roomNumber }} - Tổng nợ: <span class="font-bold text-danger">{{
          formatMoney(payForm.remainingAmount) }} đ</span>
      </p>

      <form @submit.prevent="submitPayment">
        <div class="mb-6">
          <FormInput
            type="number"
            label="Số tiền khách đóng (VNĐ)"
            v-model="payForm.paidAmount"
            :max="payForm.remainingAmount"
            min="1000"
            required
          />
        </div>

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Xác nhận</FormButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script src="./Invoices.js"></script>
