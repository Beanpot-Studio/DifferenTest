<template>
  <div class="space-y-6">
    <!-- Class Search -->
    <ClassSearch @enrolled="loadClasses" @search="handleSearch" />

    <!-- My Classes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">My Classes</h2>
      <div v-if="loading" class="text-center py-4">
        <BaseAnimation type="loading" :loop="true" />
      </div>    
      
      <div v-else-if="classes.length === 0" class="text-gray-500 text-center py-4">
       
        You haven't joined any classes yet.
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="classItem in filteredClasses" :key="classItem.id" class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
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
            <button
              @click="leaveClass(classItem.id)"
              :disabled="classItem.enrollmentStatus !== 'accepted'"
              :class="{
                'bg-red-600 hover:bg-red-700': classItem.enrollmentStatus === 'accepted',
                'bg-gray-400 cursor-not-allowed': classItem.enrollmentStatus !== 'accepted'
              }"
              class="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Leave Class</span>
            </button>
          </div>

          <!-- Class Progress -->
          <div v-if="classItem.enrollmentStatus === 'accepted'" class="mt-4">
            <h4 class="font-lg font-bold mb-2">Quizzes</h4>
            <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
              No quizzes available yet.
            </div>
            <div v-else class="space-y-2">
              <div v-for="quiz in classItem.quizzes" :key="quiz.id" class="border rounded p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ quiz.title }}</h4>
                    <p class="text-sm text-gray-500 mt-1">
                      Questions: {{ quiz.questionCount || 0 }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-if="getQuizAttempt(classItem.id, quiz.id)" class="text-sm text-gray-500">
                      Score: {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                    </span>
                    <div class="flex space-x-2">
                      <button
                        v-if="getQuizAttempt(classItem.id, quiz.id)"
                        @click="reviewQuiz(classItem.id, quiz.id)"
                        class="text-sm font-medium rounded bg-green-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                      >
                        <span>Review Quiz</span>
                        <span v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge" class="ml-1">🏆</span>
                      </button>
                      <a
                        v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge"
                        :href="`/badges/${getQuizAttempt(classItem.id, quiz.id)?.badgeId}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200 flex items-center space-x-1"
                      >
                        <span>Verify Badge</span>
                      </a>
                      <button
                        v-if="getQuizAttempt(classItem.id, quiz.id) && getQuizAttempt(classItem.id, quiz.id).score < 100"
                        @click="startQuiz(classItem.id, quiz)"
                        class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:text-gray-200"
                      >
                        Retake Quiz
                      </button>
                      <button
                        v-else-if="!getQuizAttempt(classItem.id, quiz.id)"
                        @click="startQuiz(classItem.id, quiz)"
                        class="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Take Quiz
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
    const explanations = ref({});
    const quizStartTime = ref(0);
    const error = ref(null);
    const { showSuccess, showError } = useNotification();
    const activeTab = ref('activities');
    const enrolledClasses = ref([]);
    const reviewData = ref(null);
    const tabs = [
      { id: 'activities', name: 'Activities' },
      { id: 'history', name: 'Quiz History' },
      { id: 'achievements', name: 'Achievements' }
    ];

    // Add search query ref and filtered classes computed property
    const searchQuery = ref('');
    const filteredClasses = computed(() => {
      if (!searchQuery.value) return classes.value;
      
      const search = searchQuery.value.toLowerCase().trim();
      return classes.value.filter(classItem => {
        const nameMatch = classItem.name?.toLowerCase().includes(search);
        const teacherMatch = classItem.teacherName?.toLowerCase().includes(search);
        const descriptionMatch = classItem.description?.toLowerCase().includes(search);
        const statusMatch = classItem.enrollmentStatus?.toLowerCase().includes(search);
        
        return nameMatch || teacherMatch || descriptionMatch || statusMatch;
      });
    });

    // Handle search from ClassBrowser
    const handleSearch = (query) => {
      searchQuery.value = query;
      // Force a re-render of the filtered classes
      classes.value = [...classes.value];
    };

    const loadClasses = async () => {
      if (!user.value?.uid) {
        console.error('No user ID available');
        return;
      }
      
      try {
        loading.value = true;
        const loadedClasses = await FirebaseService.getClassesByStudent(user.value.uid);
        
        // Get enrollment status for each class
        const classesWithStatus = await Promise.all(loadedClasses.map(async classItem => {
          if (!classItem.id) {
            return null;
          }
          const enrollmentStatus = await FirebaseService.getEnrollmentStatus(user.value.uid, classItem.id);
          return {
            ...classItem,
            id: classItem.id,
            name: classItem.name || 'Unnamed Class',
            teacherName: classItem.teacherName || 'Unknown Teacher',
            code: classItem.code || 'N/A',
            quizzes: classItem.quizzes || [],
            enrollmentStatus: enrollmentStatus
          };
        }));

        classes.value = classesWithStatus
          .filter(Boolean)
          .sort((a, b) => b.updatedAt?.toDate() - a.updatedAt?.toDate());
        // Also update enrolledClasses for components that need it
        enrolledClasses.value = classes.value;

        // Load quiz attempts
        if (loadedClasses.length > 0) {
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
        }
          
      } catch (error) {
        showError('Failed to load classes');
      } finally {
        loading.value = false;
      }
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
      } catch (error) {
        console.error('Error leaving class:', error);
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

    const getQuizAttempt = (classId, quizId) => {
      if (!quizAttempts.value[classId]?.[quizId]) return null;
      
      // Get all attempts for this quiz
      const attempts = quizAttempts.value[classId][quizId];
      
      // If it's already a single attempt, return it
      if (!Array.isArray(attempts)) return attempts;
      
      // Sort attempts by timestamp to get the latest one
      const sortedAttempts = attempts.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      
      return sortedAttempts[0];
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
        currentClassId.value = classId;
        
        // Get the quiz attempt
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        if (!attempts || attempts.length === 0) {
          showError('No quiz attempt found to review');
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
          return;
        }
        
        // Get class details
        const classData = classes.value.find(c => c.id === classId);
        if (!classData) {
          showError('Class not found');
          return;
        }

        // Check if badge already exists
        const hasBadge = await FirebaseService.checkBadgeExists(user.value.uid, quizId);
        
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
        
        showReviewModal.value = true;
      } catch (error) {
        console.error('Error loading quiz review:', error);
        showError('Failed to load quiz review');
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
        console.log('Loading quiz review for:', { classId, quizId });
        
        // Get the quiz attempt
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        console.log('Quiz attempts:', attempts);
        
        if (!attempts || attempts.length === 0) {
          showError('No quiz attempt found to review');
          return;
        }
        
        // Get the most recent attempt
        const attempt = attempts[0];
        console.log('Selected attempt:', attempt);
        
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
        
        console.log('Review data set:', reviewData.value);
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
      handleSearch,
      searchQuery,
      enrolledClasses,
      handleQuizCompleted,
      showQuizReview,
      reviewData,
      claimBadge,
      isMintingBadge
    };
  }
};
</script> 