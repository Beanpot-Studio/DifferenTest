<template>
  <header class="relative z-50 text-white">
    <div class=" mx-auto px-4 py-3 flex bg-primary-900 justify-between items-center">
      <div class="flex items-center">
        <a href="/" class="text-2xl text-white font-bold">DifferenTest</a>
      </div>
    
      <div class="flex items-center space-x-4">
        <nav class="hidden md:flex space-x-6">
          
          <!-- Show these links only when logged in with specific roles -->
          <template v-if="isLoggedIn">
            <a href="/dashboard" class="hover:text-primary-200 transition">Dashboard</a>
            <a v-if="role === 'teacher'" href="/teacher" class="hover:text-primary-200 transition">Teacher Portal</a>
            <a v-if="role === 'student'" href="/student" class="hover:text-primary-200 transition">Student Portal</a>
          </template>
        </nav>

        
        <!-- User Navigation Component -->
        <UserNavigation 
          :isLoggedIn="isLoggedIn" 
          :userRole="role" 
          :userEmail="userEmail"
          :userName="userName"
          @login="showLoginModal = true"
          @register="showRegisterModal = true"
        />
      </div>
    </div>
    
    
    <!-- Login Modal -->
    <LoginModal 
      v-if="showLoginModal" 
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @register="switchToRegister"
    />

    <!-- Register Modal -->
    <RegisterModal 
      v-if="showRegisterModal" 
      @close="showRegisterModal = false"
      @register-success="handleRegisterSuccess"
      @login="switchToLogin"
    />
  </header>
</template>

<script>
import { ref, onUnmounted, computed } from 'vue';
import UserNavigation from './UserNavigation.vue';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';
import { useAuth } from '../stores/auth';

export default {
  name: 'Header',
  components: {
    UserNavigation,
    LoginModal,
    RegisterModal
  },
  setup() {
    const showLoginModal = ref(false);
    const showRegisterModal = ref(false);
    const { isLoggedIn, role, user, isTeacher, isStudent, cleanup } = useAuth();
    
    onUnmounted(() => {
      cleanup();
    });
    
    const handleLoginSuccess = () => {
      showLoginModal.value = false;
      window.location.href = '/dashboard';
    };

    const handleRegisterSuccess = () => {
      showRegisterModal.value = false;
      window.location.href = '/dashboard';
    };

    const switchToRegister = () => {
      showLoginModal.value = false;
      showRegisterModal.value = true;
    };

    const switchToLogin = () => {
      showRegisterModal.value = false;
      showLoginModal.value = true;
    };
    
    return {
      isLoggedIn,
      role,
      isTeacher,
      isStudent,
      userEmail: computed(() => user.value?.email || ''),
      userName: computed(() => user.value?.name || ''),
      showLoginModal,
      showRegisterModal,
      handleLoginSuccess,
      handleRegisterSuccess,
      switchToRegister,
      switchToLogin
    };
  }
};
</script>
