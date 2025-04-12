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
      duration,
      timestamp: new Date()
    });

    // Remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const showSuccess = (message, title = 'Success', duration = 5000) => {
    showNotification(title, message, 'success', duration);
  };

  const showError = (message, title = 'Error', duration = 5000) => {
    showNotification(title, message, 'error', duration);
  };

  const showInfo = (message, title = 'Info', duration = 5000) => {
    showNotification(title, message, 'info', duration);
  };

  const showWarning = (message, title = 'Warning', duration = 5000) => {
    showNotification(title, message, 'warning', duration);
  };

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
    clearAllNotifications
  };
} 