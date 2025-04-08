<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
      <!-- Close Button -->
      <button 
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
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
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
          />
          <svg
            class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-600 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
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
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {{ classItem.quizCount }} Quizzes
                </span>
              </div>
            </div>
            <button
              @click="joinClass(classItem)"
              :disabled="classItem.enrollmentStatus === 'pending' || classItem.enrollmentStatus === 'accepted'"
              :class="{
                'bg-primary-600 hover:bg-primary-700': !classItem.enrollmentStatus,
                'bg-gray-400 cursor-not-allowed': classItem.enrollmentStatus === 'pending' || classItem.enrollmentStatus === 'accepted',
                'bg-yellow-500': classItem.enrollmentStatus === 'pending'
              }"
              class="px-4 py-2 text-white rounded-lg"
            >
              {{ 
                classItem.enrollmentStatus === 'accepted' ? 'Enrolled' : 
                classItem.enrollmentStatus === 'pending' ? 'Pending' : 
                'Join Class' 
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
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { collection, query, getDocs, doc, setDoc, getDoc, where, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'ClassBrowser',
  components: {
    BaseAnimation
  },
  setup() {
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

    // Filter classes based on search query
    const filteredClasses = computed(() => {
      if (!searchQuery.value) return classes.value;
      const search = searchQuery.value.toLowerCase();
      return classes.value.filter(classItem => 
        classItem.name.toLowerCase().includes(search) ||
        classItem.teacherName.toLowerCase().includes(search) ||
        classItem.description.toLowerCase().includes(search)
      );
    });

    // Show message function
    const showMessagePopup = (text, type = 'success') => {
      message.value = text;
      messageType.value = type;
      showMessage.value = true;
      setTimeout(() => {
        showMessage.value = false;
      }, 5000);
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
        // Get user's enrolled classes and their statuses
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', user.value.uid));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        // Create a map of classId to enrollment status
        const enrollmentStatusMap = {};
        enrollmentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          enrollmentStatusMap[data.classId] = data.status;
        });
        enrolledClasses.value = Object.keys(enrollmentStatusMap);

        // Get all classes
        const classesRef = collection(db, 'classes');
        const classesSnapshot = await getDocs(classesRef);
        
        if (classesSnapshot.empty) {
          classes.value = [];
          return;
        }

        const classPromises = classesSnapshot.docs.map(async (classDoc) => {
          try {
            const classData = classDoc.data();
            
            // Get teacher's details
            const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
            const teacherData = teacherDoc.data();
            
            // Count students
            const studentsQuery = query(enrollmentsRef, where('classId', '==', classDoc.id));
            const studentsSnapshot = await getDocs(studentsQuery);
            
            return {
              id: classDoc.id,
              ...classData,
              teacherName: teacherData?.name || 'Unknown Teacher',
              teacherId: classData.teacherId,
              studentCount: studentsSnapshot.size,
              quizCount: classData.quizzes?.length || 0,
              enrollmentStatus: enrollmentStatusMap[classDoc.id] || null
            };
          } catch (err) {
            console.error(`Error processing class ${classDoc.id}:`, err);
            const classData = classDoc.data();
            return {
              id: classDoc.id,
              ...classData,
              teacherName: 'Unknown Teacher',
              studentCount: 0,
              quizCount: 0,
              enrollmentStatus: null
            };
          }
        });

        const loadedClasses = await Promise.all(classPromises);
        classes.value = loadedClasses.filter(Boolean);
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
      try {
        // Create enrollment document with pending status
        const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
          classId: classItem.id,
          studentId: user.value.uid,
          status: 'pending',
          enrolledAt: new Date()
        });

        // Update student's classes array
        await updateDoc(doc(db, 'users', user.value.uid), {
          classes: arrayUnion(classItem.id)
        });

        // Update class's students array
        await updateDoc(doc(db, 'classes', classItem.id), {
          students: arrayUnion(user.value.uid)
        });

        // Get teacher's name
        const teacherDoc = await getDoc(doc(db, 'users', classItem.teacherId));
        const teacherData = teacherDoc.data();
        const teacherName = teacherData?.name || teacherData?.fullName || 'Unknown Teacher';

        // Log activity
        await addDoc(collection(db, 'activities'), {
          userId: user.value.uid,
          type: 'class_joined',
          classId: classItem.id,
          className: classItem.name,
          teacherName: teacherName,
          timestamp: new Date()
        });

        // Update local state
        classes.value = classes.value.map(c => 
          c.id === classItem.id 
            ? { ...c, isEnrolled: true } 
            : c
        );

        // Show success message
        showMessagePopup('Successfully requested to join the class. The teacher will review your request.');
      } catch (error) {
        console.error('Error joining class:', error);
        showMessagePopup('Failed to join class. Please try again.', 'error');
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

    return {
      showModal,
      loading,
      error,
      classes,
      searchQuery,
      filteredClasses,
      enrolledClasses,
      loadClasses,
      joinClass,
      closeModal,
      showMessage,
      message,
      messageType
    };
  }
};
</script> 