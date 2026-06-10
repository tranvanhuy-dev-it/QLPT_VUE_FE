<template>
  <div :class="[label ? 'flex flex-col gap-1.5' : 'w-full']">
    <label v-if="label" class="text-xs font-semibold text-text-sub uppercase">
      {{ label }}<span v-if="required" class="text-danger ml-0.5">*</span>
    </label>
    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      v-bind="$attrs"
      @change="onChange"
      :class="[
        'w-full border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all duration-150',
        size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
      ]"
    >
      <slot></slot>
    </select>
  </div>
</template>

<script src="./FormSelect.js"></script>
