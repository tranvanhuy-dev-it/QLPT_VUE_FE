<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <span class="breadcrumb-parent">{{ parentRoute }}</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">{{ currentRoute }}</span>
      </nav>
    </div>
    
    <div class="header-center">
      <!-- Global Search -->
      <div class="global-search-container">
        <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" class="global-search-input" placeholder="Tìm kiếm nhanh..." />
      </div>
    </div>
    
    <div class="header-right">
      <!-- Icon Utilities -->
      <button class="header-icon-btn" title="Trợ giúp">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75v5.25m0-5.25h-1.5m1.5 5.25h-1.5m1.5 0h8.25m-11.25-10.5h15a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 015.25 3z" />
        </svg>
      </button>
      <button class="header-icon-btn" title="Thông báo">
        <div class="notification-badge"></div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      <button class="header-icon-btn" title="Cài đặt">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <!-- Profile & Logout -->
      <div class="user-profile-menu">
        <div class="user-avatar">
          <span class="avatar-initial">{{ userInitial }}</span>
        </div>
        <div class="user-meta">
          <span class="user-name">{{ username }}</span>
          <span class="user-role-label">{{ roleLabel }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Đăng xuất">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script src="./Header.js"></script>

<style scoped>
.app-header {
  height: 64px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
  box-shadow: var(--shadow);
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.breadcrumb-parent {
  color: var(--text-secondary);
}

.breadcrumb-separator {
  color: var(--border-color);
}

.breadcrumb-active {
  color: var(--primary-color);
  font-weight: 600;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;
}

.global-search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-secondary);
}

.global-search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background-color: #f9fafb;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.15s ease;
}

.global-search-input:focus {
  background-color: #ffffff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.header-icon-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-primary);
}

.header-icon-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--danger-color);
}

.user-profile-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 1px solid var(--border-color);
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background-color: #e0f2fe;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: var(--danger-color);
}

.logout-btn svg {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
