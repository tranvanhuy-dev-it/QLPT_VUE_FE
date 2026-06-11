<template>
  <div class="p-4 sm:p-6 md:p-8 bg-bg-main min-h-full">
    <!-- Welcome Banner -->
    <div
      class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 md:p-6 rounded-2xl mb-6 shadow-md shadow-indigo-500/20">
      <!-- Glow effect inside banner -->
      <div
        class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none">
      </div>

      <div class="relative z-10">
        <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">{{ greeting }}</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Tổng quan hệ thống</h1>
        <p class="text-sm opacity-85 mt-1">Số liệu thống kê chi tiết toàn bộ người dùng và phòng trọ hoạt động.</p>
      </div>
      <div
        class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
        <AppIcon name="calendar" size="sm" />
        {{ currentDate }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-4 text-text-sub">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-semibold">Đang tổng hợp số liệu thống kê...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-center">
      <p class="font-bold">Không thể tải số liệu thống kê</p>
      <p class="text-xs mt-1">{{ error }}</p>
      <button @click="fetchStats" class="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition">Tải lại</button>
    </div>

    <!-- Stats Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Card 1: Users -->
      <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-text-sub uppercase tracking-wider block">Người dùng</span>
            <strong class="text-3xl font-extrabold text-text-main mt-2 block">{{ stats.totalUsers }}</strong>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-main/55 flex justify-between text-[11px] text-text-sub font-medium">
          <span>Chủ trọ: <strong>{{ stats.totalLandlords }}</strong></span>
          <span>Khách thuê: <strong>{{ stats.totalTenants }}</strong></span>
        </div>
      </div>

      <!-- Card 2: Boarding Houses -->
      <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-text-sub uppercase tracking-wider block">Dãy nhà trọ</span>
            <strong class="text-3xl font-extrabold text-text-main mt-2 block">{{ stats.totalBoardingHouses }}</strong>
          </div>
          <div class="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m-1.5-7.75l-4.5 1.636M5.25 21h1.5m12 0h-12" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-main/55 text-[11px] text-text-sub font-medium">
          <span>Trung bình: <strong>{{ avgRoomsPerHouse }}</strong> phòng/dãy</span>
        </div>
      </div>

      <!-- Card 3: Rooms -->
      <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-text-sub uppercase tracking-wider block">Phòng trọ</span>
            <strong class="text-3xl font-extrabold text-text-main mt-2 block">{{ stats.totalRooms }}</strong>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-border-main/55 flex justify-between text-[11px] text-text-sub font-medium">
          <span>Đã thuê: <strong>{{ stats.occupiedRooms }}</strong></span>
          <span>Phòng trống: <strong>{{ stats.totalRooms - stats.occupiedRooms }}</strong></span>
        </div>
      </div>

      <!-- Card 4: Occupancy Rate -->
      <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-text-sub uppercase tracking-wider block">Tỉ lệ lấp đầy</span>
            <strong class="text-3xl font-extrabold text-text-main mt-2 block">{{ stats.occupancyRate }}%</strong>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
        </div>
        
        <!-- Custom Progress Bar -->
        <div class="mt-4 pt-2">
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div 
              class="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              :style="{ width: stats.occupancyRate + '%' }"
            ></div>
          </div>
          <span class="text-[9px] text-text-sub block mt-1">Độ lấp đầy trên toàn hệ thống</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminStats.js"></script>
