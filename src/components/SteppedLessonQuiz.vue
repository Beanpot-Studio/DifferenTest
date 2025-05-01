<template>
  <div class="stepped-lesson-quiz">
    <h1 class="text-2xl font-bold mb-4">{{ quiz.title }}</h1>

    <!-- Lesson Content Area -->
    <div class="lesson-content mb-8 p-4 border rounded bg-gray-50 min-h-[200px]">
      <!-- Full Lesson -->
      <div v-if="!isStepped || !quiz.lessonSteps || quiz.lessonSteps.length === 0">
        <h3 v-if="isStepped" class="text-lg font-semibold mb-2 text-gray-500 italic">Lesson Content (Single Part)</h3>
        <div v-html="renderedFullLesson"></div>
      </div>

      <!-- Stepped Lesson -->
      <div v-else>
        <h3 class="text-lg font-semibold mb-2 text-primary-700">Step {{ currentStepIndex + 1 }} of {{ quiz.lessonSteps.length }}</h3>
        <div v-html="renderedCurrentStep"></div>
      </div>
    </div>

    <!-- Navigation / Quiz Start -->
    <div class="navigation-controls flex justify-between items-center mb-8">
      <button
        v-if="isStepped && quiz.lessonSteps && quiz.lessonSteps.length > 0"
        @click="previousStep"
        :disabled="currentStepIndex === 0"
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &larr; Previous Step
      </button>
      <span v-else>&nbsp;</span> <!-- Placeholder for spacing -->

      <button
        v-if="!showQuizInterface && (!isStepped || currentStepIndex === (quiz.lessonSteps?.length || 0) - 1)"
        @click="startQuiz"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
      >
        Take the Quiz!
      </button>
      
      <button
        v-if="isStepped && quiz.lessonSteps && currentStepIndex < quiz.lessonSteps.length - 1"
        @click="nextStep"
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
      >
        Next Step &rarr;
      </button>
       <span v-else-if="!showQuizInterface">&nbsp;</span> <!-- Placeholder for spacing if quiz button shown -->

    </div>

    <!-- Quiz Interface -->
    <div v-if="showQuizInterface" class="quiz-container mt-8 border-t pt-8">
       <h2 class="text-xl font-semibold text-gray-900 mb-4">Quiz Time!</h2>
      <QuizInterface 
        :quiz-id="quiz.id" 
        :class-id="classId" 
        :is-embedded="true" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import QuizInterface from './QuizInterface.vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked'; // Using marked for Markdown rendering

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  },
  classId: {
      type: String,
      required: true
  }
});

const currentStepIndex = ref(0);
const showQuizInterface = ref(false);

// Determine if the lesson is stepped based on props
const isStepped = computed(() => 
    props.quiz?.lessonType === 'steps' && 
    Array.isArray(props.quiz.lessonSteps) && 
    props.quiz.lessonSteps.length > 0
);

// Reset step index if quiz changes
watch(() => props.quiz, () => {
  currentStepIndex.value = 0;
  showQuizInterface.value = false; // Reset quiz view on prop change
}, { immediate: true });

// --- Sanitized HTML Rendering --- 
const sanitizeHtml = (htmlContent) => {
  return typeof document !== 'undefined' ? DOMPurify.sanitize(htmlContent) : htmlContent;
};

const renderMarkdown = (markdownContent) => {
    if (!markdownContent) return '';
    try {
        // Basic configuration for marked (can customize)
        marked.setOptions({
            gfm: true, // Enable GitHub Flavored Markdown
            breaks: true, // Convert single line breaks to <br>
            smartLists: true
        });
        const rawHtml = marked.parse(markdownContent);
        return sanitizeHtml(rawHtml);
    } catch (e) {
        console.error("Error parsing markdown:", e);
        // Fallback: return sanitized original content if parsing fails
        return sanitizeHtml(`<p>Error rendering content.</p><pre>${markdownContent}</pre>`); 
    }
};

const renderedFullLesson = computed(() => {
    return renderMarkdown(props.quiz?.lessonPlan);
});

const renderedCurrentStep = computed(() => {
    if (isStepped.value && props.quiz.lessonSteps[currentStepIndex.value]) {
        return renderMarkdown(props.quiz.lessonSteps[currentStepIndex.value]);
    }
    return '';
});
// --- End Sanitized HTML Rendering ---


// --- Navigation Logic ---
const nextStep = () => {
  if (isStepped.value && currentStepIndex.value < props.quiz.lessonSteps.length - 1) {
    currentStepIndex.value++;
  }
};

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const startQuiz = () => {
  showQuizInterface.value = true;
};
// --- End Navigation Logic ---

</script>

<style scoped>
.stepped-lesson-quiz {
  /* Add component-specific styles if needed */
}
.lesson-content {
    /* Style for the content box */
}
.navigation-controls {
    /* Styles for button alignment */
}
.quiz-container {
    /* Styles for quiz section */
}
/* Add styles for rendered HTML (e.g., from markdown) if necessary */
.lesson-content div :deep(h1), /* Example using :deep to style rendered HTML */
.lesson-content div :deep(h2) {
    margin-top: 1em;
    margin-bottom: 0.5em;
}
.lesson-content div :deep(p) {
    margin-bottom: 1em;
    line-height: 1.6;
}
.lesson-content div :deep(pre) {
    background-color: #f3f4f6; /* Tailwind gray-100 */
    padding: 1em;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin-bottom: 1em;
}
.lesson-content div :deep(code) {
    font-family: monospace;
}

</style> 