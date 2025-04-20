import { ref } from 'vue';

const notifications = ref([]);

export function useNotification() {
  const showNotification = (title, message, type = 'info', duration = 5000) => {
    console.log('Adding notification:', { title, message, type, duration });
    const id = Date.now();
    notifications.value.push({
      id,
      title,
      message,
      type,
      duration,
      timestamp: new Date()
    });
    console.log('Current notifications:', notifications.value);

    // Remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const showSuccess = (message, title = 'Success', duration = 5000) => {
    console.log('Showing success notification:', message);
    showNotification(title, message, 'success', duration);
  };

  const showError = (message, title = 'Error', duration = 5000) => {
    console.log('Showing error notification:', message);
    showNotification(title, message, 'error', duration);
  };

  const showInfo = (message, title = 'Info', duration = 5000) => {
    console.log('Showing info notification:', message);
    showNotification(title, message, 'info', duration);
  };

  const showWarning = (message, title = 'Warning', duration = 5000) => {
    console.log('Showing warning notification:', message);
    showNotification(title, message, 'warning', duration);
  };

  const removeNotification = (id) => {
    console.log('Removing notification:', id);
    notifications.value = notifications.value.filter(n => n.id !== id);
    console.log('Remaining notifications:', notifications.value);
  };

  const clearAllNotifications = () => {
    console.log('Clearing all notifications');
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