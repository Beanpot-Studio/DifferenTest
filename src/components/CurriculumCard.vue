<template>
  <div class="bg-white rounded-lg shadow-md w-full">
    <div class="p-6">
      

      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ curriculum.title }}</h2>
      <p class="text-sm text-gray-500 mb-4">Teacher: {{ curriculum.teacherName }}</p>
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm text-gray-500">{{ completedQuizzes }}/{{ totalQuizzes }} quizzes completed</span>
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
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="quiz in curriculum.quizzes" :key="quiz.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <a :href="`${basePath}/${curriculum.id}/quiz/${quiz.id}`" class="text-blue-600 hover:text-blue-800">
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
                    <template v-else-if="!badgeStatus[quiz.id]">
                      <button 
                        @click="claimBadge(quiz)"
                        class="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🏆 Claim Badge
                      </button>
                    </template>
                    <template v-else>
                      <div class="flex items-center">
                        <IconService name="badge" size="6" class="text-yellow-500 mr-1" />
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
import { useNotification } from '../composables/useNotification';

const { user } = useAuth();
const { showNotification } = useNotification();
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
    default: '/curriculum'
  }
});

const totalQuizzes = computed(() => props.curriculum.quizzes.length);

const completedQuizzes = computed(() => {
  // Count only quizzes where the latest attempt has a 100% score
  return Object.values(quizAttempts.value).filter(attempt => attempt.score === 100).length;
});

const progressPercentage = computed(() => {
  return (completedQuizzes.value / totalQuizzes.value) * 100;
});

const isStudent = computed(() => {
  return user.value?.role === 'student';
});

const loadQuizAttempts = async () => {
  if (!user.value?.uid) {
    console.log('No user UID available');
    return;
  }
  
  try {
    const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
    console.log('Quiz attempts:', attempts);
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
    
    console.log('Attempts by quiz:', attemptsByQuiz);
    quizAttempts.value = attemptsByQuiz;
  } catch (error) {
    console.error('Error loading quiz attempts:', error);
  }
};

const loadBadgeStatus = async () => {
  if (!user.value?.uid) {
    console.log('No user UID available for badge status');
    return;
  }
  
  try {
    const badges = await FirebaseService.getUserBadges(user.value.uid);
    const badgeStatusMap = {};
    badges.forEach(badge => {
      badgeStatusMap[badge.quizId] = true;
    });
    badgeStatus.value = badgeStatusMap;
  } catch (error) {
    console.error('Error loading badge status:', error);
  }
};

// Add watcher for user state changes
watch(() => user.value, async (newUser) => {
  if (!isMounted.value) return;
  console.log('User state changed:', newUser);
  if (newUser) {
    await loadQuizAttempts();
    await loadBadgeStatus();
  } else {
    quizAttempts.value = {};
    badgeStatus.value = {};
  }
}, { immediate: true });

const claimBadge = async (quiz) => {
  if (!user.value) return;

  try {
    // Check if badge already exists in Firebase
    const hasBadge = await FirebaseService.checkBadgeExists(user.value.uid, quiz.id);
    if (hasBadge) {
      showNotification('Info', 'You already have this badge!', 'info');
      return;
    }

    // Show initial loading state
    showNotification('Info', 'Issuing your badge...', 'info');

    // Generate Open Badge JSON
    const badgeData = {
      userId: user.value.uid,
      userEmail: user.value.email,
      quizId: quiz.id,
      quizTitle: quiz.title,
      classId: props.curriculum.id,
      name: `${quiz.title} Master`,
      description: `Awarded for completing ${quiz.title} with a perfect score`,
      image: quiz.badgeImage || 'https://badges.beanpotstudio.com/badges/default-badge.png',
      metadata: {
        title: `Perfect Score: ${quiz.title}`,
        description: `Achieved a perfect score on the ${quiz.title} quiz`,
        type: 'quiz_perfect_score',
        icon: '🏆',
        color: 'gold',
        timestamp: new Date().toISOString(),
        quizId: quiz.id,
        classId: props.curriculum.id
      }
    };

    // Store badge in Firebase
    await FirebaseService.createBadge(badgeData);
    showNotification('Success', 'Badge issued successfully!', 'success');
    await loadBadgeStatus();
  } catch (error) {
    console.error('Error claiming badge:', error);
    showNotification('Error', 'Failed to issue badge. Please try again.', 'error');
  }
};

const verifyBadge = async (badgeId) => {
  try {
    const result = await FirebaseService.verifyBadge(badgeId);
    if (result.valid) {
      showNotification('Success', 'Badge verified successfully!', 'success');
    } else {
      showNotification('Error', 'Invalid badge', 'error');
    }
  } catch (error) {
    console.error('Error verifying badge:', error);
    showNotification('Error', 'Failed to verify badge', 'error');
  }
};

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