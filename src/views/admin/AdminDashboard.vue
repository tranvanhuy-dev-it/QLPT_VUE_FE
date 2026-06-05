<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside style="width: 250px; background-color: var(--card-bg); border-right: 1px solid var(--border-color); padding: 1.5rem; display: flex; flex-direction: column;">
      <h3 style="color: var(--primary-color); font-weight: 700; margin-bottom: 2rem;">ADMIN PORTAL</h3>
      <nav style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
        <router-link to="/admin" class="btn btn-primary" style="justify-content: flex-start; width: 100%;">
          Quản Lý Chủ Trọ
        </router-link>
      </nav>
      <button @click="logout" class="btn btn-outline" style="width: 100%;">
        Đăng Xuất
      </button>
    </aside>

    <!-- Main Dashboard Area -->
    <main class="main-content">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-weight: 700; font-size: 1.75rem;">Danh Sách Chủ Trọ</h1>
          <p style="color: var(--text-secondary);">Quản lý tài khoản đăng ký hệ thống</p>
        </div>
      </header>

      <!-- Landlords Table Card -->
      <div class="card">
        <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          Đang tải dữ liệu chủ trọ...
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Tên đăng nhập</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th style="text-align: right;">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="landlord in landlords" :key="landlord.id">
                  <td style="font-weight: 600;">{{ landlord.username }}</td>
                  <td>{{ landlord.fullName }}</td>
                  <td>{{ landlord.phone || '-' }}</td>
                  <td>{{ landlord.email || '-' }}</td>
                  <td>
                    <span :class="['badge', landlord.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
                      {{ landlord.status === 'ACTIVE' ? 'Kích hoạt' : 'Bị Khóa' }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button 
                      @click="toggleStatus(landlord.id)" 
                      :class="['btn', landlord.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary']"
                      style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
                    >
                      {{ landlord.status === 'ACTIVE' ? 'Khóa' : 'Kích Hoạt' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="landlords.length === 0">
                  <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Chưa có tài khoản chủ trọ nào đăng ký.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
            <span style="font-size: 0.875rem; color: var(--text-secondary);">
              Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} chủ trọ)
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <button 
                class="btn btn-outline" 
                style="padding: 0.5rem 1rem;" 
                :disabled="page === 0" 
                @click="changePage(page - 1)"
              >
                Trước
              </button>
              <button 
                class="btn btn-outline" 
                style="padding: 0.5rem 1rem;" 
                :disabled="page >= totalPages - 1" 
                @click="changePage(page + 1)"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./AdminDashboard.js"></script>
