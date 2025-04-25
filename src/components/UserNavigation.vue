<template>
  <div>
    <div v-if="isLoggedIn" class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <!-- Messages Button -->
        <a 
          :href="`${baseUrl}/messages`" 
          class="p-2 rounded-lg hover:bg-primary-300 transition text-white"
          title="Messages"
        >
          <IconService name="message" size="4" />
        </a>

        <!-- Profile Button -->
        <a 
          :href="`${baseUrl}/profile`" 
          class="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-white bg-primary-700 hover:bg-primary-300 transition"
        >
          <IconService name="user" size="4" />
          <span class="font-medium">
            <span v-if="userName">{{ userName }}</span>
            <span v-else class="text-gray-300">{{ userEmail }}</span>
          </span>
          <span class="text-gray-400 text-xs">({{ userRole }})</span>
        </a>
      </div>

      <button 
        @click="handleLogout" 
        class="px-3 py-1.5 text-sm rounded-lg bg-primary-700 hover:bg-primary-300 transition"
      >
        Log Out
      </button>
    </div>
    
    <div v-else class="space-x-2">
      <button id="login-button"
        @click="$emit('login')" 
        class="px-4 py-1.5 text-sm rounded-lg bg-primary-700 hover:bg-primary-300 transition"
      >
        Log In
      </button>
      <button id="register-button"
        @click="$emit('register')" 
        class="px-4 py-1.5 text-sm border border-white rounded-lg hover:bg-white hover:text-primary-600 transition"
      >
        Sign Up
      </button>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../stores/auth';
import { computed } from 'vue';
import IconService from './IconService.vue';

export default {
  name: 'UserNavigation',
  components: {
    IconService
  },
  props: {
    userName: {
      type: String,
      default: ''
    }
  },
  setup() {
    const { isLoggedIn, role, user, logout } = useAuth();
    
    const baseUrl = computed(() => {
      return import.meta.env.BASE_URL || '/';
    });

    return {
      isLoggedIn,
      userRole: role,
      userEmail: computed(() => user.value?.email || ''),
      userName: computed(() => user.value?.name || ''),
      handleLogout: logout,
      baseUrl
    };
  },
  emits: ['login', 'register']
};
</script>
