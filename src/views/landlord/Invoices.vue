<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Hóa Đơn & Thanh Toán"
      subtitle="Ghi chỉ số điện nước, lập hóa đơn phòng hàng tháng và theo dõi nợ" :icon="invoiceIcon" :showAdd="true"
      addText="Thêm" :disableAdd="activeContracts.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..." v-model="searchQuery" @add-click="openCreateModal" />

    <!-- Invoices List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredInvoices"
        :loading="loading"
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
      <form @submit.prevent="saveInvoice">
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
          <div class="text-text-main">⚡ Chỉ số điện cũ: <span class="font-bold">{{
            selectedContract.room.currentElectricityIndex }} kWh</span></div>
          <div v-if="selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-text-main">
            💧 Chỉ số nước cũ: <span class="font-bold">{{ selectedContract.room.currentWaterIndex }} m³</span>
          </div>
          <div v-else class="text-text-main">
            💧 Tiền nước cố định:
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

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Lập hóa đơn</FormButton>
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
