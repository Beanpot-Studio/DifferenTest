<template>
  <div>
    <div v-if="isLoggedIn" class="flex items-center space-x-4">
      <div class="text-sm">
        <span v-if="userName" class="font-medium">{{ userName }}</span>
        <span v-else class="text-gray-300">{{ userEmail }}</span>
        <span class="text-gray-400 ml-2">({{ userRole }})</span>
      </div>
      <button 
        @click="handleLogout" 
        class="px-4 py-1 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 transition"
      >
        Log Out
      </button>
    </div>
    
    <div v-else class="space-x-2">
      <button 
        @click="$emit('login')" 
        class="px-4 py-1 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 transition"
      >
        Log In
      </button>
      <button 
        @click="$emit('register')" 
        class="px-4 py-1 text-sm border border-white rounded-lg hover:bg-white hover:text-primary-600 transition"
      >
        Sign Up
      </button>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../stores/auth';
import { computed } from 'vue';

export default {
  name: 'UserNavigation',
  props: {
    userName: {
      type: String,
      default: ''
    }
  },
  setup() {
    const { isLoggedIn, role, user, logout } = useAuth();
    
    return {
      isLoggedIn,
      userRole: role,
      userEmail: computed(() => user.value?.email || ''),
      userName: computed(() => user.value?.name || ''),
      handleLogout: logout
    };
  },
  emits: ['login', 'register']
};
</script>
