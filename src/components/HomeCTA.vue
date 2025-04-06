<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <button
        @click="showRegisterModal = true"
        class="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition"
      >
        Sign Up Now
      </button>
      <button
        @click="scrollToAbout"
        class="inline-block bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition"
      >
        Learn More
      </button>
    </div>

    <RegisterModal
      v-if="showRegisterModal"
      @close="showRegisterModal = false"
      @register-success="handleRegisterSuccess"
      @login="showLoginModal = true"
    />

    <LoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @register="showRegisterModal = true"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import RegisterModal from './RegisterModal.vue';
import LoginModal from './LoginModal.vue';
import { useAuth } from '../stores/auth';

export default {
  name: 'HomeCTA',
  components: {
    RegisterModal,
    LoginModal
  },
  setup() {
    const showRegisterModal = ref(false);
    const showLoginModal = ref(false);
    const { role, initialize } = useAuth();

    const scrollToAbout = () => {
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleRegisterSuccess = () => {
      showRegisterModal.value = false;
      initialize().then(() => {
        setTimeout(() => {
          if (role.value === 'teacher') {
            window.location.href = '/teacher';
          } else if (role.value === 'student') {
            window.location.href = '/student';
          } else {
            window.location.href = '/';
          }
        }, 100);
      });
    };

    const handleLoginSuccess = () => {
      showLoginModal.value = false;
      initialize().then(() => {
        setTimeout(() => {
          if (role.value === 'teacher') {
            window.location.href = '/teacher';
          } else if (role.value === 'student') {
            window.location.href = '/student';
          } else {
            window.location.href = '/';
          }
        }, 100);
      });
    };

    return {
      showRegisterModal,
      showLoginModal,
      scrollToAbout,
      handleRegisterSuccess,
      handleLoginSuccess
    };
  }
};
</script> 