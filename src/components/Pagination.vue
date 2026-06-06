<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50 w-full">
    <span class="text-xs text-text-sub">
      Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} {{ unit }})
    </span>
    <div class="flex gap-2">
      <button
        class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
        :disabled="page === 0"
        @click="onPageChange(page - 1)"
      >
        Trước
      </button>
      <button
        class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
        :disabled="page >= totalPages - 1"
        @click="onPageChange(page + 1)"
      >
        Sau
      </button>
    </div>
  </div>
</template>

<script src="./Pagination.js"></script>
