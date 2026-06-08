<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999] p-4">
    <div class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
      <!-- Icon & Header -->
      <div class="flex items-start gap-4 mb-4">
        <!-- Danger/Warning Icon -->
        <div :class="[
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          type === 'danger' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' :
          type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
          type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
          'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
        ]">
          <!-- Warning SVG -->
          <svg v-if="type === 'warning' || type === 'danger'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <!-- Success SVG -->
          <svg v-else-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <!-- Info/Default SVG -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </div>

        <div class="flex-1">
          <h3 class="text-base font-bold text-text-main leading-6">{{ title }}</h3>
          <p class="text-xs text-text-sub mt-1.5 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end gap-2.5 mt-6">
        <button
          v-if="showCancel"
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 border border-border-main text-text-sub hover:text-text-main text-xs font-semibold rounded-lg transition duration-150 cursor-pointer"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :class="[
            'px-4 py-2 text-xs font-semibold rounded-lg text-white transition duration-150 cursor-pointer',
            type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
            type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
            type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
            'bg-indigo-600 hover:bg-indigo-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./ConfirmModal.js"></script>
