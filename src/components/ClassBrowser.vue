<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
      <!-- Close Button -->
      <button 
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <IconService name="x" size="6" />
      </button>

      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Browse Available Classes</h2>
        <!-- Message Popup -->
        <div v-if="showMessage" class="mt-4">
          <div :class="{
            'bg-green-100 border-green-400 text-green-700': messageType === 'success',
            'bg-red-100 border-red-400 text-red-700': messageType === 'error'
          }" class="border rounded-lg px-4 py-3 shadow-sm flex items-center">
            <div class="flex-1">
              <p class="font-medium">{{ message }}</p>
            </div>
            <button @click="showMessage = false" class="ml-4">
              <IconService name="x" size="4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search classes..."
            class="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
            @input="handleSearch"
          />
          <IconService name="search" size="4" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" :loop="true" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-gray-900">{{ error }}</p>
        <button
          @click="loadClasses"
          class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>

      <!-- Class List -->
      <div v-else class="space-y-4">
        <div
          v-for="classItem in filteredClasses"
          :key="classItem.id"
          class="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">{{ classItem.name }}</h3>
              <p class="text-sm text-gray-500">{{ classItem.teacherName }}</p>
              <p class="mt-2 text-sm text-gray-600">{{ classItem.description }}</p>
              <div class="mt-2 flex items-center space-x-4">
                <span class="text-sm text-gray-500 flex items-center">
                  <IconService name="quiz" size="4" class="mr-1"/>
                  {{ classItem.quizCount }} Quizzes
                </span>
              </div>
            </div>
            <button
              @click="joinClass(classItem)"
              :disabled="classItem.enrollmentStatus === 'pending' || classItem.enrollmentStatus === 'accepted' || classItem.enrollmentStatus === 'rejected'"
              :class="{
                'bg-primary-600 hover:bg-primary-700': !classItem.enrollmentStatus,
                'bg-gray-400 cursor-not-allowed': classItem.enrollmentStatus === 'pending' || classItem.enrollmentStatus === 'accepted' || classItem.enrollmentStatus === 'rejected',
                'bg-yellow-500': classItem.enrollmentStatus === 'pending'
              }"
              class="px-4 py-2 text-white rounded-lg"
            >
              {{ 
                classItem.enrollmentStatus === 'accepted' ? 'Enrolled' : 
                classItem.enrollmentStatus === 'pending' ? 'Pending' :
                classItem.enrollmentStatus === 'rejected' ? 'Rejected' :
                'Request to Join Class' 
              }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredClasses.length === 0" class="text-center py-8">
          <p class="text-gray-500">No classes found matching your search.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Class Details Popup -->
  <div v-if="selectedClass" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-2xl font-bold">{{ selectedClass.name }}</h2>
          <p class="text-gray-600">{{ selectedClass.description }}</p>
        </div>
        <button @click="selectedClass = null" class="text-gray-500 hover:text-gray-700">
         <IconService name="x" size="6" />
        </button>
      </div>

      <!-- Enrollment Status -->
      <div v-if="user" class="mb-4 p-4 rounded-lg" :class="{
        'bg-yellow-100 text-yellow-800': enrollmentStatus === 'pending',
        'bg-green-100 text-green-800': enrollmentStatus === 'accepted',
        'bg-red-100 text-red-800': enrollmentStatus === 'rejected',
        'bg-gray-100 text-gray-800': !enrollmentStatus
      }">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Your Enrollment Status</h3>
            <p>{{ enrollmentStatus ? `Status: ${enrollmentStatus.charAt(0).toUpperCase() + enrollmentStatus.slice(1)}` : 'Not enrolled' }}</p>
          </div>
          <div v-if="!enrollmentStatus">
            <button
              @click="enrollInClass(selectedClass.id)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              :disabled="enrolling"
            >
              {{ enrolling ? 'Enrolling...' : 'Enroll in Class' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Class Details Content -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold">Teacher</h3>
            <p>{{ selectedClass.teacherName }}</p>
          </div>
          <div>
            <h3 class="font-semibold">Students</h3>
            <p>{{ selectedClass.students?.length || 0 }}</p>
          </div>
        </div>
        <div>
          <h3 class="font-semibold">Quizzes</h3>
          <p>{{ selectedClass.quizCount || 0 }} quizzes available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'ClassBrowser',
  components: {
    BaseAnimation, IconService
  },
  setup(props, { emit }) {
    const { user } = useAuth();
    const showModal = ref(false);
    const loading = ref(true);
    const error = ref(null);
    const classes = ref([]);
    const searchQuery = ref('');
    const enrolledClasses = ref([]);
    const showMessage = ref(false);
    const message = ref('');
    const messageType = ref('success');
    const { showNotification } = useNotification();
    const selectedClass = ref(null);
    const enrollmentStatus = ref(null);
    const enrolling = ref(false);

    // Filter classes based on search query
    const filteredClasses = computed(() => {
      if (!searchQuery.value) return classes.value;
      
      const search = searchQuery.value.toLowerCase().trim();
      return classes.value.filter(classItem => {
        const nameMatch = classItem.name?.toLowerCase().includes(search);
        const teacherMatch = classItem.teacherName?.toLowerCase().includes(search);
        const descriptionMatch = classItem.description?.toLowerCase().includes(search);
        const statusMatch = classItem.enrollmentStatus?.toLowerCase().includes(search);
        
        return nameMatch || teacherMatch || descriptionMatch || statusMatch;
      });
    });

    // Show message function
    const showMessagePopup = (text, type = 'success') => {
      showNotification(
        type === 'success' ? 'Success' : 'Error',
        text,
        type
      );
    };

    // Load all available classes
    const loadClasses = async () => {
      if (!user.value?.uid) {
        error.value = 'Please log in to view available classes.';
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        const { classes: loadedClasses, enrolledClasses: enrolled } = await FirebaseService.getAvailableClasses(user.value.uid);
        classes.value = loadedClasses;
        console.log(classes.value);
        enrolledClasses.value = enrolled;
      } catch (err) {
        console.error('Error loading classes:', err);
        error.value = 'Failed to load classes. Please try again.';
        showMessagePopup('Failed to load classes. Please try again.', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Join a class
    const joinClass = async (classItem) => {
      if (!user.value) return;
      
      try {
        await FirebaseService.enrollInClass(classItem.id, user.value.uid);
        
        // Update local state
        classes.value = classes.value.map(c => 
          c.id === classItem.id 
            ? { ...c, enrollmentStatus: 'pending' } 
            : c
        );

        // Show success message
        showNotification('Success', 'Enrollment request sent successfully', 'success');
      } catch (error) {
        console.error('Error joining class:', error);
        showNotification('Error', 'Failed to join class. Please try again.', 'error');
      }
    };

    // Show modal when join class button is clicked
    onMounted(() => {
      const joinClassBtn = document.getElementById('joinClassBtn');
      if (joinClassBtn) {
        joinClassBtn.addEventListener('click', async () => {
          showModal.value = true;
          await loadClasses();
        });
      }
    });

    // Clean up event listener
    onUnmounted(() => {
      const joinClassBtn = document.getElementById('joinClassBtn');
      if (joinClassBtn) {
        joinClassBtn.removeEventListener('click', () => {
          showModal.value = true;
          loadClasses();
        });
      }
    });

    const closeModal = () => {
      showModal.value = false;
      searchQuery.value = '';
    };

    const checkEnrollmentStatus = async (classId) => {
      if (!user.value) return;
      
      try {
        enrollmentStatus.value = await FirebaseService.getEnrollmentStatus(user.value.uid, classId);
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        enrollmentStatus.value = null;
      }
    };

    const enrollInClass = async (classId) => {
      if (!user.value) return;
      
      try {
        enrolling.value = true;
        await FirebaseService.enrollInClass(classId, user.value.uid);
        enrollmentStatus.value = 'pending';
        showNotification('Success', 'Enrollment request sent successfully', 'success');
      } catch (error) {
        console.error('Error enrolling in class:', error);
        showNotification('Error', 'Failed to enroll in class', 'error');
      } finally {
        enrolling.value = false;
      }
    };

    // Watch for selected class changes
    watch(selectedClass, (newClass) => {
      if (newClass) {
        checkEnrollmentStatus(newClass.id);
      } else {
        enrollmentStatus.value = null;
      }
    });

    // Handle search input
    const handleSearch = () => {
      // Emit the search query to the parent component
      emit('search', searchQuery.value);
    };

    // Watch for changes in the search query
    watch(searchQuery, (newValue) => {
      handleSearch();
    });

    return {
      showModal,
      loading,
      error,
      classes,
      searchQuery,
      enrolledClasses,
      loadClasses,
      joinClass,
      closeModal,
      showMessage,
      message,
      messageType,
      showMessagePopup,
      selectedClass,
      enrollmentStatus,
      enrolling,
      checkEnrollmentStatus,
      enrollInClass,
      handleSearch,
      filteredClasses
    };
  }
};
</script> 