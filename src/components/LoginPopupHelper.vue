<template>
  <div>
    <LoginModal
      v-if="showLoginModal"
      @close="hide"
      @login-success="handleLoginSuccess"
      @register="showRegister"
    />
    <RegisterModal
      v-if="showRegisterModal"
      @close="hideRegister"
      @register-success="handleLoginSuccess"
      @login="show"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import LoginModal from "./LoginModal.vue";
import RegisterModal from "./RegisterModal.vue";
import { useAuth } from "../stores/auth";

// Create a single source of truth for the login popup state
const state = {
  showLoginModal: ref(false),
  showRegisterModal: ref(false)
};

// Create a single instance of the login popup helper
let instance = null;

export function useLoginPopup() {
  if (!instance) {
    instance = {
      showLoginModal: state.showLoginModal,
      showRegisterModal: state.showRegisterModal,
      show() {
        state.showRegisterModal.value = false;
        state.showLoginModal.value = true;
      },
      hide() {
        state.showLoginModal.value = false;
      },
      showRegister() {
        state.showLoginModal.value = false;
        state.showRegisterModal.value = true;
      },
      hideRegister() {
        state.showRegisterModal.value = false;
      },
      handleLoginSuccess() {
        state.showLoginModal.value = false;
        state.showRegisterModal.value = false;
        
        // Get the auth store and ensure it's initialized
        const { role, initialize } = useAuth();
        
        // Initialize auth if needed
        initialize().then(() => {
          // Wait a moment for the role to be set
          setTimeout(() => {
            if (role.value === 'teacher') {
              window.location.href = "/teacher";
            } else if (role.value === 'student') {
              window.location.href = "/student";
            } else {
              // If no role is set, redirect to home page
              window.location.href = "/";
            }
          }, 100);
        });
      }
    };
  }
  return instance;
}

export default {
  name: "LoginPopupHelper",
  components: {
    LoginModal,
    RegisterModal
  },
  setup() {
    // Initialize the instance immediately
    const loginPopup = useLoginPopup();

    const handleShowRegisterModal = () => {
      loginPopup.showRegister();
    };

    onMounted(() => {
      // Ensure the component is properly initialized
      window.addEventListener('show-register-modal', handleShowRegisterModal);
    });

    onUnmounted(() => {
      window.removeEventListener('show-register-modal', handleShowRegisterModal);
    });

    return {
      showLoginModal: loginPopup.showLoginModal,
      showRegisterModal: loginPopup.showRegisterModal,
      handleLoginSuccess: loginPopup.handleLoginSuccess,
      showRegister: loginPopup.showRegister,
      show: loginPopup.show,
      hide: loginPopup.hide,
      hideRegister: loginPopup.hideRegister
    };
  }
};
</script> 