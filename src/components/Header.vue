<template>
  <header class="sticky top-0 h-16 bg-card border-b border-border-main flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 shadow-xs shrink-0">
    <div class="flex items-center">
      <!-- Mobile Sidebar Toggle -->
      <button 
        @click="toggleSidebar" 
        class="lg:hidden p-1.5 rounded-lg text-text-sub hover:bg-slate-100 hover:text-text-main mr-2 cursor-pointer flex items-center justify-center shrink-0"
        title="Mở menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1.5 sm:gap-2 text-[0.8rem] sm:text-[0.85rem] font-medium truncate">
        <span class="text-text-sub">{{ parentRoute }}</span>
        <span class="text-border-main">/</span>
        <span class="text-primary font-semibold">{{ currentRoute }}</span>
      </nav>
    </div>
    
    <div class="flex-1 max-w-[300px] md:max-w-[400px] mx-4 hidden md:block">
      <!-- Global Search -->
      <div class="relative w-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-[1.125rem] h-[1.125rem] text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" class="w-full pl-9 pr-4 py-2 border border-border-main bg-slate-50 dark:bg-slate-900 text-text-main text-[0.85rem] outline-none transition-all duration-150 focus:bg-white focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)]" placeholder="Tìm kiếm nhanh..." />
      </div>
    </div>
    
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Icon Utilities -->
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main hidden sm:flex" title="Trợ giúp">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75v5.25m0-5.25h-1.5m1.5 5.25h-1.5m1.5 0h8.25m-11.25-10.5h15a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 015.25 3z" />
        </svg>
      </button>
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main" title="Thông báo">
        <div class="absolute top-[3px] right-[3px] w-1.5 h-1.5 rounded-full bg-danger"></div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      
      <!-- Profile & Logout -->
      <div class="flex items-center gap-2 sm:gap-3 border-l border-border-main pl-2 sm:pl-4">
        <div class="w-8 h-8 rounded-full bg-sky-100 text-primary flex items-center justify-center font-bold text-[0.85rem] shrink-0 border border-primary/20">
          <span>{{ userInitial }}</span>
        </div>
        <div class="flex flex-col hidden sm:flex max-w-[100px]">
          <span class="text-[0.85rem] font-semibold text-text-main truncate">{{ username }}</span>
          <span class="text-[0.7rem] text-text-sub uppercase font-semibold truncate">{{ roleLabel }}</span>
        </div>
        <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 flex items-center justify-center transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950 hover:text-danger rounded-lg" @click="handleLogout" title="Đăng xuất">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-[1.15rem] h-[1.15rem]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script src="./Header.js"></script>

