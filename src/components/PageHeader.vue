<template>
  <div class="page-header-container">
    <div class="page-title-row">
      <!-- Title & Icon -->
      <div class="page-title-left">
        <div class="page-title-icon-wrapper" v-if="icon">
          <span v-html="icon"></span>
        </div>
        <div class="page-title-text">
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="page-actions-right">
        <button class="action-btn-outline" v-if="showExport" @click="$emit('export-click')">
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Xuất file
        </button>
        <button class="action-btn-outline" v-if="showImport" @click="$emit('import-click')">
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Nhập file
        </button>
        <slot name="custom-actions"></slot>
        <button class="action-btn-primary" v-if="showAdd" @click="$emit('add-click')" :disabled="disableAdd">
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ addText || 'Thêm Mới' }}
        </button>
      </div>
    </div>
    
    <!-- Filters & Search Bar -->
    <div class="page-filter-row" v-if="showSearch">
      <div class="filter-search-box">
        <svg xmlns="http://www.w3.org/2000/svg" class="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          class="filter-search-input" 
          :placeholder="searchPlaceholder || 'Tìm theo tên, liên hệ...'" 
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
      <button class="filter-action-btn" @click="$emit('filter-click')">
        <svg xmlns="http://www.w3.org/2000/svg" class="filter-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        Bộ lọc
      </button>
      <slot name="filter-addons"></slot>
    </div>
  </div>
</template>

<script src="./PageHeader.js"></script>

<style scoped>
.page-header-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: #e6f0ff;
  color: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title-icon-wrapper :deep(svg) {
  width: 22px;
  height: 22px;
}

.page-title-text {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.page-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  gap: 0.375rem;
  transition: all 0.15s ease;
}

.action-btn-outline:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.action-btn-outline .btn-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}

.action-btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  background-color: var(--primary-color);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  cursor: pointer;
  gap: 0.375rem;
  transition: all 0.15s ease;
}

.action-btn-primary:hover {
  background-color: var(--primary-hover);
}

.action-btn-primary:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.action-btn-primary .btn-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.page-filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--card-bg);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.filter-search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.filter-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}

.filter-search-input {
  width: 100%;
  padding: 0.45rem 1rem 0.45rem 2.25rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: #ffffff;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.15s ease;
}

.filter-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.08);
}

.filter-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 1rem;
  font-weight: 500;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  gap: 0.375rem;
  transition: all 0.15s ease;
}

.filter-action-btn:hover {
  background-color: #f9fafb;
}

.filter-btn-icon {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--text-secondary);
}
</style>
