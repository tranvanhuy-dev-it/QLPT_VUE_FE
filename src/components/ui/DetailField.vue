<template>
  <div v-if="layout === 'inline'" class="flex items-center">
    <span :class="[labelWidth, 'text-text-sub font-semibold shrink-0', labelClass]">
      {{ label }}
    </span>
    <span class="text-text-main flex-1" :class="valueClass">
      <slot>{{ value !== null && value !== undefined && value !== '' ? value : '-' }}</slot>
    </span>
  </div>
  <div v-else class="w-full">
    <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1" :class="labelClass">
      {{ label }}
    </label>
    <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50" :class="valueClass">
      <slot>{{ value !== null && value !== undefined && value !== '' ? value : '-' }}</slot>
    </div>
  </div>
</template>

<script src="./DetailField.js"></script>
