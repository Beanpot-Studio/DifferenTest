<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading || !initialized" class="p-6 flex justify-center items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
    </div>
    
    <!-- Not logged in state -->
    <div v-else-if="!isLoggedIn" class="p-6 bg-secondary-100 rounded-lg">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-xl font-medium text-secondary-900">Sorry, you don't have access</h3>
        <p class="mt-1 text-secondary-500">Please login</p>
        <div class="mt-4">
          <button 
            @click="showLoginModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
    
    <!-- No access for current role -->
    <div v-else-if="!hasAccess" class="p-6 bg-secondary-100 rounded-lg">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-xl font-medium text-secondary-900">Access Restricted</h3>
        <p class="mt-1 text-secondary-500">
          Your current role ({{ userRole }}) does not have permission to view this content
        </p>
      </div>
    </div>
    
    <!-- Content for authorized users -->
    <div v-else>
      <slot></slot>
    </div>

    <!-- Login Modal -->
    <LoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @register="showRegisterModal = true"
    />

    <!-- Register Modal -->
    <RegisterModal
      v-if="showRegisterModal"
      @close="showRegisterModal = false"
      @register-success="handleLoginSuccess"
    />
  </div>
</template>

<script>
import { useAuth } from '../stores/auth';
import { ref, computed, onMounted } from 'vue';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';

export default {
  name: 'RoleBasedContent',
  components: {
    LoginModal,
    RegisterModal
  },
  props: {
    requiredRoles: {
      type: Array,
      default: () => []
    },
    allRoles: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { isLoggedIn, role, loading, initialized, initialize } = useAuth();
    const showLoginModal = ref(false);
    const showRegisterModal = ref(false);
    
    const handleLoginSuccess = () => {
      showLoginModal.value = false;
      window.location.href = "/dashboard";
    };
    
    const hasAccess = computed(() => {
      // If no specific roles are required, any authenticated user has access
      if (props.requiredRoles.length === 0) {
        return true;
      }
      
      // Check if user's role matches any of the required roles
      return props.requiredRoles.includes(role.value);
    });

    onMounted(async () => {
      await initialize();
    });
    
    return {
      loading,
      isLoggedIn,
      hasAccess,
      userRole: role,
      showLoginModal,
      showRegisterModal,
      handleLoginSuccess,
      initialized
    };
  }
};
</script>
