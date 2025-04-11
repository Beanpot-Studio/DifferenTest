<template>
  <TransitionGroup
    name="notification"
    tag="div"
    class="fixed bottom-4 right-4 space-y-2 z-50"
  >
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="[
        'p-4 rounded-lg shadow-lg max-w-sm',
        notification.type === 'success' ? 'bg-green-500' :
        notification.type === 'error' ? 'bg-red-500' :
        notification.type === 'info' ? 'bg-blue-500' :
        'bg-gray-500'
      ]"
    >
      <div class="flex items-start">
        <div class="flex-1">
          <p class="text-sm font-medium text-white">{{ notification.title }}</p>
          <p class="text-sm text-white opacity-90">{{ notification.message }}</p>
        </div>
        <button
          @click="removeNotification(notification.id)"
          class="ml-4 text-white hover:text-gray-200"
        >
          <IconService name="x" size="4" />
        </button>
      </div>
    </div>
  </TransitionGroup>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import IconService from './IconService.vue';

export default {
  name: 'Notification',
  components: {
    IconService
  },
  setup() {
    const notifications = ref([]);
    let timeoutIds = [];

    const addNotification = (notification) => {
      const id = Date.now();
      notifications.value.push({ id, ...notification });
      
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, 5000);
      
      timeoutIds.push(timeoutId);
    };

    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const handleNotification = (event) => {
      addNotification(event.detail);
    };

    onMounted(() => {
      window.addEventListener('show-notification', handleNotification);
    });

    onUnmounted(() => {
      timeoutIds.forEach(id => clearTimeout(id));
      window.removeEventListener('show-notification', handleNotification);
    });

    return {
      notifications,
      removeNotification
    };
  }
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 