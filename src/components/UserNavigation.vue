<template>
  <div class="flex items-center">
    <!-- For logged in users -->
    <div v-if="isLoggedIn" class="relative group">
      <button class="flex items-center space-x-1 text-white">
        <div class="flex flex-col items-end">
          <span class="text-sm font-medium">{{ userEmail }}</span>
          <span class="text-xs text-indigo-200 capitalize">{{ userRole }}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Dropdown menu -->
      <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
        <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
        <a 
          href="#" 
          @click.prevent="$emit('logout')" 
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
        class="px-4 py-1 text-sm rounded-lg bg-indigo-500 hover:bg-indigo-600 transition"
      >
        Log In
      </button>
      <button 
        @click="$emit('register')" 
        class="px-4 py-1 text-sm border border-white rounded-lg hover:bg-white hover:text-indigo-600 transition"
      >
        Sign Up
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserNavigation',
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    userRole: {
      type: String,
      default: null
    },
    userEmail: {
      type: String,
      default: ''
    }
  },
  emits: ['login', 'register', 'logout']
};
</script>
