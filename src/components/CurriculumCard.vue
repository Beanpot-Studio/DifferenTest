<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ curriculum.title }}</h2>
      <p class="text-sm text-gray-500 mb-4">Teacher: {{ curriculum.teacherName }}</p>
      
      <div class="mt-4">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Lessons & Quizzes</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="quiz in curriculum.quizzes" :key="quiz.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <a :href="curriculum.link" class="text-blue-600 hover:text-blue-800">
                    {{ quiz.title }}
                  </a>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <IconService name="lock" size="6" class="mr-2" />
                    <span class="text-gray-900">Please log in</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconService from './IconService.vue';

defineProps({
  curriculum: {
    type: Object,
    required: true
  }
});
</script> 