<template>
  <header class="bg-indigo-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <a href="/" class="text-2xl font-bold">EduPortal</a>
      </div>
      
      <div class="flex items-center space-x-4">
        <nav class="hidden md:flex space-x-6">
          <a href="/" class="hover:text-indigo-200 transition">Home</a>
          
          <!-- Show these links only when logged in with specific roles -->
          <template v-if="isLoggedIn">
            <a href="/dashboard" class="hover:text-indigo-200 transition">Dashboard</a>
            <a v-if="userRole === 'teacher'" href="/teacher" class="hover:text-indigo-200 transition">Teacher Portal</a>
            <a v-if="userRole === 'student'" href="/student" class="hover:text-indigo-200 transition">Student Portal</a>
          </template>
        </nav>
        
        <!-- User Navigation Component -->
        <UserNavigation 
          :isLoggedIn="isLoggedIn" 
          :userRole="userRole" 
          :userEmail="userEmail"
          @login="showLoginModal = true"
          @register="showRegisterModal = true"
          @logout="handleLogout"
        />
      </div>
    </div>
    
    <!-- Login Modal -->
    <LoginModal 
      v-if="showLoginModal" 
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
    />
    
    <!-- Register Modal -->
    <RegisterModal 
      v-if="showRegisterModal" 
      @close="showRegisterModal = false"
      @register-success="handleRegisterSuccess"
    />
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import UserNavigation from './UserNavigation.vue';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';
import { setupAuthListener, logoutUser } from '../lib/auth';

export default {
  name: 'Header',
  components: {
    UserNavigation,
    LoginModal,
    RegisterModal
  },
  setup() {
    const isLoggedIn = ref(false);
    const userRole = ref(null);
    const userEmail = ref('');
    const showLoginModal = ref(false);
    const showRegisterModal = ref(false);
    let unsubscribeAuth = null;
    
    onMounted(() => {
      // Set up authentication listener
      unsubscribeAuth = setupAuthListener(({ user, role }) => {
        isLoggedIn.value = !!user;
        userRole.value = role;
        userEmail.value = user ? user.email : '';
      });
    });
    
    onUnmounted(() => {
      // Clean up auth listener when component is unmounted
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    });
    
    const handleLogout = async () => {
      const { success } = await logoutUser();
      if (success) {
        // Redirect to home page after logout
        window.location.href = '/';
      }
    };
    
    const handleLoginSuccess = () => {
      showLoginModal.value = false;
      // Redirect to dashboard after login
      window.location.href = '/dashboard';
    };
    
    const handleRegisterSuccess = () => {
      showRegisterModal.value = false;
      // Redirect to dashboard after registration
      window.location.href = '/dashboard';
    };
    
    return {
      isLoggedIn,
      userRole,
      userEmail,
      showLoginModal,
      showRegisterModal,
      handleLogout,
      handleLoginSuccess,
      handleRegisterSuccess
    };
  }
};
</script>
