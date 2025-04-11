<template>
  <div v-if="isLoggedIn" class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex items-center space-x-4">
      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        <IconService name="user" size="6" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ userEmail }}, {{ userRole }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '../stores/auth';


export default {
  components: {
    IconService
  },
  name: 'UserInfo',
  setup() {
    const { user, role, isLoggedIn, initialize } = useAuth();
    const initialized = ref(false);

    // Initialize auth state
    onMounted(async () => {
      if (!initialized.value) {
        await initialize();
        initialized.value = true;
      }
    });

    // Watch for auth state changes
    watch([user, role], () => {
      if (!initialized.value) {
        initialize();
        initialized.value = true;
      }
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