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
        <button
          v-if="badgeClaimed && role === 'student'"
          @click="openBadgeModal"
          class="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          View & Share Badge
        </button>
      </div>
    </div>
    <div v-if="showBadgeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button @click="closeBadgeModal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          <IconService name="close" size="6" />
        </button>
        <div v-if="badgeData" class="text-center">
          <img :src="badgeData.image || badgeData.metadata?.image" alt="Badge" class="mx-auto mb-4 w-24 h-24 rounded-full border-4 border-yellow-400" />
          <h3 class="text-xl font-bold mb-2">{{ badgeData.metadata?.title }}</h3>
          <p class="mb-2 text-gray-700">{{ badgeData.metadata?.description }}</p>
          <p class="mb-4 text-sm text-gray-500">Issued: {{ badgeData.timestamp?.toDate ? badgeData.timestamp.toDate().toLocaleDateString() : '' }}</p>
          <div class="flex flex-col space-y-2">
            <button @click="shareOnTwitter" class="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500">Share on Twitter</button>
            <button @click="shareOnLinkedIn" class="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Share on LinkedIn</button>
            <button @click="shareOnFacebook" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Share on Facebook</button>
            <button @click="copyLink" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Copy Link</button>
          </div>
        </div>
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
    const { showNotification } = useNotification();
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
    const badgeClaimed = ref(false);
    const badgeData = ref(null);
    const showBadgeModal = ref(false);

    // Add watch for role changes
    watch(role, (newRole) => {
      console.log('Role changed:', newRole);
    }, { immediate: true });

    // Add watch for user changes
    watch(user, (newUser) => {
      console.log('User changed:', newUser);
    }, { immediate: true });

    const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

    const canSubmit = computed(() => {
      return selectedAnswers.value.length === quiz.value?.questions.length &&
        !selectedAnswers.value.includes(undefined);
    });

    const shareUrl = computed(() => {
      if (!badgeData.value) return '';
      return `${window.location.origin}/badges/${user.value?.uid}_${quiz.value?.id}`;
    });

    const loadQuiz = async () => {
      try {
        if (!props.quizId) {
          throw new Error('Quiz ID is required');
        }

        const quizId = props.quizId.trim();
        console.log('Loading quiz with ID:', quizId);

        const quizData = await FirebaseService.getQuiz(quizId);
        if (!quizData) {
          throw new Error(`Quiz with ID ${quizId} not found`);
        }

        console.log('Quiz data:', quizData);

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
        error.value = error.message;
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
          
          // Only allow students to claim badge, and only if 100% score
          if (role.value === 'student' && score.value === 100) {
            const result = await FirebaseService.claimBadge(user.value.uid, quiz.value.id, props.classId, score.value);
            if (result.success) {
              showNotification('Success', result.message, 'success');
              badgeClaimed.value = true;
              await openBadgeModal();
            } else if (result.message && result.message.includes('already claimed')) {
              showNotification('Info', 'You have already claimed this badge!', 'info');
              badgeClaimed.value = true;
              await openBadgeModal();
            } else {
              showNotification('Error', result.message || 'Failed to claim badge', 'error');
            }
          } else {
            // Add quiz completion activity only for non-perfect scores
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
            showNotification('Success', `Quiz completed! Score: ${score.value}%`, 'success');
          }
        } catch (error) {
          console.error('Error saving quiz results:', error);
          showNotification('Error', 'Failed to save quiz results', 'error');
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

    const openBadgeModal = async () => {
      if (!user.value || !quiz.value) return;
      const badgeId = `${user.value.uid}_${quiz.value.id}`;
      const badge = await FirebaseService.getBadgeById(badgeId);
      badgeData.value = badge;
      showBadgeModal.value = true;
    };

    const closeBadgeModal = () => {
      showBadgeModal.value = false;
    };

    const shareOnTwitter = () => {
      const text = encodeURIComponent(`I just earned the '${badgeData.value?.metadata?.title}' badge! 🎉 Check it out: ${shareUrl.value}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    const shareOnLinkedIn = () => {
      const url = encodeURIComponent(shareUrl.value);
      const title = encodeURIComponent(badgeData.value?.metadata?.title || 'Achievement Badge');
      const summary = encodeURIComponent(badgeData.value?.metadata?.description || 'I earned a badge!');
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
    };

    const shareOnFacebook = () => {
      const url = encodeURIComponent(shareUrl.value);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl.value);
        showNotification('Success', 'Link copied to clipboard!', 'success');
      } catch {
        showNotification('Error', 'Failed to copy link', 'error');
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
      role,
      badgeClaimed,
      badgeData,
      showBadgeModal,
      openBadgeModal,
      closeBadgeModal,
      shareOnTwitter,
      shareOnLinkedIn,
      shareOnFacebook,
      copyLink,
      shareUrl
    };
  }
};
</script> 