<template>
  <div class="cat-quiz-result">
    <h2>Quiz Results!</h2>
    <div class="debug-info" style="display: none;">
      <p>Score: {{ score }}</p>
      <p>Image Path: {{ catPoseForScore }}</p>
    </div>
    <img 
      :src="catPoseForScore" 
      alt="Cat reaction to score" 
      class="cat-reaction mx-auto"
      @error="handleImageError"
    />
    <p class="score-text">You scored: {{ score }}%</p>
    <p class="cat-message mb-6">{{ catMessage }}</p>
    
    <!-- NEW: Detailed Results Section (Adapted from QuizInterface) -->
    <div class="space-y-4 text-left border-t pt-6 mt-6 border-[rgba(var(--cat-primary),0.3)]">
      <h3 class="text-lg font-semibold text-center mb-4 text-[rgb(var(--cat-primary))]">Review Your Answers</h3>
      <div
        v-for="(result, index) in detailedResults"
        :key="index"
        class="p-4 rounded-lg border border-[rgba(var(--cat-primary),0.2)]"
        :class="{
          'bg-[rgba(var(--color-success-light),0.5)]': result.isCorrect,
          'bg-[rgba(var(--color-danger-light),0.5)]': !result.isCorrect
        }"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium mb-2">{{ index + 1 }}. {{ result.questionText }}</p>
            <p class="text-sm">
              Your answer: <span class="font-semibold">{{ result.selectedAnswerText }}</span>
            </p>
            <p v-if="!result.isCorrect" class="text-sm text-green-700">
              Correct answer: <span class="font-semibold">{{ result.correctAnswerText }}</span>
            </p>
          </div>
          <span 
            class="text-sm font-bold ml-4 flex-shrink-0 px-2 py-0.5 rounded"
            :class="{
              'text-green-800 bg-green-200': result.isCorrect,
              'text-red-800 bg-red-200': !result.isCorrect
            }"
          >
            {{ result.isCorrect ? 'Correct' : 'Incorrect' }}
          </span>
        </div>

        <!-- Gemini Explanation Section -->
        <div v-if="!result.isCorrect" class="mt-4">
          <button
            @click="toggleQuestion(index)"
            class="text-[rgb(var(--cat-primary))] hover:text-[rgb(var(--cat-accent))] text-sm flex items-center space-x-1 font-medium"
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
          <div v-if="expandedQuestions[index]" class="mt-2 p-3 bg-[rgba(var(--cat-accent-light),0.3)] rounded">
            <div v-if="explanations[index] === 'loading'" class="flex items-center space-x-2">
              <BaseAnimation type="loading" :size="20" />
              <span class="text-sm text-gray-600">Generating explanation...</span>
            </div>
            <p v-else class="text-sm text-gray-700">{{ explanations[index] || 'Could not load explanation.' }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- End Detailed Results Section -->

    <button @click="emit('close-results')" class="mt-8">Close</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAnimation from '../../services/BaseAnimation.vue'; // Assuming BaseAnimation is used for loading

const props = defineProps({
  attemptResult: { type: Object, required: true },
  quizTitle: { type: String, default: 'Quiz' }
});

const emit = defineEmits(['close-results']);

// --- State for Explanations (Copied from QuizInterface) ---
const explanations = ref({});
const expandedQuestions = ref({});
const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

// --- Computed Properties ---

// Extract score for convenience
const score = computed(() => {
  return props.attemptResult?.score ?? 0;
});

// Cat image logic (uses computed score)
const scoreCatImagePaths = {
  perfect: '/skins/cats/assets/dancing-cat.gif',
  good: '/skins/cats/assets/pouncing-cat.gif',
  okay: '/skins/cats/assets/sleeping-cat.gif',
  improvement: '/skins/cats/assets/angry-cat.gif'
};

const catPoseForScore = computed(() => {
  const currentScore = score.value;
  let imagePath;
  if (currentScore === 100) imagePath = scoreCatImagePaths.perfect;
  else if (currentScore >= 80) imagePath = scoreCatImagePaths.good;
  else if (currentScore >= 50) imagePath = scoreCatImagePaths.okay;
  else imagePath = scoreCatImagePaths.improvement;
  return imagePath;
});

// Cat message logic (uses computed score)
const catMessage = computed(() => {
  const currentScore = score.value;
  if (currentScore >= 90) return "Wow! You're a superstar!";
  if (currentScore >= 70) return "Great job! You're doing wonderfully!";
  if (currentScore >= 50) return "Nice try! Keep practicing!";
  return "Don't worry, try again! You can do it!";
});

// Process attemptResult.questions into a more display-friendly format
// Ensure this matches the structure provided by QuizInterface's attemptData
const detailedResults = computed(() => {
  if (!props.attemptResult?.questions) return [];
  return props.attemptResult.questions.map((q) => {
    const isCorrect = q.selectedAnswer === q.correctIndex;
    const correctAnswerText = q.options[q.correctIndex]?.text || 'N/A';
    const selectedAnswerText = q.options[q.selectedAnswer]?.text || 'No answer selected';
    

    
    return {
      questionText: q.text,
      selectedAnswerText,
      correctAnswerText,
      isCorrect,
      originalQuestion: q 
    };
  });
});

// --- Methods (Copied and adapted from QuizInterface) ---

const getExplanation = async (questionIndex) => {
  const resultItem = detailedResults.value[questionIndex];
  if (!resultItem || !resultItem.originalQuestion) return;

  explanations.value[questionIndex] = 'loading'; // Show loading state
  try {
    const question = resultItem.originalQuestion;
    const ageGroup = props.attemptResult?.class?.ageGroup || 'college';

    const ageGroupPrompts = {
      elementary: "Explain in very simple language suitable for ages 5-10 why the correct answer is right and why the student's answer was incorrect. Use short sentences and familiar words. Include a fun example or comparison that a young child would understand. Keep it to 2-3 sentences maximum.",
      middle: "Explain in clear language suitable for ages 11-13 why the correct answer is right and why the student's answer was incorrect. Use age-appropriate examples and avoid complex terminology. Keep it to 3-4 sentences maximum.",
      high: "Explain in more sophisticated language suitable for ages 14-18 why the correct answer is right and why the student's answer was incorrect. Use real-world examples and include some critical thinking elements. Keep it to 4-5 sentences maximum.",
      college: "Explain in professional language suitable for college students and adults why the correct answer is right and why the student's answer was incorrect. Use appropriate terminology and include deeper analysis. Keep it to 4-5 sentences maximum."
    };

    const prompt = `Explain why "${resultItem.correctAnswerText}" is the correct answer to the question: "${question.text}". 
    Compare it with the student's chosen answer: "${resultItem.selectedAnswerText}".
    ${ageGroupPrompts[ageGroup] || ageGroupPrompts.college}
    Focus on the key concept being tested. Use simple, professional language and no formatting.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    explanations.value[questionIndex] = explanation;

  } catch (error) {
    explanations.value[questionIndex] = "Sorry, couldn't generate an explanation at this time.";
  }
};

const toggleQuestion = (index) => {
  expandedQuestions.value[index] = !expandedQuestions.value[index];
  if (expandedQuestions.value[index] && !explanations.value[index]) {
    getExplanation(index);
  }
};

const handleImageError = (e) => {
  // Try to load the image directly to test if it exists
  fetch(e.target.src)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    })
    .catch(error => {
    });
  // Fallback to a default image if needed
  e.target.src = '/skins/cats/assets/dancing-cat.gif';
};

// TODO:
// - Create or source the actual cat images/animations for different poses.
// - Style the component to match the playful theme.
</script>

<style scoped>
.cat-quiz-result {
  padding: 25px;
  background-color: rgb(var(--cat-background));
  border-radius: 20px;
  text-align: center;
  border: 3px solid rgb(var(--cat-primary));
  box-shadow: 0 6px 15px rgba(var(--cat-primary), 0.2);
  max-width: 500px;
  margin: 20px auto;
}

.cat-reaction {
  max-width: 200px;
  width: 100%;
  height: auto;
  margin: 20px auto;
  display: block;
  object-fit: contain;
  border: 2px solid rgb(var(--cat-primary));
  border-radius: 10px;
  padding: 10px;
  background-color: rgba(var(--cat-background), 0.5);
}

/* Add a debug outline to help see the image container */
.cat-reaction {
  outline: 2px solid red;
}

.cat-quiz-result h2 {
  color: rgb(var(--cat-primary));
  margin-bottom: 15px;
  font-size: 1.8em;
}

.score-text {
  font-size: 1.6em;
  font-weight: bold;
  color: rgb(var(--cat-accent)); /* Using accent for score */
  margin-bottom: 10px;
}

.cat-message {
  font-size: 1.15em;
  color: #5a4640; /* From cats.css curriculum styles */
  margin-bottom: 25px;
  line-height: 1.6;
}

button {
  padding: 12px 28px;
  background-color: rgb(var(--color-success)); /* Using success variable from theme */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:hover {
  background-color: rgba(var(--color-success), 0.85); /* Darken using alpha */
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0px);
}

/* Example animation for cat image */
/*
@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
*/
</style> 