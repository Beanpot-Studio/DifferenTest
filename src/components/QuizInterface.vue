<template>
  <div 
    v-if="quizData && quizData.questions && quizData.questions.length > 0" 
    class="max-w-2xl mx-auto p-6 rounded-lg shadow-xl bg-gradient-to-br from-green-50 to-teal-100 text-gray-800"
  >
    <h2 class="text-2xl font-bold mb-4 text-center text-gray-900">{{ quizData.title }}</h2>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <BaseAnimation type="loading" :size="50" />
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="!user" class="text-center py-8">
      <div class="flex items-center justify-center space-x-2 mb-2">
        <IconService name="lock" size="6" />
        <h3 class="text-lg font-semibold text-gray-900">Please Log In</h3>
      </div>
      <p class="text-gray-500">You need to be logged in to take this quiz.</p>
    </div>

    <div v-else-if="role !== 'student'" class="text-center py-8">
      <div class="flex items-center justify-center space-x-2 mb-2">
        <IconService name="lock" size="6" />
        <h3 class="text-lg font-semibold text-gray-900">Access Restricted</h3>
      </div>
      <p class="text-gray-500">This quiz is only available to students.</p>
    </div>
    
    <div v-else-if="quizData">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ quizData.title }}</h3>
        <span class="text-sm text-gray-500">{{ quizData.questions.length }} questions</span>
      </div>
      
      <div v-if="!quizCompleted">
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconService name="chevron-left" size="5" />
            </button>
            <span class="text-sm text-gray-700">Question {{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconService name="chevron-right" size="5" />
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">
              {{ answeredQuestions }} of {{ quizData.questions.length }} answered
            </span>
          </div>
        </div>

        <!-- Current Question -->
        <div class="mb-6">
          <p class="font-medium mb-2">{{ currentPage }}. {{ currentQuestion.text }}</p>
          <div class="space-y-2">
            <div
              v-for="(option, optionIndex) in currentQuestion.options"
              :key="optionIndex"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              :class="{
                'bg-primary-50 border-primary-200': selectedAnswers[currentQuestionIndex] === optionIndex,
                'border-gray-200': selectedAnswers[currentQuestionIndex] !== optionIndex
              }"
              @click="selectAnswer(currentQuestionIndex, optionIndex)"
            >
              <input
                type="radio"
                :name="'question-' + currentQuestionIndex"
                :value="optionIndex"
                v-model="selectedAnswers[currentQuestionIndex]"
                class="mr-3"
              />
              <span>{{ option.text }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <button
            v-if="currentPage > 1"
            @click="currentPage--"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Previous
          </button>
          <button
            v-if="currentPage < totalPages"
            @click="currentPage++"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Next
          </button>
          <button
            v-if="currentPage === totalPages"
            @click="submitQuiz"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            :disabled="!canSubmit"
          >
            Submit Quiz
          </button>
        </div>
      </div>
      
      <div v-else class="text-center py-6">
        <div v-if="showConfetti" class="fixed inset-0 pointer-events-none">
          <BaseAnimation type="confetti" :size="500" />
        </div>
        <h4 class="text-xl font-semibold mb-2">Quiz Results</h4>
        <p class="text-lg mb-4">Your score: {{ score }}%</p>
        <div class="space-y-4">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="p-4 rounded-lg"
            :class="{
              'bg-green-50': result.isCorrect,
              'bg-red-50': !result.isCorrect
            }"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium mb-2">{{ index + 1 }}. {{ result.questionText }}</p>
                <p class="text-sm">
                  Your answer: {{ result.selectedAnswer }}
                </p>
              </div>
              <span 
                v-if="!result.isCorrect"
                class="text-sm font-medium"
                :class="{
                  'text-green-600': result.isCorrect,
                  'text-red-600': !result.isCorrect
                }"
              >
                {{ result.isCorrect ? 'Correct' : 'Incorrect' }}
              </span>
            </div>

            <div v-if="!result.isCorrect" class="mt-4">
              <button
                @click="toggleQuestion(index)"
                class="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
              >
                <span>{{ expandedQuestions[index] ? 'Hide' : 'Show' }} explanation</span>
                <svg 
                  class="w-4 h-4 transform transition-transform" 
                  :class="{ 'rotate-180': expandedQuestions[index] }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="expandedQuestions[index]" class="mt-2 p-3 bg-primary-50 rounded">
                <div v-if="!explanations[index]" class="flex items-center space-x-2">
                  <BaseAnimation type="loading" :size="20" />
                  <span class="text-sm text-gray-600">Generating explanation...</span>
                </div>
                <p v-else class="text-sm text-gray-700">{{ explanations[index] }}</p>
              </div>
            </div>
          </div>
        </div>
        <button
          v-if="score < 100"
          @click="resetQuiz"
          class="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
        
      </div>
    </div>
    
  </div>
  <div v-else-if="!loading && (!quizData || !quizData.questions || quizData.questions.length === 0)" class="text-center text-gray-500 py-8">
    <p>Quiz data is not available or the quiz has no questions.</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import BaseAnimation from './BaseAnimation.vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import { GoogleGenerativeAI } from '@google/generative-ai';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'QuizInterface',
  components: {
    BaseAnimation, IconService
  },
  props: {
    quizId: {
      type: String,
      required: true
    },
    classId: {
      type: String,
      default: null
    },
    isEmbedded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { user, role } = useAuth();
    const { showSuccess, showError } = useNotification();
    const quizData = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const selectedAnswers = ref([]);
    const quizCompleted = ref(false);
    const score = ref(0);
    const results = ref([]);
    const quizStartTime = ref(0);
    const explanations = ref({});
    const expandedQuestions = ref({});
    const showConfetti = ref(false);
    const currentPage = ref(1);
    const questionsPerPage = 1; // Show one question at a time

    // Add watch for role changes
    watch(role, (newRole) => {
    }, { immediate: true });

    // Add watch for user changes
    watch(user, (newUser) => {
    }, { immediate: true });

    const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

    const canSubmit = computed(() => {
      return selectedAnswers.value.length === quizData.value?.questions.length &&
        !selectedAnswers.value.includes(undefined);
    });

    const totalPages = computed(() => {
      return quizData.value?.questions.length || 0;
    });

    const currentQuestionIndex = computed(() => {
      return currentPage.value - 1;
    });

    const currentQuestion = computed(() => {
      return quizData.value?.questions[currentQuestionIndex.value] || null;
    });

    const answeredQuestions = computed(() => {
      return selectedAnswers.value.filter(answer => answer !== undefined).length;
    });

    // Watch for page changes to ensure we don't go out of bounds
    watch(currentPage, (newPage) => {
      if (newPage < 1) {
        currentPage.value = 1;
      } else if (newPage > totalPages.value) {
        currentPage.value = totalPages.value;
      }
    });

    const loadQuiz = async () => {
      try {
        if (!props.quizId) {
          throw new Error('Quiz ID is required');
        }

        const quizId = props.quizId.trim();

        const fetchedQuizData = await FirebaseService.getQuiz(quizId);
        if (!fetchedQuizData) {
          throw new Error(`Quiz with ID ${quizId} not found`);
        }

        if (!fetchedQuizData.questions || !Array.isArray(fetchedQuizData.questions) || fetchedQuizData.questions.length === 0) {
          throw new Error('Quiz has no questions');
        }

        // Validate each question
        fetchedQuizData.questions.forEach((question, index) => {
          if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
            throw new Error(`Question ${index + 1} is missing required fields`);
          }
        });

        // Assign to quizData ref
        quizData.value = {
          id: quizId,
          ...fetchedQuizData,
          questions: fetchedQuizData.questions.map((q, index) => ({
            ...q,
            id: index + 1,
            selectedAnswer: null,
            isCorrect: null
          }))
        };

        selectedAnswers.value = new Array(quizData.value.questions.length).fill(undefined);
        quizStartTime.value = Date.now();
      } catch (error) {
        console.error('Error loading quiz:', error);
        showError('Failed to load quiz. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    const selectAnswer = (questionIndex, answerIndex) => {
      selectedAnswers.value[questionIndex] = answerIndex;
    };

    const submitQuiz = async () => {
      if (!canSubmit.value) return;

      let correctCount = 0;
      results.value = quizData.value.questions.map((question, index) => {
        const isCorrect = selectedAnswers.value[index] === question.correctIndex;
        if (isCorrect) correctCount++;
        
        return {
          questionText: question.text,
          selectedAnswer: question.options[selectedAnswers.value[index]].text,
          correctAnswer: question.options[question.correctIndex].text,
          isCorrect
        };
      });

      score.value = Math.round((correctCount / quizData.value.questions.length) * 100);
      quizCompleted.value = true;
      
      // Show confetti for perfect score
      if (score.value === 100) {
        showConfetti.value = true;
        setTimeout(() => {
          showConfetti.value = false;
        }, 5000); // Hide confetti after 5 seconds
      }

      if (user.value) {
        try {
          const attemptData = {
            userId: user.value.uid,
            quizId: quizData.value.id,
            score: score.value,
            correctAnswers: correctCount,
            questionCount: quizData.value.questions.length,
            timeSpent: Date.now() - quizStartTime.value,
            questions: quizData.value.questions.map((q, index) => ({
              ...q,
              selectedAnswer: selectedAnswers.value[index]
            }))
          };
          
          // Use submitQuizAttempt instead of createQuizAttempt
          await FirebaseService.submitQuizAttempt(attemptData);
          
          // Dispatch quiz completed event
          window.dispatchEvent(new CustomEvent('quizCompleted'));

          showSuccess(`Quiz completed! Score: ${score.value}%`);
        } catch (error) {
          console.error('Error submitting quiz:', error);
          showError('Failed to submit quiz. Please try again.');
        } finally {
          loading.value = false;
        }
      }
    };

    const resetQuiz = () => {
      selectedAnswers.value = new Array(quizData.value.questions.length).fill(undefined);
      quizCompleted.value = false;
      score.value = 0;
      results.value = [];
      quizStartTime.value = Date.now();
      showConfetti.value = false;
    };

    const getExplanation = async (questionIndex) => {
      if (!quizData.value) return;
      
      try {
        const question = quizData.value.questions[questionIndex];
        const prompt = `Explain in simple, concise language why the correct answer is right for the question: "${question.text}". 
        Focus on the key concept being tested. Use simple, professional language and no formatting. Don't give more than 4-5 sentences.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
        const result = await model.generateContent(prompt);
        const explanation = result.response.text();
        
        explanations.value[questionIndex] = explanation;
        expandedQuestions.value[questionIndex] = true;
      } catch (error) {
        console.error('Error getting explanation:', error);
        explanations.value[questionIndex] = "Sorry, couldn't generate an explanation at this time.";
      }
    };

    const toggleQuestion = (index) => {
      expandedQuestions.value[index] = !expandedQuestions.value[index];
      if (expandedQuestions.value[index] && !explanations.value[index]) {
        getExplanation(index);
      }
    };

    onMounted(loadQuiz);

    return {
      quizData,
      loading,
      error,
      selectedAnswers,
      quizCompleted,
      score,
      results,
      canSubmit,
      selectAnswer,
      submitQuiz,
      resetQuiz,
      explanations,
      expandedQuestions,
      toggleQuestion,
      getExplanation,
      showConfetti,
      user,
      role,
      currentPage,
      totalPages,
      currentQuestionIndex,
      currentQuestion,
      answeredQuestions
    };
  }
};
</script> 