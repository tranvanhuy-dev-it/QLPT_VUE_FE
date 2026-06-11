<template>
  <aside
    :class="[
      isSidebarOpen ? 'lg:w-[260px]' : 'lg:w-[76px]',
      'hidden lg:flex sticky top-0 bottom-0 left-0 z-30 bg-gradient-to-b from-[#0a0f1d] via-[#0f172a] to-[#121c35] dark:from-[#151515] dark:via-[#0e0e0e] dark:to-[#0a0a0a] border-r border-slate-800/60 dark:border-border-main flex-col h-[100dvh] transition-all duration-300 rounded-2xl shrink-0'
    ]"
  >
    <!-- Brand Header for Collapsed State -->
    <div
      v-if="!isSidebarOpen"
      class="flex flex-col items-center justify-center gap-4 py-6 px-2 border-b border-slate-900/60 dark:border-border-main transition-all duration-300"
    >
      <img src="/logo.ico" alt="Logo" class="w-[32px] h-[32px] rounded-lg object-contain bg-white/10 p-0.5 shrink-0" />
      <button
        @click="toggleSidebar"
        class="text-slate-400 dark:text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 dark:hover:bg-neutral-800/60 cursor-pointer"
        title="Mở rộng menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Brand Header for Expanded State -->
    <div
      v-else
      class="flex items-center justify-between p-6 pb-5 border-b border-slate-900/60 dark:border-border-main transition-all duration-300"
    >
      <div class="flex items-center gap-3">
        <img src="/logo.ico" alt="Logo" class="w-[38px] h-[38px] rounded-lg object-contain bg-white/10 p-0.5 shrink-0" />
        <div class="flex flex-col animate-fade-in">
          <h3 class="text-[0.95rem] font-extrabold text-white leading-tight tracking-wide whitespace-nowrap">SMART RENT</h3>
          <p class="text-[10px] text-slate-400 dark:text-neutral-400 font-medium whitespace-nowrap">Quản lý nhà trọ thông minh</p>
        </div>
      </div>
      <!-- Hamburger Menu Button to close/collapse Sidebar -->
      <button
        @click="toggleSidebar"
        class="text-slate-400 dark:text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 dark:hover:bg-neutral-800/60 cursor-pointer shrink-0"
        title="Thu gọn menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Menu Items based on Role -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
      <!-- Landlord Navigation -->
      <template v-if="role === 'LANDLORD'">
        <div v-if="isSidebarOpen" class="text-[0.6rem] font-bold text-slate-400 dark:text-neutral-400 px-3 pt-3 pb-1.5 uppercase tracking-wider animate-fade-in">TỔNG QUAN</div>
        <router-link v-for="item in landlordGeneral" :key="item.to" :to="item.to" v-slot="{ isActive, href, navigate }" custom>
          <a
            :href="href"
            @click="navigate"
            class="flex items-center rounded-lg text-xs font-semibold transition-all duration-150 py-2.5 nav-item group"
            :class="[
              isActive 
                ? 'bg-blue-600/20 text-blue-400 border-l-[3px] border-blue-500 rounded-l-none shadow-[inset_4px_0_12px_rgba(59,130,246,0.15)]' 
                : 'text-slate-300 dark:text-neutral-300 hover:bg-slate-800/40 dark:hover:bg-neutral-800/40 hover:text-white',
              isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-0 mx-1'
            ]"
            :title="!isSidebarOpen ? item.label : ''"
          >
            <span class="flex items-center justify-center w-[1.15rem] h-[1.15rem] nav-icon shrink-0 transition-colors"
              :class="isActive ? 'text-blue-400' : 'text-slate-400 dark:text-neutral-400 group-hover:text-white'"
              v-html="item.icon"></span>
            <span v-if="isSidebarOpen" class="nav-text whitespace-nowrap animate-fade-in">{{ item.label }}</span>
          </a>
        </router-link>

        <div v-if="isSidebarOpen" class="text-[0.6rem] font-bold text-slate-400 dark:text-neutral-400 px-3 pt-4 pb-1.5 uppercase tracking-wider animate-fade-in">QUẢN LÝ</div>
        <router-link v-for="item in landlordManage" :key="item.to" :to="item.to" v-slot="{ isActive, href, navigate }" custom>
          <a
            :href="href"
            @click="navigate"
            class="flex items-center rounded-lg text-xs font-semibold transition-all duration-150 py-2.5 nav-item group"
            :class="[
              isActive 
                ? 'bg-blue-600/20 text-blue-400 border-l-[3px] border-blue-500 rounded-l-none shadow-[inset_4px_0_12px_rgba(59,130,246,0.15)]' 
                : 'text-slate-300 dark:text-neutral-300 hover:bg-slate-800/40 dark:hover:bg-neutral-800/40 hover:text-white',
              isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-0 mx-1'
            ]"
            :title="!isSidebarOpen ? item.label : ''"
          >
            <span class="flex items-center justify-center w-[1.15rem] h-[1.15rem] nav-icon shrink-0 transition-colors"
              :class="isActive ? 'text-blue-400' : 'text-slate-400 dark:text-neutral-400 group-hover:text-white'"
              v-html="item.icon"></span>
            <span v-if="isSidebarOpen" class="nav-text whitespace-nowrap animate-fade-in">{{ item.label }}</span>
          </a>
        </router-link>
      </template>

      <!-- Tenant Navigation -->
      <template v-if="role === 'TENANT'">
        <div v-if="isSidebarOpen" class="text-[0.6rem] font-bold text-slate-400 dark:text-neutral-400 px-3 pt-3 pb-1.5 uppercase tracking-wider animate-fade-in">DỊCH VỤ CƯ DÂN</div>
        <router-link v-for="item in tenantGeneral" :key="item.to" :to="item.to" v-slot="{ isActive, href, navigate }" custom>
          <a
            :href="href"
            @click="navigate"
            class="flex items-center rounded-lg text-xs font-semibold transition-all duration-150 py-2.5 nav-item group"
            :class="[
              isActive 
                ? 'bg-blue-600/20 text-blue-400 border-l-[3px] border-blue-500 rounded-l-none shadow-[inset_4px_0_12px_rgba(59,130,246,0.15)]' 
                : 'text-slate-300 dark:text-neutral-300 hover:bg-slate-800/40 dark:hover:bg-neutral-800/40 hover:text-white',
              isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-0 mx-1'
            ]"
            :title="!isSidebarOpen ? item.label : ''"
          >
            <span class="flex items-center justify-center w-[1.15rem] h-[1.15rem] nav-icon shrink-0 transition-colors"
              :class="isActive ? 'text-blue-400' : 'text-slate-400 dark:text-neutral-400 group-hover:text-white'"
              v-html="item.icon"></span>
            <span v-if="isSidebarOpen" class="nav-text whitespace-nowrap animate-fade-in">{{ item.label }}</span>
          </a>
        </router-link>
      </template>

      <!-- Admin Navigation -->
      <template v-if="role === 'ADMIN'">
        <div v-if="isSidebarOpen" class="text-[0.6rem] font-bold text-slate-400 dark:text-neutral-400 px-3 pt-3 pb-1.5 uppercase tracking-wider animate-fade-in">HỆ THỐNG</div>
        <router-link v-for="item in adminGeneral" :key="item.to" :to="item.to" v-slot="{ isActive, href, navigate }" custom>
          <a
            :href="href"
            @click="navigate"
            class="flex items-center rounded-lg text-xs font-semibold transition-all duration-150 py-2.5 nav-item group"
            :class="[
              isActive 
                ? 'bg-blue-600/20 text-blue-400 border-l-[3px] border-blue-500 rounded-l-none shadow-[inset_4px_0_12px_rgba(59,130,246,0.15)]' 
                : 'text-slate-300 dark:text-neutral-300 hover:bg-slate-800/40 dark:hover:bg-neutral-800/40 hover:text-white',
              isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-0 mx-1'
            ]"
            :title="!isSidebarOpen ? item.label : ''"
          >
            <span class="flex items-center justify-center w-[1.15rem] h-[1.15rem] nav-icon shrink-0 transition-colors"
              :class="isActive ? 'text-blue-400' : 'text-slate-400 dark:text-neutral-400 group-hover:text-white'"
              v-html="item.icon"></span>
            <span v-if="isSidebarOpen" class="nav-text whitespace-nowrap animate-fade-in">{{ item.label }}</span>
          </a>
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
  transition: transform 0.15s ease;
}

.nav-item:hover .nav-icon {
  transform: translateX(1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-4px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
