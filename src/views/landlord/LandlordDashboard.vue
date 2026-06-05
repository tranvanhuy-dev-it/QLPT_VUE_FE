<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải thông tin thống kê...</span>
    </div>

    <template v-else>
      <!-- Welcome Banner -->
      <div class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 md:p-6 rounded-2xl mb-4 shadow-md shadow-indigo-500/20">
        <!-- Glow effect inside banner -->
        <div class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none"></div>

        <div class="relative z-10">
          <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">{{ greeting }}</span>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Tổng Quan Hệ Thống</h1>
          <p class="text-sm opacity-85 mt-1">Thống kê hoạt động kinh doanh phòng trọ của bạn</p>
        </div>
        <div class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ currentDate }}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <!-- Card 1: Boarding Houses -->
        <div class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-indigo-600 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Dãy trọ</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.boardingHousesCount }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Đang quản lý</span>
          </div>
        </div>

        <!-- Card 2: Rooms -->
        <div class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-blue-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/35 text-blue-500 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Tổng phòng trọ</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.roomsCount }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Đang thuê {{ stats.occupiedRooms }} · Trống {{ stats.vacantRooms }}</span>
          </div>
        </div>

        <!-- Card 3: Active Contracts -->
        <div class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-500 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Hợp đồng hoạt động</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.activeContracts }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Có người ở</span>
          </div>
        </div>

        <!-- Card 4: Unpaid Invoices -->
        <div class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-rose-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/35 text-rose-500 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Hóa đơn chưa đóng</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.unpaidInvoicesCount }}</h2>
            <span class="text-xs font-semibold text-rose-500 mt-1.5 truncate">Nợ {{ formatMoney(stats.unpaidAmount) }} đ</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Performance Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Occupancy Performance Card -->
        <div class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-[1.05rem] font-bold text-text-main mb-1">Hiệu Suất Cho Thuê</h3>
            <p class="text-xs text-text-sub mb-6">Tỷ lệ phòng có người ở trong toàn bộ hệ thống</p>
          </div>
          <div class="text-center my-4">
            <div class="text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text leading-none drop-shadow-[0_4px_12px_rgba(59,130,246,0.15)]">
              {{ occupancyRate }}%
            </div>
            <div class="text-[0.8rem] text-text-sub mt-2 font-medium">
              Phòng đã được cho thuê
            </div>
          </div>
          <div class="w-full mt-4">
            <div class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
              <div :style="{ width: occupancyRate + '%' }" class="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-750 ease-out shadow-xs shadow-blue-500/30"></div>
            </div>
            <div class="flex justify-between text-[0.75rem] text-text-sub font-medium">
              <span>{{ stats.occupiedRooms }} phòng đang ở</span>
              <span>{{ stats.roomsCount }} tổng phòng</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="lg:col-span-2 bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-[1.05rem] font-bold text-text-main mb-1">Thao Tác Nhanh</h3>
            <p class="text-xs text-text-sub mb-6">Truy cập nhanh các chức năng quản trị chính</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
            <div @click="navigateTo('/landlord/boarding-houses')" class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Cấu hình Dãy trọ</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Quản lý khu trọ & đơn giá dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/rooms')" class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Quản Lý Phòng Trọ</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Tạo phòng, cài đặt số điện nước đầu</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/contracts')" class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Hợp Đồng Thuê</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Ký kết hợp đồng, thiết lập dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/invoices')" class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Lập Hóa Đơn Tháng</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Ghi số điện nước, thu tiền phòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Phòng trống -->
        <div class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4">
          <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px] text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 class="text-[1.05rem] font-bold text-text-main">Danh sách phòng trống</h3>
            </div>
            <span class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-blue-50 text-blue-600 px-2">{{ vacantRoomList.length }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-text-main border-collapse">
              <thead>
                <tr class="border-b border-border-main">
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Số phòng</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Dãy trọ</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase text-right">Giá thuê</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in vacantRoomList" :key="room.id" class="border-b border-border-main/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td class="py-3 font-semibold text-primary">Phòng {{ room.roomNumber }}</td>
                  <td class="py-3 text-text-sub">{{ room.boardingHouse.name }}</td>
                  <td class="py-3 text-right font-semibold text-text-main">{{ formatMoney(room.basePrice) }} đ</td>
                </tr>
                <tr v-if="vacantRoomList.length === 0">
                  <td colspan="3" class="text-center text-text-sub py-8">
                    Tất cả phòng đều đã có người thuê
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hóa đơn nợ -->
        <div class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4">
          <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px] text-danger"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 class="text-[1.05rem] font-bold text-text-main">Hóa đơn chờ thanh toán</h3>
            </div>
            <span class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-red-50 text-red-600 px-2">{{ unpaidInvoiceList.length }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-text-main border-collapse">
              <thead>
                <tr class="border-b border-border-main">
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Phòng</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Kỳ hóa đơn</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase text-right">Tổng cộng</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase text-right">Đã đóng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in unpaidInvoiceList" :key="invoice.id" class="border-b border-border-main/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td class="py-3 font-semibold text-text-main">Phòng {{ invoice.contract.room.roomNumber }}</td>
                  <td class="py-3 text-xs text-text-sub">
                    {{ formatDate(invoice.billingPeriodStart) }} – {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td class="py-3 text-right font-semibold text-danger">{{ formatMoney(invoice.totalAmount) }} đ</td>
                  <td class="py-3 text-right font-semibold text-success">{{ formatMoney(invoice.paidAmount) }} đ</td>
                </tr>
                <tr v-if="unpaidInvoiceList.length === 0">
                  <td colspan="4" class="text-center text-text-sub py-8">
                    Không có hóa đơn nợ — Tuyệt vời!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script src="./LandlordDashboard.js"></script>
