<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block (hidden during print) -->
    <div class="mb-6 pb-4 border-b border-border-main no-print flex flex-col gap-4">
      <!-- Top Row: Back button + Title + Status -->
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="!w-4 !h-4" />
        </FormButton>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
          <span>Chi Tiết Hóa Đơn</span>
          <span v-if="invoice" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border uppercase',
            invoice.status === 'PAID'
              ? 'bg-green-50 text-green-700 border-green-200'
              : (invoice.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200')
          ]">
            {{ invoice.status === 'PAID' ? 'Đã thu đủ' : (invoice.status === 'PARTIALLY_PAID' ? 'Đã thu một phần' :
              'Chưa thu tiền') }}
          </span>
        </h2>
      </div>

      <!-- Bottom Row: 4 buttons in a horizontal flex row -->
      <div v-if="invoice" class="flex flex-row items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">
        <!-- Tab Switcher -->
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button @click="activeTab = 'summary'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'summary' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Tóm tắt
          </button>
          <button @click="activeTab = 'receipt'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'receipt' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Bản in
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <FormButton v-if="isLandlord" variant="custom"
            class="bg-[#0068ff] hover:bg-[#0052cc] text-white px-2.5 py-1.5 text-xs shadow-xs"
            @click="copyAndShareZalo">
            <AppIcon name="zalo" class="!w-4 !h-4" />
            <span>Gửi Zalo</span>
          </FormButton>
          <FormButton v-if="activeTab === 'receipt'" variant="primary" size="sm" @click="showPreviewModal = true"
            class="!px-2.5 !py-1.5">
            <AppIcon name="printer" class="!w-4 !h-4" />
            <span>In hóa đơn</span>
          </FormButton>
          <FormButton v-if="isLandlord && invoice.status !== 'PAID' && activeTab === 'summary'" variant="secondary"
            size="sm" @click="openPayModal">
            <AppIcon name="credit-card" class="!w-4 !h-4" />
            Thu trước
          </FormButton>
          <FormButton v-if="isLandlord && invoice.status !== 'PAID' && activeTab === 'summary'" variant="primary"
            size="sm" @click="quickPayInvoice">
            <AppIcon name="check-circle" class="!w-4 !h-4" />
            Thu đủ
          </FormButton>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingState v-if="loading" message="Đang tải chi tiết hóa đơn..." />

    <!-- Main Content Area -->
    <div v-else-if="invoice" class="flex flex-col gap-4">

      <!-- SUMMARY TAB VIEW -->
      <div v-if="activeTab === 'summary'">
        <div :class="[
          'gap-6 w-full',
          (invoice.status !== 'PAID' && vietQrUrl && !isLandlord) 
            ? 'grid grid-cols-1 lg:grid-cols-3' 
            : 'flex flex-col'
        ]">
          <!-- Left Column: Invoice Details -->
          <div :class="[
            'flex flex-col gap-4',
            (invoice.status !== 'PAID' && vietQrUrl && !isLandlord) ? 'lg:col-span-2' : 'w-full'
          ]">
            <!-- Room Info Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin phòng trọ</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                <DetailField label="Dãy trọ:" :value="invoice.contract?.room?.boardingHouse?.name" layout="inline" value-class="font-bold" />
                <DetailField label="Phòng số:" layout="inline" value-class="font-bold text-primary">
                  Phòng {{ invoice.contract?.room?.roomNumber }}
                </DetailField>
                <DetailField label="Địa chỉ dãy trọ:" :value="invoice.contract?.room?.boardingHouse?.address || 'Chưa cập nhật'" layout="inline" value-class="font-semibold text-text-sub" />
                <DetailField label="Sức chứa tối đa:" layout="inline" value-class="font-semibold">
                  {{ invoice.contract?.room?.maxPeople }} người
                </DetailField>
              </div>
            </div>

            <!-- Tenant Info Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin khách thuê đại
                diện</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                <DetailField label="Đại diện thuê:" :value="invoice.contract?.tenant?.fullName" layout="inline" value-class="font-bold" />
                <DetailField label="Số điện thoại:" :value="invoice.contract?.tenant?.phone || 'Chưa cập nhật'" layout="inline" value-class="font-bold" />
                <DetailField label="Email liên hệ:" :value="invoice.contract?.tenant?.email || 'Chưa cập nhật'" layout="inline" value-class="font-semibold break-all" />
                <DetailField label="Số người ở thực tế:" layout="inline" value-class="font-bold">
                  {{ invoice.contract?.numberOfTenants }} người
                </DetailField>
              </div>
            </div>

            <!-- Billing Period Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Chi tiết kỳ thanh toán
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                <DetailField label="Ngày lập hóa đơn:" :value="formatDate(invoice.invoiceDate)" layout="inline" value-class="font-semibold" />
                <DetailField label="Kỳ thanh toán từ:" :value="formatDate(invoice.billingPeriodStart)" layout="inline" value-class="font-semibold" />
                <DetailField label="Đến ngày:" :value="formatDate(invoice.billingPeriodEnd)" layout="inline" value-class="font-semibold" />
                <DetailField label="Mã hóa đơn:" layout="inline" value-class="font-mono text-text-sub">
                  #{{ invoice.id }}
                </DetailField>
              </div>
            </div>

            <!-- Electricity & Water Usage Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Chỉ số sử dụng điện nước
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Điện -->
                <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3.5 border border-border-main/50 text-xs">
                  <h4 class="font-bold text-primary mb-2 flex items-center gap-1">Điện năng tiêu thụ</h4>
                  <div class="space-y-1.5 text-text-main">
                    <div class="flex justify-between"><span>Chỉ số cũ:</span> <strong>{{ invoice.oldElectricityIndex }}
                        kWh</strong></div>
                    <div class="flex justify-between"><span>Chỉ số mới:</span> <strong>{{ invoice.newElectricityIndex }}
                        kWh</strong></div>
                    <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Tiêu thụ:</span> <strong
                        class="text-primary">{{ invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh</strong>
                    </div>
                    <div class="flex justify-between pt-1"><span>Đơn giá:</span> <strong>{{
                      formatMoney(invoice.electricityRate) }} đ/kWh</strong></div>
                    <div
                      class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                      <span>Thành tiền:</span>
                      <span class="text-primary">{{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex)
                        * invoice.electricityRate) }} đ</span>
                    </div>
                  </div>
                </div>
                <!-- Nước -->
                <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3.5 border border-border-main/50 text-xs">
                  <h4 class="font-bold text-blue-600 mb-2 flex items-center gap-1">Nước sinh hoạt</h4>
                  <div class="space-y-1.5 text-text-main">
                    <template v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                      <div class="flex justify-between"><span>Chỉ số cũ:</span> <strong>{{ invoice.oldWaterIndex }}
                          m³</strong></div>
                      <div class="flex justify-between"><span>Chỉ số mới:</span> <strong>{{ invoice.newWaterIndex }}
                          m³</strong></div>
                      <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Tiêu thụ:</span> <strong
                          class="text-blue-600">{{ invoice.newWaterIndex - invoice.oldWaterIndex }} m³</strong></div>
                      <div class="flex justify-between pt-1"><span>Đơn giá nước:</span> <strong>{{
                        formatMoney(invoice.waterRate) }} đ/m³</strong></div>
                      <div
                        class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                        <span>Thành tiền:</span>
                        <span class="text-blue-600">{{ formatMoney((invoice.newWaterIndex - invoice.oldWaterIndex) *
                          invoice.waterRate) }} đ</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex justify-between"><span>Hình thức đóng:</span> <strong>{{
                        invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ?
                          'Cố định theo đầu người' : 'Cố định theo phòng' }}</strong></div>
                      <div class="flex justify-between"><span>Số lượng tính:</span> <strong>{{
                        invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ?
                          invoice.contract?.numberOfTenants + ' người' : '1 phòng' }}</strong></div>
                      <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Đơn giá:</span> <strong>{{
                        formatMoney(invoice.waterRate) }} đ</strong></div>
                      <div
                        class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                        <span>Thành tiền:</span>
                        <span class="text-blue-600">
                          {{ formatMoney(invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ?
                            invoice.contract?.numberOfTenants * invoice.waterRate : invoice.waterRate) }} đ
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Extra Fees Services Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Các dịch vụ đi kèm & phụ
                phí</h3>
              <div v-if="invoiceItems.length === 0" class="text-center py-6 text-text-sub italic text-xs">
                Không có phụ phí dịch vụ phát sinh.
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="item in invoiceItems" :key="item.id"
                  class="border border-border-main/40 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                  <div>
                    <span class="font-semibold text-text-main block">{{ item.name }}</span>
                    <span class="text-[10px] text-text-sub">
                      Đơn giá: {{ formatMoney(item.price) }} đ x {{ item.quantity }}
                    </span>
                  </div>
                  <span class="font-bold text-primary shrink-0 ml-2">
                    {{ formatMoney(item.subtotal) }} đ
                  </span>
                </div>
              </div>
            </div>

            <!-- Financial Summary Card -->
            <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
              <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Tổng hợp nợ thu & Trạng
                thái</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div
                  class="bg-slate-50 dark:bg-slate-900/30 p-3.5 border border-border-main/40 rounded-lg flex flex-col justify-between">
                  <span class="text-text-sub font-semibold block mb-1">Tổng tiền hóa đơn:</span>
                  <div>
                    <strong class="text-text-main text-base sm:text-lg block">{{ formatMoney(invoice.totalAmount) }} đ</strong>
                    <span v-if="invoice.discount > 0" class="text-[10px] text-rose-500 dark:text-rose-400 font-semibold block mt-0.5">
                      Đã giảm: {{ formatMoney(invoice.discount) }} đ
                    </span>
                  </div>
                </div>
                <div
                  class="bg-green-50/30 dark:bg-green-950/10 p-3.5 border border-green-200/50 rounded-lg flex flex-col justify-between">
                  <span class="text-green-700 dark:text-green-400 font-semibold block mb-1">Đã đóng (Đã thu):</span>
                  <strong class="text-green-600 dark:text-green-400 text-base sm:text-lg">{{ formatMoney(invoice.paidAmount) }} đ</strong>
                </div>
                <div
                  class="bg-rose-50/30 dark:bg-rose-950/10 p-3.5 border border-rose-200/50 rounded-lg flex flex-col justify-between">
                  <span class="text-rose-700 dark:text-rose-400 font-semibold block mb-1">Còn lại cần thu (Còn nợ):</span>
                  <strong class="text-rose-600 dark:text-rose-400 text-base sm:text-lg">{{ formatMoney(invoice.totalAmount -
                    invoice.paidAmount) }} đ</strong>
                </div>
              </div>
            </div>
          </div>

      <!-- Right Column: VietQR Payment Card (Only show for tenant when unpaid and bank configured) -->
          <div v-if="invoice.status !== 'PAID' && vietQrUrl && !isLandlord" class="lg:col-span-1">
            <div class="bg-card border border-border-main rounded-xl p-5 shadow-xs flex flex-col items-center sticky top-20">
              <h3 class="text-sm font-bold text-text-main mb-1 w-full text-center">Thanh toán chuyển khoản nhanh</h3>
              <p class="text-[11px] text-text-sub mb-4 text-center">Quét mã QR bằng ứng dụng ngân hàng để thanh toán tự động.</p>
              
              <!-- QR Code (Large) -->
              <div class="w-52 h-52 sm:w-56 sm:h-56 bg-white border border-border-main p-2 rounded-2xl flex items-center justify-center shrink-0 shadow-xs mb-4">
                <img :src="vietQrUrl" class="w-full h-full object-contain" alt="Mã chuyển khoản VietQR" />
              </div>

              <!-- Details -->
              <div class="space-y-2.5 text-xs w-full">
                <div class="flex justify-between border-b border-border-main/20 pb-1.5">
                  <span class="text-text-sub font-semibold">Ngân hàng:</span>
                  <span class="font-bold text-text-main">{{ invoice.contract?.room?.boardingHouse?.bankName }}</span>
                </div>
                <div class="flex justify-between border-b border-border-main/20 pb-1.5">
                  <span class="text-text-sub font-semibold">Số tài khoản:</span>
                  <span class="font-bold text-primary">{{ invoice.contract?.room?.boardingHouse?.bankAccountNumber }}</span>
                </div>
                <div class="flex justify-between border-b border-border-main/20 pb-1.5">
                  <span class="text-text-sub font-semibold">Tên chủ tài khoản:</span>
                  <span class="font-bold text-text-main">{{ invoice.contract?.room?.boardingHouse?.bankAccountName }}</span>
                </div>
                <div class="flex justify-between border-b border-border-main/20 pb-1.5">
                  <span class="text-text-sub font-semibold">Số tiền cần đóng:</span>
                  <span class="font-extrabold text-danger text-sm">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-text-sub font-semibold">Nội dung chuyển khoản:</span>
                  <span class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-1.5 rounded text-text-main text-center text-[10.5px]">
                    PHONG {{ invoice.contract?.room?.roomNumber }} CK TIEN PHONG
                  </span>
                </div>
              </div>

              <!-- Lưu ý cho người thuê -->
              <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 flex gap-2 items-start leading-relaxed w-full">
                <AppIcon name="exclamation-triangle" class="!w-4 !h-4 shrink-0 mt-0.5" />
                <div>
                  <span class="font-bold block text-[10px] mb-0.5">Lưu ý quan trọng:</span>
                  <p class="text-[9px] leading-normal m-0">Sau khi chuyển khoản thành công, quý khách vui lòng đợi chủ trọ đối soát tài khoản và xác nhận duyệt trạng thái thanh toán trên hệ thống.</p>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- End Grid Wrapper -->
      </div> <!-- End Summary Tab -->

      <!-- PRINTABLE INVOICE SHEET VIEW -->
      <div v-else-if="activeTab === 'receipt'" id="invoice-print-area"
        class="print-contract-container bg-white dark:bg-slate-950 p-3 sm:p-10 md:p-12 border border-border-main rounded-2xl shadow-xs max-w-4xl mx-auto text-text-main font-serif relative">
        <h3 class="text-center font-bold text-lg sm:text-2xl uppercase tracking-widest my-6 text-black dark:text-white">
          HÓA ĐƠN TIỀN PHÒNG & DỊCH VỤ</h3>
        <p class="text-center text-xs sm:text-sm italic text-black dark:text-slate-200 mb-6">
          Kỳ thanh toán: Từ ngày {{ formatDate(invoice.billingPeriodStart) }} đến ngày {{
            formatDate(invoice.billingPeriodEnd)
          }}
        </p>

        <div class="space-y-3 text-xs sm:text-sm leading-relaxed text-justify text-black dark:text-slate-200">
          <!-- Thông tin Bên A và Bên B -->
          <div>
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN CHO THUÊ (LANDLORD)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.fullName ||
                '......................................................' }}</div>
              <div><strong>Số điện thoại:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.phone ||
                '......................................................' }}</div>
              <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{
                invoice.contract?.room?.boardingHouse?.address
                || '......................................................' }}</div>
            </div>
          </div>

          <div class="pt-1.5">
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN THUÊ PHÒNG (TENANT)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ invoice.contract?.tenant?.fullName }}</div>
              <div><strong>Phòng số:</strong> Phòng {{ invoice.contract?.room?.roomNumber }} - Dãy trọ: {{
                invoice.contract?.room?.boardingHouse?.name }}</div>
              <div><strong>Số điện thoại:</strong> {{ invoice.contract?.tenant?.phone ||
                '......................................................' }}</div>
              <div><strong>Ngày lập hóa đơn:</strong> {{ formatDate(invoice.invoiceDate) }}</div>
            </div>
          </div>

          <p class="pt-1.5">Chi tiết các khoản tiền phòng và chi phí dịch vụ phát sinh trong kỳ thanh toán:</p>

          <!-- Table of items -->
          <div class="overflow-x-auto border border-black dark:border-white rounded-lg mt-1">
            <table class="w-full text-xs text-left border-collapse table-fixed min-w-0 sm:min-w-[500px]">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-black dark:border-white">
                  <th class="py-2 px-3 w-[45%] font-bold text-black dark:text-white">Mục chi phí</th>
                  <th class="text-right py-2 px-3 w-[20%] font-bold text-black dark:text-white">Đơn giá</th>
                  <th class="text-center py-2 px-3 w-[12%] font-bold text-black dark:text-white">SL</th>
                  <th class="text-right py-2 px-3 w-[23%] font-bold text-black dark:text-white">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/30 dark:divide-white/30">
                <!-- Tiền phòng -->
                <tr>
                  <td class="py-2 px-3 text-black dark:text-white">
                    <strong>Tiền thuê phòng</strong>
                  </td>
                  <td class="text-right py-2 px-3 text-black dark:text-white">{{
                    formatMoney(invoice.contract?.contractedRoomPrice) }} đ</td>
                  <td class="text-center py-2 px-3 text-black dark:text-white">1</td>
                  <td class="text-right py-2 px-3 font-bold text-black dark:text-white">{{
                    formatMoney(invoice.roomPrice) }} đ
                  </td>
                </tr>

                <!-- Tiền điện -->
                <tr>
                  <td class="py-2 px-3 text-black dark:text-white">
                    <strong>Tiền điện tiêu thụ</strong>
                    <div class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Chỉ số: {{ invoice.newElectricityIndex }} - {{ invoice.oldElectricityIndex }} ({{
                        invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh)
                    </div>
                  </td>
                  <td class="text-right py-2 px-3 text-black dark:text-white">{{ formatMoney(invoice.electricityRate) }}
                    đ
                  </td>
                  <td class="text-center py-2 px-3 text-black dark:text-white">{{ invoice.newElectricityIndex -
                    invoice.oldElectricityIndex }}</td>
                  <td class="text-right py-2 px-3 font-bold text-black dark:text-white">
                    {{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex) *
                      invoice.electricityRate) }} đ
                  </td>
                </tr>

                <!-- Tiền nước -->
                <tr>
                  <td class="py-2 px-3 text-black dark:text-white">
                    <strong>Tiền nước tiêu thụ</strong>
                    <div v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'"
                      class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Chỉ số: {{ invoice.newWaterIndex }} - {{ invoice.oldWaterIndex }} ({{ invoice.newWaterIndex -
                        invoice.oldWaterIndex }} m³)
                    </div>
                    <div v-else class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Tính cố định theo {{ invoice.contract?.room?.boardingHouse?.waterBillingType ===
                        'FIXED_PER_PERSON' ?
                        'đầu người' : 'phòng' }}
                    </div>
                  </td>
                  <td class="text-right py-2 px-3 text-black dark:text-white">{{ formatMoney(invoice.waterRate) }} đ
                  </td>
                  <td class="text-center py-2 px-3 text-black dark:text-white">
                    <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">{{
                      invoice.newWaterIndex - invoice.oldWaterIndex }}</span>
                    <span v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">{{
                      invoice.contract?.numberOfTenants }}</span>
                    <span v-else>1</span>
                  </td>
                  <td class="text-right py-2 px-3 font-bold text-black dark:text-white">
                    <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                      {{ formatMoney((invoice.newWaterIndex - invoice.oldWaterIndex) * invoice.waterRate) }} đ
                    </span>
                    <span v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">
                      {{ formatMoney(invoice.contract?.numberOfTenants * invoice.waterRate) }} đ
                    </span>
                    <span v-else>{{ formatMoney(invoice.waterRate) }} đ</span>
                  </td>
                </tr>

                <!-- Phụ phí dịch vụ riêng -->
                <tr v-for="item in invoiceItems" :key="item.id">
                  <td class="py-2 px-3 text-black dark:text-white">
                    <strong>{{ item.name }}</strong>
                  </td>
                  <td class="text-right py-2 px-3 text-black dark:text-white">{{ formatMoney(item.price) }} đ</td>
                  <td class="text-center py-2 px-3 text-black dark:text-white">{{ item.quantity }}</td>
                  <td class="text-right py-2 px-3 font-bold text-black dark:text-white">{{ formatMoney(item.subtotal) }}
                    đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total amounts details -->
          <div class="border-t border-black dark:border-white pt-2.5 text-xs sm:text-sm flex justify-end">
            <div class="w-full sm:w-[50%] space-y-1.5">
              <div v-if="invoice.discount > 0" class="flex justify-between text-black dark:text-white">
                <span>Tạm tính:</span>
                <span>{{ formatMoney(invoice.totalAmount + invoice.discount) }} đ</span>
              </div>
              <div v-if="invoice.discount > 0" class="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                <span>Giảm giá:</span>
                <span>-{{ formatMoney(invoice.discount) }} đ</span>
              </div>
              <div class="flex justify-between font-semibold text-black dark:text-white">
                <span>Tổng chi phí cần đóng:</span>
                <span>{{ formatMoney(invoice.totalAmount) }} đ</span>
              </div>
              <div class="flex justify-between text-black dark:text-white">
                <span>Đã đóng:</span>
                <span class="font-medium text-green-600">{{ formatMoney(invoice.paidAmount) }} đ</span>
              </div>
              <div
                class="flex justify-between font-extrabold border-t border-dashed border-black/40 dark:border-white/40 pt-2 text-black dark:text-white">
                <span>Còn nợ cần thu:</span>
                <span class="text-rose-600">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signature section -->
        <div
          class="signature-section mt-6 pb-4 pt-2 border-t border-dashed border-border-main/50 text-xs sm:text-sm font-serif text-black dark:text-white">
          <div>
            <h5 class="font-bold uppercase">NGƯỜI LẬP PHIẾU</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-10">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-6">{{ invoice.contract?.room?.boardingHouse?.landlord?.fullName || 'Chủ trọ' }}
            </div>
          </div>
          <div>
            <h5 class="font-bold uppercase">NGƯỜI NỘP TIỀN</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-10">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-6">{{ invoice.contract?.tenant?.fullName }}</div>
          </div>
        </div>
      </div>

      <!-- Print Preview Modal -->
      <Modal v-if="showPreviewModal" title="Xem trước bản in hóa đơn" maxWidth="xl" @close="showPreviewModal = false">
        <div class="max-h-[70vh] overflow-y-auto pr-1">
          <div
            class="print-contract-container bg-white text-black p-4 border border-slate-200 rounded-xl font-serif text-xs leading-relaxed text-justify">
            <h3 class="text-center font-bold text-lg uppercase tracking-widest my-6 text-black">
              HÓA ĐƠN THANH TOÁN TIỀN PHÒNG & DỊCH VỤ</h3>
            <p class="text-center text-xs sm:text-sm italic text-black mb-6">
              Kỳ thanh toán: Từ ngày {{ formatDate(invoice.billingPeriodStart) }} đến ngày {{
                formatDate(invoice.billingPeriodEnd) }}
            </p>

            <div class="space-y-3 text-xs leading-relaxed text-justify text-black">
              <!-- Thông tin Bên A và Bên B -->
              <div>
                <h4 class="font-bold uppercase mb-1 text-black">BÊN CHO THUÊ (LANDLORD)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  <div><strong>Họ và tên:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.fullName ||
                    '......................................................' }}</div>
                  <div><strong>Số điện thoại:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.phone ||
                    '......................................................' }}</div>
                  <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{
                    invoice.contract?.room?.boardingHouse?.address ||
                    '......................................................'
                    }}</div>
                </div>
              </div>

              <div class="pt-1.5">
                <h4 class="font-bold uppercase mb-1 text-black">BÊN THUÊ PHÒNG (TENANT)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  <div><strong>Họ và tên:</strong> {{ invoice.contract?.tenant?.fullName }}</div>
                  <div><strong>Phòng số:</strong> Phòng {{ invoice.contract?.room?.roomNumber }} - Dãy trọ: {{
                    invoice.contract?.room?.boardingHouse?.name }}</div>
                  <div><strong>Số điện thoại:</strong> {{ invoice.contract?.tenant?.phone ||
                    '......................................................' }}</div>
                  <div><strong>Ngày lập hóa đơn:</strong> {{ formatDate(invoice.invoiceDate) }}</div>
                </div>
              </div>

              <p class="pt-1.5">Chi tiết các khoản tiền phòng và chi phí dịch vụ phát sinh trong kỳ thanh toán:</p>

              <!-- Table of items -->
              <div class="overflow-x-auto border border-black rounded-lg mt-1">
                <table class="w-full text-xs text-left border-collapse table-fixed min-w-0 sm:min-w-[500px]">
                  <thead>
                    <tr class="bg-slate-50 border-b border-black">
                      <th class="py-2 px-3 w-[45%] font-bold text-black">Mục chi phí</th>
                      <th class="text-right py-2 px-3 w-[20%] font-bold text-black">Đơn giá</th>
                      <th class="text-center py-2 px-3 w-[12%] font-bold text-black">SL</th>
                      <th class="text-right py-2 px-3 w-[23%] font-bold text-black">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-black/30">
                    <!-- Tiền phòng -->
                    <tr>
                      <td class="py-2 px-3 text-black">
                        <strong>Tiền thuê phòng</strong>
                      </td>
                      <td class="text-right py-2 px-3 text-black">{{ formatMoney(invoice.contract?.contractedRoomPrice)
                        }} đ
                      </td>
                      <td class="text-center py-2 px-3 text-black">1</td>
                      <td class="text-right py-2 px-3 font-bold text-black">{{ formatMoney(invoice.roomPrice) }} đ</td>
                    </tr>

                    <!-- Tiền điện -->
                    <tr>
                      <td class="py-2 px-3 text-black">
                        <strong>Tiền điện tiêu thụ</strong>
                        <div class="text-[10px] text-text-sub mt-0.5">
                          Chỉ số: {{ invoice.newElectricityIndex }} - {{ invoice.oldElectricityIndex }} ({{
                            invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh)
                        </div>
                      </td>
                      <td class="text-right py-2 px-3 text-black">{{ formatMoney(invoice.electricityRate) }} đ</td>
                      <td class="text-center py-2 px-3 text-black">{{ invoice.newElectricityIndex -
                        invoice.oldElectricityIndex }}</td>
                      <td class="text-right py-2 px-3 font-bold text-black">
                        {{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex) *
                        invoice.electricityRate)
                        }} đ
                      </td>
                    </tr>

                    <!-- Tiền nước -->
                    <tr>
                      <td class="py-2 px-3 text-black">
                        <strong>Tiền nước tiêu thụ</strong>
                        <div v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'"
                          class="text-[10px] text-text-sub mt-0.5">
                          Chỉ số: {{ invoice.newWaterIndex }} - {{ invoice.oldWaterIndex }} ({{ invoice.newWaterIndex -
                          invoice.oldWaterIndex }} m³)
                        </div>
                        <div v-else class="text-[10px] text-text-sub mt-0.5">
                          Tính cố định theo {{ invoice.contract?.room?.boardingHouse?.waterBillingType ===
                            'FIXED_PER_PERSON'
                          ? 'đầu người' : 'phòng' }}
                        </div>
                      </td>
                      <td class="text-right py-2 px-3 text-black">{{ formatMoney(invoice.waterRate) }} đ</td>
                      <td class="text-center py-2 px-3 text-black">
                        <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">{{
                          invoice.newWaterIndex - invoice.oldWaterIndex }}</span>
                        <span
                          v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">{{
                            invoice.contract?.numberOfTenants }}</span>
                        <span v-else>1</span>
                      </td>
                      <td class="text-right py-2 px-3 font-bold text-black">
                        <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                          {{ formatMoney((invoice.newWaterIndex - invoice.oldWaterIndex) * invoice.waterRate) }} đ
                        </span>
                        <span
                          v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">
                          {{ formatMoney(invoice.contract?.numberOfTenants * invoice.waterRate) }} đ
                        </span>
                        <span v-else>{{ formatMoney(invoice.waterRate) }} đ</span>
                      </td>
                    </tr>

                    <!-- Phụ phí dịch vụ riêng -->
                    <tr v-for="item in invoiceItems" :key="item.id">
                      <td class="py-2 px-3 text-black">
                        <strong>{{ item.name }}</strong>
                      </td>
                      <td class="text-right py-2 px-3 text-black">{{ formatMoney(item.price) }} đ</td>
                      <td class="text-center py-2 px-3 text-black">{{ item.quantity }}</td>
                      <td class="text-right py-2 px-3 font-bold text-black">{{ formatMoney(item.subtotal) }} đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Total amounts details -->
              <div class="border-t border-black pt-2.5 text-xs sm:text-sm flex justify-end">
                <div class="w-full sm:w-[50%] space-y-1.5">
                  <div v-if="invoice.discount > 0" class="flex justify-between text-black">
                    <span>Tạm tính:</span>
                    <span>{{ formatMoney(invoice.totalAmount + invoice.discount) }} đ</span>
                  </div>
                  <div v-if="invoice.discount > 0" class="flex justify-between text-rose-600 font-semibold">
                    <span>Giảm giá:</span>
                    <span>-{{ formatMoney(invoice.discount) }} đ</span>
                  </div>
                  <div class="flex justify-between font-semibold text-black">
                    <span>Tổng chi phí cần đóng:</span>
                    <span>{{ formatMoney(invoice.totalAmount) }} đ</span>
                  </div>
                  <div class="flex justify-between text-black">
                    <span>Đã đóng:</span>
                    <span class="font-medium text-green-600">{{ formatMoney(invoice.paidAmount) }} đ</span>
                  </div>
                  <div
                    class="flex justify-between font-extrabold border-t border-dashed border-black/40 pt-2 text-black">
                    <span>Còn nợ cần thu:</span>
                    <span class="text-rose-600">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Signature section -->
            <div
              class="signature-section mt-6 pb-4 pt-2 border-t border-dashed border-border-main/50 text-xs font-serif text-black">
              <div>
                <h5 class="font-bold uppercase">NGƯỜI LẬP PHIẾU</h5>
                <span class="text-[10px] text-text-sub block italic mt-0.5 mb-10">(Ký và ghi rõ họ tên)</span>
                <div class="font-bold mt-6">{{ invoice.contract?.room?.boardingHouse?.landlord?.fullName || 'Chủ trọ' }}
                </div>
              </div>
              <div>
                <h5 class="font-bold uppercase">NGƯỜI NỘP TIỀN</h5>
                <span class="text-[10px] text-text-sub block italic mt-0.5 mb-10">(Ký và ghi rõ họ tên)</span>
                <div class="font-bold mt-6">{{ invoice.contract?.tenant?.fullName }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="showPreviewModal = false" variant="secondary">Đóng</FormButton>
          <FormButton type="button" @click="printInvoice" variant="primary">In hóa đơn</FormButton>
        </div>
      </Modal>

    </div>

    <!-- Record Payment Modal -->
    <Modal v-if="showPayModal" title="Ghi Nhận Thanh Toán" maxWidth="sm" @close="closePayModal">
      <p class="text-xs text-text-sub mb-5">
        Phòng {{ invoice.contract?.room?.roomNumber }} - Tổng nợ: <span class="font-bold text-danger">{{
          formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
      </p>

      <form @submit.prevent="submitPayment">
        <div class="mb-6">
          <FormInput type="number" label="Số tiền khách đóng (VNĐ)" v-model="payForm.paidAmount"
            :max="invoice.totalAmount - invoice.paidAmount" min="1000" required />
        </div>

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closePayModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Xác nhận</FormButton>
        </div>
      </form>
    </Modal>

    <!-- CONFIRM MODAL -->
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
  </div>
</template>

<script src="./InvoiceDetail.js"></script>

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
