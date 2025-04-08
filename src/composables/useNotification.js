import { ref } from 'vue';

const notifications = ref([]);

export function useNotification() {
  const showNotification = (title, message, type = 'info', duration = 5000) => {
    const id = Date.now();
    notifications.value.push({
      id,
      title,
      message,
      type,
      duration
    });

    // Remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  return {
    notifications,
    showNotification,
    removeNotification
  };
} 