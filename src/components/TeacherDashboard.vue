<template>
  <div class="space-y-6">
    <!-- Quick Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-secondary-900">Total Classes</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.totalClasses }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-secondary-900">Active Quizzes</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.totalQuizzes }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-secondary-900">Quiz Submissions</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.totalSubmissions }}</p>
      </div>
    </div>

   

    <!-- Main Content Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'classes'">
        <ClassManager @select-quiz="handleQuizSelect" />
      </div>
      <div v-else-if="activeTab === 'quizzes'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">Quiz Management</h2>
          <button
            @click="activeTab = 'quiz-generator'"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create New Quiz
          </button>
        </div>
        <QuizManager :classId="selectedClassId" />
      </div>
      <div v-else-if="activeTab === 'quiz-generator'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">Create New Quiz</h2>
          <button
            @click="activeTab = 'quizzes'"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Quizzes
          </button>
        </div>
        <QuizGenerator :classId="selectedClassId" />
      </div>
      <div v-else-if="activeTab === 'submissions'">
        <TeacherSubmissions />
      </div>
      <div v-else-if="activeTab === 'reports'">
        <TeacherReports />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import QuizGenerator from './QuizGenerator.vue';
import QuizManager from './QuizManager.vue';
import ClassManager from './ClassManager.vue';
import TeacherSubmissions from './TeacherSubmissions.vue';
import TeacherReports from './TeacherReports.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'TeacherDashboard',
  components: {
    QuizGenerator,
    QuizManager,
    ClassManager,
    TeacherSubmissions,
    TeacherReports
  },
  setup() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const activeTab = ref('classes');
    const selectedClassId = ref(null);
    const stats = ref({
      totalClasses: 0,
      totalQuizzes: 0,
      totalSubmissions: 0
    });
    const isLoading = ref(true);

    const tabs = [
      { id: 'classes', name: 'Classes' },
      { id: 'quizzes', name: 'Quizzes' },
      { id: 'submissions', name: 'Submissions' },
      { id: 'reports', name: 'Reports' }
    ];

    const loadStats = async () => {
      if (!user.value) return;
      
      try {
        isLoading.value = true;
        const dashboardStats = await FirebaseService.getTeacherDashboardStats(user.value.uid);
        stats.value = dashboardStats;
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error', 'Failed to load dashboard statistics', 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const handleQuizSelect = (quizId) => {
      activeTab.value = 'quizzes';
      selectedClassId.value = quizId;
    };

    onMounted(() => {
      if (user.value) {
        loadStats();
      }
    });

    watch(user, (newUser) => {
      if (newUser) {
        loadStats();
      }
    });

    return {
      activeTab,
      selectedClassId,
      stats,
      isLoading,
      handleQuizSelect,
      tabs
    };
  }
};
</script> 