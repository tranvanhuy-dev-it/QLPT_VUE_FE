<template>
  <div class="page-toolbar" v-if="showSearch || showAdd || showExport || showImport">
    <!-- Search Box -->
    <div class="filter-search-box" v-if="showSearch">
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

    <!-- Filter Addons Slot (e.g. house select dropdown) -->
    <slot name="filter-addons"></slot>

    <!-- Spacer to push buttons to right -->
    <div class="toolbar-spacer"></div>

    <!-- Action Buttons -->
    <button class="toolbar-btn-outline" v-if="showExport" @click="$emit('export-click')">
      <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Xuất file
    </button>
    <button class="toolbar-btn-outline" v-if="showImport" @click="$emit('import-click')">
      <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      Nhập file
    </button>
    <slot name="custom-actions"></slot>
    <button class="toolbar-btn-primary" v-if="showAdd" @click="$emit('add-click')" :disabled="disableAdd">
      <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {{ addText || 'Thêm Mới' }}
    </button>
  </div>
</template>

<script src="./PageHeader.js"></script>

<style scoped>
.page-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--card-bg);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.toolbar-spacer {
  flex: 1;
  min-width: 0;
}

.filter-search-box {
  position: relative;
  flex: 1;
  max-width: 350px;
  min-width: 180px;
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
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: #f9fafb;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: all 0.15s ease;
}

.filter-search-input:focus {
  border-color: var(--primary-color);
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.08);
}

.toolbar-btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.875rem;
  font-weight: 500;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  gap: 0.375rem;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.toolbar-btn-outline:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.toolbar-btn-outline .btn-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}

.toolbar-btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 1rem;
  font-weight: 600;
  background-color: var(--primary-color);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  gap: 0.375rem;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.toolbar-btn-primary:hover {
  background-color: var(--primary-hover);
}

.toolbar-btn-primary:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.toolbar-btn-primary .btn-icon {
  width: 1rem;
  height: 1rem;
}
</style>
