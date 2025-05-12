<template>
  <div class="fixed text-left inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-md p-6 relative">
      <button 
        @click="$emit('close')" 
        class="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600"
      >
        <IconService name="x" size="6" />
      </button>
      
      <h2 class="text-2xl font-bold text-center mb-6 text-secondary-800">Create Account</h2>
      
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      <div class="mb-6">
          <label class="block text-secondary-700 text-sm font-bold mb-2">I am a:</label>
          <div class="flex space-x-4">
            <label class="flex items-center text-secondary-700">
              <input 
                type="radio" 
                v-model="role" 
                value="student" 
                class="mr-2 text-secondary-700"
                required
                data-testid="role-student-radio"
              />
              Student
            </label>
            <label class="flex items-center text-secondary-700">
              <input 
                type="radio" 
                v-model="role" 
                value="teacher" 
                class="mr-2 text-secondary-700"
                data-testid="role-teacher-radio"
              />
              Teacher
            </label>
          </div>
        </div>
      
      <!-- Google Sign Up Button -->
      <button
        @click="handleGoogleSignIn"
        class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-secondary-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 transition mb-6"
        :disabled="loading || googleLoading || !role"
        data-testid="register-google-button"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="w-5 h-5" />
        <span>{{ googleLoading ? 'Signing in with Google...' : 'Sign up with Google' }}</span>
      </button>
      
      <div class="flex items-center justify-center gap-2">
        <div class="h-[1px] w-full bg-gray-300"></div>
        <span class="text-secondary-500 text-sm">OR</span>
        <div class="h-[1px] w-full bg-gray-300"></div>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-secondary-700 text-sm font-bold mb-2">Full Name</label>
          <input 
            v-model="name"
            type="text" 
            id="name" 
            class="w-full text-secondary-700 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
            data-testid="register-name-input"
          />
        </div>

        <div class="mb-4">
          <label for="email" class="block text-secondary-700 text-sm font-bold mb-2">Email</label>
          <input 
            v-model="email"
            type="email" 
            id="email" 
            class="w-full text-secondary-700 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
          />
        </div>
        
        <div class="mb-4">
          <label for="password" class="block text-secondary-700 text-sm font-bold mb-2">Password</label>
          <input 
            v-model="password"
            type="password" 
            id="password" 
            class="w-full text-secondary-700 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
            minlength="6"
          />
          <p class="text-xs text-secondary-500 mt-1">Password must be at least 6 characters</p>
        </div>
        
       
        
        <button 
          type="submit" 
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 transition"
          :disabled="loading"
          data-testid="register-submit-button"
        >
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <p class="text-primary-600 underline cursor-pointer"
          @click.prevent="switchToLogin" 
          data-testid="switch-to-login-link"
          >
            Already have an account? Log in →
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { registerUser, signInWithGoogle } from '../../../lib/auth';
import IconService from '../../services/IconService.vue';
export default {
  name: 'RegisterModal',
  components: {
    IconService
  },
  emits: ['close', 'register-success', 'login'],
  
  setup(props, { emit }) {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const role = ref('student'); // Default role
    const loading = ref(false);
    const error = ref('');
    const googleLoading = ref(false);
    
    const handleRegister = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const { success, error: registerError } = await registerUser(email.value, password.value, role.value, name.value);
        
        if (success) {
          emit('register-success');
        } else {
          error.value = registerError.message || 'Failed to create account. Please try again.';
        }
      } catch (err) {
        error.value = 'An unexpected error occurred. Please try again.';
        console.error('Register error:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const handleGoogleSignIn = async () => {
      if (!role.value) {
        error.value = 'Please select whether you are a student or teacher before signing up with Google.';
        return;
      }
      googleLoading.value = true;
      error.value = '';
      try {
        const { success, error: googleError } = await signInWithGoogle(role.value);
        if (success) {
          emit('register-success');
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
    
    const switchToLogin = () => {
      emit('close');
      emit('login');
    };
    
    return {
      name,
      email,
      password,
      role,
      loading,
      error,
      googleLoading,
      handleRegister,
      handleGoogleSignIn,
      switchToLogin
    };
  }
};
</script>
