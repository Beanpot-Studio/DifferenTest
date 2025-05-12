<template>
  <div class="fixed text-left inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-md p-6 relative">
      <button 
        @click="$emit('close')" 
        class="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600"
      >
       <IconService name="x" size="6" />
      </button>
      
      <h2 class="text-2xl font-bold text-center mb-6 text-secondary-800">Log In</h2>
      
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      
     
      
      <button
        @click="handleGoogleSignIn"
        class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-secondary-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 transition mb-6"
        :disabled="loading || googleLoading"
        data-testid="login-google-button"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="w-5 h-5" />
        <span>{{ googleLoading ? 'Signing in with Google...' : 'Sign in with Google' }}</span>
      </button>
      
      <div class="flex items-center justify-center gap-2">
        <div class="h-[1px] w-full bg-gray-300"></div>
        <span class="text-secondary-500 text-sm">OR</span>
        <div class="h-[1px] w-full bg-gray-300"></div>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-secondary-700 text-sm font-bold mb-2">Email</label>
          <input 
            v-model="email"
            type="email" 
            id="email" 
            class="text-secondary-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-secondary-700 text-sm font-bold mb-2">Password</label>
          <input 
            v-model="password"
            type="password" 
            id="password" 
            class="text-secondary-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
          />
        </div>
        
        <button 
          type="submit" id="login-submit-button" 
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 transition"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <p @click.prevent="switchToRegister" class="text-primary-600 underline cursor-pointer">
          Need an account? Sign up for free →
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuth } from '../../../stores/auth';
import { signInWithGoogle } from '../../../lib/auth';
import IconService from '../../services/IconService.vue';

export default {
  name: 'LoginModal',
  emits: ['close', 'login-success', 'register'],
  components: {
    IconService
  },
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref('');
    const { login } = useAuth();
    const googleLoading = ref(false);
    
    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const { success, error: loginError } = await login(email.value, password.value);
        
        if (success) {
          emit('login-success');
        } else {
          error.value = loginError || 'Failed to login. Please try again.';
        }
      } catch (err) {
        error.value = 'An unexpected error occurred. Please try again.';
        console.error('Login error:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const handleGoogleSignIn = async () => {
      googleLoading.value = true;
      error.value = '';
      try {
        const { success, error: googleError } = await signInWithGoogle();
        if (success) {
          emit('login-success');
        } else {
          error.value = googleError?.message || 'Google sign-in failed. Please try again.';
        }
      } catch (err) {
        error.value = 'An unexpected error occurred during Google sign-in.';
        console.error('Google sign-in error:', err);
      } finally {
        googleLoading.value = false;
      }
    };
    
    const switchToRegister = () => {
      emit('close');
      emit('register');
    };
    
    return {
      email,
      password,
      loading,
      error,
      googleLoading,
      handleLogin,
      handleGoogleSignIn,
      switchToRegister
    };
  }
};
</script>
