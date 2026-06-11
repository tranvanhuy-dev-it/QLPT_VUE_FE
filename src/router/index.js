import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore, isTokenExpired } from '../stores/auth.js';

// Định nghĩa danh sách routes
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin',
    name: 'AdminStats',
    component: () => import('../views/admin/AdminStats.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
  },
  {
    path: '/admin/landlords',
    name: 'AdminLandlords',
    component: () => import('../views/admin/AdminLandlords.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
  },
  {
    path: '/admin/requests',
    name: 'AdminRequests',
    component: () => import('../views/admin/AdminRequests.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('../views/admin/AdminSettings.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
  },
  {
    path: '/admin/login-history',
    name: 'AdminLoginHistory',
    component: () => import('../views/admin/AdminLoginHistory.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
  },
  // LANDLORD ROUTES
  {
    path: '/landlord',
    name: 'LandlordDashboard',
    component: () => import('../views/landlord/LandlordDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/boarding-houses',
    name: 'BoardingHouses',
    component: () => import('../views/landlord/BoardingHouses.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/boarding-houses/:id',
    name: 'BoardingHouseDetail',
    component: () => import('../views/landlord/BoardingHouseDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    path: '/landlord/cameras',
    name: 'Cameras',
    component: () => import('../views/landlord/Cameras.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/rooms',
    name: 'Rooms',
    component: () => import('../views/landlord/Rooms.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/rooms/:id',
    name: 'RoomDetail',
    component: () => import('../views/landlord/RoomDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    path: '/landlord/contracts',
    name: 'Contracts',
    component: () => import('../views/landlord/Contracts.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/contracts/:id',
    name: 'ContractDetail',
    component: () => import('../views/landlord/ContractDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    path: '/landlord/invoices',
    name: 'Invoices',
    component: () => import('../views/landlord/Invoices.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/invoices/bulk',
    name: 'BulkInvoices',
    component: () => import('../views/landlord/BulkInvoices.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    path: '/landlord/invoices/:id',
    name: 'InvoiceDetail',
    component: () => import('../views/landlord/InvoiceDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    key: 'tenants',
    path: '/landlord/tenants',
    name: 'Tenants',
    component: () => import('../views/landlord/Tenants.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD' },
  },
  {
    path: '/landlord/tenants/:id',
    name: 'TenantDetail',
    component: () => import('../views/landlord/TenantDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true },
  },
  {
    path: '/landlord/upgrade',
    name: 'SubscriptionUpgrade',
    component: () => import('../views/landlord/SubscriptionUpgrade.vue'),
    meta: { requiresAuth: true, requiresRole: 'LANDLORD', hideHeaderOnMobile: true, hideBottomBar: true },
  },
  // TENANT ROUTES
  {
    path: '/tenant',
    name: 'TenantDashboard',
    component: () => import('../views/tenant/TenantDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/tenant/invoices',
    name: 'TenantInvoices',
    component: () => import('../views/tenant/TenantInvoices.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/tenant/invoices/:id',
    name: 'TenantInvoiceDetail',
    component: () => import('../views/landlord/InvoiceDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT', hideHeaderOnMobile: true },
  },
  {
    path: '/tenant/contracts',
    name: 'TenantContracts',
    component: () => import('../views/landlord/Contracts.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/tenant/contracts/:id',
    name: 'TenantContractDetail',
    component: () => import('../views/landlord/ContractDetail.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT', hideHeaderOnMobile: true },
  },
  {
    path: '/tenant/rules',
    name: 'TenantRules',
    component: () => import('../views/tenant/Rules.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/tenant/cameras',
    name: 'TenantCameras',
    component: () => import('../views/tenant/Cameras.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/tenant/contact-landlord',
    name: 'TenantContactLandlord',
    component: () => import('../views/tenant/ContactLandlord.vue'),
    meta: { requiresAuth: true, requiresRole: 'TENANT' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true, hideHeaderOnMobile: true, hideBottomBar: true },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: { guestOnly: false, hideHeaderOnMobile: true, hideBottomBar: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards: Bảo mật trang theo vai trò (Role-based Authorization)
router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  // Tự động đăng xuất nếu token đã hết hạn
  if (authStore.token && isTokenExpired(authStore.token)) {
    authStore.logout();
  }

  // Route yêu cầu xác thực
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      return { name: 'Login' };
    } else if (to.meta.requiresRole && authStore.role !== to.meta.requiresRole) {
      // Role không khớp -> chuyển về trang 404 (NotFound) để bảo mật phân quyền
      return { name: 'NotFound' };
    } else {
      // Kiểm tra trạng thái hết hạn gói dịch vụ của chủ trọ
      if (authStore.role === 'LANDLORD' && authStore.user?.isExpired && to.name !== 'SubscriptionUpgrade') {
        return { name: 'SubscriptionUpgrade' };
      } else {
        return true;
      }
    }
  } 
  // Khách chưa login mới vào được (guestOnly - e.g. Login, Register)
  else if (to.matched.some((record) => record.meta.guestOnly)) {
    if (authStore.isAuthenticated) {
      // Nếu đã login, tự động chuyển về trang Dashboard tương ứng
      if (authStore.role === 'ADMIN') return { name: 'AdminStats' };
      else if (authStore.role === 'LANDLORD') return { name: 'LandlordDashboard' };
      else if (authStore.role === 'TENANT') return { name: 'TenantDashboard' };
      else return true;
    } else {
      return true;
    }
  } else {
    return true;
  }
});

export default router;
