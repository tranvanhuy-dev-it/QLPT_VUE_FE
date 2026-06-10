<template>
  <div class="p-4 bg-bg-main min-h-full dashboard-page">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải thông tin thống kê...</span>
    </div>

    <template v-else>
      <!-- Welcome Banner -->
      <div
        class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 md:p-6 rounded-2xl mb-4 shadow-md shadow-indigo-500/20">
        <!-- Glow effect inside banner -->
        <div
          class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none">
        </div>

        <div class="relative z-10">
          <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">{{ greeting }}</span>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Tổng quan hệ thống</h1>
          <p class="text-sm opacity-85 mt-1">Thống kê hoạt động kinh doanh phòng trọ của bạn</p>
        </div>
        <div
          class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
          <AppIcon name="calendar" size="sm" />
          {{ currentDate }}
        </div>
      </div>

      <!-- Date Filter & Revenue Report -->
      <div class="bg-card border border-border-main rounded-2xl p-4 mb-4 shadow-xs flex flex-col gap-4">
        <!-- Date Selector Row -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-3">
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <h3 class="text-sm font-bold text-text-main">
              Thống Kê Doanh Thu & Công Nợ
              <span v-if="filterStartDate || filterEndDate" class="text-xs font-semibold text-primary pl-1.5">(Theo kỳ
                lọc)</span>
              <span v-else class="text-xs font-semibold text-text-sub pl-1.5">(Tất cả thời gian)</span>
            </h3>
          </div>
          <div class="flex items-center gap-2 min-w-0">
            <div class="flex-1 min-w-0 text-xs">
              <FormInput type="date" label="Từ ngày" v-model="filterStartDate" class="!mb-0" />
            </div>
            <div class="flex-1 min-w-0 text-xs">
              <FormInput type="date" label="Đến ngày" v-model="filterEndDate" class="!mb-0" />
            </div>
          </div>
        </div>

        <!-- Period Statistics & Chart Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left: Statistics list -->
          <div class="flex flex-col gap-3 lg:col-span-1">
            <!-- Revenue Collected -->
            <div
              class="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main/80 rounded-xl p-3 flex-1">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-green-50 dark:bg-green-950/30 text-green-600">
                <AppIcon name="check-circle" size="md" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Doanh thu thực tế (Đã
                  thu)</span>
                <h3 class="text-base font-extrabold text-green-600 dark:text-green-400 leading-none mt-1">{{
                  formatMoney(revenueStats.actual) }} đ</h3>
                <span class="text-[9px] text-text-sub mt-0.5 font-medium">Đã thanh toán từ {{ revenueStats.count }} hóa
                  đơn</span>
              </div>
            </div>

            <!-- Expected Revenue -->
            <div
              class="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main/80 rounded-xl p-3 flex-1">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/30 text-primary">
                <AppIcon name="currency" size="md" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Tổng doanh thu dự
                  kiến</span>
                <h3 class="text-base font-extrabold text-primary leading-none mt-1">{{
                  formatMoney(revenueStats.expected) }} đ</h3>
                <span class="text-[9px] text-text-sub mt-0.5 font-medium">Tổng số tiền cần thu</span>
              </div>
            </div>

            <!-- Unpaid / Debt in Period -->
            <div
              class="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main/80 rounded-xl p-3 flex-1">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                <AppIcon name="exclamation-circle" size="md" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Nợ chưa thu (Công nợ kỳ
                  này)</span>
                <h3 class="text-base font-extrabold text-rose-500 leading-none mt-1">{{ formatMoney(revenueStats.debt)
                  }} đ</h3>
                <span class="text-[9px] text-rose-500/80 font-bold mt-0.5">Số tiền chưa thu được</span>
              </div>
            </div>
          </div>

          <!-- Right: Revenue Bar Chart (SVG-based) -->
          <div
            class="lg:col-span-2 border border-border-main bg-slate-50/30 dark:bg-slate-900/10 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs font-bold text-text-main">Doanh Thu 6 Tháng Gần Nhất</span>
              <div class="flex items-center gap-3 text-[10px]">
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-primary/80 rounded-xs"></span> Dự kiến
                </div>
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-success/80 rounded-xs"></span> Thực thu
                </div>
              </div>
            </div>

            <div v-if="monthlyRevenueData.length === 0"
              class="flex-1 flex items-center justify-center text-xs text-text-sub italic">
              Chưa có dữ liệu hóa đơn để lập biểu đồ
            </div>

            <div v-else class="h-44 w-full flex items-end">
              <svg viewBox="0 0 380 140" class="w-full h-full">
                <!-- Grid lines -->
                <line x1="30" y1="10" x2="370" y2="10" stroke="var(--border-color)" stroke-dasharray="3" />
                <line x1="30" y1="45" x2="370" y2="45" stroke="var(--border-color)" stroke-dasharray="3" />
                <line x1="30" y1="80" x2="370" y2="80" stroke="var(--border-color)" stroke-dasharray="3" />
                <line x1="30" y1="115" x2="370" y2="115" stroke="var(--border-color)" stroke-width="1" />

                <g v-for="(m, idx) in monthlyRevenueData" :key="idx">
                  <!-- Expected Bar -->
                  <rect :x="42 + idx * 56" :y="115 - m.expectedHeightPct" width="14" :height="m.expectedHeightPct"
                    class="fill-primary/70 dark:fill-primary/80 hover:opacity-85 transition-all duration-300" rx="2">
                    <title>Tháng {{ m.label }} - Dự kiến: {{ formatMoney(m.expected) }} đ</title>
                  </rect>
                  <!-- Actual Bar -->
                  <rect :x="58 + idx * 56" :y="115 - m.actualHeightPct" width="14" :height="m.actualHeightPct"
                    class="fill-success/70 dark:fill-success/85 hover:opacity-85 transition-all duration-300" rx="2">
                    <title>Tháng {{ m.label }} - Thực thu: {{ formatMoney(m.actual) }} đ</title>
                  </rect>
                  <!-- Label -->
                  <text :x="57 + idx * 56" y="132" text-anchor="middle" class="text-[9px] font-semibold fill-text-sub">
                    {{ m.label }}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <!-- Card 1: Boarding Houses -->
        <div
          class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-indigo-600 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400">
            <AppIcon name="home" size="lg" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Dãy trọ</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.boardingHousesCount }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Đang quản lý</span>
          </div>
        </div>

        <!-- Card 2: Rooms -->
        <div
          class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-blue-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/35 text-blue-500 dark:text-blue-400">
            <AppIcon name="door" size="lg" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Tổng phòng trọ</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.roomsCount }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Đang thuê {{ stats.occupiedRooms }} · Trống {{
              stats.vacantRooms }}</span>
          </div>
        </div>

        <!-- Card 3: Active Contracts -->
        <div
          class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-500 dark:text-emerald-400">
            <AppIcon name="contract" size="lg" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Hợp đồng hoạt động</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.activeContracts }}</h2>
            <span class="text-xs text-text-sub mt-1.5 truncate">Có người ở</span>
          </div>
        </div>

        <!-- Card 4: Unpaid Invoices -->
        <div
          class="stat-card flex items-center gap-4 bg-card border border-border-main border-l-4 border-l-rose-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/35 text-rose-500 dark:text-rose-400">
            <AppIcon name="invoice" size="lg" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.7rem] text-text-sub font-bold uppercase tracking-wider">Hóa đơn chưa đóng</span>
            <h2 class="text-2xl font-extrabold text-text-main leading-none mt-1">{{ stats.unpaidInvoicesCount }}</h2>
            <span class="text-xs font-semibold text-rose-500 mt-1.5 truncate">Nợ {{ formatMoney(stats.unpaidAmount) }}
              đ</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Performance Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Occupancy Performance Card -->
        <div
          class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-[1.05rem] font-bold text-text-main mb-1">Hiệu Suất Cho Thuê</h3>
            <p class="text-xs text-text-sub mb-4">Tỷ lệ phòng có người ở trong toàn bộ hệ thống</p>
          </div>
          <div class="flex items-center justify-around my-2 gap-4">
            <!-- SVG Donut Chart -->
            <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 80 80" class="w-full h-full transform -rotate-90">
                <!-- Track -->
                <circle cx="40" cy="40" r="36" stroke="var(--border-color)" stroke-width="6" fill="transparent" />
                <!-- Fill -->
                <circle cx="40" cy="40" r="36" stroke="url(#occupancy-gradient)" stroke-width="7" fill="transparent"
                  stroke-dasharray="226.19" :stroke-dashoffset="occupancyCircleDashoffset" stroke-linecap="round"
                  class="transition-all duration-1000 ease-out" />
                <!-- Gradients def -->
                <defs>
                  <linearGradient id="occupancy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <!-- Center Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xl font-black text-text-main leading-none">{{ occupancyRate }}%</span>
                <span class="text-[8px] text-text-sub font-bold uppercase tracking-wider mt-1">Đã Thuê</span>
              </div>
            </div>

            <!-- Statistics Legends -->
            <div class="flex flex-col gap-2.5 text-xs">
              <div class="flex items-start gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ stats.occupiedRooms }} phòng</span>
                  <span class="text-[10px] text-text-sub">Đang thuê</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ stats.vacantRooms }} phòng</span>
                  <span class="text-[10px] text-text-sub">Đang trống</span>
                </div>
              </div>
              <div class="flex items-start gap-2 border-t border-border-main/40 pt-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ stats.roomsCount }} phòng</span>
                  <span class="text-[10px] text-text-sub">Tổng số phòng</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="w-full mt-3 border-t border-border-main/40 pt-3 flex items-center justify-between text-[11px] text-text-sub font-medium">
            <span>Tỷ lệ phòng trống:</span>
            <span class="font-bold text-text-main">{{ Math.max(0, 100 - occupancyRate) }}%</span>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div
          class="lg:col-span-2 bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-[1.05rem] font-bold text-text-main mb-1">Thao Tác Nhanh</h3>
            <p class="text-xs text-text-sub mb-6">Truy cập nhanh các chức năng quản trị chính</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
            <div @click="navigateTo('/landlord/boarding-houses')"
              class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div
                class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <AppIcon name="building" size="lg" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Cấu hình Dãy trọ</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Quản lý khu trọ & đơn giá dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/rooms')"
              class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div
                class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <AppIcon name="room" size="lg" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Quản Lý Phòng Trọ</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Tạo phòng, cài đặt số điện nước đầu</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/contracts')"
              class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div
                class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <AppIcon name="contract-alt" size="lg" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Hợp Đồng Thuê</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Ký kết hợp đồng, thiết lập dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/invoices')"
              class="flex items-center gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-border-main rounded-xl cursor-pointer hover:bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-xs transition-all duration-200 group">
              <div
                class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <AppIcon name="invoice-alt" size="lg" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-[0.9rem] text-text-main">Lập Hóa Đơn Tháng</span>
                <span class="text-[0.725rem] text-text-sub leading-normal">Ghi số điện nước, thu tiền phòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Invoices Section -->
      <div
        class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 mb-4">
        <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
          <div class="flex items-center gap-2">
            <AppIcon name="clock" class="text-rose-500 !w-[18px] !h-[18px]" />
            <h3 class="text-[1.05rem] font-bold text-text-main">Hợp đồng đã quá hạn lập hóa đơn</h3>
          </div>
          <span
            class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 px-2">{{
              upcomingBillingContracts.length }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead>
              <tr class="border-b border-border-main">
                <th class="py-3 font-semibold text-text-sub text-xs uppercase">Phòng</th>
                <th class="py-3 font-semibold text-text-sub text-xs uppercase">Dãy trọ</th>
                <th class="py-3 font-semibold text-text-sub text-xs uppercase">Ngày đến hạn</th>
                <th class="py-3 font-semibold text-text-sub text-xs uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in upcomingBillingContracts" :key="item.id"
                class="border-b border-border-main/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                <td class="py-3 font-semibold text-primary">Phòng {{ item.roomNumber }}</td>
                <td class="py-3 text-text-sub">{{ item.boardingHouseName }}</td>
                <td class="py-3 font-semibold text-text-main">{{ formatFullDate(item.dueDate) }}</td>
                <td class="py-3 text-right">
                  <FormButton
                    @click="navigateTo({ path: '/landlord/invoices', query: { createForContractId: item.id } })"
                    size="sm" class="flex items-center gap-1 ml-auto">
                    <AppIcon name="plus" size="xs" />
                    Lập hóa đơn
                  </FormButton>
                </td>
              </tr>
              <tr v-if="upcomingBillingContracts.length === 0">
                <td colspan="6" class="text-center text-text-sub py-8">
                  Không có hợp đồng nào bị quá hạn lập hóa đơn.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Phòng trống -->
        <div
          class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4">
          <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
            <div class="flex items-center gap-2">
              <AppIcon name="check-circle" class="text-primary !w-[18px] !h-[18px]" />
              <h3 class="text-[1.05rem] font-bold text-text-main">Danh sách phòng trống</h3>
            </div>
            <span
              class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-blue-50 text-blue-600 px-2">{{
                vacantRoomList.length }}</span>
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
                <tr v-for="room in vacantRoomList" :key="room.id"
                  class="border-b border-border-main/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
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
        <div
          class="bg-card border border-border-main rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4">
          <div class="flex justify-between items-center mb-4 border-b border-border-main pb-3">
            <div class="flex items-center gap-2">
              <AppIcon name="exclamation-triangle" class="text-danger !w-[18px] !h-[18px]" />
              <h3 class="text-[1.05rem] font-bold text-text-main">Hóa đơn chờ thanh toán</h3>
            </div>
            <span
              class="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold bg-red-50 text-red-600 px-2">{{
                filteredUnpaidInvoices.length }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-text-main border-collapse">
              <thead>
                <tr class="border-b border-border-main">
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Phòng</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Dãy trọ</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase">Kỳ hóa đơn</th>
                  <th class="py-3 font-semibold text-text-sub text-xs uppercase text-right">Số tiền nợ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in filteredUnpaidInvoices" :key="invoice.id"
                  @click="navigateTo('/landlord/invoices/' + invoice.id)"
                  class="border-b border-border-main/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer">
                  <td class="py-3 font-semibold text-primary">Phòng {{ invoice.contract.room.roomNumber }}</td>
                  <td class="py-3 text-text-sub">{{ invoice.contract.room.boardingHouse.name }}</td>
                  <td class="py-3 text-xs text-text-sub">
                    {{ formatDate(invoice.billingPeriodStart) }} – {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td class="py-3 text-right font-semibold text-danger">{{ formatMoney(invoice.totalAmount -
                    invoice.paidAmount) }} đ</td>
                </tr>
                <tr v-if="filteredUnpaidInvoices.length === 0">
                  <td colspan="4" class="text-center text-text-sub py-8">
                    Không có hóa đơn nợ trong kỳ này — Tuyệt vời!
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
