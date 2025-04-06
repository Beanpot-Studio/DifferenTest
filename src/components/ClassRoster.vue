<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Class Roster</h3>
      <div class="flex space-x-2">
        <button
          @click="filterStatus = 'pending'"
          :class="{'bg-primary-600 text-white': filterStatus === 'pending', 'bg-gray-100 text-gray-700': filterStatus !== 'pending'}"
          class="px-3 py-1 rounded-lg text-sm"
        >
          Pending
        </button>
        <button
          @click="filterStatus = 'accepted'"
          :class="{'bg-green-600 text-white': filterStatus === 'accepted', 'bg-gray-100 text-gray-700': filterStatus !== 'accepted'}"
          class="px-3 py-1 rounded-lg text-sm"
        >
          Accepted
        </button>
        <button
          @click="filterStatus = 'rejected'"
          :class="{'bg-red-600 text-white': filterStatus === 'rejected', 'bg-gray-100 text-gray-700': filterStatus !== 'rejected'}"
          class="px-3 py-1 rounded-lg text-sm"
        >
          Rejected
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
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
                    <span class="text-gray-600 font-medium">{{ student.name?.charAt(0) || '?' }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ student.name || 'Unknown Student' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ student.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ formatDate(student.enrolledAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-yellow-100 text-yellow-800': student.status === 'pending',
                  'bg-green-100 text-green-800': student.status === 'accepted',
                  'bg-red-100 text-red-800': student.status === 'rejected'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ student.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button
                  v-if="student.status === 'pending'"
                  @click="updateStudentStatus(student.id, 'accepted')"
                  class="text-green-600 hover:text-green-900"
                >
                  Accept
                </button>
                <button
                  v-if="student.status === 'pending'"
                  @click="updateStudentStatus(student.id, 'rejected')"
                  class="text-red-600 hover:text-red-900"
                >
                  Reject
                </button>
                <button
                  v-if="student.status === 'accepted'"
                  @click="updateStudentStatus(student.id, 'rejected')"
                  class="text-red-600 hover:text-red-900"
                >
                  Revoke
                </button>
                <button
                  v-if="student.status === 'rejected'"
                  @click="updateStudentStatus(student.id, 'accepted')"
                  class="text-green-600 hover:text-green-900"
                >
                  Accept
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default {
  name: 'ClassRoster',
  props: {
    classId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const students = ref([]);
    const filterStatus = ref('pending');
    const loading = ref(true);

    const filteredStudents = computed(() => {
      return students.value.filter(student => student.status === filterStatus.value);
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    };

    const loadStudents = async () => {
      try {
        // Get all enrollments for this class
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('classId', '==', props.classId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        const studentPromises = enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          
          // Get student details
          const studentDoc = await getDoc(doc(db, 'users', enrollmentData.userId));
          const studentData = studentDoc.data();

          return {
            id: enrollmentDoc.id,
            userId: enrollmentData.userId,
            name: studentData?.name || 'Unknown Student',
            email: studentData?.email || 'No email',
            enrolledAt: enrollmentData.enrolledAt,
            status: enrollmentData.status || 'pending'
          };
        });

        students.value = await Promise.all(studentPromises);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        loading.value = false;
      }
    };

    const updateStudentStatus = async (enrollmentId, newStatus) => {
      try {
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        await updateDoc(enrollmentRef, {
          status: newStatus,
          updatedAt: new Date()
        });

        // Update local state
        const studentIndex = students.value.findIndex(s => s.id === enrollmentId);
        if (studentIndex !== -1) {
          students.value[studentIndex].status = newStatus;
        }

        // Log activity
        const student = students.value.find(s => s.id === enrollmentId);
        if (student) {
          await addDoc(collection(db, 'activities'), {
            userId: student.userId,
            type: 'enrollment_status_changed',
            classId: props.classId,
            className: 'Class Name', // You might want to pass this as a prop
            status: newStatus,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating student status:', error);
      }
    };

    onMounted(() => {
      loadStudents();
    });

    return {
      students,
      filteredStudents,
      filterStatus,
      loading,
      formatDate,
      updateStudentStatus
    };
  }
};
</script> 