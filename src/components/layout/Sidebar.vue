<template>
  <aside class="hidden lg:flex w-[260px] bg-card border-r border-border-main flex-col h-[100dvh] sticky top-0 inset-y-0 left-0 shrink-0 z-50">
    <!-- Brand Header -->
    <div class="flex items-center justify-between p-6 pb-5">
      <div class="flex items-center gap-3">
        <img src="/logo.ico" alt="Logo" class="w-[38px] h-[38px] rounded-lg object-contain" />
        <div class="flex flex-col">
          <h3 class="text-[1rem] font-bold text-primary leading-tight">Nhà Trọ Thông Minh</h3>
          <p class="text-xs text-text-sub">Quản lý nhà trọ thông minh</p>
        </div>
      </div>
    </div>

    <!-- Menu Items based on Role -->
    <nav class="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
      <!-- Landlord Navigation -->
      <template v-if="role === 'LANDLORD'">
        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">TỔNG QUAN</div>
        <router-link v-for="item in landlordGeneral" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item"
          @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon"
            v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>

        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">QUẢN LÝ</div>
        <router-link v-for="item in landlordManage" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item"
          @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon"
            v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>

      <!-- Tenant Navigation -->
      <template v-if="role === 'TENANT'">
        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">DỊCH VỤ CƯ DÂN
        </div>
        <router-link v-for="item in tenantGeneral" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item"
          @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon"
            v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>

      <!-- Admin Navigation -->
      <template v-if="role === 'ADMIN'">
        <div class="text-[0.65rem] font-bold text-text-sub px-3 pt-4 pb-1.5 uppercase tracking-wider">HỆ THỐNG</div>
        <router-link v-for="item in adminGeneral" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all duration-150 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 nav-item"
          @click="closeSidebar">
          <span class="flex items-center justify-center text-text-sub w-[1.15rem] h-[1.15rem] nav-icon"
            v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>


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
