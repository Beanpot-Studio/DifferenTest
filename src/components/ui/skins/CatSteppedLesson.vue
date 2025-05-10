<template>
  <div class="cat-stepped-lesson-container">
    <header class="cat-lesson-header sticky-header">
      <div class="header-content">
        <button @click="restartLesson" class="restart-button" title="Restart Lesson">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.966 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.966z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="academy-title">aCATemy</h1>
        <div class="header-spacer"></div> 
      </div>
      <nav v-if="classQuizzes && classQuizzes.length > 0" class="quiz-links-nav">
        <ul class="quiz-links-list">
          <li v-for="quizLink in classQuizzes" :key="quizLink.id">
            <a 
              :href="`/courses/${currentClassId}/quiz/${quizLink.id}`" 
              :class="{'active-quiz-link': quizLink.id === currentQuizId}"
              class="quiz-link-item"
            >
              {{ quizLink.title }}
            </a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="cat-lesson-content-area">
      <h2 class="lesson-title">{{ lessonTitle }}</h2>
      <div v-if="currentStep" class="lesson-step">
        <img :src="catForStep" alt="Friendly Cat Guide" class="cat-guide" />
        
        <div class="step-content" v-html="renderedStepContent"></div>

        <!-- Paw Print Trail -->
        <div v-if="lessonSteps.length > 0" class="paw-print-trail">
          <span 
            v-for="(_, index) in lessonSteps" 
            :key="index"
            class="paw-print"
            :class="{
              'paw-print--completed': index < currentStepIndex,
              'paw-print--current': index === currentStepIndex,
              'paw-print--future': index > currentStepIndex
            }"
            role="img"
            :aria-label="`Step ${index + 1} ${index === currentStepIndex ? 'current' : (index < currentStepIndex ? 'completed' : 'pending')}`"
          >
            🐾
          </span>
        </div>
        
        <div class="navigation-buttons mt-6 flex justify-center space-x-4">
          <button 
            @click="previousStep" 
            :disabled="currentStepIndex === 0"
            class="btn-cat-nav"
          >
            &larr; Previous
          </button>

          <button 
            v-if="currentStepIndex < lessonSteps.length - 1"
            @click="nextStep" 
            class="btn-cat-nav primary"
          >
            Next &rarr;
          </button>

          <button 
            v-if="currentStepIndex === lessonSteps.length - 1 && lessonSteps.length > 0"
            @click="completeLesson"
            class="btn-cat-nav secondary"
          >
            Take the Quiz! 
          </button>
        </div>
      </div>
      <div v-else-if="lessonCompletedInternal && !currentStep">
        <p class="completion-message">Loading quiz...</p> 
      </div>
      <div v-else>
        <p class="loading-message">Loading lesson...</p>
      </div>
      <img src="/skins/cats/assets/spinning-heart.gif" alt="Spinning Heart" class="spinning-heart w-10 m-auto" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Define your available cat assets for cycling
const availableCatAssets = [
  '/skins/cats/assets/dancing-cat.gif',       // Your current fallback
  '/skins/cats/assets/squirming-cat.gif',
  '/skins/cats/assets/chasing-cat.gif',
  '/skins/cats/assets/pouncing-cat.gif',
  '/skins/cats/assets/wiggle-cat.gif',
  '/skins/cats/assets/walking-cat.gif',
  '/skins/cats/assets/heart-cat.gif' 
];

const props = defineProps({
  lessonSteps: { 
    type: Array, 
    default: () => [] 
    // Expected: [{ title: 'Step X', content: '...', catAsset: '...' }, ...]
  },
  lessonTitle: { type: String, default: 'Interactive Lesson' },
  classQuizzes: { type: Array, default: () => [] },        // New prop
  currentClassId: { type: String, default: '' },           // New prop
  currentQuizId: { type: String, default: '' }             // New prop
});

const emit = defineEmits(['lesson-completed']);

const currentStepIndex = ref(0);
// Internal state to track if lesson has been marked as completed by this component
const lessonCompletedInternal = ref(false); 

const currentStep = computed(() => {
  if (props.lessonSteps && props.lessonSteps.length > currentStepIndex.value) {
    return props.lessonSteps[currentStepIndex.value];
  }
  return null;
});

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
            pedantic: false,
            mangle: false,
            headerIds: false
        });
        const rawHtml = marked.parse(markdownContent);
        return sanitizeHtml(rawHtml);
    } catch (e) {
        console.error("Error parsing markdown for cat lesson step:", e);
        return sanitizeHtml(`<p>Error rendering content.</p><pre>${markdownContent}</pre>`); 
    }
};

const renderedStepContent = computed(() => {
    return renderMarkdown(currentStep.value?.content);
});

const catForStep = computed(() => {
  // First, check if the current step data provides a specific catAsset
  if (currentStep.value?.catAsset) {
    return currentStep.value.catAsset;
  }
  // If not, cycle through the availableCatAssets array
  if (availableCatAssets.length > 0) {
    return availableCatAssets[currentStepIndex.value % availableCatAssets.length];
  }
  // Fallback if no specific asset and no available assets (should not happen if array is populated)
  return '/skins/cats/assets/dancing-cat.gif'; 
});

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
}

function nextStep() {
  if (currentStepIndex.value < props.lessonSteps.length - 1) {
    currentStepIndex.value++;
  }
}

function completeLesson() {
  lessonCompletedInternal.value = true;
  emit('lesson-completed');
}

function restartLesson() {
  currentStepIndex.value = 0;
  lessonCompletedInternal.value = false;
}

</script>

