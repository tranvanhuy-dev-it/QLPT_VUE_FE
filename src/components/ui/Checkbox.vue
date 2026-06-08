<template>
  <label :class="['flex items-start gap-2.5 cursor-pointer select-none', {'opacity-50 cursor-not-allowed': disabled}]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="onCheckedChange"
      class="mt-0.5 w-4.5 h-4.5 rounded border-border-main text-primary focus:ring-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
    />
    <div class="flex flex-col">
      <slot>
        <span v-if="label" class="text-xs sm:text-sm font-semibold text-text-main">{{ label }}</span>
        <span v-if="description" class="text-[10px] text-text-sub font-normal">{{ description }}</span>
      </slot>
    </div>
  </label>
</template>

<script src="./Checkbox.js"></script>
