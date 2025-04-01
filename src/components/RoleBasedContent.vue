<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="p-6 flex justify-center items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
    
    <!-- Not logged in state -->
    <div v-else-if="!isLoggedIn" class="p-6 bg-gray-100 rounded-lg">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-xl font-medium text-gray-900">Authentication Required</h3>
        <p class="mt-1 text-gray-500">Please login to view this content</p>
        <div class="mt-4">
          <button 
            @click="$emit('login')" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
    
    <!-- No access for current role -->
    <div v-else-if="!hasAccess" class="p-6 bg-gray-100 rounded-lg">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-xl font-medium text-gray-900">Access Restricted</h3>
        <p class="mt-1 text-gray-500">
          Your current role ({{ userRole }}) does not have permission to view this content
        </p>
      </div>
    </div>
    
    <!-- Content for authorized users -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleBasedContent',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    userRole: {
      type: String,
      default: null
    },
    requiredRoles: {
      type: Array,
      default: () => []
    },
    allRoles: {
      type: Boolean,
      default: false
    }
  },
  emits: ['login'],
  computed: {
    hasAccess() {
      // If no specific roles are required, any authenticated user has access
      if (this.requiredRoles.length === 0) {
        return true;
      }
      
      // Check if user's role matches any of the required roles
      return this.requiredRoles.includes(this.userRole);
    }
  }
};
</script>
