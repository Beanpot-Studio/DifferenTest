<template>
  
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :duration="notification.duration"
        @close="removeNotification(notification.id)"
      />
   
</template>

<script>
import { useNotification } from '../composables/useNotification';
import Notification from './Notification.vue';
import { watch } from 'vue';

export default {
  name: 'NotificationContainer',
  components: {
    Notification
  },
  setup() {
    const { notifications, removeNotification } = useNotification();
    
    // Add watcher to debug notifications
    watch(notifications, (newNotifications) => {
    }, { deep: true });

    return {
      notifications,
      removeNotification
    };
  }
};
</script> 