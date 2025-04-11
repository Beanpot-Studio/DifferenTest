<template>
  <div class="space-y-6">
    
    <!-- Class Filter -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Filter by Class
      </label>
      <select
        v-model="selectedClass"
        class="w-full p-2 border rounded-lg"
        @change="fetchSubmissions"
      >
        <option value="">All Classes</option>
        <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
          {{ classItem.name }}
        </option>
      </select>
    </div>

    <!-- Submissions Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quiz
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="submission in submissions" :key="submission.id">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ submission.studentName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ submission.className }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ submission.quizTitle }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="submission.score == 100">🎊</span> {{ submission.score }}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(submission.submittedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="viewSubmission(submission)"
                class="text-primary-600 hover:text-primary-800"
              >
                View Details
              </button>
            </td>
          </tr>
          <tr v-if="submissions.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No submissions found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Submission Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Submission Details</h3>
          <button @click="closeDetailsModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <div v-if="currentSubmission" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Student</p>
              <p class="font-medium">{{ currentSubmission.studentName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Class</p>
              <p class="font-medium">{{ currentSubmission.className }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Quiz</p>
              <p class="font-medium">{{ currentSubmission.quizTitle }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Score</p>
              <p class="font-medium">{{ currentSubmission.score }}%</p>
            </div>
          </div>

          <div class="mt-6">
            <h4 class="font-medium mb-2">Questions and Answers</h4>
            <div class="space-y-4">
              <div v-for="(answer, index) in currentSubmission.answers" :key="index" 
                   class="p-4 rounded-lg" :class="answer.isCorrect ? 'bg-green-50' : 'bg-red-50'">
                <p class="font-medium">{{ answer.question }}</p>
                <p class="text-sm mt-2">
                  Student's Answer: <span :class="answer.isCorrect ? 'text-green-600' : 'text-red-600'">
                    {{ answer.studentAnswer }}
                  </span>
                </p>
                <p v-if="!answer.isCorrect" class="text-sm mt-1 text-gray-600">
                  Correct Answer: {{ answer.correctAnswer }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import IconService from './IconService.vue';
export default {
  name: 'QuizSubmissions',
  components: {
    IconService
  },
  setup() {
    const { user } = useAuth();
    const classes = ref([]);
    const selectedClass = ref('');
    const submissions = ref([]);
    const showDetailsModal = ref(false);
    const currentSubmission = ref(null);

    const fetchClasses = async () => {
      if (!user.value) return;

      try {
        const q = query(
          collection(db, 'classes'),
          where('teacherId', '==', user.value.uid)
        );
        const querySnapshot = await getDocs(q);
        classes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    const fetchSubmissions = async () => {
      if (!user.value) return;

      try {
        let q;
        if (selectedClass.value) {
          q = query(
            collection(db, 'submissions'),
            where('classId', '==', selectedClass.value),
            where('teacherId', '==', user.value.uid)
          );
        } else {
          q = query(
            collection(db, 'submissions'),
            where('teacherId', '==', user.value.uid)
          );
        }

        const querySnapshot = await getDocs(q);
        const submissionsPromises = querySnapshot.docs.map(async doc => {
          const data = doc.data();
          
          // Get student name
          const studentDoc = await getDoc(doc(db, 'users', data.studentId));
          const studentName = studentDoc.data()?.name || 'Unknown Student';
          
          // Get class name
          const classDoc = await getDoc(doc(db, 'classes', data.classId));
          const className = classDoc.data()?.name || 'Unknown Class';

          return {
            id: doc.id,
            ...data,
            studentName,
            className
          };
        });

        submissions.value = await Promise.all(submissionsPromises);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    const viewSubmission = (submission) => {
      currentSubmission.value = submission;
      showDetailsModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      currentSubmission.value = null;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    onMounted(() => {
      fetchClasses();
      fetchSubmissions();
    });

    return {
      classes,
      selectedClass,
      submissions,
      showDetailsModal,
      currentSubmission,
      viewSubmission,
      closeDetailsModal,
      formatDate,
      fetchSubmissions
    };
  }
};
</script> 