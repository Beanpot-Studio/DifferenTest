<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading || !initialized" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <div class="w-full flex justify-center items-center">
        <DotLottieVue style="height: 300px; width: 300px" autoplay loop src="./loading.lottie" />
      </div>
    </div>
    
    <!-- Not logged in state -->
    <div v-else-if="!isLoggedIn" class="p-6 bg-secondary-100 rounded-lg">
      <div class="text-center">
        <h3 class="mt-2 text-xl font-medium text-secondary-900">Sorry, you don't have access</h3>
        <p class="mt-1 text-secondary-500">Please login</p>
        <div class="mt-4">
          <div class="w-full flex justify-center items-center">
          <DotLottieVue style="height: 300px; width: 300px" autoplay loop src="../../lock.lottie" />
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
          <DotLottieVue style="height: 300px; width: 300px" autoplay loop src="../../lock.lottie" />
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
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import LockIcon from './AnimationComponents/Lock.vue';

export default {
  name: 'RoleBasedContent',
  components: {
    LoginModal,
    RegisterModal,
    DotLottieVue,
    LockIcon
  },
  props: {
    requiredRoles: {
      type: Array,
      default: () => []
    },
    allRoles: {
      type: Boolean,
      default: false
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
