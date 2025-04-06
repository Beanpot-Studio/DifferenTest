<template>
  <div>
    <div v-if="isLoggedIn" class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <!-- Messages Button -->
        <a 
          href="/messages" 
          class="p-2 rounded-lg hover:bg-primary-700 transition"
          title="Messages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>

        <!-- Profile Button -->
        <a 
          href="/profile" 
          class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="font-medium">
            <span v-if="userName">{{ userName }}</span>
            <span v-else class="text-gray-300">{{ userEmail }}</span>
          </span>
          <span class="text-gray-400 text-xs">({{ userRole }})</span>
        </a>
      </div>

      <button 
        @click="handleLogout" 
        class="px-4 py-1.5 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 transition"
      >
        Log Out
      </button>
    </div>
    
    <div v-else class="space-x-2">
      <button 
        @click="$emit('login')" 
        class="px-4 py-1.5 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 transition"
      >
        Log In
      </button>
      <button 
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
