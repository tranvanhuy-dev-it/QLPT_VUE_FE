<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div
      class="bg-card border border-border-main rounded-2xl shadow-lg w-full p-6 md:p-8 m-auto relative"
      :class="maxWidthClass"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg md:text-xl font-bold text-text-main">{{ title }}</h3>
        <button
          type="button"
          @click="$emit('close')"
          class="text-text-sub hover:text-text-main cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script src="./Modal.js"></script>
