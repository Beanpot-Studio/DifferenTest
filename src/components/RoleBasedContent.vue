<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading || !initialized" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" />
    </div>
    
    <!-- Not logged in state -->
    <div v-else-if="!isLoggedIn" class="p-6 bg-secondary-100 rounded-lg">
      <div class="text-center">
        <h3 class="mt-2 text-xl font-medium text-secondary-900">Sorry, you don't have access</h3>
        <p class="mt-1 text-secondary-500">Please login</p>
        <div class="mt-4">
          <div class="w-full flex justify-center items-center">
            <BaseAnimation type="lock" />
          </div>
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
        <h3 class="mt-2 text-xl font-medium text-secondary-900">Access Restricted</h3>
        <div class="w-full flex justify-center items-center">
          <BaseAnimation type="lock" />
        </div>
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
import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'RoleBasedContent',
  components: {
    LoginModal,
    RegisterModal,
    BaseAnimation
  },
  props: {
    requiredRoles: {
      type: Array,
      default: () => ['student', 'teacher']
    },
    message: {
      type: String,
      default: 'You do not have permission to access this content.'
    }
  },
  setup(props) {
    const { isLoggedIn, role, loading, initialized, initialize } = useAuth();
    const showLoginModal = ref(false);
    const showRegisterModal = ref(false);
    
    const handleLoginSuccess = () => {
      showLoginModal.value = false;
      if (role.value === 'teacher') {
        window.location.href = '/teacher';
      } else if (role.value === 'student') {
        window.location.href = '/student';
      } else {
        // If no role is set, redirect to home page
        window.location.href = '/';
      }
    };
    
    const hasAccess = computed(() => props.requiredRoles.includes(role.value));

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
