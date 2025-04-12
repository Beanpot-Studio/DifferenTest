<template>
  <header class="relative z-50 text-white">
    <div class=" mx-auto px-4 py-3 flex bg-gradient-to-r from-primary-700 to-primary-950 justify-between items-center">
      <div class="flex items-center">
        <a href="/" class="text-2xl text-white font-bold">DifferenTest</a>
      </div>
    
      <div class="flex items-center space-x-4">
        <nav class="hidden md:flex space-x-6">
          <a href="/curricula" class="hover:text-primary-200 transition text-white">Open Curricula</a>

          <!-- Show these links only when logged in with specific roles -->
          <template v-if="isLoggedIn">
            <a v-if="role === 'teacher'" href="/teacher" class="hover:text-primary-200 transition text-white">Teacher Portal</a>
            <a v-if="role === 'student'" href="/student" class="hover:text-primary-200 transition text-white">Student Portal</a>
          </template>
          <!-- Curriculum Link (visible to all) -->
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
    <LoginModal id="login-modal"
      v-if="showLoginModal" 
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @register="switchToRegister"
    />

    <!-- Register Modal -->
    <RegisterModal id="register-modal"
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
      if (role.value === 'teacher') {
        window.location.href = '/teacher';
      } else if (role.value === 'student') {
        window.location.href = '/student';
      } else {
        // If no role is set, redirect to home page
        window.location.href = '/';
      }
    };

    const handleRegisterSuccess = () => {
      showRegisterModal.value = false;
      if (role.value === 'teacher') {
        window.location.href = '/teacher';
      } else if (role.value === 'student') {
        window.location.href = '/student';
      } else {
        // If no role is set, redirect to home page
        window.location.href = '/';
      }
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
