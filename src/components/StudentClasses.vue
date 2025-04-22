<template>
  <div class="space-y-6">
    <!-- Class Search -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Find Classes</h2>
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for classes..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          @click="searchClasses"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Search
        </button>
      </div>
      
      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mt-4 space-y-4">
        <div v-for="classItem in searchResults" :key="classItem.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ classItem.name }}</h3>
              <p class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</p>
              <p class="text-sm text-gray-600">Class Code: {{ classItem.code }}</p>
            </div>
            <button
              v-if="!isEnrolled(classItem.id)"
              @click="requestToJoin(classItem.id)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Request to Join
            </button>
            <span
              v-else
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              Enrolled
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Classes -->
    <div v-if="pendingClasses.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Pending Classes</h2>
      <div class="space-y-4">
        <div v-for="classItem in pendingClasses" :key="classItem.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ classItem.name }}</h3>
              <p class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</p>
              <p class="text-sm text-gray-600">Class Code: {{ classItem.code }}</p>
            </div>
            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Pending Approval
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- My Classes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Enrolled Classes</h2>
      <div v-if="loading" class="text-center py-4">
        <BaseAnimation type="loading" :loop="true" />
      </div>    
      
      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>
      
      <div v-else-if="enrolledClasses.length === 0" class="text-gray-500 text-center py-4">
        You are not enrolled in any classes yet.
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="classItem in enrolledClasses" :key="classItem.id" class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center ">
                <h3 class="text-xl font-bold text-gray-900">{{ classItem.name || 'Unnamed Class' }}</h3>
                <span :class="{
                  'bg-yellow-100 text-yellow-800': classItem.enrollmentStatus === 'pending',
                  'bg-green-100 text-green-800': classItem.enrollmentStatus === 'accepted',
                  'bg-red-100 text-red-800': classItem.enrollmentStatus === 'rejected',
                  'bg-gray-100 text-gray-800': !classItem.enrollmentStatus
                }" class="px-3 ml-5 py-1 rounded-full text-sm font-medium">
                  {{ 
                    classItem.enrollmentStatus === 'accepted' ? 'Enrolled' : 
                    classItem.enrollmentStatus === 'pending' ? 'Pending Approval' :
                    classItem.enrollmentStatus === 'rejected' ? 'Rejected' :
                    'Not Enrolled' 
                  }}
                </span>
              </div>
              <div class="flex items-center space-x-4 mt-2">
                <div class="flex items-center space-x-2">
                  <IconService name="user" size="4" />
                  <p class="text-sm font-medium text-gray-700 pt-4">
                    Teacher: <span class="text-primary-600">{{ classItem.teacherName || 'Unknown Teacher' }}</span>
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <IconService name="key" size="4" />
                  <p class="text-sm font-medium text-gray-700 pt-4">
                    Class Code: <span class="font-mono text-primary-600">{{ classItem.code || 'N/A' }}</span>
                  </p>
                </div>
              </div>
            </div>
            <!--<button
              @click="leaveClass(classItem.id)"
              :disabled="classItem.enrollmentStatus !== 'accepted'"
              :class="{
                'bg-red-600 hover:bg-red-700': classItem.enrollmentStatus === 'accepted',
                'bg-gray-400 cursor-not-allowed': classItem.enrollmentStatus !== 'accepted'
              }"
              class="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Leave Class</span>
            </button>-->
          </div>

          <!-- Class Progress -->
          <div v-if="classItem.enrollmentStatus === 'accepted'" class="mt-4">
            <h4 class="font-lg font-bold mb-2">Quizzes</h4>
          
            <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
              No quizzes available yet.
            </div>
            <div v-else class="space-y-2">
              <div v-for="quiz in classItem.quizzes" :key="quiz.id" class="border rounded p-3">
                <div v-if="getQuizAttempt(classItem.id, quiz.id)" class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ quiz.title }}</h4>
                    <p class="text-sm text-gray-500 mt-1">
                      Questions: {{ quiz.questionCount || 0 }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">
                      Score: {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                      <span v-if="getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge" class="text-gray-600 ml-2">
                        - Review quiz and claim badge
                      </span>
                    </span>
                    <div class="flex space-x-2">
                      <button
                        @click="reviewQuiz(classItem.id, quiz.id)"
                        class="text-sm font-medium rounded bg-green-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                      >
                        <span>Review Quiz</span>
                        <span v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge" class="ml-1">🏆</span>
                      </button>
                      <a
                        v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge"
                        :href="getQuizAttempt(classItem.id, quiz.id)?.verificationUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                      >
                        <span>Verify Badge</span>
                      </a>
                      <button
                        v-if="getQuizAttempt(classItem.id, quiz.id).score < 100"
                        @click="startQuiz(classItem.id, quiz)"
                        class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                </div>
  
              </div>
            </div>
          </div>
          <div v-else-if="classItem.enrollmentStatus === 'pending'" class="mt-4 text-yellow-600">
            <p class="text-sm">Your enrollment request is pending approval. You will be able to access quizzes once approved.</p>
          </div>
          <div v-else-if="classItem.enrollmentStatus === 'rejected'" class="mt-4 text-red-600">
            <p class="text-sm">Your enrollment request was rejected. Please contact the teacher if you believe this is an error.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Open Classes -->
    <div v-if="openClasses?.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Open Classes</h2>
      <div v-if="loading" class="text-center py-4">
        <BaseAnimation type="loading" :loop="true" />
      </div>    
      
      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="classItem in openClasses" :key="classItem.id" class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center">
                <h3 class="text-xl font-bold text-gray-900">{{ classItem.name || 'Unnamed Class' }}</h3>
                <span class="px-3 ml-5 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Open Class
                </span>
              </div>
              <div class="flex items-center space-x-4 mt-2">
                <div class="flex items-center space-x-2">
                  <IconService name="user" size="4" />
                  <p class="text-sm font-medium text-gray-700 pt-4">
                    Teacher: <span class="text-primary-600">{{ classItem.teacherName || 'Unknown Teacher' }}</span>
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <IconService name="key" size="4" />
                  <p class="text-sm font-medium text-gray-700 pt-4">
                    Class Code: <span class="font-mono text-primary-600">{{ classItem.code || 'N/A' }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Class Progress -->
          <div class="mt-4">
            <h4 class="font-lg font-bold mb-2">Attempted Quizzes</h4>
          
            <div v-if="!classItem.quizzes?.length" class="text-gray-500 text-sm">
              No quizzes available yet.
            </div>
            <div v-else class="space-y-2">
              <template v-for="quiz in classItem.quizzes" :key="quiz.id">
                <div v-if="getQuizAttempt(classItem.id, quiz.id)" class="border rounded p-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ quiz.title }}</h4>
                      <p class="text-sm text-gray-500 mt-1">
                        Questions: {{ quiz.questionCount || 0 }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">
                        Score: {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                        <span v-if="getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge" class="text-gray-600 ml-2">
                          - Review quiz and claim badge
                        </span>
                      </span>
                      <div class="flex space-x-2">
                        <button
                          @click="reviewQuiz(classItem.id, quiz.id)"
                          class="text-sm font-medium rounded bg-green-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                        >
                          <span>Review Quiz</span>
                          <span v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge" class="ml-1">🏆</span>
                        </button>
                        <a
                          v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge"
                          :href="getQuizAttempt(classItem.id, quiz.id)?.verificationUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                        >
                          <span>Verify Badge</span>
                        </a>
                        <button
                          v-if="getQuizAttempt(classItem.id, quiz.id).score < 100"
                          @click="startQuiz(classItem.id, quiz)"
                          class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Modal -->
    <BaseModal
      v-if="selectedQuiz"
      :is-open="isQuizModalOpen"
      @close="closeQuizModal"
      :title="selectedQuiz.title"
    >
      <QuizInterface
        v-if="selectedQuiz"
        :quiz-id="selectedQuiz.id"
        :class-id="selectedClass?.id"
        :is-embedded="false"
        @quiz-completed="handleQuizCompleted"
      />
    </BaseModal>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="closeReviewModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconService name="x" size="4" />
        </button>

        <div v-if="reviewData?.quiz">
          <h3 class="text-xl font-bold mb-4">Review: {{ reviewData.quiz.title }}</h3>
          
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Score</p>
                <p class="text-2xl font-bold">{{ reviewData.attempt.score }}%</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Time Spent</p>
                <p class="text-2xl font-bold">{{ Math.floor(reviewData.attempt.timeSpent / 1000) }}s</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-8">
            <div 
              v-for="(question, index) in reviewData.quiz.questions" 
              :key="index"
              class="border-b pb-6"
            >
              <div class="mb-4">
                <p class="font-medium">{{ index + 1 }}. {{ question.text }}</p>
                <div class="mt-2 space-y-2">
                  <div 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    :class="{
                      'text-green-600': optionIndex === question.correctIndex,
                      'text-red-600': optionIndex === question.userAnswer && optionIndex !== question.correctIndex
                    }"
                    class="flex items-center space-x-2"
                  >
                    <span v-if="optionIndex === question.correctIndex">✓</span>
                    <span v-else-if="optionIndex === question.userAnswer">✗</span>
                    <span v-else>&nbsp;&nbsp;</span>
                    <span>{{ option.text }}</span>
                  </div>
                </div>
              </div>

              <div v-if="!question.isCorrect" class="mt-4">
                <button
                  @click="getExplanation(index)"
                  class="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Get detailed explanation
                </button>
                <div v-if="explanations[index]" class="mt-2 p-3 bg-primary-50 rounded">
                  {{ explanations[index] }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              v-if="reviewData.attempt.score === 100 && !reviewData.hasBadge"
              @click="claimBadge"
              :disabled="isMintingBadge"
              class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isMintingBadge" class="animate-spin">⏳</span>
              <span v-else>🏆</span>
              <span>{{ isMintingBadge ? 'Claiming Badge...' : 'Claim Badge' }}</span>
            </button>
            <button
              v-if="reviewData.attempt.score < 100"
              @click="startQuiz(reviewData.class.id, reviewData.quiz)"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retake Quiz
            </button>
          </div>
        </div>
        <div v-else-if="loading" class="text-center py-4">
          <BaseAnimation type="loading" :loop="true" />
        </div>
      </div>
    </div>

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

    <!-- Classes Tab -->
    <div v-if="activeTab === 'activities'" class="space-y-6">
      <RecentActivity />
    </div>

    <!-- Quiz History Tab -->
    <div v-else-if="activeTab === 'history'" class="space-y-6">
      <QuizHistory />
    </div>

    <!-- Achievements Tab -->
    <div v-else-if="activeTab === 'achievements'" class="space-y-6">
      <BadgeDisplay />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useAuth } from '../stores/auth';
import ClassSearch from './ClassSearch.vue';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAnimation from './BaseAnimation.vue';
import { useNotification } from '../composables/useNotification';
import QuizHistory from './QuizHistory.vue';
import RecentActivity from './RecentActivity.vue';
import QuizInterface from './QuizInterface.vue';
import BaseModal from './BaseModal.vue';
import BadgeDisplay from './BadgeDisplay.vue';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

export default {
  name: 'StudentClasses',
  components: {
    ClassSearch, BaseAnimation, QuizHistory, RecentActivity, QuizInterface, BaseModal, BadgeDisplay, IconService
  },
  setup() {
    const { user, initialized } = useAuth();
    const classes = ref([]);
    const loading = ref(true);
    const showQuizModal = ref(false);
    const showReviewModal = ref(false);
    const currentQuiz = ref(null);
    const currentClassId = ref(null);
    const selectedQuiz = ref(null);
    const selectedClass = ref(null);
    const isQuizModalOpen = ref(false);
    const answers = ref([]);
    const quizCompleted = ref(false);
    const quizScore = ref(0);
    const quizAttempts = ref({});
    const quizAttemptsWithBadges = ref({});
    const explanations = ref({});
    const quizStartTime = ref(0);
    const error = ref(null);
    const { showSuccess, showError } = useNotification();
    const activeTab = ref('activities');
    const enrolledClasses = ref([]);
    const pendingClasses = ref([]);
    const openClasses = ref([]);
    const reviewData = ref(null);
    const tabs = [
      { id: 'activities', name: 'Activities' },
      { id: 'history', name: 'Quiz History' },
      { id: 'achievements', name: 'Achievements' }
    ];

    // Add search query ref and filtered classes computed property
    const searchQuery = ref('');
    const searchResults = ref([]);

    // Filter classes to only show enrolled ones
    const filteredClasses = computed(() => {
      return enrolledClasses.value;
    });

    const isEnrolled = (classId) => {
      return enrolledClasses.value.some(c => c.id === classId);
    };

    const searchClasses = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
      }

      try {
        loading.value = true;
        const { classes: foundClasses } = await FirebaseService.getClasses({
          searchQuery: searchQuery.value,
          includeTeacherInfo: true,
          isPublic: false
        });
        
        // Filter out classes where user is already enrolled
        searchResults.value = foundClasses.filter(classItem => 
          !enrolledClasses.value.some(enrolled => enrolled.id === classItem.id)
        );
      } catch (err) {
        console.error('Error searching classes:', err);
        showError('Failed to search classes');
      } finally {
        loading.value = false;
      }
    };

    const requestToJoin = async (classId) => {
      if (!user.value?.uid) return;
      
      try {
        const result = await FirebaseService.enrollInClass(classId, user.value.uid);
        if (result.success) {
          showSuccess(result.message);
          // Refresh the search results to update the UI
          await searchClasses();
        } else {
          showError(result.message);
        }
      } catch (err) {
        console.error('Error requesting to join class:', err);
        showError('Failed to send join request');
      }
    };

    const loadClasses = async () => {
      if (!user.value?.uid) {
        console.error('No user ID available');
        return;
      }
      
      try {
        loading.value = true;
        error.value = null;
        
        // Get enrolled classes
        const { classes: loadedClasses = [] } = await FirebaseService.getClasses({
          studentId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true,
          includeEnrollmentInfo: true
        });

        // Separate classes by enrollment status
        enrolledClasses.value = (loadedClasses || [])
          .filter(classItem => classItem?.enrollment?.status === 'accepted')
          .map(classItem => ({
            ...classItem,
            enrollmentStatus: classItem.enrollment?.status
          }))
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        pendingClasses.value = (loadedClasses || [])
          .filter(classItem => classItem?.enrollment?.status === 'pending')
          .map(classItem => ({
            ...classItem,
            enrollmentStatus: classItem.enrollment?.status
          }))
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        // Get open classes where user has quiz attempts
        const { classes: openClassesList = [] } = await FirebaseService.getClasses({
          isPublic: true,
          includeQuizzes: true,
          includeTeacherInfo: true
        });

        // Get all quiz attempts
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
        const attemptedClassIds = new Set((attempts || []).map(attempt => attempt.classId));

        // Filter open classes to only include those where user has attempted quizzes
        openClasses.value = (openClassesList || [])
          .filter(classItem => 
            classItem?.id && 
            attemptedClassIds.has(classItem.id) && 
            !enrolledClasses.value.some(c => c.id === classItem.id) &&
            !pendingClasses.value.some(c => c.id === classItem.id)
          )
          .map(classItem => ({
            ...classItem,
            enrollmentStatus: 'open'
          }))
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        // Load quiz attempts
        await loadQuizAttempts();
          
      } catch (err) {
        console.error('Error loading classes:', err);
        error.value = 'Failed to load classes';
        showError('Failed to load classes');
      } finally {
        loading.value = false;
      }
    };

    const loadQuizAttempts = async () => {
      if (!user.value?.uid) return;
      
      try {
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
        quizAttempts.value = {};
        quizAttemptsWithBadges.value = {};
        
        // Get all badges for this user
        const badges = await FirebaseService.getUserBadges(user.value.uid);
        const badgeMap = new Map(badges.map(badge => [badge.metadata.quizId, {
          hasBadge: true,
          badgeId: badge.id,
          verificationUrl: badge.metadata.verificationUrl,
          metadata: badge.metadata
        }]));
        
        attempts.forEach(attempt => {
          if (!quizAttempts.value[attempt.classId]) {
            quizAttempts.value[attempt.classId] = {};
          }
          if (!quizAttempts.value[attempt.classId][attempt.quizId]) {
            quizAttempts.value[attempt.classId][attempt.quizId] = [];
          }
          quizAttempts.value[attempt.classId][attempt.quizId].push(attempt);
          
          // If score is 100, check if badge exists
          if (attempt.score === 100) {
            if (!quizAttemptsWithBadges.value[attempt.classId]) {
              quizAttemptsWithBadges.value[attempt.classId] = {};
            }
            const badgeData = badgeMap.get(attempt.quizId);
            quizAttemptsWithBadges.value[attempt.classId][attempt.quizId] = {
              ...attempt,
              ...(badgeData || { hasBadge: false })
            };
          }
        });
      } catch (error) {
        console.error('Error loading quiz attempts:', error);
      }
    };

    const getQuizAttempt = (classId, quizId) => {
      const attemptWithBadge = quizAttemptsWithBadges.value[classId]?.[quizId];
      if (attemptWithBadge) {
        return attemptWithBadge;
      }
      
      const regularAttempts = quizAttempts.value[classId]?.[quizId];
      return quizAttemptsWithBadges.value[classId]?.[quizId] || quizAttempts.value[classId]?.[quizId]?.[0];
    };

    // Watch for both user and initialization changes
    watch([() => user.value, () => initialized.value], ([newUser, isInitialized]) => {
      
      if (isInitialized) {
        if (newUser?.uid) {
          loadClasses();
        } else {
          classes.value = [];
          enrolledClasses.value = [];
          loading.value = false;
        }
      }
    }, { immediate: true });

    const leaveClass = async (classId) => {
      if (!user.value) return;
      
      try {
        await FirebaseService.leaveClass(user.value.uid, classId);
        
        // Remove the class from the local state
        classes.value = classes.value.filter(c => c.id !== classId);

        // Dispatch event to update dashboard
        window.dispatchEvent(new CustomEvent('classLeft'));

        showSuccess('Successfully left the class');
      } catch (err) {
        console.error('Error leaving class:', err);
        showError('Failed to leave the class. Please try again.');
      }
    };

    const startQuiz = async (classId, quiz) => {
      if (!user.value) return;

      const enrollment = enrolledClasses.value.find(e => e.id === classId);
      if (enrollment?.enrollmentStatus !== 'accepted') {
        showError('Your enrollment request is still pending or has been rejected. Please wait for the teacher to accept your request.');
        return;
      }

      try {
        const quizData = await FirebaseService.getQuiz(quiz.id);
        if (!quizData) {
          showError('Quiz not found.');
          return;
        }

        const classData = classes.value.find(c => c.id === classId);
        const previousAttempt = getQuizAttempt(classId, quiz.id);
        const isRetake = !!previousAttempt;

        // Create activity record for quiz start
        await FirebaseService.createActivity({
          type: 'quiz_started',
          classId: classId,
          className: classData?.name || 'Unknown Class',
          studentId: user.value.uid,
          studentName: user.value.displayName || 'Student',
          teacherId: classData?.teacherId,
          quizId: quiz.id,
          quizTitle: quizData.title,
          timestamp: new Date(),
          isRetake: isRetake,
          previousScore: previousAttempt ? previousAttempt.correctAnswers : null,
          activityDescription: isRetake 
            ? `Retaking "${quizData.title}" quiz in ${classData?.name || 'Unknown Class'}`
            : `Starting "${quizData.title}" quiz in ${classData?.name || 'Unknown Class'}`
        });

        selectedClass.value = classData;
        selectedQuiz.value = {
          id: quiz.id,
          title: quizData.title,
          questions: quizData.questions,
          classId: classId
        };
        isQuizModalOpen.value = true;

      } catch (error) {
        console.error('Error starting quiz:', error);
        showError('Failed to start quiz. Please try again.');
      }
    };

    const calculateQuizScore = () => {
      if (!currentQuiz.value || !currentQuiz.value.questions) return 0;
      
      let correctAnswers = 0;
      const totalQuestions = currentQuiz.value.questions.length;
      
      for (let i = 0; i < totalQuestions; i++) {
        const question = currentQuiz.value.questions[i];
        const userAnswer = answers.value[i];
        
        if (question && typeof question.correctIndex === 'number' && userAnswer === question.correctIndex) {
          correctAnswers++;
        }
      }
      
      return Math.round((correctAnswers / totalQuestions) * 100);
    };

    const submitQuiz = async () => {
      if (!currentQuiz.value || !user.value) return;
      
      const unansweredQuestions = answers.value.filter(answer => answer === null).length;
      if (unansweredQuestions > 0) {
        showError(`Please answer all questions before submitting. You have ${unansweredQuestions} unanswered questions.`);
        return;
      }
      
      const score = calculateQuizScore();
      quizScore.value = score;
      quizCompleted.value = true;
      
      try {
        const questionResults = currentQuiz.value.questions.map((question, index) => ({
          questionIndex: index,
          questionText: question.text,
          correctIndex: question.correctIndex,
          userAnswer: answers.value[index],
          isCorrect: answers.value[index] === question.correctIndex,
          selectedOption: question.options[answers.value[index]]
        }));
        
        const attemptData = {
          userId: user.value.uid,
          classId: currentClassId.value,
          quizId: currentQuiz.value.id,
          quizTitle: currentQuiz.value.title,
          score: score,
          answers: answers.value,
          timestamp: new Date(),
          questionCount: currentQuiz.value.questions.length,
          correctAnswers: questionResults.filter(q => q.isCorrect).length,
          questionResults: questionResults,
          timeSpent: Date.now() - quizStartTime.value
        };
        
        await FirebaseService.createQuizAttempt(attemptData);
        
        // Log detailed activity
        await FirebaseService.createActivity({
          userId: user.value.uid,
          type: 'quiz_completed',
          classId: currentClassId.value,
          className: classes.value.find(c => c.id === currentClassId.value)?.name || 'Unknown Class',
          quizId: currentQuiz.value.id,
          quizTitle: currentQuiz.value.title,
          score: score,
          timestamp: new Date(),
          correctAnswers: questionResults.filter(q => q.isCorrect).length,
          totalQuestions: currentQuiz.value.questions.length,
          timeSpent: Date.now() - quizStartTime.value,
          improvement: await calculateImprovement(currentClassId.value, currentQuiz.value.id, score),
          activityDescription: `Completed "${currentQuiz.value.title}" quiz in ${classes.value.find(c => c.id === currentClassId.value)?.name || 'Unknown Class'} with ${score}% score`,
          status: score >= 80 ? 'passed' : 'needs_improvement',
          isRetake: !!getQuizAttempt(currentClassId.value, currentQuiz.value.id),
          incorrectAnswers: questionResults
            .filter(q => !q.isCorrect)
            .map(q => ({
              question: q.questionText,
              selectedOption: q.selectedOption?.text || 'No answer selected',
              correctOption: currentQuiz.value.questions[q.questionIndex].options[q.correctIndex]?.text || 'Unknown correct answer'
            }))
        });

        // If this is a perfect score, add a special achievement activity
        if (score === 100) {
          await FirebaseService.createActivity({
            userId: user.value.uid,
            type: 'achievement',
            classId: currentClassId.value,
            className: classes.value.find(c => c.id === currentClassId.value)?.name,
            quizId: currentQuiz.value.id,
            quizTitle: currentQuiz.value.title,
            timestamp: new Date(),
            activityDescription: `🎉 Achieved perfect score on "${currentQuiz.value.title}" quiz!`,
            achievement: 'perfect_score'
          });
        }
        
        // If there was improvement from previous attempts, log it as a progress activity
        const improvement = await calculateImprovement(currentClassId.value, currentQuiz.value.id, score);
        if (improvement > 0) {
          await FirebaseService.createActivity({
            userId: user.value.uid,
            type: 'progress',
            classId: currentClassId.value,
            className: classes.value.find(c => c.id === currentClassId.value)?.name,
            quizId: currentQuiz.value.id,
            quizTitle: currentQuiz.value.title,
            timestamp: new Date(),
            activityDescription: `📈 Improved score on "${currentQuiz.value.title}" by ${improvement}%`,
            improvement
          });
        }
        
        // Dispatch quiz completed event
        window.dispatchEvent(new CustomEvent('quizCompleted'));
        
        await loadClasses();
      } catch (error) {
        console.error('Error saving quiz results:', error);
        showError('There was an error saving your quiz results. Please try again.');
      }
    };

    const calculateProgress = (classItem) => {
      if (!classItem.quizzes || !classItem.quizzes.length) return 0;
      
      const attempts = quizAttempts.value[classItem.id] || {};
      const totalQuizzes = classItem.quizzes.length;
      const completedQuizzes = Object.values(attempts).filter(attempt => attempt.score >= 80).length;
      
      return Math.round((completedQuizzes / totalQuizzes) * 100);
    };

    const reviewQuiz = async (classId, quizId) => {
      try {
        loading.value = true;
        showReviewModal.value = true;
        
        // Get the quiz attempt
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        if (!attempts || attempts.length === 0) {
          showError('No quiz attempt found to review');
          showReviewModal.value = false;
          return;
        }
        
        // Sort attempts by timestamp to get the latest one
        const sortedAttempts = attempts.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
        
        // Get the most recent attempt
        const attempt = sortedAttempts[0];
        
        // Get quiz details
        const quizData = await FirebaseService.getQuiz(quizId);
        if (!quizData) {
          showError('Quiz not found');
          showReviewModal.value = false;
          return;
        }
        
        // Get class details - check both enrolled and open classes
        let classData = enrolledClasses.value.find(c => c.id === classId);
        if (!classData) {
          classData = openClasses.value.find(c => c.id === classId);
        }
        if (!classData) {
          showError('Class not found');
          showReviewModal.value = false;
          return;
        }

        // Check if badge exists in the badges collection
        const badges = await FirebaseService.getUserBadges(user.value.uid);
        const hasBadge = badges.some(badge => 
          badge.metadata.quizId === quizId && 
          badge.metadata.userId === user.value.uid
        );
        
        // Set the review data
        reviewData.value = {
          quiz: {
            ...quizData,
            questions: quizData.questions.map((q, index) => ({
              ...q,
              userAnswer: attempt.answers?.[index],
              isCorrect: attempt.questionResults?.[index]?.isCorrect,
              selectedOption: attempt.questionResults?.[index]?.selectedOption,
              correctIndex: q.correctIndex
            }))
          },
          attempt: {
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.questionCount,
            timeSpent: attempt.timeSpent,
            submittedAt: attempt.timestamp?.toDate()
          },
          class: {
            id: classId,
            name: classData.name
          },
          hasBadge
        };
        
      } catch (error) {
        console.error('Error loading quiz review:', error);
        showError('Failed to load quiz review');
        showReviewModal.value = false;
      } finally {
        loading.value = false;
      }
    };

    const getExplanation = async (questionIndex) => {
      if (!reviewData.value?.quiz) return;
      try {
        const question = reviewData.value.quiz.questions[questionIndex];
        const userAnswer = reviewData.value.quiz.questions[questionIndex].userAnswer;
        const prompt = `Explain in simple, concise language why "${question.options[question.correctIndex].text}" is the correct answer 
        to the question: "${question.text}". Only address how the correct answer is different from the student's chosen answer:
         "${question.options[userAnswer].text}". Use simple, professional language and no formatting. Don't give more than 4-5 sentences.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
        const result = await model.generateContent(prompt);
        const explanation = result.response.text();
        
        explanations.value[questionIndex] = explanation;
      } catch (error) {
        console.error('Error getting explanation:', error);
        explanations.value[questionIndex] = "Sorry, couldn't generate an explanation at this time.";
      }
    };

    const retakeQuiz = () => {
      showReviewModal.value = false;
      startQuiz(currentClassId.value, currentQuiz.value);
    };

    const closeQuizModal = () => {
      isQuizModalOpen.value = false;
      selectedQuiz.value = null;
      selectedClass.value = null;
    };

    const closeReviewModal = () => {
      showReviewModal.value = false;
      explanations.value = {};
    };

    const calculateImprovement = async (classId, quizId, currentScore) => {
      try {
        const previousAttempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        
        if (previousAttempts.length === 0) return null;
        
        const scores = previousAttempts.map(attempt => attempt.score);
        const previousBest = Math.max(...scores);
        return currentScore > previousBest ? currentScore - previousBest : 0;
      } catch (error) {
        console.error('Error calculating improvement:', error);
        return null;
      }
    };

    const handleQuizCompleted = async (results) => {
      closeQuizModal();
      // Refresh quiz attempts
      const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
      quizAttempts.value = {};
      attempts.forEach(attempt => {
        if (!quizAttempts.value[attempt.classId]) {
          quizAttempts.value[attempt.classId] = {};
        }
        if (!quizAttempts.value[attempt.classId][attempt.quizId]) {
          quizAttempts.value[attempt.classId][attempt.quizId] = [];
        }
        quizAttempts.value[attempt.classId][attempt.quizId].push(attempt);
      });
      await loadClasses(); // Refresh the classes list to show updated quiz status
    };

    const showQuizReview = async (classId, quizId) => {
      try {
        loading.value = true;
        
        // Get the quiz attempt
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        
        if (!attempts || attempts.length === 0) {
          showError('No quiz attempt found to review');
          return;
        }
        
        // Get the most recent attempt
        const attempt = attempts[0];
        
        // Get quiz details
        const quiz = await FirebaseService.getQuiz(quizId);
        if (!quiz) {
          showError('Quiz not found');
          return;
        }
        
        // Get class details
        const classData = classes.value.find(c => c.id === classId);
        if (!classData) {
          showError('Class not found');
          return;
        }
        
        // Set the review data
        reviewData.value = {
          quiz: {
            ...quiz,
            questions: quiz.questions.map((q, index) => ({
              ...q,
              userAnswer: attempt.answers?.[index],
              isCorrect: attempt.questionResults?.[index]?.isCorrect,
              selectedOption: attempt.questionResults?.[index]?.selectedOption,
              correctIndex: q.correctIndex
            }))
          },
          attempt: {
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.questionCount,
            timeSpent: attempt.timeSpent,
            submittedAt: attempt.timestamp?.toDate()
          },
          class: {
            id: classId,
            name: classData.name
          }
        };
        
        showReviewModal.value = true;
      } catch (error) {
        console.error('Error loading quiz review:', error);
        showError('Failed to load quiz review');
      } finally {
        loading.value = false;
      }
    };

    const isMintingBadge = ref(false);

    const claimBadge = async () => {
      try {
        if (!reviewData.value) return;
        isMintingBadge.value = true;

        // Check if badge already exists in Firebase
        const hasBadge = await FirebaseService.checkBadgeExists(user.value.uid, reviewData.value.quiz.id);
        if (hasBadge) {
          showError('You already have this badge!');
          isMintingBadge.value = false;
          return;
        }

        // Show initial loading state
        showSuccess('Issuing your badge...');
        
        // Claim the badge using FirebaseService.claimBadge
        const result = await FirebaseService.claimBadge(
          user.value.uid,
          reviewData.value.quiz.id,
          reviewData.value.class.id,
          reviewData.value.attempt.score
        );
        
        if (result.success) {
          showSuccess('Badge claimed successfully!');
          await loadClasses(); // Refresh classes, activities, achievements
          activeTab.value = 'achievements'; // Switch to achievements tab
          showReviewModal.value = false; // Close the modal
        } else {
          showError(result.message || 'Failed to claim badge');
        }
      } catch (error) {
        console.error('Error claiming badge:', error);
        showError('Failed to claim badge. Please try again.');
      } finally {
        isMintingBadge.value = false;
      }
    };

    onMounted(async () => {
      if (user.value?.uid && initialized.value) {
        await loadClasses();
      }
      
      // Listen for class joined event
      window.addEventListener('classJoined', async () => {
        await loadClasses();
      });

      // Listen for custom refresh event
      const component = document.querySelector('student-classes');
      if (component) {
        component.addEventListener('refreshClasses', async () => {
          await loadClasses();
        });
      }
    });

    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('classJoined', loadClasses);
      const component = document.querySelector('student-classes');
      if (component) {
        component.removeEventListener('refreshClasses', loadClasses);
      }
    });

    return {
      classes,
      loading,
      error,
      showQuizModal,
      showReviewModal,
      currentQuiz,
      selectedQuiz,
      selectedClass,
      isQuizModalOpen,
      answers,
      quizCompleted,
      quizScore,
      explanations,
      loadClasses,
      leaveClass,
      startQuiz,
      submitQuiz,
      getQuizAttempt,
      calculateProgress,
      reviewQuiz,
      getExplanation,
      retakeQuiz,
      closeQuizModal,
      closeReviewModal,
      showSuccess,
      showError,
      activeTab,
      tabs,
      filteredClasses,
      searchQuery,
      searchResults,
      searchClasses,
      requestToJoin,
      enrolledClasses,
      pendingClasses,
      openClasses,
      handleQuizCompleted,
      showQuizReview,
      reviewData,
      claimBadge,
      isMintingBadge,
      isEnrolled
    };
  }
};
</script> 