<template>
  <div class="p-4 bg-bg-main min-h-full">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-medium">Đang tổng hợp dữ liệu doanh thu...</span>
    </div>

    <template v-else>

      <!-- ===== HEADER BANNER ===== -->
      <div
        class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center
                  bg-gradient-to-br from-violet-600 to-indigo-500 text-white p-4 md:p-6 rounded-2xl mb-4 shadow-md shadow-violet-500/20">
        <div
          class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none">
        </div>
        <div class="relative z-10 flex-1">
          <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">Chủ trọ · Tài chính</span>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Báo cáo Doanh thu</h1>
          <p class="text-sm opacity-85 mt-1">Thống kê thu nhập theo phòng và hợp đồng thuê</p>
        </div>
        <div
          class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ currentDate }}
        </div>
      </div>

      <!-- ===== FILTER ROW ===== -->
      <div class="bg-card border border-border-main rounded-2xl p-4 mb-4 shadow-xs flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <h3 class="text-sm font-bold text-text-main">
              Thống Kê Doanh Thu
              <span v-if="filterStartDate || filterEndDate" class="text-xs font-semibold text-primary pl-1.5">(Theo kỳ
                lọc)</span>
              <span v-else class="text-xs font-semibold text-text-sub pl-1.5">(Tất cả thời gian)</span>
            </h3>
          </div>
          <div class="w-full sm:w-48 text-xs">
            <FormSelect v-model="filterOption" size="sm" class="!w-full">
              <option value="all">Tất cả thời gian</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="6months">6 tháng</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chỉnh</option>
            </FormSelect>
          </div>
        </div>

        <transition name="fade-slide">
          <div v-if="filterOption === 'custom'" class="grid grid-cols-2 gap-2">
            <FormInput type="date" label="Từ ngày" v-model="filterStartDate" class="!mb-0" />
            <FormInput type="date" label="Đến ngày" v-model="filterEndDate" class="!mb-0" />
          </div>
        </transition>

        <!-- Dãy trọ filter pills -->
        <div v-if="allBoardingHouses.length > 1" class="flex gap-2 flex-wrap">
          <button @click="selectedBoardingHouseId = 'all'"
            class="text-xs px-3 py-1.5 rounded-full font-semibold border transition-all duration-150" :class="selectedBoardingHouseId === 'all'
              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
              : 'bg-card border-border-main text-text-sub hover:border-primary/40 hover:text-primary'">
            Tất cả
          </button>
          <button v-for="bh in allBoardingHouses" :key="bh.id" @click="selectedBoardingHouseId = bh.id"
            class="text-xs px-3 py-1.5 rounded-full font-semibold border transition-all duration-150" :class="selectedBoardingHouseId === bh.id
              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
              : 'bg-card border-border-main text-text-sub hover:border-primary/40 hover:text-primary'">
            {{ bh.name }}
          </button>
        </div>
      </div>

      <!-- ===== SUMMARY STATS CARDS ===== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <!-- Đã thu -->
        <div
          class="flex items-center gap-3 bg-card border border-border-main border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Doanh thu thực tế (Đã
              thu)</span>
            <h2 class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-1">{{
              formatMoney(summaryStats.totalPaid) }} đ</h2>
            <span class="text-[9px] text-text-sub mt-0.5 font-medium">{{ summaryStats.paidCount }}/{{ summaryStats.total
            }} hóa đơn đã thanh toán</span>
          </div>
        </div>

        <!-- Phải thu -->
        <div
          class="flex items-center gap-3 bg-card border border-border-main border-l-4 border-l-indigo-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Tổng doanh thu dự kiến</span>
            <h2 class="text-xl font-extrabold text-primary leading-none mt-1">{{ formatMoney(summaryStats.totalExpected)
            }} đ</h2>
            <span class="text-[9px] text-text-sub mt-0.5 font-medium">Tổng số tiền cần thu trong kỳ</span>
          </div>
        </div>

        <!-- Còn nợ -->
        <div
          class="flex items-center gap-3 bg-card border border-border-main border-l-4 border-l-rose-500 rounded-xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/35 text-rose-500">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Nợ chưa thu (Công nợ)</span>
            <h2 class="text-xl font-extrabold text-rose-500 leading-none mt-1">{{ formatMoney(summaryStats.totalDebt) }}
              đ</h2>
            <span class="text-[9px] text-rose-500/80 font-bold mt-0.5">{{ summaryStats.unpaidCount }} hóa đơn chưa
              thu</span>
          </div>
        </div>
      </div>

      <!-- ===== CHART + TỶ LỆ ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Bar chart -->
        <div
          class="lg:col-span-2 border border-border-main bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold text-text-main">Doanh Thu 6 Tháng Gần Nhất</span>
            <div class="flex items-center gap-3 text-[10px]">
              <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-primary/70 rounded-sm"></span> Dự kiến
              </div>
              <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-emerald-500/70 rounded-sm"></span> Thực
                thu</div>
            </div>
          </div>
          <div v-if="monthlyChartData.every(m => m.expected === 0)"
            class="flex-1 flex items-center justify-center text-xs text-text-sub italic">
            Chưa có dữ liệu hóa đơn để lập biểu đồ
          </div>
          <div v-else class="h-44 w-full flex items-end">
            <svg viewBox="0 0 380 140" class="w-full h-full">
              <line x1="30" y1="10" x2="370" y2="10" stroke="var(--border-color)" stroke-dasharray="3" />
              <line x1="30" y1="45" x2="370" y2="45" stroke="var(--border-color)" stroke-dasharray="3" />
              <line x1="30" y1="80" x2="370" y2="80" stroke="var(--border-color)" stroke-dasharray="3" />
              <line x1="30" y1="115" x2="370" y2="115" stroke="var(--border-color)" stroke-width="1" />
              <g v-for="(m, idx) in monthlyChartData" :key="idx">
                <rect :x="42 + idx * 56" :y="115 - m.expectedPct * 1.15" width="14"
                  :height="Math.max(m.expectedPct * 1.15, 0)"
                  class="fill-primary/70 dark:fill-primary/80 hover:opacity-85 transition-all duration-300" rx="2">
                  <title>{{ m.label }} - Dự kiến: {{ formatMoney(m.expected) }} đ</title>
                </rect>
                <rect :x="58 + idx * 56" :y="115 - m.paidPct * 1.15" width="14" :height="Math.max(m.paidPct * 1.15, 0)"
                  class="fill-emerald-500/70 dark:fill-emerald-500/85 hover:opacity-85 transition-all duration-300"
                  rx="2">
                  <title>{{ m.label }} - Thực thu: {{ formatMoney(m.paid) }} đ</title>
                </rect>
                <text :x="57 + idx * 56" y="132" text-anchor="middle" class="text-[9px] font-semibold fill-text-sub">{{
                  m.label }}</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Tỷ lệ thu tiền donut -->
        <div class="bg-card border border-border-main rounded-2xl shadow-xs p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-[1.05rem] font-bold text-text-main mb-1">Tỷ Lệ Thu Tiền</h3>
            <p class="text-xs text-text-sub mb-4">Tỷ lệ hóa đơn đã thanh toán</p>
          </div>
          <div class="flex items-center justify-around my-2 gap-4">
            <!-- Donut -->
            <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 80 80" class="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="var(--border-color)" stroke-width="6" fill="transparent" />
                <circle cx="40" cy="40" r="36" :stroke="payRateColor" stroke-width="7" fill="transparent"
                  stroke-dasharray="226.19" :stroke-dashoffset="226.19 - (226.19 * collectionRate / 100)"
                  stroke-linecap="round" class="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="rev-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xl font-black text-text-main leading-none">{{ collectionRate }}%</span>
                <span class="text-[8px] text-text-sub font-bold uppercase tracking-wider mt-1">Đã Thu</span>
              </div>
            </div>
            <div class="flex flex-col gap-2.5 text-xs">
              <div class="flex items-start gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ summaryStats.paidCount }} hóa đơn</span>
                  <span class="text-[10px] text-text-sub">Đã thanh toán</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ summaryStats.unpaidCount }} hóa đơn</span>
                  <span class="text-[10px] text-text-sub">Chưa thanh toán</span>
                </div>
              </div>
              <div class="flex items-start gap-2 border-t border-border-main/40 pt-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1 shrink-0"></div>
                <div class="flex flex-col">
                  <span class="font-bold text-text-main leading-tight">{{ summaryStats.total }} hóa đơn</span>
                  <span class="text-[10px] text-text-sub">Tổng trong kỳ</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="w-full mt-3 border-t border-border-main/40 pt-3 flex items-center justify-between text-[11px] text-text-sub font-medium">
            <span>Còn nợ:</span>
            <span class="font-bold" :class="summaryStats.totalDebt > 0 ? 'text-rose-500' : 'text-text-main'">{{
              formatMoney(summaryStats.totalDebt) }} đ</span>
          </div>
        </div>
      </div>

      <!-- ===== TABS: THEO PHÒNG / THEO HỢP ĐỒNG ===== -->
      <div class="bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden mb-4">
        <!-- Tab header -->
        <div class="flex border-b border-border-main">
          <button @click="activeTab = 'room'"
            class="flex-1 py-3 px-4 text-sm font-semibold transition-colors duration-150" :class="activeTab === 'room'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-text-sub hover:text-text-main'">
            Theo phòng
          </button>
          <button @click="activeTab = 'contract'"
            class="flex-1 py-3 px-4 text-sm font-semibold transition-colors duration-150" :class="activeTab === 'contract'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-text-sub hover:text-text-main'">
            Theo hợp đồng
          </button>
        </div>

        <!-- Sort bar -->
        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border-main/50 bg-bg-main/40 flex-wrap">
          <span class="text-xs text-text-sub font-medium">Sắp xếp:</span>
          <button @click="setSort('revenue')"
            class="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150"
            :class="sortKey === 'revenue' ? 'bg-primary text-white shadow-sm' : 'bg-card border border-border-main text-text-sub hover:text-primary'">
            Đã thu{{ sortKey === 'revenue' ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '' }}
          </button>
          <button @click="setSort('expected')"
            class="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150"
            :class="sortKey === 'expected' ? 'bg-primary text-white shadow-sm' : 'bg-card border border-border-main text-text-sub hover:text-primary'">
            Phải thu{{ sortKey === 'expected' ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '' }}
          </button>
          <button @click="setSort('debt')"
            class="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150"
            :class="sortKey === 'debt' ? 'bg-primary text-white shadow-sm' : 'bg-card border border-border-main text-text-sub hover:text-primary'">
            Còn nợ{{ sortKey === 'debt' ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '' }}
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="activeRows.length === 0" class="py-16 text-center text-text-sub text-sm italic">
          Không có dữ liệu hóa đơn trong khoảng thời gian đã chọn.
        </div>

        <!-- ===== DESKTOP TABLE (lg+) ===== -->
        <div v-if="activeRows.length > 0" class="hidden lg:block overflow-x-auto">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Phòng</th>
                <th v-if="activeTab === 'contract'" class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Khách thuê / Bắt đầu</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Dãy trọ</th>
                <th
                  class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right cursor-pointer hover:text-primary"
                  @click="setSort('expected')">
                  Phải thu <span v-if="sortKey === 'expected'">{{ sortDir === 'desc' ? '↓' : '↑' }}</span>
                </th>
                <th
                  class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right cursor-pointer hover:text-primary"
                  @click="setSort('revenue')">
                  Đã thu <span v-if="sortKey === 'revenue'">{{ sortDir === 'desc' ? '↓' : '↑' }}</span>
                </th>
                <th
                  class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right cursor-pointer hover:text-primary"
                  @click="setSort('debt')">
                  Còn nợ <span v-if="sortKey === 'debt'">{{ sortDir === 'desc' ? '↓' : '↑' }}</span>
                </th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-center">Tỷ lệ</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-center">HĐ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in activeRows" :key="row.roomId || row.contractId"
                @click="activeTab === 'contract' && goToContract(row.contractId)"
                class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150"
                :class="activeTab === 'contract' ? 'cursor-pointer group' : ''">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                      :class="activeTab === 'room' ? 'bg-primary/10 text-primary' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'">
                      {{ row.roomNumber }}
                    </span>
                    <span v-if="activeTab === 'contract'"
                      class="font-semibold text-text-main group-hover:text-primary transition-colors">{{ row.tenantName
                      }}</span>
                  </div>
                </td>
                <td v-if="activeTab === 'contract'" class="py-3 px-4 text-text-main">
                  {{ formatDate(row.startDate) }}
                </td>
                <td class="py-3 px-4 text-text-sub">{{ row.boardingHouseName }}</td>
                <td class="py-3 px-4 text-right font-medium text-text-main">{{ formatMoney(row.expected) }}<span
                    class="text-[10px] text-text-sub ml-0.5">đ</span></td>
                <td class="py-3 px-4 text-right font-bold text-emerald-600">{{ formatMoney(row.paid) }}<span
                    class="text-[10px] ml-0.5">đ</span></td>
                <td class="py-3 px-4 text-right font-medium" :class="row.debt > 0 ? 'text-rose-500' : 'text-text-sub'">
                  {{ formatMoney(row.debt) }}<span class="text-[10px] ml-0.5">đ</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <div class="flex items-center gap-2 justify-center">
                    <div class="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                         :class="payRate(row) >= 90 ? 'bg-emerald-500' : payRate(row) >= 60 ? 'bg-amber-400' : 'bg-rose-400'"
                        :style="{ width: payRate(row) + '%' }"></div>
                    </div>
                    <span class="text-xs font-semibold min-w-[30px]" :class="payRateClass(payRate(row))">{{ payRate(row)
                    }}%</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-text-sub px-2 py-0.5 rounded-md">
                    {{ row.paidCount }}/{{ row.invoiceCount }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50/60 dark:bg-slate-900/20 border-t border-border-main">
              <tr>
                <td :colspan="activeTab === 'room' ? 2 : 3" class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">
                  Tổng cộng ({{ activeRows.length }} {{ activeTab === 'room' ? 'phòng' : 'hợp đồng' }})
                </td>
                <td class="py-3 px-4 text-right font-bold text-text-main">{{
                  formatMoney(summaryStats.totalExpected) }}<span class="text-[10px] ml-0.5">đ</span></td>
                <td class="py-3 px-4 text-right font-bold text-emerald-600">{{
                  formatMoney(summaryStats.totalPaid) }}<span class="text-[10px] ml-0.5">đ</span></td>
                <td class="py-3 px-4 text-right font-bold"
                  :class="summaryStats.totalDebt > 0 ? 'text-rose-500' : 'text-text-sub'">
                  {{ formatMoney(summaryStats.totalDebt) }}<span class="text-[10px] ml-0.5">đ</span>
                </td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ===== MOBILE CARDS (< lg) ===== -->
        <div v-if="activeRows.length > 0" class="lg:hidden flex flex-col divide-y divide-border-main/50">
          <div v-for="row in activeRows" :key="row.roomId || row.contractId"
            @click="activeTab === 'contract' && goToContract(row.contractId)"
            class="p-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors"
            :class="activeTab === 'contract' ? 'cursor-pointer' : ''">
            <!-- Header row: room badge + tenant + boarding house -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-10 h-10 rounded-xl text-sm font-black flex items-center justify-center shrink-0"
                  :class="activeTab === 'room' ? 'bg-primary/10 text-primary' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'">
                  {{ row.roomNumber }}
                </span>
                <div>
                  <p v-if="activeTab === 'contract'" class="font-bold text-text-main text-sm leading-tight">{{ row.tenantName }}</p>
                  <p class="font-bold text-text-main text-sm leading-tight" :class="activeTab === 'contract' ? 'text-xs font-semibold text-text-sub mt-0.5' : ''">{{ row.boardingHouseName }}</p>
                  <p v-if="activeTab === 'contract'" class="text-[11px] text-text-sub">Từ {{ formatDate(row.startDate) }}</p>
                </div>
              </div>
              <!-- Status badge for contract -->
              <span v-if="activeTab === 'contract'"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" :class="row.status === 'ACTIVE'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-text-sub'">
                {{ row.status === 'ACTIVE' ? 'Đang thuê' : 'Đã kết thúc' }}
              </span>
            </div>

            <!-- Money row -->
            <div class="grid grid-cols-3 gap-2 mb-2.5">
              <div class="bg-slate-50/60 dark:bg-slate-900/20 rounded-xl p-2.5 text-center">
                <p class="text-[10px] text-text-sub font-medium mb-0.5">Phải thu</p>
                <p class="text-sm font-extrabold text-text-main">{{ formatMoneyShort(row.expected) }}</p>
              </div>
              <div class="bg-emerald-50/60 dark:bg-emerald-900/10 rounded-xl p-2.5 text-center">
                <p class="text-[10px] text-emerald-600 font-medium mb-0.5">Đã thu</p>
                <p class="text-sm font-extrabold text-emerald-600">{{ formatMoneyShort(row.paid) }}</p>
              </div>
              <div class="rounded-xl p-2.5 text-center"
                :class="row.debt > 0 ? 'bg-rose-50/60 dark:bg-rose-900/10' : 'bg-slate-50/60 dark:bg-slate-900/20'">
                <p class="text-[10px] font-medium mb-0.5" :class="row.debt > 0 ? 'text-rose-500' : 'text-text-sub'">Còn
                  nợ</p>
                <p class="text-sm font-extrabold" :class="row.debt > 0 ? 'text-rose-500' : 'text-text-sub'">{{
                  formatMoneyShort(row.debt) }}</p>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                  :class="payRate(row) >= 90 ? 'bg-emerald-500' : payRate(row) >= 60 ? 'bg-amber-400' : 'bg-rose-400'"
                  :style="{ width: payRate(row) + '%' }"></div>
              </div>
              <span class="text-xs font-bold shrink-0" :class="payRateClass(payRate(row))">{{ payRate(row) }}%</span>
              <span class="text-[10px] text-text-sub shrink-0">{{ row.paidCount }}/{{ row.invoiceCount }} HĐ</span>
            </div>
          </div>

          <!-- Mobile total row -->
          <div class="p-4 bg-slate-50/60 dark:bg-slate-900/20">
            <p class="text-xs font-bold text-text-sub uppercase mb-2">Tổng cộng — {{ activeRows.length }} {{ activeTab
              === 'room' ? 'phòng' : 'hợp đồng' }}</p>
            <div class="grid grid-cols-3 gap-2">
              <div class="text-center">
                <p class="text-[10px] text-text-sub">Phải thu</p>
                <p class="text-sm font-extrabold text-text-main">{{ formatMoneyShort(summaryStats.totalExpected) }}</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-emerald-600">Đã thu</p>
                <p class="text-sm font-extrabold text-emerald-600">{{ formatMoneyShort(summaryStats.totalPaid) }}</p>
              </div>
              <div class="text-center">
                <p class="text-[10px]" :class="summaryStats.totalDebt > 0 ? 'text-rose-500' : 'text-text-sub'">Còn nợ
                </p>
                <p class="text-sm font-extrabold"
                  :class="summaryStats.totalDebt > 0 ? 'text-rose-500' : 'text-text-sub'">{{
                    formatMoneyShort(summaryStats.totalDebt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script src="./Revenue.js"></script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
