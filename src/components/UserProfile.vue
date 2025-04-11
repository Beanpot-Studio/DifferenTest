<template>
    <form @submit.prevent="handleSubmit" class="space-y-10">
      <!-- Profile Header -->
      <div class="flex items-start space-x-8">
        <div class="flex-shrink-0">
          <div class="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span class="text-4xl font-bold text-primary-600">{{ userInitials }}</span>
          </div>
        </div>
        <div class="flex-1 space-y-6">
          <div>
            <label for="name" class="block text-base font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-base font-medium text-gray-700">Email</label>
              <input
                type="email"
                :value="formData.email"
                disabled
                class="mt-2 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm text-lg px-4 py-3"
              />
            </div>
            <div>
              <label class="block text-base font-medium text-gray-700">Role</label>
              <input
                type="text"
                :value="userRole"
                disabled
                class="mt-2 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm text-lg px-4 py-3"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="space-y-8">
        <h3 class="text-xl font-semibold text-gray-900">Contact Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label for="phone" class="block text-base font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            />
          </div>
          <div>
            <label for="timezone" class="block text-base font-medium text-gray-700">Timezone</label>
            <select
              id="timezone"
              v-model="formData.timezone"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            >
              <option value="">Select your timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Education Information -->
      <div class="space-y-8">
        <h3 class="text-xl font-semibold text-gray-900">Education Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label for="school" class="block text-base font-medium text-gray-700">School</label>
            <input
              type="text"
              id="school"
              v-model="formData.school"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            />
          </div>
          <div>
            <label for="grade" class="block text-base font-medium text-gray-700">Grade</label>
            <select
              id="grade"
              v-model="formData.grade"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            >
              <option value="">Select grade level</option>
              <optgroup label="K-12 Educator">
                <option value="Kindergarten">Kindergarten</option>
                <option value="1-3">1-3</option>
                <option value="4-5">4-5</option>
                <option value="6-8">6-8</option>
                <option value="9-12">9-12</option>
              </optgroup>
              <optgroup label="Higher Education">
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
              </optgroup>
              <optgroup label="Other">
                <option value="Other">Other</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <!-- Teaching Information - not relevant for students -->
      <div v-if="userRole === 'teacher'" class="space-y-8">
        <h3 class="text-xl font-semibold text-gray-900">Teaching Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label for="subjects" class="block text-base font-medium text-gray-700">Subjects</label>
            <input
              type="text"
              id="subjects"
              v-model="formData.subjects"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            />
            <p class="mt-2 text-sm text-gray-500">Enter subjects separated by commas</p>
          </div>
          <div>
            <label for="availability" class="block text-base font-medium text-gray-700">Availability</label>
            <input
              type="text"
              id="availability"
              v-model="formData.availability"
              class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            />
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="space-y-8">
        <h3 class="text-xl font-semibold text-gray-900">About You</h3>
        <div>
          <label for="bio" class="block text-base font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            v-model="formData.bio"
            rows="6"
            class="mt-2 bg-gray-100 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg px-4 py-3"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-lg bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <IconService name="check" size="6" color="text-green-800" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              Profile updated successfully!
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="rounded-lg bg-red-50 p-4">
        <div class="flex">       
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </form>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import IconService from './IconService.vue';
export default {
  name: 'UserProfile',
  components: {
    IconService
  },
  setup() {
    const { user, role } = useAuth();
    const loading = ref(false);
    const success = ref(false);
    const error = ref('');
    const formData = ref({
      name: '',
      email: '',
      phone: '',
      bio: '',
      school: '',
      grade: '',
      subjects: [],
      availability: '',
      timezone: ''
    });

    const userInitials = computed(() => {
      if (!formData.value.name) return '?';
      return formData.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    });

    const loadUserData = async () => {
      if (!user.value?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.value.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Ensure subjects is always an array
          const subjects = data.subjects || [];
          const subjectsArray = Array.isArray(subjects) ? subjects : 
            typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()) : [];

          formData.value = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            school: data.school || '',
            grade: data.grade || '',
            subjects: subjectsArray,
            availability: data.availability || '',
            timezone: data.timezone || ''
          };
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        error.value = 'Failed to load profile data';
      }
    };

    const handleSubmit = async () => {
      if (!user.value?.uid) return;

      loading.value = true;
      error.value = '';
      success.value = false;

      try {
        // Convert subjects string to array if it's a string
        const subjectsArray = typeof formData.value.subjects === 'string' 
          ? formData.value.subjects.split(',').map(s => s.trim())
          : formData.value.subjects;

        await updateDoc(doc(db, 'users', user.value.uid), {
          ...formData.value,
          subjects: subjectsArray,
          updatedAt: new Date()
        });
        success.value = true;
      } catch (err) {
        console.error('Error updating profile:', err);
        error.value = 'Failed to update profile. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    // Watch for changes in the user object
    watch(() => user.value, (newUser) => {
      if (newUser) {
        loadUserData();
      }
    }, { immediate: true });

    return {
      formData,
      loading,
      success,
      error,
      userRole: role,
      userInitials,
      handleSubmit
    };
  }
};
</script> 