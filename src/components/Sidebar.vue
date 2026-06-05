<template>
  <!-- Mobile Sidebar Backdrop Overlay -->
  <div 
    v-if="isSidebarOpen" 
    class="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
    @click="closeSidebar"
  ></div>

  <aside 
    class="w-[260px] bg-card border-r border-border-main flex flex-col h-screen fixed lg:sticky top-0 inset-y-0 left-0 shrink-0 z-50 transition-transform duration-200 ease-in-out lg:translate-x-0"
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Header -->
    <div class="flex items-center justify-between p-6 pb-5">
      <div class="flex items-center gap-3">
        <div class="w-[38px] h-[38px] rounded-lg bg-primary text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path
              d="M11.47 3.822a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06L12 5.06l-8.16 8.16a.75.75 0 01-1.06-1.06l8.69-8.69z" />
            <path
              d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <h3 class="text-[1.05rem] font-bold text-primary leading-tight">Nhà Trọ Thông Minh</h3>
          <p class="text-xs text-text-sub">Quản lý nhà trọ thông minh</p>
        </div>
      </div>
      <!-- Close Sidebar button on mobile -->
      <button 
        @click="closeSidebar" 
        class="lg:hidden p-1 rounded-md text-text-sub hover:bg-slate-100 hover:text-text-main cursor-pointer"
        title="Đóng menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Menu Items based on Role -->
    <nav class="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
      <!-- Landlord Navigation -->
      <template v-if="role === 'LANDLORD'">
        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">TỔNG QUAN</div>
        <router-link v-for="item in landlordGeneral" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item" @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>

        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">QUẢN LÝ</div>
        <router-link v-for="item in landlordManage" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item" @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>

      <!-- Tenant Navigation -->
      <template v-if="role === 'TENANT'">
        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">DỊCH VỤ CƯ DÂN</div>
        <router-link v-for="item in tenantGeneral" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item" @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Footer Profile -->
    <div class="border-t border-border-main p-5 flex items-center gap-3 bg-slate-50 dark:bg-slate-900">
      <div class="w-9 h-9 rounded-full bg-sky-100 text-primary flex items-center justify-center font-bold text-sm">
        <span>{{ userInitial }}</span>
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <div class="text-[0.85rem] font-semibold text-text-main truncate">{{ username || 'Chủ trọ' }}</div>
        <div class="text-[0.7rem] text-text-sub uppercase font-semibold">{{ roleLabel }}</div>
      </div>
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1 rounded-md flex items-center justify-center transition-all duration-150 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-text-main" title="Cài đặt tài khoản">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-[1.1rem] h-[1.1rem]">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<script src="./Sidebar.js"></script>

<style scoped>
.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.router-link-active {
  background-color: rgba(0, 102, 204, 0.08) !important;
  color: var(--primary-color) !important;
  font-weight: 600;
}

.router-link-active .nav-icon {
  color: var(--primary-color) !important;
}
</style>

