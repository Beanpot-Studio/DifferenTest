<template>
  <div>
    <QuizInterface 
      :quiz-id="quizId" 
      :class-id="classId"
      @quiz-completed="handleQuizCompleted"
    />
    <div v-if="showCatResult" class="mt-8">
      <CatQuizResult 
        :quiz-title="quizTitle"
        :attempt-result="quizResult"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QuizInterface from '../../QuizInterface.vue';
import CatQuizResult from './CatQuizResult.vue';

const props = defineProps({
  quizId: {
    type: String,
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  }
});

const showCatResult = ref(false);
const quizResult = ref({
  score: 0,
  questions: []
});

const handleQuizCompleted = (result) => {
  quizResult.value = {
    score: result.score,
    questions: result.results.map(result => ({
      text: result.questionText,
      options: result.options.map(option => ({ text: option })),
      correctIndex: result.correctIndex,
      selectedAnswer: result.selectedAnswer,
    }))
  };
  console.log('Quiz result formatted:', quizResult.value);
  showCatResult.value = true;
  document.dispatchEvent(new Event('quiz-completed'));
};
</script> 