<template>
  <div class="flex items-center justify-between gap-2 w-full bg-card p-2 sm:p-3 rounded-xl border border-border-main shadow-xs mb-4 flex-nowrap">
    <!-- Left Side: Search input & Lọc button -->
    <div v-if="showSearch" class="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 max-w-lg">
      <!-- Search Input -->
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          class="w-full pl-8 sm:pl-9 pr-2 sm:pr-4 py-1 sm:py-1.5 rounded-lg border border-border-main bg-white dark:bg-slate-900 text-text-main text-[11px] sm:text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)]" 
          :placeholder="searchPlaceholder || 'Tìm theo tên, địa chỉ...'" 
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    </div>

    <!-- Right Side: Filter addons & Action buttons (Export, Import, custom-actions, Add Button) -->
    <div class="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
      <!-- Slot for custom filter options (like select dropdowns) -->
      <slot name="filter-addons"></slot>

      <!-- Export Button -->
      <button v-if="showExport" @click="$emit('export-click')" class="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-border-main rounded-lg text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer gap-1.5 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        <span>Xuất</span>
      </button>

      <!-- Import Button -->
      <button v-if="showImport" @click="$emit('import-click')" class="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-border-main rounded-lg text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer gap-1.5 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span>Import</span>
      </button>

      <!-- Slot for custom actions -->
      <slot name="custom-actions"></slot>

      <!-- Add Button -->
      <button v-if="showAdd" @click="$emit('add-click')" :disabled="disableAdd" class="inline-flex items-center px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-extrabold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer gap-1 sm:gap-1.5 transition-all shadow-xs shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>{{ addText || 'Thêm Mới' }}</span>
      </button>
    </div>
  </div>
</template>

<script src="./PageHeader.js"></script>
