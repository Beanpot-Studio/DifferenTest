<template>
  <div class="my-6 p-4 border rounded-lg bg-white shadow-sm">
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
    
    <div v-else-if="quiz">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ quiz.title }}</h3>
        <span class="text-sm text-gray-500">{{ quiz.questions.length }} questions</span>
      </div>
      
      <div v-if="!quizCompleted">
        <div v-for="(question, index) in quiz.questions" :key="index" class="mb-6">
          <p class="font-medium mb-2">{{ index + 1 }}. {{ question.text }}</p>
          <div class="space-y-2">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              :class="{
                'bg-primary-50 border-primary-200': selectedAnswers[index] === optionIndex,
                'border-gray-200': selectedAnswers[index] !== optionIndex
              }"
              @click="selectAnswer(index, optionIndex)"
            >
              <input
                type="radio"
                :name="'question-' + index"
                :value="optionIndex"
                v-model="selectedAnswers[index]"
                class="mr-3"
              />
              <span>{{ option.text }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button
            @click="submitQuiz"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
          class="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
        
      </div>
    </div>
    
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
    const quiz = ref(null);
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

    // Add watch for role changes
    watch(role, (newRole) => {
    }, { immediate: true });

    // Add watch for user changes
    watch(user, (newUser) => {
    }, { immediate: true });

    const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

    const canSubmit = computed(() => {
      return selectedAnswers.value.length === quiz.value?.questions.length &&
        !selectedAnswers.value.includes(undefined);
    });

    const loadQuiz = async () => {
      try {
        if (!props.quizId) {
          throw new Error('Quiz ID is required');
        }

        const quizId = props.quizId.trim();

        const quizData = await FirebaseService.getQuiz(quizId);
        if (!quizData) {
          throw new Error(`Quiz with ID ${quizId} not found`);
        }


        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error('Quiz has no questions');
        }

        // Validate each question has required fields
        quizData.questions.forEach((question, index) => {
          if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
            throw new Error(`Question ${index + 1} is missing required fields`);
          }
        });

        quiz.value = {
          id: quizId,
          ...quizData,
          questions: quizData.questions.map((q, index) => ({
            ...q,
            id: index + 1,
            selectedAnswer: null,
            isCorrect: null
          }))
        };

        selectedAnswers.value = new Array(quiz.value.questions.length).fill(undefined);
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
      results.value = quiz.value.questions.map((question, index) => {
        const isCorrect = selectedAnswers.value[index] === question.correctIndex;
        if (isCorrect) correctCount++;
        
        return {
          questionText: question.text,
          selectedAnswer: question.options[selectedAnswers.value[index]].text,
          correctAnswer: question.options[question.correctIndex].text,
          isCorrect
        };
      });

      score.value = Math.round((correctCount / quiz.value.questions.length) * 100);
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
            classId: props.classId,
            quizId: quiz.value.id,
            quizTitle: quiz.value.title,
            score: score.value,
            answers: selectedAnswers.value,
            timestamp: new Date(),
            questionCount: quiz.value.questions.length,
            correctAnswers: correctCount,
            questionResults: results.value,
            timeSpent: Date.now() - quizStartTime.value,
            isEmbedded: props.isEmbedded
          };
          
          await FirebaseService.submitQuizAttempt(attemptData);
          
          // Add quiz completion activity
          await FirebaseService.createActivity({
            userId: user.value.uid,
            type: 'quiz_completed',
            classId: props.classId,
            quizId: quiz.value.id,
            quizTitle: quiz.value.title,
            score: score.value,
            timestamp: new Date(),
            correctAnswers: correctCount,
            totalQuestions: quiz.value.questions.length,
            timeSpent: Date.now() - quizStartTime.value,
            isEmbedded: props.isEmbedded
          });
          showSuccess('Success', `Quiz completed! Score: ${score.value}%`, 'success');
        } catch (error) {
          console.error('Error submitting quiz:', error);
          showError('Failed to submit quiz. Please try again.');
        } finally {
          loading.value = false;
        }
      }
    };

    const resetQuiz = () => {
      selectedAnswers.value = new Array(quiz.value.questions.length).fill(undefined);
      quizCompleted.value = false;
      score.value = 0;
      results.value = [];
      quizStartTime.value = Date.now();
      showConfetti.value = false;
    };

    const getExplanation = async (questionIndex) => {
      if (!quiz.value) return;
      
      try {
        const question = quiz.value.questions[questionIndex];
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
      quiz,
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
      role
    };
  }
};
</script> 