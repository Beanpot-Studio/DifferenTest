<template>
  <div class="stepped-lesson-quiz-wrapper">
    <!-- Theme Loading Indicator -->
    <div v-if="themeLoading" class="flex justify-center items-center min-h-[300px]">
      <BaseAnimation type="loading" :size="50" />
      <p class="ml-4 text-gray-500">Loading lesson theme...</p>
    </div>

    <!-- Main Content once theme is loaded -->
    <template v-else>
      <!-- Cat Skin View -->
      <template v-if="isCatThemeActive && isStepped">
        <CatSteppedLesson 
          v-if="!showQuizInterface && !showCatQuizResult"
          :lesson-steps="catLessonSteps"
          :lesson-title="quiz.title"
          :class-quizzes="classQuizzes" 
          :current-class-id="classId" 
          :current-quiz-id="quiz.id"
          @lesson-completed="handleCatLessonCompleted"
        />
        <!-- For Cat theme, QuizInterface is shown after lesson completion -->
        <!-- Or, you could implement CatQuizResult here if QuizInterface emits score -->
      </template>

      <!-- Default View (or Full Lesson for Cat Theme) -->
      <template v-else-if="!isCatThemeActive || (isCatThemeActive && !isStepped)">
        <div class="stepped-lesson-quiz">
          <h1 class="text-2xl font-bold mb-4">{{ quiz.title }}</h1>

          <!-- Lesson Content Area -->
          <div 
            v-if="!showQuizInterface"
            :class="[
              'lesson-content mb-8 p-4 border rounded bg-gray-50 min-h-[200px]',
              { 'curriculum-content': isCatThemeActive } 
            ]"
          >
            <!-- Full Lesson (or non-stepped, or stepped for default theme) -->
            <div v-if="!isStepped || !quiz.lessonSteps || quiz.lessonSteps.length === 0">
              <h3 v-if="isStepped" class="text-lg font-semibold mb-2 text-gray-500 italic">Lesson Content (Single Part)</h3>
              <div v-html="renderedFullLesson"></div>
            </div>
            <!-- Stepped Lesson (Default Theme) -->
            <div v-else>
              <h3 class="text-lg font-semibold mb-2 text-primary-700">Step {{ currentStepIndex + 1 }} of {{ quiz.lessonSteps.length }}</h3>
              <div v-html="renderedCurrentStep"></div>
            </div>
          </div>

          <!-- Navigation / Quiz Start (Default Theme or Full Cat Lesson) -->
          <div v-if="!showQuizInterface" class="navigation-controls flex justify-between items-center mb-8">
            <button
              v-if="isStepped && quiz.lessonSteps && quiz.lessonSteps.length > 0"
              @click="previousStep"
              :disabled="currentStepIndex === 0"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &larr; Previous Step
            </button>
            <span v-else>&nbsp;</span>

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
            <span v-else-if="!showQuizInterface">&nbsp;</span>
          </div>
        </div>
      </template>

      <!-- Quiz Interface (Common for both, shown based on showQuizInterface) -->
      <!-- Consider if CatQuizResult should replace/wrap this for cat theme -->
      <div v-if="showQuizInterface" class="quiz-container mt-8 pt-8" :class="{ 'curriculum-content': isCatThemeActive, 'border-t': !isCatThemeActive }">
        <h2 v-if="!isCatThemeActive || !isStepped" class="text-xl font-semibold text-gray-900 mb-4">Quiz Time!</h2>
        <!-- For Cat theme, CatSteppedLesson has its own title, so Quiz Time! might be redundant or styled differently -->
        <QuizInterface 
          :quiz-id="quiz.id" 
          :class-id="classId" 
          :is-embedded="true"
          @quiz-completed="handleQuizCompleted" 
        />
      </div>

      <!-- Cat Quiz Result View (shown after QuizInterface completes for cat theme) -->
      <CatQuizResult
        v-if="isCatThemeActive && showCatQuizResult && quizAttemptResult"
        :attempt-result="quizAttemptResult"
        :quiz-title="quiz.title"
        @close-results="showCatQuizResult = false" 
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import QuizInterface from './QuizInterface.vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import FirebaseService from '../lib/firebaseService';
import CatSteppedLesson from './ui/skins/CatSteppedLesson.vue';
import CatQuizResult from './ui/skins/CatQuizResult.vue';
import BaseAnimation from './services/BaseAnimation.vue';

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

const themeLoading = ref(true);
const currentStepIndex = ref(0);
const showQuizInterface = ref(false);
const classData = ref(null);
const skinId = ref(null);
const showCatQuizResult = ref(false);
const quizAttemptResult = ref(null);
const classQuizzes = ref([]); // Added: To store quizzes for the current class

