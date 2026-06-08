<template>
  <div class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
    <div class="text-center flex flex-col items-center gap-2">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div class="text-text-sub text-xs">
        <slot>{{ message }}</slot>
      </div>
    </div>
  </div>
</template>

<script src="./LoadingState.js"></script>
