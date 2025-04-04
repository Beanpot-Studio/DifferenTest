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
import { ref, onMounted } from "vue";
import LoginModal from "./LoginModal.vue";
import RegisterModal from "./RegisterModal.vue";

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
        // Redirect to dashboard after successful login
        window.location.href = "/dashboard";
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

    onMounted(() => {
      // Ensure the component is properly initialized
      console.log("LoginPopupHelper mounted");
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