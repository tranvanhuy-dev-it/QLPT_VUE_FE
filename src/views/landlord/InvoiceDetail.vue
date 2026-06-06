<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <!-- Header Block (hidden during print) -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-border-main no-print">
      <div class="flex items-center gap-2">
        <button @click="goBack" class="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-main bg-card hover:bg-slate-50 transition cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
          <span>Chi Tiết Hóa Đơn</span>
          <span v-if="invoice" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border uppercase',
            invoice.status === 'PAID'
              ? 'bg-green-50 text-green-700 border-green-200'
              : (invoice.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200')
          ]">
            {{ invoice.status === 'PAID' ? 'Đã thu đủ' : (invoice.status === 'PARTIALLY_PAID' ? 'Đã thu một phần' : 'Chưa thu tiền') }}
          </span>
        </h2>
      </div>

      <!-- Tab Switcher (hidden during print) -->
      <div v-if="invoice" class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 max-w-xs w-full sm:w-auto">
        <button 
          @click="activeTab = 'summary'" 
          :class="['flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'summary' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
          Xem tóm tắt
        </button>
        <button 
          @click="activeTab = 'receipt'" 
          :class="['flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'receipt' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
          Hóa đơn thanh toán
        </button>
      </div>

      <div v-if="invoice" class="flex gap-2">
        <FormButton 
          v-if="activeTab === 'receipt'"
          variant="primary" 
          size="sm" 
          @click="printInvoice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.816V8.16m10.56 5.656V8.16m-10.56 5.656h10.56m-10.56 0h10.56m-10.56 0v5.656m0-5.656v-5.656m10.56 5.656v5.656m0-5.656v-5.656m-10.56 0V3.75h10.56v4.41" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5h-13.5A2.25 2.25 0 0 1 3 17.25V13.816a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v3.434a2.25 2.25 0 0 1-2.25 2.25Z" />
          </svg>
          In hóa đơn
        </FormButton>
        <FormButton 
          v-if="isLandlord && invoice.status !== 'PAID' && activeTab === 'summary'" 
          variant="secondary" 
          size="sm" 
          @click="openPayModal"
        >
          Thu trước
        </FormButton>
        <FormButton 
          v-if="isLandlord && invoice.status !== 'PAID' && activeTab === 'summary'" 
          variant="primary" 
          size="sm" 
          @click="quickPayInvoice"
        >
          Thu đủ
        </FormButton>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải chi tiết hóa đơn...</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-else-if="invoice" class="flex flex-col gap-4">
      
      <!-- SUMMARY TAB VIEW -->
      <div v-if="activeTab === 'summary'" class="flex flex-col gap-4">
        <!-- Room Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin phòng trọ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Dãy trọ:</span>
              <span class="font-bold text-text-main flex-1">{{ invoice.contract?.room?.boardingHouse?.name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Phòng số:</span>
              <span class="font-bold text-primary flex-1">Phòng {{ invoice.contract?.room?.roomNumber }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Địa chỉ dãy trọ:</span>
              <span class="font-semibold text-text-sub flex-1">{{ invoice.contract?.room?.boardingHouse?.address || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Sức chứa tối đa:</span>
              <span class="font-semibold text-text-main flex-1">{{ invoice.contract?.room?.maxPeople }} người</span>
            </div>
          </div>
        </div>

        <!-- Tenant Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin khách thuê đại diện</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Đại diện thuê:</span>
              <span class="font-bold text-text-main flex-1">{{ invoice.contract?.tenant?.fullName }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Số điện thoại:</span>
              <span class="font-bold text-text-main flex-1">{{ invoice.contract?.tenant?.phone || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Email liên hệ:</span>
              <span class="font-semibold text-text-main flex-1 break-all">{{ invoice.contract?.tenant?.email || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Số người ở thực tế:</span>
              <span class="font-bold text-text-main flex-1">{{ invoice.contract?.numberOfTenants }} người</span>
            </div>
          </div>
        </div>

        <!-- Billing Period Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Chi tiết kỳ thanh toán</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Ngày lập hóa đơn:</span>
              <span class="font-semibold text-text-main flex-1">{{ formatDate(invoice.invoiceDate) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Kỳ thanh toán từ:</span>
              <span class="font-semibold text-text-main flex-1">{{ formatDate(invoice.billingPeriodStart) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Đến ngày:</span>
              <span class="font-semibold text-text-main flex-1">{{ formatDate(invoice.billingPeriodEnd) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Mã hóa đơn:</span>
              <span class="font-mono text-text-sub flex-1">#{{ invoice.id }}</span>
            </div>
          </div>
        </div>

        <!-- Electricity & Water Usage Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Chỉ số sử dụng điện nước</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Điện -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3.5 border border-border-main/50 text-xs">
              <h4 class="font-bold text-primary mb-2 flex items-center gap-1">⚡ Điện năng tiêu thụ</h4>
              <div class="space-y-1.5 text-text-main">
                <div class="flex justify-between"><span>Chỉ số cũ:</span> <strong>{{ invoice.oldElectricityIndex }} kWh</strong></div>
                <div class="flex justify-between"><span>Chỉ số mới:</span> <strong>{{ invoice.newElectricityIndex }} kWh</strong></div>
                <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Tiêu thụ:</span> <strong class="text-primary">{{ invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh</strong></div>
                <div class="flex justify-between pt-1"><span>Đơn giá:</span> <strong>{{ formatMoney(invoice.electricityRate) }} đ/kWh</strong></div>
                <div class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                  <span>Thành tiền:</span>
                  <span class="text-primary">{{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex) * invoice.electricityRate) }} đ</span>
                </div>
              </div>
            </div>
            <!-- Nước -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3.5 border border-border-main/50 text-xs">
              <h4 class="font-bold text-blue-600 mb-2 flex items-center gap-1">💧 Nước sinh hoạt</h4>
              <div class="space-y-1.5 text-text-main">
                <template v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                  <div class="flex justify-between"><span>Chỉ số cũ:</span> <strong>{{ invoice.oldWaterIndex }} m³</strong></div>
                  <div class="flex justify-between"><span>Chỉ số mới:</span> <strong>{{ invoice.newWaterIndex }} m³</strong></div>
                  <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Tiêu thụ:</span> <strong class="text-blue-600">{{ invoice.newWaterIndex - invoice.oldWaterIndex }} m³</strong></div>
                  <div class="flex justify-between pt-1"><span>Đơn giá nước:</span> <strong>{{ formatMoney(invoice.waterRate) }} đ/m³</strong></div>
                  <div class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                    <span>Thành tiền:</span>
                    <span class="text-blue-600">{{ formatMoney((invoice.newWaterIndex - invoice.oldWaterIndex) * invoice.waterRate) }} đ</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex justify-between"><span>Hình thức đóng:</span> <strong>{{ invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ? 'Cố định theo đầu người' : 'Cố định theo phòng' }}</strong></div>
                  <div class="flex justify-between"><span>Số lượng tính:</span> <strong>{{ invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ? invoice.contract?.numberOfTenants + ' người' : '1 phòng' }}</strong></div>
                  <div class="flex justify-between border-b border-border-main/20 pb-1"><span>Đơn giá:</span> <strong>{{ formatMoney(invoice.waterRate) }} đ</strong></div>
                  <div class="flex justify-between font-bold text-sm text-text-main pt-1.5 border-t border-border-main/20">
                    <span>Thành tiền:</span>
                    <span class="text-blue-600">
                      {{ formatMoney(invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ? invoice.contract?.numberOfTenants * invoice.waterRate : invoice.waterRate) }} đ
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Fees Services Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Các dịch vụ đi kèm & phụ phí</h3>
          <div v-if="invoiceItems.length === 0" class="text-center py-6 text-text-sub italic text-xs">
            Không có phụ phí dịch vụ phát sinh.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="item in invoiceItems" :key="item.id" class="border border-border-main/40 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center text-xs">
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
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Tổng hợp nợ thu & Trạng thái</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-50 dark:bg-slate-900/30 p-3.5 border border-border-main/40 rounded-lg flex flex-col justify-between">
              <span class="text-text-sub font-semibold block mb-1">Tổng tiền hóa đơn:</span>
              <strong class="text-text-main text-base sm:text-lg">{{ formatMoney(invoice.totalAmount) }} đ</strong>
            </div>
            <div class="bg-green-50/30 dark:bg-green-950/10 p-3.5 border border-green-200/50 rounded-lg flex flex-col justify-between">
              <span class="text-green-700 dark:text-green-400 font-semibold block mb-1">Đã đóng (Đã thu):</span>
              <strong class="text-green-600 dark:text-green-400 text-base sm:text-lg">{{ formatMoney(invoice.paidAmount) }} đ</strong>
            </div>
            <div class="bg-rose-50/30 dark:bg-rose-950/10 p-3.5 border border-rose-200/50 rounded-lg flex flex-col justify-between">
              <span class="text-rose-700 dark:text-rose-400 font-semibold block mb-1">Còn lại cần thu (Còn nợ):</span>
              <strong class="text-rose-600 dark:text-rose-400 text-base sm:text-lg">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- PRINTABLE INVOICE SHEET VIEW -->
      <div v-else-if="activeTab === 'receipt'" id="invoice-print-area" class="print-contract-container bg-white dark:bg-slate-950 p-8 sm:p-12 md:p-16 border border-border-main rounded-2xl shadow-xs max-w-4xl mx-auto text-text-main font-serif relative">
        <h3 class="text-center font-bold text-lg sm:text-2xl uppercase tracking-widest my-8 text-black dark:text-white">HÓA ĐƠN THANH TOÁN</h3>
        <p class="text-center text-xs sm:text-sm italic text-black dark:text-slate-200 mb-8">
          Kỳ thanh toán: Từ ngày {{ formatDate(invoice.billingPeriodStart) }} đến ngày {{ formatDate(invoice.billingPeriodEnd) }}
        </p>

        <div class="space-y-4 text-xs sm:text-sm leading-relaxed text-justify text-black dark:text-slate-200">
          <!-- Thông tin Bên A và Bên B -->
          <div>
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN CHO THUÊ (LANDLORD)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.fullName || '......................................................' }}</div>
              <div><strong>Số điện thoại:</strong> {{ invoice.contract?.room?.boardingHouse?.landlord?.phone || '......................................................' }}</div>
              <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ invoice.contract?.room?.boardingHouse?.address || '......................................................' }}</div>
            </div>
          </div>

          <div class="pt-2">
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN THUÊ PHÒNG (TENANT)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ invoice.contract?.tenant?.fullName }}</div>
              <div><strong>Phòng số:</strong> Phòng {{ invoice.contract?.room?.roomNumber }} - Dãy trọ: {{ invoice.contract?.room?.boardingHouse?.name }}</div>
              <div><strong>Số điện thoại:</strong> {{ invoice.contract?.tenant?.phone || '......................................................' }}</div>
              <div><strong>Ngày lập hóa đơn:</strong> {{ formatDate(invoice.invoiceDate) }}</div>
            </div>
          </div>

          <p class="pt-2">Chi tiết các khoản tiền phòng và chi phí dịch vụ phát sinh trong kỳ thanh toán:</p>

          <!-- Table of items -->
          <div class="overflow-x-auto border border-black dark:border-white rounded-lg mt-2">
            <table class="w-full text-xs text-left border-collapse table-fixed min-w-[500px]">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-black dark:border-white">
                  <th class="py-2.5 px-3 w-[45%] font-bold text-black dark:text-white">Mục chi phí</th>
                  <th class="text-right py-2.5 px-3 w-[20%] font-bold text-black dark:text-white">Đơn giá</th>
                  <th class="text-center py-2.5 px-3 w-[12%] font-bold text-black dark:text-white">SL</th>
                  <th class="text-right py-2.5 px-3 w-[23%] font-bold text-black dark:text-white">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/30 dark:divide-white/30">
                <!-- Tiền phòng -->
                <tr>
                  <td class="py-3 px-3 text-black dark:text-white">
                    <strong>Tiền thuê phòng</strong>
                  </td>
                  <td class="text-right py-3 px-3 text-black dark:text-white">{{ formatMoney(invoice.contract?.contractedRoomPrice) }} đ</td>
                  <td class="text-center py-3 px-3 text-black dark:text-white">1</td>
                  <td class="text-right py-3 px-3 font-bold text-black dark:text-white">{{ formatMoney(invoice.roomPrice) }} đ</td>
                </tr>

                <!-- Tiền điện -->
                <tr>
                  <td class="py-3 px-3 text-black dark:text-white">
                    <strong>Tiền điện tiêu thụ</strong>
                    <div class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Chỉ số: {{ invoice.newElectricityIndex }} - {{ invoice.oldElectricityIndex }} ({{ invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh)
                    </div>
                  </td>
                  <td class="text-right py-3 px-3 text-black dark:text-white">{{ formatMoney(invoice.electricityRate) }} đ</td>
                  <td class="text-center py-3 px-3 text-black dark:text-white">{{ invoice.newElectricityIndex - invoice.oldElectricityIndex }}</td>
                  <td class="text-right py-3 px-3 font-bold text-black dark:text-white">
                    {{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex) * invoice.electricityRate) }} đ
                  </td>
                </tr>

                <!-- Tiền nước -->
                <tr>
                  <td class="py-3 px-3 text-black dark:text-white">
                    <strong>Tiền nước tiêu thụ</strong>
                    <div v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'" class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Chỉ số: {{ invoice.newWaterIndex }} - {{ invoice.oldWaterIndex }} ({{ invoice.newWaterIndex - invoice.oldWaterIndex }} m³)
                    </div>
                    <div v-else class="text-[10px] text-text-sub dark:text-slate-400 mt-0.5">
                      Tính cố định theo {{ invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON' ? 'đầu người' : 'phòng' }}
                    </div>
                  </td>
                  <td class="text-right py-3 px-3 text-black dark:text-white">{{ formatMoney(invoice.waterRate) }} đ</td>
                  <td class="text-center py-3 px-3 text-black dark:text-white">
                    <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">{{ invoice.newWaterIndex - invoice.oldWaterIndex }}</span>
                    <span v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">{{ invoice.contract?.numberOfTenants }}</span>
                    <span v-else>1</span>
                  </td>
                  <td class="text-right py-3 px-3 font-bold text-black dark:text-white">
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
                  <td class="py-3 px-3 text-black dark:text-white">
                    <strong>{{ item.name }}</strong>
                  </td>
                  <td class="text-right py-3 px-3 text-black dark:text-white">{{ formatMoney(item.price) }} đ</td>
                  <td class="text-center py-3 px-3 text-black dark:text-white">{{ item.quantity }}</td>
                  <td class="text-right py-3 px-3 font-bold text-black dark:text-white">{{ formatMoney(item.subtotal) }} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total amounts details -->
          <div class="border-t border-black dark:border-white pt-4 text-xs sm:text-sm flex justify-end">
            <div class="w-full sm:w-[50%] space-y-2">
              <div class="flex justify-between font-semibold text-black dark:text-white">
                <span>Tổng chi phí:</span>
                <span>{{ formatMoney(invoice.totalAmount) }} đ</span>
              </div>
              <div class="flex justify-between text-black dark:text-white">
                <span>Đã đóng:</span>
                <span class="font-medium text-green-600">{{ formatMoney(invoice.paidAmount) }} đ</span>
              </div>
              <div class="flex justify-between font-extrabold border-t border-dashed border-black/40 dark:border-white/40 pt-2 text-black dark:text-white">
                <span>Còn nợ cần thu:</span>
                <span class="text-rose-600">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signature section -->
        <div class="signature-section mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs sm:text-sm font-serif text-black dark:text-white">
          <div>
            <h5 class="font-bold uppercase">NGƯỜI LẬP PHIẾU</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-8">{{ invoice.contract?.room?.boardingHouse?.landlord?.fullName || 'Chủ trọ' }}</div>
          </div>
          <div>
            <h5 class="font-bold uppercase">NGƯỜI NỘP TIỀN</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-8">{{ invoice.contract?.tenant?.fullName }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Record Payment Modal -->
    <Modal v-if="showPayModal" title="Ghi Nhận Thanh Toán" maxWidth="sm" @close="closePayModal">
      <p class="text-xs text-text-sub mb-5">
        Phòng {{ invoice.contract?.room?.roomNumber }} - Tổng nợ: <span class="font-bold text-danger">{{
          formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
      </p>

      <form @submit.prevent="submitPayment">
        <div class="mb-6">
          <FormInput
            type="number"
            label="Số tiền khách đóng (VNĐ)"
            v-model="payForm.paidAmount"
            :max="invoice.totalAmount - invoice.paidAmount"
            min="1000"
            required
          />
        </div>

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closePayModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Xác nhận</FormButton>
        </div>
      </form>
    </Modal>
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

.signature-section > div {
  width: 45% !important;
  text-align: center !important;
}
</style>
