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
        <p class="text-3xl font-bold text-primary-600">{{ stats.activeQuizzes }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-secondary-900">Quiz Submissions</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.pendingSubmissions }}</p>
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import QuizGenerator from './QuizGenerator.vue';
import QuizManager from './QuizManager.vue';
import ClassManager from './ClassManager.vue';
import TeacherSubmissions from './TeacherSubmissions.vue';

export default {
  name: 'TeacherDashboard',
  components: {
    QuizGenerator,
    QuizManager,
    ClassManager,
    TeacherSubmissions
  },
  setup() {
    const { user } = useAuth();
    const activeTab = ref('classes');
    const selectedClassId = ref(null);
    const stats = ref({
      totalClasses: 0,
      activeQuizzes: 0,
      pendingSubmissions: 0
    });

    const tabs = [
      { id: 'classes', name: 'Classes' },
      { id: 'quizzes', name: 'Quizzes' },
      { id: 'submissions', name: 'Submissions' }
    ];

    const loadStats = async () => {
      if (!user.value?.uid) return;

      try {
        // Get total classes and their quizzes
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherId', '==', user.value.uid)
        );
        const classesSnapshot = await getDocs(classesQuery);
        stats.value.totalClasses = classesSnapshot.size;

        // Count total quizzes across all classes
        let totalQuizzes = 0;
        classesSnapshot.docs.forEach(classDoc => {
          const classData = classDoc.data();
          totalQuizzes += classData.quizzes?.length || 0;
        });
        stats.value.activeQuizzes = totalQuizzes;

        // Get quiz submissions from activities for teacher's classes
        const classIds = classesSnapshot.docs.map(doc => doc.id);
        let totalSubmissions = 0;
        
        // Process classIds in chunks of 10
        for (let i = 0; i < classIds.length; i += 10) {
          const chunk = classIds.slice(i, i + 10);
          const activitiesQuery = query(
            collection(db, 'activities'),
            where('classId', 'in', chunk),
            where('type', '==', 'quiz_completed')
          );
          const activitiesSnapshot = await getDocs(activitiesQuery);
          totalSubmissions += activitiesSnapshot.size;
        }
        
        stats.value.pendingSubmissions = totalSubmissions;
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };

    const handleQuizSelect = (quizId) => {
      activeTab.value = 'quizzes';
      selectedClassId.value = quizId;
    };

    onMounted(() => {
      loadStats();
    });

    return {
      activeTab,
      selectedClassId,
      stats,
      handleQuizSelect,
      tabs
    };
  }
};
</script> 