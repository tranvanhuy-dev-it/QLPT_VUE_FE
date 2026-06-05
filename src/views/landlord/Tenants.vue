<template>
  <div class="app-container">
    <Sidebar />

    <main class="main-content">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-weight: 700; font-size: 1.75rem;">Tài Khoản Người Thuê</h1>
          <p style="color: var(--text-secondary);">Cấp tài khoản đăng nhập để người ở có thể tự xem hóa đơn và chỉ số phòng mình</p>
        </div>
        <button @click="showAddModal = true" class="btn btn-primary">
          + Cấp Tài Khoản Mới
        </button>
      </header>

      <!-- Tenants List -->
      <div class="card">
        <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          Đang tải danh sách tài khoản người thuê...
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Tên tài khoản (username)</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tenant in tenants" :key="tenant.id">
                  <td style="font-weight: 600; color: var(--primary-color);">{{ tenant.username }}</td>
                  <td style="font-weight: 500;">{{ tenant.fullName }}</td>
                  <td>{{ tenant.phone || '-' }}</td>
                  <td>{{ tenant.email || '-' }}</td>
                  <td>
                    <span :class="['badge', tenant.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
                      {{ tenant.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="tenants.length === 0">
                  <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Chưa cấp tài khoản nào cho người thuê trọ.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
            <span style="font-size: 0.875rem; color: var(--text-secondary);">
              Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} tài khoản)
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline" style="padding: 0.5rem 1rem;" :disabled="page === 0" @click="changePage(page - 1)">
                Trước
              </button>
              <button class="btn btn-outline" style="padding: 0.5rem 1rem;" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Tenant Modal -->
      <div v-if="showAddModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <div class="card" style="width: 100%; max-width: 500px; padding: 2rem; margin: 1rem; position: relative;">
          <h3 class="card-title">Cấp Tài Khoản Cho Người Ở</h3>
          
          <form @submit.prevent="createTenantAccount">
            <div class="form-group">
              <label class="form-label">Tên đăng nhập *</label>
              <input type="text" class="form-input" v-model="form.username" placeholder="Ví dụ: nguyenvanan (viết liền không dấu)" required />
            </div>

            <div class="form-group">
              <label class="form-label">Mật khẩu ban đầu *</label>
              <input type="password" class="form-input" v-model="form.password" placeholder="Tối thiểu 6 ký tự" required />
            </div>

            <div class="form-group">
              <label class="form-label">Họ và tên người thuê *</label>
              <input type="text" class="form-input" v-model="form.fullName" placeholder="Nhập tên đầy đủ người ở" required />
            </div>

            <div class="grid grid-cols-2" style="gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input type="text" class="form-input" v-model="form.phone" placeholder="Số điện thoại liên hệ" />
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" v-model="form.email" placeholder="Địa chỉ email" />
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" @click="closeModal" class="btn btn-outline">Hủy</button>
              <button type="submit" class="btn btn-primary">Tạo Tài Khoản</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./Tenants.js"></script>
