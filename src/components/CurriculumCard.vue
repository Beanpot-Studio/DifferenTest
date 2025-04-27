<template>
  <div class="bg-white rounded-lg shadow-md w-full">
    <div class="p-6">
      

      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ curriculum.title }}</h2>
      <p class="text-sm text-gray-500 mb-4">Teacher: {{ curriculum.teacherName }}</p>
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm text-gray-500">{{ completedQuizzes }}/{{ totalQuizzes }} quizzes completed with 100% score</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-600 h-2.5 rounded-full" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>
      <div class="mt-4">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Lessons & Quizzes</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="quiz in paginatedQuizzes" :key="quiz.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <img :src="quiz.badgeImage" class="w-10 h-10" />
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <a :href="`/classes/${curriculum.id}/quiz/${quiz.id}`" class="text-blue-600 hover:text-blue-800">
                    {{ quiz.title }}
                  </a>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div v-if="!user" class="flex items-center">
                    <IconService name="lock" size="6" class="mr-2" />
                    <span class="text-gray-900">Please log in</span>
                  </div>
                  
                  <div v-else-if="!isStudent" class="flex items-center">
                    <IconService name="lock" size="6" class="mr-2" />
                    <span class="text-gray-900">Please login as a student to take quiz</span>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <template v-if="!quizAttempts[quiz.id]">
                      <button 
                        @click="openQuizModal(quiz)"
                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Take Quiz
                      </button>
                    </template>
                    <template v-else-if="quizAttempts[quiz.id].score < 100">
                      <button 
                        @click="openQuizModal(quiz)"
                        class="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      >
                        Retake Quiz
                      </button>
                    </template>
                    <template v-else-if="quizAttempts[quiz.id].score === 100 && !badgeStatus[quiz.id]">
                      <a 
                        href="/student"
                        class="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 flex items-center space-x-2"
                      >
                        🏆 Review Quiz & Claim Badge
                      </a>
                    </template>
                    <template v-else>
                      <div class="flex items-center">
                        <IconService name="star" size="6" class="text-yellow-500 mr-1" />
                        <span class="text-gray-900">Badge Earned</span>
                      </div>
                    </template>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span v-if="quizAttempts[quiz.id]" 
                        :class="{
                          'text-green-600': quizAttempts[quiz.id].score === 100,
                          'text-yellow-600': quizAttempts[quiz.id].score >= 70 && quizAttempts[quiz.id].score < 100,
                          'text-red-600': quizAttempts[quiz.id].score < 70
                        }">
                    {{ quizAttempts[quiz.id].score }}%
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-sm text-gray-700">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalQuizzes }} quizzes
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconService name="chevron-left" size="5" />
            </button>
            <span class="text-sm text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconService name="chevron-right" size="5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="close" size="6" />
          </button>
        </div>
        <QuizInterface 
          :quiz-id="selectedQuiz?.id"
          :class-id="curriculum.id"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import IconService from './IconService.vue';
import QuizInterface from './QuizInterface.vue';
import { useAuth } from '../stores/auth';
import FirebaseService from '../lib/firebaseService';

const { user } = useAuth();
const showModal = ref(false);
const selectedQuiz = ref(null);
const quizAttempts = ref({});
const badgeStatus = ref({});
const isMounted = ref(false);

const props = defineProps({
  curriculum: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: '/curricula'
  }
});

const totalQuizzes = computed(() => props.curriculum.quizzes.length);

const completedQuizzes = computed(() => {
  // Count only quizzes in this curriculum that have been passed with 100%
  return props.curriculum.quizzes.filter(quiz => 
    quizAttempts.value[quiz.id]?.score === 100
  ).length;
});

const progressPercentage = computed(() => {
  return (completedQuizzes.value / totalQuizzes.value) * 100;
});

const isStudent = computed(() => {
  return user.value?.role === 'student';
});


const currentPage = ref(1);
const quizzesPerPage = 5;

const totalPages = computed(() => {
  return Math.ceil(props.curriculum.quizzes.length / quizzesPerPage);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * quizzesPerPage;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + quizzesPerPage, props.curriculum.quizzes.length);
});

const paginatedQuizzes = computed(() => {
  return props.curriculum.quizzes.slice(startIndex.value, endIndex.value);
});

// Watch for page changes to ensure we don't go out of bounds
watch(currentPage, (newPage) => {
  if (newPage < 1) {
    currentPage.value = 1;
  } else if (newPage > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const loadQuizAttempts = async () => {
  if (!user.value?.uid) {
    return;
  }
  
  try {
    const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
    const attemptsByQuiz = {};
    
    attempts.forEach(attempt => {
      if (!attemptsByQuiz[attempt.quizId] || 
          attempt.timestamp > attemptsByQuiz[attempt.quizId].timestamp) {
        attemptsByQuiz[attempt.quizId] = {
          score: attempt.score,
          timestamp: attempt.timestamp
        };
      }
    });
    
    quizAttempts.value = attemptsByQuiz;
  } catch (error) {
    console.error('Error loading quiz attempts:', error);
  }
};

const loadBadgeStatus = async () => {
  if (!user.value?.uid) {
    return;
  }
  
  try {
    const badges = await FirebaseService.getUserBadges(user.value.uid);
    const badgeStatusMap = {};
    badges.forEach(badge => {
      badgeStatusMap[badge.metadata.quizId] = true;
    });
    badgeStatus.value = badgeStatusMap;
  } catch (error) {
    console.error('Error loading badge status:', error);
  }
};

// Add watcher for user state changes
watch(() => user.value, async (newUser) => {
  if (!isMounted.value) return;
  if (newUser) {
    await loadQuizAttempts();
    await loadBadgeStatus();
  } else {
    quizAttempts.value = {};
    badgeStatus.value = {};
  }
}, { immediate: true });


const openQuizModal = (quiz) => {
  selectedQuiz.value = quiz;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedQuiz.value = null;
  loadQuizAttempts(); // Reload attempts after quiz completion
};

onMounted(async () => {
  isMounted.value = true;
  if (user.value) {
    await loadQuizAttempts();
    await loadBadgeStatus();
  }
});

onUnmounted(() => {
  isMounted.value = false;
});
</script> 