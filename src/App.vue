<template>
  <div v-if="isGuest" class="min-h-screen w-screen">
    <router-view />
  </div>
  <div v-else class="flex min-h-screen bg-bg-main">
    <Sidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <Header />
      <main class="flex-1 p-0 overflow-y-auto">
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

