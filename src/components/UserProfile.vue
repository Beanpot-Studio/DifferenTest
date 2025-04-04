<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center space-x-4">
      <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h2 class="text-2xl font-bold">{{ userData.name || 'User' }}</h2>
        <p class="text-gray-600">{{ userData.email }}</p>
        <p class="text-sm text-gray-500 capitalize">{{ userData.role }}</p>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification.show" 
         :class="['mb-4 p-4 rounded-lg', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
      {{ notification.message }}
    </div>

    <!-- Profile Form -->
    <form @submit.prevent="updateProfile" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            v-model="userData.name"
            type="text"
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            v-model="userData.email"
            type="email"
            disabled
            class="w-full p-2 border rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            v-model="userData.role"
            type="text"
            disabled
            class="w-full p-2 border rounded-lg bg-gray-100 capitalize"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            v-model="userData.phone"
            type="tel"
            class="w-full p-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          v-model="userData.bio"
          rows="4"
          class="w-full p-2 border rounded-lg"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default {
  name: 'UserProfile',
  setup() {
    const { user } = useAuth();
    const userData = ref({
      name: '',
      email: '',
      role: '',
      phone: '',
      bio: ''
    });
    const notification = ref({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type };
      setTimeout(() => {
        notification.value.show = false;
      }, 3000);
    };

    const fetchUserData = async () => {
      if (!user.value) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.value.uid));
        if (userDoc.exists()) {
          userData.value = {
            ...userData.value,
            ...userDoc.data(),
            email: user.value.email
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showNotification('Error fetching profile data', 'error');
      }
    };

    const updateProfile = async () => {
      if (!user.value) return;

      try {
        await updateDoc(doc(db, 'users', user.value.uid), {
          name: userData.value.name,
          phone: userData.value.phone,
          bio: userData.value.bio,
          updatedAt: new Date()
        });
        showNotification('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
      }
    };

    onMounted(() => {
      fetchUserData();
    });

    return {
      userData,
      notification,
      updateProfile
    };
  }
};
</script> 