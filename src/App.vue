<template>
  <div v-if="isGuest" class="auth-wrapper-guest">
    <router-view />
  </div>
  <div v-else class="app-container">
    <Sidebar />
    <div class="app-wrapper">
      <Header />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
  },
  setup() {
    const route = useRoute();
    const isGuest = computed(() => {
      return !!(route.meta && route.meta.guestOnly);
    });

    return {
      isGuest,
    };
  },
};
</script>

<style>
.auth-wrapper-guest {
  min-height: 100vh;
  width: 100vw;
}
</style>
