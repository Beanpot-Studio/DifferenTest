<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">Submissions Manager</h2>
    <div class="bg-white rounded-lg shadow-md p-6">
    <!-- Class Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
      <select 
        v-model="selectedClass" 
        @change="loadSubmissions"
        class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Classes</option>
        <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
          {{ classItem.name }}
        </option>
      </select>
    </div>

    <!-- Quiz Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
      <select 
        v-model="selectedQuiz" 
        @change="loadSubmissions"
        class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Quizzes</option>
        <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
          {{ quiz.title }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Submissions Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-scroll">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            <!--<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>-->
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">
                  {{ submission.studentName }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ submission.className }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ submission.quizTitle }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': submission.score >= 70,
                  'bg-yellow-100 text-yellow-800': submission.score >= 50 && submission.score < 70,
                  'bg-red-100 text-red-800': submission.score < 50
                }"
              >
                {{ submission.score }}%
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatTimeSpent(submission.timeSpent) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(submission.timestamp) }}
            </td>
            <!--<td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-blue-100 text-blue-800': submission.status === 'completed',
                  'bg-purple-100 text-purple-800': submission.isRetake,
                  'bg-yellow-100 text-yellow-800': submission.status === 'needs_improvement',
                  'bg-gray-100 text-gray-800': submission.status !== 'completed' && submission.status !== 'needs_improvement'
                }"
              >
                {{ submission.isRetake ? 'Retake' : submission.status === 'needs_improvement' ? 'Needs Improvement' : submission.status }}
              </span>
            </td>-->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="viewSubmission(submission)"
                class="text-primary-600 hover:text-primary-900 mr-4"
                title="View Details"
              >
                <IconService name="search" :size="4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Submission Details Modal -->
    <div v-if="showSubmissionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="closeSubmissionModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconService name="x" :size="6" />
        </button>

        <div v-if="currentSubmission">
          <h3 class="text-xl font-bold mb-4">
            Quiz Details: {{ currentSubmission.quizTitle }}
          </h3>
          <div class="mb-6">
            <p class="text-gray-600">Student: {{ currentSubmission.studentName }}</p>
            <p class="text-gray-600">Class: {{ currentSubmission.className }}</p>
            <p class="text-gray-600">Submitted: {{ formatDate(currentSubmission.submittedAt) }}</p>
            <p class="text-gray-600">Score: {{ currentSubmission.score }}%</p>
            <p class="text-gray-600">Time Spent: {{ formatTimeSpent(currentSubmission.timeSpent) }}</p>
            <p class="text-gray-600">Total Questions: {{ currentSubmission.totalQuestions }}</p>
            <p class="text-gray-600">Correct Answers: {{ currentSubmission.correctAnswers }}</p>
            <p class="text-gray-600">Status: {{ currentSubmission.isRetake ? 'Retake' : currentSubmission.status }}</p>
            <p v-if="currentSubmission.improvement" class="text-gray-600">
              Improvement: {{ currentSubmission.improvement }}%
            </p>
          </div>

          <div class="space-y-6">
            <div class="border-b pb-4">
              <p class="font-medium mb-2">Activity Description:</p>
              <p class="text-sm text-gray-600">{{ currentSubmission.activityDescription }}</p>
            </div>

            <div v-if="currentSubmission.incorrectAnswers && currentSubmission.incorrectAnswers.length > 0">
              <h4 class="font-medium mb-4">Incorrect Answers:</h4>
              <div v-for="(answer, index) in currentSubmission.incorrectAnswers" :key="index" class="mb-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-3">
                    <span class="inline-flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {{ index + 1 }}
                    </span>
                  </div>
                  <div class="flex-grow">
                    <p class="font-medium text-gray-900">{{ answer.question }}</p>
                    <div class="mt-2 space-y-2">
                      <div class="p-2 rounded bg-red-50 text-red-800">
                        <p class="text-sm font-medium">Student's Answer:</p>
                        <p class="text-sm">{{ answer.selectedOption }}</p>
                      </div>
                      <div class="p-2 rounded bg-green-50 text-green-800">
                        <p class="text-sm font-medium">Correct Answer:</p>
                        <p class="text-sm">{{ answer.correctOption }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
import BaseAnimation from './BaseAnimation.vue';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'TeacherSubmissions',
  components: {
    BaseAnimation, IconService
  },
  setup() {
    const { user } = useAuth();
    const loading = ref(false);
    const classes = ref([]);
    const quizzes = ref([]);
    const submissions = ref([]);
    const selectedClass = ref('');
    const selectedQuiz = ref('');
    const showSubmissionModal = ref(false);
    const currentSubmission = ref(null);
    const error = ref(null);

    const loadClasses = async () => {
      try {
        classes.value = await FirebaseService.getTeacherClasses(user.value.uid);
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };

    const loadQuizzes = async () => {
      try {
        if (selectedClass.value) {
          quizzes.value = await FirebaseService.getClassQuizzes(selectedClass.value);
        } else {
          quizzes.value = await FirebaseService.getTeacherQuizzes(user.value.uid);
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    };

    const loadSubmissions = async () => {
      loading.value = true;
      try {
        const submissionsData = await FirebaseService.getTeacherSubmissions(
          user.value.uid,
          selectedClass.value,
          selectedQuiz.value
        );
        submissions.value = submissionsData;
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        loading.value = false;
      }
    };

    const viewSubmission = (submission) => {
      currentSubmission.value = submission;
      showSubmissionModal.value = true;
    };

    const closeSubmissionModal = () => {
      showSubmissionModal.value = false;
      currentSubmission.value = null;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    };

    const formatTimeSpent = (timeSpent) => {
      if (!timeSpent) return 'N/A';
      try {
        const totalSeconds = Math.floor(timeSpent / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes} minutes ${seconds} seconds`;
      } catch (error) {
        console.error('Error formatting time spent:', error);
        return 'Invalid Time';
      }
    };

    onMounted(async () => {
      if (!user.value) return;
      await loadClasses();
      await loadQuizzes();
      await loadSubmissions();
    });

    return {
      loading,
      classes,
      quizzes,
      submissions,
      selectedClass,
      selectedQuiz,
      showSubmissionModal,
      currentSubmission,
      error,
      loadSubmissions,
      viewSubmission,
      closeSubmissionModal,
      formatDate,
      formatTimeSpent
    };
  }
};
</script> 