// Cat theme specific state
const CAT_SKIN_ID = 'cats';

const isCatThemeActive = computed(() => skinId.value === CAT_SKIN_ID && props.quiz?.lessonType === 'steps');

async function fetchClassDetailsAndQuizzes() {
  themeLoading.value = true;
  if (!props.classId) {
    console.warn("SteppedLessonQuiz: classId prop is missing.");
    skinId.value = null;
    classQuizzes.value = [];
    themeLoading.value = false;
    return;
  }
  try {
    const fetchedClassData = await FirebaseService.getClass(props.classId);
    if (fetchedClassData) {
      classData.value = fetchedClassData;
      skinId.value = fetchedClassData.skinId;

      // Fetch all quizzes for this class
      const quizzes = await FirebaseService.getQuizzesByClass(props.classId);
      classQuizzes.value = quizzes.filter(q => q.id !== props.quiz.id); // Store other quizzes

    } else {
      console.warn(`SteppedLessonQuiz: Class data not found for ID: ${props.classId}`);
      skinId.value = null;
      classQuizzes.value = [];
    }
  } catch (error) {
    console.error("Error fetching class details or quizzes:", error);
    skinId.value = null;
    classQuizzes.value = [];
  } finally {
    themeLoading.value = false;
  }
}

onMounted(async () => {
  await fetchClassDetailsAndQuizzes();
});

watch(skinId, (newSkinId, oldSkinId) => {
  if (typeof document !== 'undefined') {
    if (newSkinId === CAT_SKIN_ID) {
      document.documentElement.setAttribute('data-theme', 'cats');
    } else if (oldSkinId === CAT_SKIN_ID) {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (typeof document !== 'undefined' && skinId.value === CAT_SKIN_ID) {
    document.documentElement.removeAttribute('data-theme');
  }
});

const isStepped = computed(() => 
    props.quiz?.lessonType === 'steps' && 
    Array.isArray(props.quiz.lessonSteps) && 
    props.quiz.lessonSteps.length > 0
);

// Prepare lessonSteps for CatSteppedLesson (array of objects)
const catLessonSteps = computed(() => {
  if (isStepped.value) {
    // Assuming props.quiz.lessonSteps is an array of strings
    // And CatSteppedLesson expects [{ content: '...', catAsset: '...' }, ...]
    // You might need to fetch/determine catAsset per step if not already in quiz.lessonSteps
    return props.quiz.lessonSteps.map(stepContent => ({ content: stepContent, title: 'Step', catAsset: null })); // Placeholder for catAsset
  }
  return [];
});

watch(() => props.quiz, async (newQuiz, oldQuiz) => {
  currentStepIndex.value = 0;
  showQuizInterface.value = false;
  showCatQuizResult.value = false;
  quizAttemptResult.value = null;
  // If quiz changes, classId might too, or we might need to refilter classQuizzes
  if (newQuiz && oldQuiz && newQuiz.id !== oldQuiz.id) {
    await fetchClassDetailsAndQuizzes(); // Re-fetch if primary quiz context changes
  }
}, { immediate: true, deep: true });

const sanitizeHtml = (htmlContent) => {
  return typeof document !== 'undefined' ? DOMPurify.sanitize(htmlContent) : htmlContent;
};

const renderMarkdown = (markdownContent) => {
    if (!markdownContent) return '';
    try {
        marked.setOptions({
            gfm: true,
            breaks: true,
            smartLists: true,
            pedantic: false, // Relax some of the strictness
            mangle: false, // Important for security if you use user-provided headers
            headerIds: false // Disable auto-generating header IDs if not needed
        });
        const rawHtml = marked.parse(markdownContent);
        return sanitizeHtml(rawHtml);
    } catch (e) {
        console.error("Error parsing markdown:", e);
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

const handleCatLessonCompleted = () => {
    showQuizInterface.value = true; // Show the QuizInterface after cat lesson
};

const handleQuizCompleted = (attemptResult) => {
  // attemptResult is expected from QuizInterface, e.g., { score: 80, ... }
  if (isCatThemeActive.value) {
    quizAttemptResult.value = {
      ...attemptResult,
      class: {
        id: props.classId,
        ageGroup: classData.value?.ageGroup || 'college'
      }
    };
    showCatQuizResult.value = true;
    showQuizInterface.value = false; // Hide QuizInterface, show CatQuizResult
  } else {
    // Handle default quiz completion if needed (e.g., navigate away or show a generic message)
  }
};

</script>

