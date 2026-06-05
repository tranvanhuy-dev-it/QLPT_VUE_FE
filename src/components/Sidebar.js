import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

export default {
  name: 'Sidebar',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const username = computed(() => authStore.username);
    const role = computed(() => authStore.role);

    const handleLogout = () => {
      authStore.logout();
      router.push('/login');
    };

    return {
      username,
      role,
      handleLogout,
    };
  },
};
