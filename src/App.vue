<template>
  <div class="min-h-screen bg-gray-50">
    <NotificationContainer />
    <router-view />
  </div>
</template>

<script>
import NotificationContainer from './components/NotificationContainer.vue';

export default {
  name: 'App',
  components: {
    NotificationContainer
  }
};
</script> 