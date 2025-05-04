<template>
  <div class="space-y-6">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex flex-col items-center">
        <BaseAnimation type="loading" :loop="true" />
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-lg shadow-md p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <IconService name="class" :size="6" class="text-primary-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900">Total Classes</h3>
            <p class="text-3xl font-bold text-primary-600">{{ stats.totalClasses }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg shadow-md p-6 bg-gradient-to-br from-green-50 to-teal-100">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <IconService name="quiz" :size="6" class="text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900">Active Quizzes</h3>
            <p class="text-3xl font-bold text-green-600">{{ stats.totalQuizzes }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg shadow-md p-6 bg-gradient-to-br from-yellow-50 to-amber-100">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <IconService name="edit" :size="6" class="text-yellow-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900">Quiz Submissions</h3>
            <p class="text-3xl font-bold text-yellow-600">{{ stats.totalSubmissions }}</p>
          </div>
        </div>
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
            :data-testid="`${tab.id}-tab`" 
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
       
        <QuizManager :classId="selectedClassId"/>
      </div>
      <div v-else-if="activeTab === 'lesson-plans'" class="space-y-6">
        
        <LessonPlanManager :classId="selectedClassId" />
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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import QuizManager from './QuizManager.vue';
import ClassManager from './ClassManager.vue';
import TeacherSubmissions from './TeacherSubmissions.vue';
import TeacherReports from './TeacherReports.vue';
import FirebaseService from '../lib/firebaseService';
import IconService from './IconService.vue';
import BaseAnimation from './BaseAnimation.vue';
import LessonPlanManager from './LessonPlanManager.vue';

export default {
  name: 'TeacherDashboard',
  components: {
    QuizManager,
    ClassManager,
    TeacherSubmissions,
    TeacherReports,
    IconService,
    BaseAnimation,
    LessonPlanManager
  },
  setup() {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const activeTab = ref('classes');
    const selectedClassId = ref(null);
    const stats = ref({
      totalClasses: 0,
      totalQuizzes: 0,
      totalSubmissions: 0
    });
    const isLoading = ref(false);

    const tabs = [
      { id: 'classes', name: 'Classes' },
      { id: 'quizzes', name: 'Quizzes' },
      { id: 'lesson-plans', name: 'Lesson Plans' },
      { id: 'submissions', name: 'Submissions' },
      { id: 'reports', name: 'Reports' }
    ];

    const loadStats = async () => {
      if (!user.value) return;
      
      try {
        isLoading.value = true;
        const dashboardStats = await FirebaseService.getTeacherDashboardStats(user.value.uid);
        stats.value = dashboardStats;
        
        // If we don't have a selected class and there are classes available,
        // select the first one
        if (!selectedClassId.value && dashboardStats.classes && dashboardStats.classes.length > 0) {
          selectedClassId.value = dashboardStats.classes[0].id;
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showError('Failed to load dashboard statistics');
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
      // Add event listener for stats refresh
      window.addEventListener('refreshStats', loadStats);
    });

    onUnmounted(() => {
      // Clean up event listener
      window.removeEventListener('refreshStats', loadStats);
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
      tabs,
      loadStats,
      handleQuizSelect
    };
  }
};
</script> 