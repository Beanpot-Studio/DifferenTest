<template>
  <div class="mt-6">
    <h3 class="text-lg font-semibold mb-4">Class Roster</h3>
    
    <!-- Status Filter Buttons -->
    <div class="flex space-x-2 mb-4">
      <button
        v-for="status in ['all', 'pending', 'accepted', 'rejected']"
        :key="status"
        @click="currentFilter = status"
        :class="{
          'bg-primary-600 text-white': currentFilter === status,
          'bg-gray-200 text-gray-700 hover:bg-gray-300': currentFilter !== status
        }"
        class="px-3 py-1 rounded-lg text-sm capitalize"
      >
        {{ status }}
      </button>
    </div>

    <!-- Students Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="student in filteredStudents" :key="student.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-gray-500 font-medium">{{ student.name.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ student.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ formatDate(student.enrolledAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-yellow-100 text-yellow-800': student.status === 'pending',
                'bg-green-100 text-green-800': student.status === 'accepted',
                'bg-red-100 text-red-800': student.status === 'rejected'
              }">
                {{ student.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button
                  v-if="student.status === 'pending'"
                  @click="updateStudentStatus(student.id, 'accepted')"
                  class="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                  title="Accept student"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  v-if="student.status === 'pending'"
                  @click="updateStudentStatus(student.id, 'rejected')"
                  class="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                  title="Reject student"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  v-if="student.status === 'accepted'"
                  @click="updateStudentStatus(student.id, 'rejected')"
                  class="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                  title="Remove student"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredStudents.length === 0" class="text-center py-8">
      <p class="text-gray-500">No students found.</p>
    </div>

    
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default {
  name: 'ClassRoster',
  props: {
    classId: {
      type: String,
      required: true
    },
    className: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const students = ref([]);
    const enrollments = ref([]);
    const currentFilter = ref('all');
    const loading = ref(true);

    // Filter students based on current filter
    const filteredStudents = computed(() => {
      if (currentFilter.value === 'all') return students.value;
      return students.value.filter(student => student.status === currentFilter.value);
    });

    // Format date
    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    };

    // Load students
    const loadStudents = async () => {
      try {
        loading.value = true;
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('classId', '==', props.classId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        const studentPromises = enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const studentDoc = await getDoc(doc(db, 'users', enrollmentData.studentId));
          const studentData = studentDoc.data();

          return {
            id: enrollmentDoc.id,
            name: studentData?.name || 'Unknown Student',
            email: studentData?.email || 'No email',
            enrolledAt: enrollmentData.enrolledAt,
            status: enrollmentData.status
          };
        });

        students.value = await Promise.all(studentPromises);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        loading.value = false;
      }
    };

    // Load enrollments
    const loadEnrollments = async () => {
      try {
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('classId', '==', props.classId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        enrollments.value = enrollmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading enrollments:', error);
      }
    };

    // Update student status
    const updateStudentStatus = async (enrollmentId, newStatus) => {
      try {
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        const enrollmentDoc = await getDoc(enrollmentRef);
        const enrollmentData = enrollmentDoc.data();

        // Update enrollment status
        await updateDoc(enrollmentRef, {
          status: newStatus
        });

        // Get student details
        const studentDoc = await getDoc(doc(db, 'users', enrollmentData.studentId));
        const studentData = studentDoc.data();

        // Log activity
        await addDoc(collection(db, 'activities'), {
          userId: enrollmentData.studentId,
          type: 'enrollment_status_changed',
          classId: props.classId,
          className: props.className,
          teacherName: studentData?.name || 'Unknown Teacher',
          status: newStatus,
          timestamp: new Date()
        });

        // Dispatch event to update student's view
        window.dispatchEvent(new CustomEvent('enrollmentStatusChanged'));

        // Reload students
        await loadStudents();
      } catch (error) {
        console.error('Error updating student status:', error);
      }
    };

    onMounted(() => {
      loadStudents();
      loadEnrollments();
    });

    return {
      students,
      enrollments,
      filteredStudents,
      currentFilter,
      loading,
      formatDate,
      updateStudentStatus
    };
  }
};
</script> 