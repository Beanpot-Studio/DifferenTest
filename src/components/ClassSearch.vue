<template>
  <div class="py-4">
    <div class="flex space-x-4">
      <input
        v-model="searchQuery"
        type="text"
        class="flex-1 p-2 border rounded-lg"
        placeholder="Search for classes..."
        @input="searchClasses"
      />
      <button
        @click="searchClasses"
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
import { ref } from 'vue';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../stores/auth';

export default {
  name: 'ClassSearch',
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const hasSearched = ref(false);
    const loading = ref(false);
    const { user } = useAuth();

    const searchClasses = async () => {
      if (!searchQuery.value.trim()) return;
      
      hasSearched.value = true;
      loading.value = true;
      
      try {
        const classesRef = collection(db, 'classes');
        const q = query(
          classesRef,
          where('name', '>=', searchQuery.value),
          where('name', '<=', searchQuery.value + '\uf8ff')
        );
        
        const querySnapshot = await getDocs(q);
        const results = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const classData = docSnapshot.data();
          // Check if user is already enrolled
          const enrollmentRef = await getDoc(doc(db, 'enrollments', `${user.value.uid}_${docSnapshot.id}`));
          
          if (!enrollmentRef.exists()) {
            results.push({
              id: docSnapshot.id,
              ...classData
            });
          }
        }
        
        searchResults.value = results;
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
        // Create enrollment record
        const enrollmentId = `${user.value.uid}_${classId}`;
        await setDoc(doc(db, 'enrollments', enrollmentId), {
          userId: user.value.uid,
          classId: classId,
          enrolledAt: new Date(),
          status: 'active'
        });

        // Emit event to refresh enrolled classes
        searchClasses();
      } catch (error) {
        console.error('Error enrolling in class:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      searchQuery,
      searchResults,
      hasSearched,
      loading,
      searchClasses,
      enrollInClass
    };
  }
};
</script> 