<template>
  <div class="p-4 bg-bg-main min-h-full print:bg-white print:p-0">
    <!-- Header Block (hidden during print) -->
    <div class="mb-6 pb-4 border-b border-border-main no-print flex flex-col gap-4">
      <!-- Top Row: Back button + Title + Status -->
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="!w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2">
          <span>Chi Tiết Hợp Đồng</span>
          <span v-if="contract" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border',
            contract.status === 'ACTIVE'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          ]">
            {{ contract.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thanh lý' }}
          </span>
        </h2>
      </div>

      <!-- Bottom Row: buttons in a horizontal flex row -->
      <div v-if="contract" class="flex flex-row items-center justify-between gap-2 w-full flex-nowrap">
        <!-- Tab Switcher -->
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button @click="activeTab = 'summary'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'summary' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Tóm tắt
          </button>
          <button @click="activeTab = 'contract'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'contract' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Bản in
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Print Button (visible on contract tab) -->
          <FormButton v-if="activeTab === 'contract'" variant="primary" size="sm" @click="showPreviewModal = true"
            class="!px-2.5 !py-1.5">
            <AppIcon name="printer" class="!w-4 !h-4" />
            <span class="hidden sm:inline">In hợp đồng</span>
          </FormButton>

          <FormButton v-if="activeTab === 'summary' && contract.status === 'ACTIVE' && isLandlord" variant="danger" size="sm"
            @click="terminateContract" class="!px-2.5 !py-1.5">
            <AppIcon name="minus-circle" class="!w-4 !h-4" />
            <span>Thanh lý</span>
          </FormButton>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingState v-if="loading" message="Đang tải chi tiết hợp đồng..." />

    <!-- Main Content Area -->
    <div v-else-if="contract" class="flex flex-col gap-4">

      <!-- SUMMARY TAB VIEW -->
      <div v-if="activeTab === 'summary'" class="flex flex-col gap-4">
        <!-- Room Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin phòng trọ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <DetailField label="Dãy trọ:" :value="contract.room.boardingHouse.name" layout="inline"
              value-class="font-bold" />
            <DetailField label="Phòng số:" layout="inline" value-class="font-bold text-primary">
              Phòng {{ contract.room.roomNumber }}
            </DetailField>
            <DetailField label="Giá phòng gốc:" layout="inline" value-class="font-bold">
              {{ formatMoney(contract.contractedRoomPrice) }} đ/tháng
            </DetailField>
            <DetailField label="Sức chứa tối đa:" layout="inline" value-class="font-bold">
              {{ contract.room.maxPeople }} người
            </DetailField>
            <DetailField label="Số điện hiện tại:" layout="inline" value-class="font-bold">
              {{ contract.room.currentElectricityIndex }} kWh
            </DetailField>
            <DetailField label="Số nước hiện tại:" layout="inline" value-class="font-bold">
              {{ contract.room.currentWaterIndex }} m³
            </DetailField>
          </div>
        </div>

        <!-- Contract Terms Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Điều khoản hợp đồng</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <DetailField label="Ngày bắt đầu thuê:" :value="formatDate(contract.startDate)" layout="inline"
              value-class="font-semibold" />
            <DetailField label="Ngày hết hạn:" :value="formatDate(contract.endDate)" layout="inline"
              value-class="font-semibold" />
            <DetailField label="Tiền đặt cọc:" layout="inline" value-class="font-bold text-green-600">
              {{ formatMoney(contract.deposit) }} đ
            </DetailField>
            <DetailField label="Kỳ hạn tính tiền:" value="Thanh toán vào cuối tháng" layout="inline"
              value-class="font-semibold" />
          </div>
        </div>

        <!-- Tenant Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin khách thuê</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <DetailField label="Đại diện thuê:" :value="contract.tenant.fullName" layout="inline"
              value-class="font-bold" />
            <DetailField label="Tài khoản:" :value="contract.tenant.username" layout="inline" value-class="font-mono" />
            <DetailField label="Số điện thoại:" :value="contract.tenant.phone || 'Chưa cập nhật'" layout="inline"
              value-class="font-bold" />
            <DetailField label="Email liên hệ:" :value="contract.tenant.email || 'Chưa cập nhật'" layout="inline"
              value-class="font-semibold break-all" />
          </div>
        </div>

        <!-- Occupants & Extra fees Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Số người ở & Dịch vụ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border border-border-main/50 text-xs">
              <span class="text-text-sub block mb-2 font-medium">Số người đang ở thực tế:</span>
              <span class="font-bold text-text-main text-sm">{{ contract.numberOfTenants }} người</span>
            </div>

            <!-- Right Side: Services applied -->
            <div class="text-xs">
              <span class="text-text-sub font-semibold block mb-2.5">Dịch vụ đi kèm:</span>
              <div v-if="extraFees.length === 0" class="text-center py-4 text-text-sub italic">
                Không có dịch vụ đi kèm
              </div>
              <div v-else class="flex flex-col gap-2">
                <div v-for="cef in extraFees" :key="cef.id"
                  class="border border-border-main/40 rounded p-2.5 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                  <div>
                    <span class="font-semibold text-text-main block">{{ cef.extraFee.name }}</span>
                    <span class="text-[10px] text-text-sub">
                      {{ formatMoney(cef.customPrice) }} đ/{{ cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' :
                        'phòng' }}
                    </span>
                  </div>
                  <span class="font-bold text-primary shrink-0 ml-2">
                    {{ formatMoney(cef.extraFee.unitType === 'FIXED_PER_PERSON' ? cef.customPrice *
                      contract.numberOfTenants : cef.customPrice) }} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Addendums History Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <div class="flex items-center justify-between border-b border-border-main pb-2.5 mb-4">
            <h3 class="text-sm font-bold text-text-main">Lịch sử phụ lục hợp đồng</h3>
            <FormButton v-if="contract.status === 'ACTIVE' && isLandlord" variant="primary" size="sm" @click="openAddendumModal"
              class="!px-2.5 !py-1.5">
              + Thêm phụ lục
            </FormButton>
          </div>

          <div v-if="loadingAddendums" class="text-center py-6 text-text-sub text-xs">
            <div class="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2">
            </div>
            Đang tải...
          </div>

          <div v-else-if="addendums.length === 0" class="text-center py-6 text-text-sub text-xs italic">
            Chưa có phụ lục nào.
          </div>

          <div v-else class="flex flex-col gap-3">
            <div v-for="(addendum, index) in addendums" :key="addendum.id"
              :class="['border rounded-xl p-3.5 text-xs', index === 0 ? 'border-primary/40 bg-primary/5' : 'border-border-main/50 bg-slate-50/30 dark:bg-slate-900/20']">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-text-main text-sm flex items-center gap-2">
                  {{ addendum.description || 'Phụ lục #' + (addendums.length - index) }}
                  <span v-if="index === 0"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">Hiện hành</span>
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-text-sub text-[11px]">Từ {{ formatDate(addendum.startDate) }}</span>
                  <FormButton @click.stop="openPrintAddendumModal(addendum, addendums.length - index)"
                    variant="secondary" class="!p-1" title="In phụ lục hợp đồng">
                    <AppIcon name="printer" size="sm" />
                  </FormButton>
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
                <div><span class="text-text-sub">Giá phòng:</span> <span class="font-bold text-text-main">{{
                  formatMoney(addendum.roomPrice) }} đ</span></div>
                <div><span class="text-text-sub">Giá điện:</span> <span class="font-bold text-text-main">{{
                  formatMoney(addendum.electricityRate) }} đ/kWh</span></div>
                <div><span class="text-text-sub">Giá nước:</span> <span class="font-bold text-text-main">{{
                  formatMoney(addendum.waterRate) }} đ</span></div>
                <div><span class="text-text-sub">Tính nước:</span> <span class="font-semibold text-text-main">{{
                  formatWaterBillingType(addendum.waterBillingType) }}</span></div>
                <div><span class="text-text-sub">Số người:</span> <span class="font-bold text-text-main">{{
                  addendum.numberOfTenants }}</span></div>
              </div>
              <div v-if="addendum.extraFees && addendum.extraFees.length > 0"
                class="mt-2 pt-2 border-t border-border-main/30">
                <span class="text-text-sub text-[10px] font-semibold uppercase">Phụ phí:</span>
                <div class="flex flex-wrap gap-1.5 mt-1">
                  <span v-for="ef in addendum.extraFees" :key="ef.id"
                    class="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-text-sub">
                    {{ ef.extraFee.name }}: {{ formatMoney(ef.customPrice) }}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LEGAL CONTRACT TAB VIEW (A4 Preview & printable layout) -->
      <ContractPrint v-else-if="activeTab === 'contract'" :contract="contract" :extra-fees="extraFees" />

      <!-- Print Preview Modal -->
      <Modal v-if="showPreviewModal" title="Xem trước bản in hợp đồng" maxWidth="xl" @close="showPreviewModal = false">
        <div class="max-h-[70vh] overflow-y-auto pr-1">
          <ContractPrint :contract="contract" :extra-fees="extraFees"
            class="!text-black !bg-white !p-4 !border-slate-200 !rounded-xl !text-xs !max-w-none" />
        </div>
        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="showPreviewModal = false" variant="secondary">Đóng</FormButton>
          <FormButton type="button" @click="printContract" variant="primary">In hợp đồng</FormButton>
        </div>
      </Modal>

      <!-- Add Addendum Modal -->
      <Modal v-if="showAddendumModal" title="Thêm Phụ Lục Hợp Đồng" maxWidth="lg" @close="showAddendumModal = false">
        <form @submit.prevent="saveAddendum">
          <div class="mb-4">
            <FormInput type="date" label="Ngày bắt đầu hiệu lực" v-model="addendumForm.startDate" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <FormInput type="number" label="Giá phòng (đ/tháng)" v-model="addendumForm.roomPrice" min="0" required />
            </div>
            <div>
              <FormInput type="number" label="Số người ở" v-model="addendumForm.numberOfTenants" min="1" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <FormInput type="number" label="Giá điện (đ/kWh)" v-model="addendumForm.electricityRate" min="0"
                required />
            </div>
            <div>
              <FormInput type="number" label="Giá nước (đ)" v-model="addendumForm.waterRate" min="0" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <FormSelect label="Cách tính tiền nước" v-model="addendumForm.waterBillingType" required>
                <option value="BY_INDEX">Theo chỉ số đồng hồ (đ/m³)</option>
                <option value="FIXED_PER_PERSON">Cố định theo đầu người (đ/người)</option>
              </FormSelect>
            </div>
            <div>
              <FormInput type="text" label="Ghi chú / Mô tả" v-model="addendumForm.description"
                placeholder="Ví dụ: Điều chỉnh giá phòng T7/2026" />
            </div>
          </div>

          <!-- Dịch vụ phụ phí -->
          <div class="mt-4 pt-4 border-t border-border-main">
            <h4 class="text-sm font-bold text-text-main mb-3">Phụ Phí & Dịch Vụ Áp Dụng:</h4>
            <div v-if="availableExtraFees.length === 0" class="text-xs text-text-sub italic">
              Dãy trọ này chưa cấu hình dịch vụ phụ phí.
            </div>
            <div v-else class="flex flex-col gap-2.5">
              <div v-for="(ef, index) in availableExtraFees" :key="ef.id"
                class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-xl px-4 py-3">
                <Checkbox v-model="ef.selected" :label="ef.name" />
                <div class="flex items-center gap-2">
                  <input type="number" v-model.number="ef.customPrice" min="0"
                    class="w-24 text-right border border-border-main rounded px-1.5 py-0.5 bg-card text-text-main text-xs font-bold outline-none" />
                  <span class="text-xs text-text-sub font-medium">đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' :
                    'phòng' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <FormButton type="button" @click="showAddendumModal = false" variant="secondary">Hủy</FormButton>
            <FormButton type="submit" :disabled="savingAddendum">{{ savingAddendum ? 'Đang lưu...' : 'Lưu phụ lục' }}
            </FormButton>
          </div>
        </form>
      </Modal>

      <!-- Print Addendum Modal -->
      <Modal v-if="showPrintAddendumModal" title="Xem trước bản in Phụ lục" maxWidth="xl"
        @close="showPrintAddendumModal = false">
        <div class="max-h-[70vh] overflow-y-auto pr-1">
          <AddendumPrint :contract="contract" :selected-addendum="selectedAddendum"
            class="!bg-white !text-black !p-4 !border-slate-200 !rounded-xl !text-xs !max-w-none" />
        </div>
        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="showPrintAddendumModal = false" variant="secondary">Đóng</FormButton>
          <FormButton type="button" @click="printAddendum" variant="primary">In phụ lục</FormButton>
        </div>
      </Modal>

    </div>
  </div>
</template>

<script src="./ContractDetail.js"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

.print-contract-container {
  font-family: 'Lora', 'Times New Roman', Times, serif !important;
}

.signature-section {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
}

.signature-section>div {
  width: 45% !important;
  text-align: center !important;
}
</style>

<style>
/* Global Print Styles to clean up layout structures */
@media print {

  /* Completely remove layout elements, sidebars, headers, and buttons from flow */
  aside,
  header,
  .no-print,
  button,
  .fixed,
  .z-\[9999\] {
    display: none !important;
  }

  /* Reset body and wrapper elements to block layout to prevent absolute width collapse */
  html,
  body,
  #app,
  .min-h-screen,
  .flex,
  .flex-col,
  .flex-1,
  main {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    background-color: white !important;
    background: white !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  /* Suppress default browser page headers/footers */
  @page {
    size: A4;
    margin: 0;
  }

  /* Apply printed page margins inside body padding to prevent header/footer printing */
  body {
    padding: 20mm 15mm !important;
  }

  /* Expand printable container to take full width */
  .print-contract-container {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
    font-family: 'Lora', 'Times New Roman', Times, serif !important;
  }

  .print-contract-container * {
    color: black !important;
    background-color: transparent !important;
  }

  /* Ensure signatures print side-by-side in 2 columns */
  .signature-section {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    width: 100% !important;
    margin-top: 3rem !important;
    page-break-inside: avoid !important;
  }

  .signature-section>div {
    width: 45% !important;
    min-width: 45% !important;
    text-align: center !important;
    display: block !important;
  }
}
</style>
