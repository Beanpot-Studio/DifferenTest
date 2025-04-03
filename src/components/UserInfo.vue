<template>
  <div v-if="isLoggedIn" class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex items-center space-x-4">
      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ userEmail }}, {{ userRole }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../stores/auth';

export default {
  name: 'UserInfo',
  setup() {
    const { user, role, isLoggedIn, initialize } = useAuth();

    // Initialize auth state
    onMounted(async () => {
      await initialize();
    });

    const userEmail = computed(() => {
      if (!user.value) return 'User';
      return user.value.email || 'User';
    });

    const userRole = computed(() => {
      return role.value || 'student';
    });

    return {
      userEmail,
      userRole,
      isLoggedIn
    };
  }
};
</script> 