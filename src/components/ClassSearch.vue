<template>
  <div class="py-4">
    <div class="flex space-x-4">
      <input
        v-model="searchQuery"
        type="text"
        class="flex-1 p-2 border rounded-lg"
        placeholder="Search for classes..."
        @input="handleSearch"
      />
      <button
        @click="handleSearch"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Search
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="space-y-4">
      <h3 class="font-semibold text-lg">Available Classes</h3>
      <div class="grid gap-4">
        <div
          v-for="classItem in searchResults"
          :key="classItem.id"
          class="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold">{{ classItem.name }}</h4>
              <p class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ classItem.description }}</p>
            </div>
            <button
              @click="enrollInClass(classItem.id)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              :disabled="loading"
            >
              {{ loading ? 'Enrolling...' : 'Enroll' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="hasSearched" class="text-center py-8 text-gray-500">
      No classes found matching your search.
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useAuth } from '../stores/auth';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'ClassSearch',
  emits: ['search', 'enrolled'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const hasSearched = ref(false);
    const loading = ref(false);
    const { user } = useAuth();

    const handleSearch = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = [];
        hasSearched.value = false;
        emit('search', '');
        return;
      }
      
      hasSearched.value = true;
      loading.value = true;
      
      try {
        const classes = await FirebaseService.searchClasses(searchQuery.value);
        const results = [];
        
        for (const classItem of classes) {
          // Check if user is already enrolled
          const enrollments = await FirebaseService.getEnrollmentsByClass(classItem.id);
          const isEnrolled = enrollments.some(e => e.studentId === user.value.uid);
          
          if (!isEnrolled) {
            results.push(classItem);
          }
        }
        
        searchResults.value = results;
        emit('search', searchQuery.value);
      } catch (error) {
        console.error('Error searching classes:', error);
      } finally {
        loading.value = false;
      }
    };

    const enrollInClass = async (classId) => {
      if (!user.value) return;
      
      loading.value = true;
      try {
        await FirebaseService.createEnrollment({
          userId: user.value.uid,
          classId: classId,
          enrolledAt: new Date(),
          status: 'active'
        });

        // Emit event to refresh enrolled classes
        emit('enrolled');
        handleSearch();
      } catch (error) {
        console.error('Error enrolling in class:', error);
      } finally {
        loading.value = false;
      }
    };

    // Watch for changes in the search query
    watch(searchQuery, () => {
      handleSearch();
    });

    return {
      searchQuery,
      searchResults,
      hasSearched,
      loading,
      handleSearch,
      enrollInClass
    };
  }
};
</script> 