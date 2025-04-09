<template>
  <QuizInterface
    :quiz-id="quizId"
    :is-embedded="true"
  />
</template>

<script>
import QuizInterface from './QuizInterface.vue';

export default {
  name: 'EmbeddableQuiz',
  components: {
    QuizInterface
  },
  props: {
    quizId: {
      type: String,
      required: true
    }
  }
};
</script> 