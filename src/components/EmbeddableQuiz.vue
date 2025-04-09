<template>
  <div class="embeddable-quiz">
    <div v-if="loading" class="loading-state">
      <BaseAnimation animation="loading" />
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>
    
    <div v-else class="quiz-content">
      <h3 class="quiz-title">{{ quiz.title }}</h3>
      
      <div v-for="(question, index) in quiz.questions" :key="index" class="question">
        <p class="question-text">{{ question.text }}</p>
        
        <div class="options">
          <div v-for="(option, optionIndex) in question.options" 
               :key="optionIndex"
               class="option"
               :class="{ 
                 'selected': selectedAnswers[index] === optionIndex,
                 'correct': showResults && question.correctIndex === optionIndex,
                 'incorrect': showResults && selectedAnswers[index] === optionIndex && question.correctIndex !== optionIndex
               }"
               @click="selectAnswer(index, optionIndex)">
            {{ option.text }}
          </div>
        </div>
      </div>
      
      <div class="quiz-actions">
        <button v-if="!showResults" 
                @click="submitQuiz" 
                class="submit-button"
                :disabled="!isComplete">
          Submit Quiz
        </button>
        
        <div v-else class="results">
          <p class="score">Score: {{ score }}%</p>
          <p class="feedback">{{ feedback }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BaseAnimation from './AnimationComponents/BaseAnimation.vue';

const props = defineProps({
  quizId: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(null);
const quiz = ref(null);
const selectedAnswers = ref([]);
const showResults = ref(false);
const score = ref(0);

const isComplete = computed(() => {
  return selectedAnswers.value.length === quiz.value?.questions.length;
});

const feedback = computed(() => {
  if (score.value >= 80) return 'Excellent work!';
  if (score.value >= 60) return 'Good job!';
  return 'Keep practicing!';
});

const loadQuiz = async () => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', props.quizId));
    if (quizDoc.exists()) {
      quiz.value = quizDoc.data();
      selectedAnswers.value = new Array(quiz.value.questions.length).fill(null);
    } else {
      error.value = 'Quiz not found';
    }
  } catch (err) {
    error.value = 'Error loading quiz';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const selectAnswer = (questionIndex, optionIndex) => {
  if (!showResults.value) {
    selectedAnswers.value[questionIndex] = optionIndex;
  }
};

const submitQuiz = () => {
  let correctCount = 0;
  quiz.value.questions.forEach((question, index) => {
    if (selectedAnswers.value[index] === question.correctIndex) {
      correctCount++;
    }
  });
  
  score.value = Math.round((correctCount / quiz.value.questions.length) * 100);
  showResults.value = true;
};

onMounted(() => {
  loadQuiz();
});
</script>

<style scoped>
.embeddable-quiz {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #ef4444;
}

.quiz-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.question {
  margin-bottom: 1.5rem;
}

.question-text {
  font-weight: 500;
  color: #334155;
  margin-bottom: 1rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  background-color: #f1f5f9;
}

.option.selected {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.option.correct {
  background-color: #dcfce7;
  border-color: #22c55e;
}

.option.incorrect {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.quiz-actions {
  margin-top: 2rem;
  text-align: center;
}

.submit-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.results {
  text-align: center;
}

.score {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.feedback {
  color: #64748b;
}
</style> 