<style scoped>
.cat-stepped-lesson-container {
  background-color: rgb(var(--cat-background, 255 245 242));
  border-radius: 15px;
  border: 2px solid rgb(var(--cat-secondary, 255 181 167));
  box-shadow: 0 4px 12px rgba(var(--cat-primary, 255 157 135), 0.15);
  color: rgb(var(--cat-text-color, #333));
  overflow: hidden; 

}

.cat-lesson-header {
  background-color: #E6E6FA; /* Lavender */
  /* Or use a CSS variable if defined in cats.css e.g. rgb(var(--cat-lavender, 230 230 250)); */
  padding: 10px 20px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100; /* Ensure it's above other content */
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Pushes items apart */
  max-width: 1000px; /* Or your preferred max width */
  margin: 0 auto; /* Center the content within the header */
}

.academy-title {
  color: rgb(var(--cat-primary, 255 157 135));
  font-size: 1.8em; /* Adjusted size */
  font-weight: 700; 
  margin: 0; /* Remove default margins */
  text-align: center; /* Center title if space-between isn't enough */
  flex-grow: 1; /* Allow title to take up space */
}

.restart-button {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  color: rgb(var(--cat-primary, 255 157 135)); /* Match title color */
  opacity: 0.8;
  transition: opacity 0.2s;
}

.restart-button:hover {
  opacity: 1;
}

.restart-button svg {
  display: block; /* Prevent extra space below icon */
}

/* Spacer div to help center the title when using space-between */
.header-spacer {
  width: 28px; /* Match approx width of button+padding */
}

.quiz-links-nav {
  margin-top: 8px; /* Spacing below title/buttons */
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.quiz-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap; /* Allow links to wrap on smaller screens */
  justify-content: center;
  gap: 8px 12px; /* Row and column gap */
}

.quiz-link-item {
  color: rgb(var(--cat-accent, 139 211 221));
  text-decoration: none;
  font-size: 0.9em;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.quiz-link-item:hover {
  background-color: rgba(var(--cat-primary, 255 157 135), 0.1);
  color: rgb(var(--cat-primary, 255 157 135));
}

.quiz-link-item.active-quiz-link {
  background-color: rgb(var(--cat-primary, 255 157 135));
  color: white;
  font-weight: bold;
}

/* Content area that sits below the sticky header */
.cat-lesson-content-area {
  padding: 20px; /* Main padding for content */
  text-align: center;
}

.lesson-title {
  color: rgb(var(--cat-primary, 255 157 135));
  font-size: 1.5em;
  margin-top: 0; /* Margin now handled by .cat-lesson-content-area padding */
  margin-bottom: 15px;
}

.lesson-step {
 /* Removed padding, now on .cat-lesson-content-area */
}

.cat-guide {
  max-width: 150px;
  margin: 0 auto 15px auto;
  display: block;
}

.step-title {
  color: rgb(var(--cat-accent, 139 211 221));
  font-size: 1.3em;
  margin-bottom: 10px;
}

.step-content {
  text-align: left;
  padding: 10px;
  background-color: rgba(var(--cat-primary, 255 157 135), 0.05);
  border-radius: 8px;
  min-height: 100px; 
  margin-bottom: 20px;
}

.step-content :deep(p) { margin-bottom: 0.8em; line-height: 1.6; }
.step-content :deep(ul), .step-content :deep(ol) { padding-left: 1.5em; margin-bottom: 0.8em; }
.step-content :deep(li) { margin-bottom: 0.3em; }

.btn-cat-nav {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: rgb(var(--cat-secondary, 255 181 167)); /* Base/Previous: Light Coral */
  color: white; 
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-cat-nav.primary { /* Next Button */
  background-color: rgb(var(--color-success, 74 222 128)); /* Pastel Green */
  color: white; 
}

.btn-cat-nav.secondary { /* Take Quiz Button */
  background-color: #E6E6FA; /* Lavender */
  color: #333; /* Darker text for contrast with lavender */
}

.btn-cat-nav:hover:not(:disabled) {
  opacity: 0.85;
  transform: translateY(-1px);
}

.btn-cat-nav:active:not(:disabled) {
  transform: translateY(0px);
}

.btn-cat-nav:disabled {
  background-color: rgba(var(--cat-secondary, 200 200 200), 0.5);
  cursor: not-allowed;
  transform: none;
}

.completion-message, .loading-message {
    padding: 20px;
    font-size: 1.1em;
    color: rgb(var(--cat-text-color, #333));
}

/* Paw Print Trail Styles */
.paw-print-trail {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px; /* Space between paw prints */
  margin-bottom: 20px; /* Space before navigation buttons */
  flex-wrap: wrap; /* Allow paws to wrap on smaller screens if many steps */
}

.paw-print {
  font-size: 1.8em; /* Adjust size as needed */
  color: rgba(var(--cat-text-color, 51 51 51), 0.3); /* Default for future paws */
  transition: all 0.3s ease-in-out;
  user-select: none; /* Prevent text selection */
}

.paw-print--completed {
  color: rgb(var(--cat-secondary, 255 181 167)); /* Light Coral for completed */
  opacity: 0.8;
}

.paw-print--current {
  color: rgb(var(--cat-primary, 255 157 135)); /* Main Cat Primary for current */
  transform: scale(1.25) rotate(-10deg); /* Make current paw stand out */
  text-shadow: 0 0 5px rgba(var(--cat-primary, 255 157 135), 0.5);
}

.paw-print--future {
   /* Uses the default .paw-print color and opacity or can be more specific if needed */
   opacity: 0.4;
}
</style> 