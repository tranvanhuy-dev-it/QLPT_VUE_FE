<template>
  <div :class="[label ? 'flex flex-col gap-1.5' : 'w-full']">
    <label v-if="label" class="text-xs font-semibold text-text-sub uppercase">
      {{ label }}<span v-if="required" class="text-danger ml-0.5">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      v-bind="$attrs"
      @input="onInput"
      :class="[
        'w-full border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all duration-150',
        size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : '',
        readonly ? 'bg-slate-100 dark:bg-slate-800' : ''
      ]"
    />
  </div>
</template>

<script src="./FormInput.js"></script>
