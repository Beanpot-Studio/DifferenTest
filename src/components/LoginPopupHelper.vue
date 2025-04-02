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
        console.log('Showing login modal');
        state.showRegisterModal.value = false;
        state.showLoginModal.value = true;
      },
      hide() {
        console.log('Hiding login modal');
        state.showLoginModal.value = false;
      },
      showRegister() {
        console.log('Showing register modal');
        state.showLoginModal.value = false;
        state.showRegisterModal.value = true;
      },
      hideRegister() {
        console.log('Hiding register modal');
        state.showRegisterModal.value = false;
      },
      handleLoginSuccess() {
        console.log('Login success');
        state.showLoginModal.value = false;
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
      handleLoginSuccess: () => {
        console.log('Login success in component');
        loginPopup.handleLoginSuccess();
      },
      showRegister: () => {
        console.log('Showing register in component');
        loginPopup.showRegister();
      },
      hide: () => {
        console.log('Hiding login in component');
        loginPopup.hide();
      },
      hideRegister: () => {
        console.log('Hiding register in component');
        loginPopup.hideRegister();
      }
    };
  }
};
</script> 