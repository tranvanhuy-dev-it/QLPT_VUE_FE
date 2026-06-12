<template>
  <div class="p-6 bg-bg-main min-h-full">


    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải thông tin phòng trọ...</span>
    </div>

    <div v-else>
      <!-- Welcome Banner -->
      <div
        class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 md:p-6 rounded-2xl mb-6 shadow-md shadow-indigo-500/20">
        <!-- Glow effect inside banner -->
        <div
          class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none">
        </div>

        <div class="relative z-10">
          <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">{{ greeting }}</span>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Thông tin phòng trọ</h1>
            <span v-if="unpaidInvoices.length > 0"
              class="bg-rose-500/90 backdrop-blur-sm border border-rose-400/30 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm animate-pulse">
              Chưa thanh toán
            </span>
          </div>
          <p v-if="unpaidInvoices.length > 0" class="text-sm text-rose-200 font-medium mt-1 flex items-center gap-1">
            ⚠️ Bạn còn {{ unpaidInvoices.length }} hóa đơn chưa thanh toán.
          </p>
          <p v-else class="text-sm opacity-85 mt-1">Xem chi tiết hợp đồng, hóa đơn và chỉ số dịch vụ của bạn</p>
        </div>
        <div
          class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
          <AppIcon name="calendar" size="sm" />
          {{ currentDate }}
        </div>
      </div>

      <div v-if="!activeContract"
        class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-base font-semibold shadow-xs">
        ⚠️ Hiện tại tài khoản của bạn chưa được gắn vào hợp đồng thuê phòng nào. Vui lòng liên hệ chủ trọ để kích hoạt!
      </div>

      <div v-else class="space-y-6">
        <!-- Room and Landlord Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Room info -->
          <div
            class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-4">📍 Phòng Của Tôi</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Số phòng:</strong>
                  <span>Phòng {{ activeContract.room.roomNumber }}</span>
                </div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Dãy trọ:</strong> <span
                    class="text-text-sub">{{ activeContract.room.boardingHouse.name }}</span></div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Địa chỉ:</strong> <span
                    class="text-text-sub text-right">{{ activeContract.room.boardingHouse.address || 'Chưa cập nhật'
                    }}</span></div>
                <div class="flex justify-between pb-1"><strong>Số người ở:</strong> <span>{{
                  activeContract.numberOfTenants }} người</span></div>
              </div>
            </div>
          </div>

          <!-- Contract Info -->
          <div
            class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-success uppercase tracking-wider mb-4">📄 Chi Tiết Hợp Đồng</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Giá thuê phòng:</strong>
                  <span class="font-bold text-primary">{{ formatMoney(activeContract.contractedRoomPrice) }}
                    đ/tháng</span>
                </div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Tiền đặt cọc:</strong>
                  <span class="font-semibold">{{ formatMoney(activeContract.deposit) }} đ</span>
                </div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Ngày bắt đầu:</strong>
                  <span class="text-text-sub">{{ formatDate(activeContract.startDate) }}</span>
                </div>
                <div class="flex justify-between pb-1"><strong>Kỳ đóng tiền:</strong>
                  <span class="text-text-sub text-right">{{
                    activeContract.billingMode === 'BY_RENTAL_DAYS' ?
                      'Ngày thuê hàng tháng' : `Ngày ${activeContract.fixedBillingDay} hàng tháng` }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Meter Index Info -->
          <div
            class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-text-main uppercase tracking-wider mb-4">🔌 Chỉ Số Hiện Tại</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Điện tiêu thụ:</strong>
                  <span>⚡ {{ activeContract.room.currentElectricityIndex }} kWh</span>
                </div>
                <div v-if="activeContract.room.boardingHouse.waterBillingType === 'BY_INDEX'"
                  class="flex justify-between border-b border-border-main/30 pb-2">
                  <strong>Nước tiêu thụ:</strong> <span>💧 {{ activeContract.room.currentWaterIndex }} m³</span>
                </div>
                <div v-else class="flex justify-between border-b border-border-main/30 pb-2">
                  <strong>Nước (cố định):</strong> <span class="text-text-sub text-right">💧 Theo {{
                    activeContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? 'người' : 'phòng'
                    }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Utilities & Quick Services Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
          <!-- Camera card -->
          <router-link to="/tenant/cameras" class="no-underline bg-card border border-border-main rounded-2xl p-6 shadow-xs flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-text-main group-hover:text-primary transition-colors">Camera giám sát</h4>
                <p class="text-xs text-text-sub mt-0.5 font-medium">Theo dõi an ninh trực tuyến tại dãy trọ của bạn</p>
              </div>
            </div>
            <div class="text-text-sub group-hover:text-primary transition-transform duration-200 group-hover:translate-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </router-link>

          <!-- Direct Chat card -->
          <router-link to="/tenant/contact-landlord" class="no-underline bg-card border border-border-main rounded-2xl p-6 shadow-xs flex items-center justify-between hover:shadow-md hover:border-indigo-500/30 transition-all duration-200 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.497c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-text-main group-hover:text-indigo-600 transition-colors">Nhắn tin cho chủ nhà</h4>
                <p class="text-xs text-text-sub mt-0.5 font-medium">Hỗ trợ, phản ánh và liên hệ trực tiếp 24/7</p>
              </div>
            </div>
            <div class="text-text-sub group-hover:text-indigo-600 transition-transform duration-200 group-hover:translate-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </router-link>
        </div>

        <!-- Unpaid Invoices Section -->
        <div
          class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-6">
          <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
            <div class="flex items-center gap-2">
              <AppIcon name="exclamation-triangle" class="text-rose-500 !w-[18px] !h-[18px]" />
              <h3 class="text-[1.05rem] font-bold text-text-main">Hóa đơn chờ thanh toán</h3>
            </div>
            <span v-if="unpaidInvoices.length > 0"
              class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 px-2">
              {{ unpaidInvoices.length }}
            </span>
          </div>
          <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
            <table class="w-full text-sm text-left text-text-main border-collapse">
              <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
                <tr>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Kỳ hóa đơn</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Ngày xuất</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Còn nợ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in unpaidInvoices" :key="invoice.id" @click="viewInvoiceDetails(invoice.id)"
                  class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors duration-150">
                  <td class="py-3 px-4 font-semibold text-primary flex items-center gap-1.5">
                    <span>{{ formatDate(invoice.billingPeriodStart) }} – {{ formatDate(invoice.billingPeriodEnd) }}</span>
                    <span v-if="invoice.paymentClaimed" class="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shrink-0" title="Chờ xác nhận"></span>
                  </td>
                  <td class="py-3 px-4 text-text-sub">
                    {{ formatDate(invoice.invoiceDate) }}
                  </td>
                  <td class="py-3 px-4 text-right font-semibold text-rose-500">
                    {{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ
                  </td>
                </tr>
                <tr v-if="unpaidInvoices.length === 0">
                  <td colspan="3" class="text-center text-text-sub py-12 italic text-sm">
                    Tuyệt vời! Bạn không có hóa đơn nào chưa thanh toán.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TenantDashboard.js"></script>
