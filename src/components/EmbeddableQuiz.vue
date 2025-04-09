<template>
  <div class="my-6 p-4 border rounded-lg bg-white shadow-sm">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <BaseAnimation type="loading" :size="50" />
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
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
            <p class="font-medium mb-2">{{ index + 1 }}. {{ result.questionText }}</p>
            <p class="text-sm">
              Your answer: {{ result.selectedAnswer }}<br>
              <span v-if="!result.isCorrect">
                Correct answer: {{ result.correctAnswer }}
              </span>
            </p>
          </div>
        </div>
        <button
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
import { ref, computed, onMounted } from 'vue';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'EmbeddableQuiz',
  components: {
    BaseAnimation
  },
  props: {
    quizId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const quiz = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const selectedAnswers = ref([]);
    const quizCompleted = ref(false);
    const score = ref(0);
    const results = ref([]);

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
        console.log('Loading quiz with ID:', quizId);

        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          throw new Error(`Quiz with ID ${quizId} not found`);
        }

        const quizData = quizDoc.data();
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
          id: quizDoc.id,
          ...quizData,
          questions: quizData.questions.map((q, index) => ({
            ...q,
            id: index + 1,
            selectedAnswer: null,
            isCorrect: null
          }))
        };

        console.log('Processed quiz:', quiz.value);
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

    const submitQuiz = () => {
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
    };

    const resetQuiz = () => {
      selectedAnswers.value = new Array(quiz.value.questions.length).fill(undefined);
      quizCompleted.value = false;
      score.value = 0;
      results.value = [];
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
      resetQuiz
    };
  }
};
</script> 