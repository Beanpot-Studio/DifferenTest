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
import { ref, onMounted } from 'vue';
import QuizInterface from '../../QuizInterface.vue';
import CatQuizResult from './CatQuizResult.vue';
import FirebaseService from '../../services/FirebaseService';

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

// Add onMounted to check level when component loads
onMounted(async () => {
  const classData = await FirebaseService.getClass(props.classId);
  
});

const handleQuizCompleted = async (result) => {
  
  
  // Get class data to include age group
  const classData = await FirebaseService.getClass(props.classId);
  
  
  quizResult.value = {
    score: result.score,
    class: {
      id: props.classId,
      ageGroup: classData?.ageGroup || 'college'
    },
    questions: result.results.map(result => ({
      text: result.questionText,
      options: result.options.map(option => ({ text: option })),
      correctIndex: result.correctIndex,
      selectedAnswer: result.selectedAnswer,
    }))
  };
  showCatResult.value = true;
  document.dispatchEvent(new Event('quiz-completed'));
};
</script> 