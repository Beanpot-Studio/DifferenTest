import { ref, computed } from 'vue';
import { setupAuthListener, logoutUser } from '../lib/auth';

// Create reactive state
const user = ref(null);
const role = ref(null);
const loading = ref(true);
const initialized = ref(false);

// Computed properties
const isLoggedIn = computed(() => !!user.value);
const isTeacher = computed(() => role.value === 'teacher');
const isStudent = computed(() => role.value === 'student');

// Initialize auth listener
let unsubscribeAuth = null;

export function useAuth() {
  // Initialize auth listener if not already initialized
  const initialize = async () => {
    if (!unsubscribeAuth) {
      loading.value = true;
      unsubscribeAuth = setupAuthListener(({ user: authUser, role: userRole }) => {
        user.value = authUser;
        role.value = userRole;
        loading.value = false;
        initialized.value = true;
      });
    }
    return initialized.value;
  };

  // Cleanup function
  const cleanup = () => {
    if (unsubscribeAuth) {
      unsubscribeAuth();
      unsubscribeAuth = null;
    }
  };

  // Logout function
  const logout = async () => {
    const { success } = await logoutUser();
    if (success) {
      window.location.href = '/';
    }
  };

  return {
    // State
    user,
    role,
    loading,
    initialized,
    
    // Computed
    isLoggedIn,
    isTeacher,
    isStudent,
    
    // Methods
    initialize,
    logout,
    cleanup
  };
} 