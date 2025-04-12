<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ curriculum.title }}</h3>
      <p class="text-gray-600 mb-4">{{ curriculum.description }}</p>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">
            {{ curriculum.quizzes?.length || 0 }} quizzes
          </span>
        </div>
        <a 
          :href="`/curriculum/${curriculum.id}`"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Class
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CurriculumCard',
  props: {
    curriculum: {
      type: Object,
      required: true
    }
  }
}
</script> 