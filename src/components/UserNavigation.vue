<template>
  <div class="flex items-center">
    <!-- For logged in users -->
    <div v-if="isLoggedIn" class="relative group">
      <button class="flex items-center space-x-1 text-white">
        <div class="flex flex-col items-end">
          <span class="text-sm font-medium">{{ userEmail }}</span>
          <span class="text-xs text-primary-200 capitalize">{{ userRole }}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Dropdown menu -->
      <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <a 
          href="#" 
          @click.prevent="handleLogout" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Log out
        </a>
      </div>
    </div>
    
    <!-- For guests -->
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
  setup() {
    const { isLoggedIn, role, user, logout } = useAuth();
    
    return {
      isLoggedIn,
      userRole: role,
      userEmail: computed(() => user.value?.email || ''),
      handleLogout: logout
    };
  },
  emits: ['login', 'register']
};
</script>
