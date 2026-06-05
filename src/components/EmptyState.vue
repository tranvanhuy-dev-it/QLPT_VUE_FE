<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12h20.25M2.25 6h20.25m-20.25 12h20.25" />
      </svg>
    </div>
    <p class="empty-message">{{ message || 'Không tìm thấy dữ liệu nào' }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    message: {
      type: String,
      default: 'Không tìm thấy dữ liệu nào'
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2rem;
  text-align: center;
  background-color: var(--card-bg);
  border-radius: 0;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-message {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}
</style>
