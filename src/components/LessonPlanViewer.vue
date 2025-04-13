<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <!-- Lesson Plan Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ lessonPlan.title }}</h1>
      <p class="text-gray-600 mb-4">{{ lessonPlan.description }}</p>
      <div class="flex items-center text-sm text-gray-500">
        <span class="mr-4">Created by: {{ lessonPlan.teacherName }}</span>
        <span>{{ new Date(lessonPlan.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- Lesson Content -->
    <div class="prose max-w-none mb-8">
      <div v-html="lessonPlan.content"></div>
    </div>

    <!-- Quizzes Section -->
    <div class="border-t pt-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Quizzes</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="quiz in lessonPlan.quizzes" 
          :key="quiz.id" 
          class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ quiz.title }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ quiz.description || 'Test your knowledge' }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">
              {{ quiz.questionCount }} questions
            </span>
            <a 
              :href="`/quiz/${quiz.id}`"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Take Quiz
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonPlanViewer',
  props: {
    lessonPlan: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>
.prose {
  max-width: 65ch;
  color: #374151;
  line-height: 1.75;
}

.prose h2 {
  color: #111827;
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose ul {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  list-style-type: disc;
  padding-left: 1.625em;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose code {
  color: #111827;
  font-weight: 600;
  font-size: 0.875em;
}

.prose pre {
  color: #e5e7eb;
  background-color: #1f2937;
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}
</style> 