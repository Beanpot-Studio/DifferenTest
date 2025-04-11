<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Notification />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Notification from './components/Notification.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Notification
  }
};
</script> 