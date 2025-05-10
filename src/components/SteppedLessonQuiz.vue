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
      console.log("Fetched Class Skin ID:", skinId.value, "CAT_SKIN_ID:", CAT_SKIN_ID);

      // Fetch all quizzes for this class
      const quizzes = await FirebaseService.getQuizzesByClass(props.classId);
      classQuizzes.value = quizzes.filter(q => q.id !== props.quiz.id); // Store other quizzes
      console.log("Fetched other quizzes for class:", classQuizzes.value);

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
    console.log("Final skinId.value after fetchClassDetailsAndQuizzes:", skinId.value);
    console.log("Theme loading finished:", themeLoading.value);
  }
}

onMounted(async () => {
  await fetchClassDetailsAndQuizzes();
});

watch(skinId, (newSkinId, oldSkinId) => {
  console.log("Skin ID watcher triggered. New:", newSkinId, "Old:", oldSkinId, "CAT_SKIN_ID:", CAT_SKIN_ID);
  if (typeof document !== 'undefined') {
    if (newSkinId === CAT_SKIN_ID) {
      console.log("Setting data-theme='cats'");
      document.documentElement.setAttribute('data-theme', 'cats');
    } else if (oldSkinId === CAT_SKIN_ID) {
      console.log("Removing data-theme='cats'");
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
    quizAttemptResult.value = attemptResult;
    showCatQuizResult.value = true;
    showQuizInterface.value = false; // Hide QuizInterface, show CatQuizResult
  } else {
    // Handle default quiz completion if needed (e.g., navigate away or show a generic message)
    console.log("Default quiz completed:", attemptResult);
  }
};

</script>

<style scoped>
/* Styles remain largely the same, but can be augmented by cats.css when theme is active */
.stepped-lesson-quiz-wrapper {
  /* This new wrapper can be used for global layout if needed */
}
.stepped-lesson-quiz {
  /* ... existing styles ... */
}
.lesson-content {
    /* ... existing styles ... */
}
.navigation-controls {
    /* ... existing styles ... */
}
.quiz-container {
    /* ... existing styles ... */
}
.lesson-content div :deep(h1),
.lesson-content div :deep(h2) {
    margin-top: 1em;
    margin-bottom: 0.5em;
}
.lesson-content div :deep(p) {
    margin-bottom: 1em;
    line-height: 1.6;
}
.lesson-content div :deep(pre) {
    background-color: #f3f4f6;
    padding: 1em;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin-bottom: 1em;
}
.lesson-content div :deep(code) {
    font-family: monospace;
}

/* Default Markdown content styling (when cat theme is not active or for base) */
/* These styles apply to the content rendered by v-html via :deep selector */
.lesson-content :deep(h1),
.lesson-content :deep(h2),
.lesson-content :deep(h3),
.lesson-content :deep(h4),
.lesson-content :deep(h5),
.lesson-content :deep(h6) {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: 600;
    line-height: 1.3;
}
.lesson-content :deep(h1) { font-size: 1.8em; }
.lesson-content :deep(h2) { font-size: 1.5em; }
.lesson-content :deep(h3) { font-size: 1.25em; }

.lesson-content :deep(p) {
    margin-bottom: 1em;
    line-height: 1.7;
}

.lesson-content :deep(ul),
.lesson-content :deep(ol) {
    margin-bottom: 1em;
    padding-left: 1.8em; /* Indent lists */
}
.lesson-content :deep(li) {
    margin-bottom: 0.4em;
}
.lesson-content :deep(ul) { list-style-type: disc; }
.lesson-content :deep(ol) { list-style-type: decimal; }

.lesson-content :deep(blockquote) {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #ccc;
    background-color: #f9f9f9;
    color: #555;
    font-style: italic;
}

.lesson-content :deep(a) {
    color: #007bff; /* Example blue link color */
    text-decoration: underline;
}
.lesson-content :deep(a:hover) {
    color: #0056b3;
}

.lesson-content :deep(hr) {
    border: 0;
    border-top: 1px solid #eee;
    margin: 1.5em 0;
}

.lesson-content :deep(pre) {
    background-color: #f3f4f6; /* Tailwind gray-100 */
    padding: 1em;
    border-radius: 0.375rem; /* Tailwind rounded-md */
    overflow-x: auto;
    margin-bottom: 1em;
    font-size: 0.9em;
}
.lesson-content :deep(code) { /* Inline code */
    font-family: monospace;
    background-color: #e9e9e9;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
}
.lesson-content :deep(pre code) { /* Code within pre, remove extra padding/bg */
    background-color: transparent;
    padding: 0;
    font-size: inherit; /* Inherit pre's font size */
}

.lesson-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
}
.lesson-content :deep(th),
.lesson-content :deep(td) {
    border: 1px solid #ddd;
    padding: 0.5em;
    text-align: left;
}
.lesson-content :deep(th) {
    background-color: #f2f2f2;
    font-weight: bold;
}

/* Ensure quiz-container also gets curriculum-content styles if cat theme is active for quiz options etc. */
.quiz-container.curriculum-content :deep(label) { 
  /* Example: if QuizInterface labels need cat theme colors */
  /* color: rgb(var(--cat-primary)); */
}

</style> 