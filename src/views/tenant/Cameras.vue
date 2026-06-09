<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Page Header -->
    <PageHeader 
      title="Camera Giám Sát" 
      :subtitle="`Theo dõi an ninh trực tuyến tại dãy trọ của bạn (${cameras.length} camera)`"
      :icon="cameraIcon" 
      :showAdd="false" 
      :showSearch="false" 
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-medium">Đang tải luồng camera...</span>
    </div>

    <!-- Main List/Grid -->
    <template v-else>
      <div v-if="cameras.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CameraPlayer 
          v-for="cam in cameras" 
          :key="cam.id" 
          :camera="cam"
          :show-settings="false"
        />
      </div>

      <!-- Empty State -->
      <EmptyState 
        v-else 
        message="Dãy trọ của bạn chưa có camera giám sát nào được cấu hình."
      />
    </template>
  </div>
</template>

<script src="/src/views/tenant/Cameras.js"></script>
