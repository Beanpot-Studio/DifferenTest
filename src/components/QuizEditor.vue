import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'QuizEditor',
  components: {
    BaseAnimation
  },
  // ... existing code ...

  <template>
    <div class="space-y-6">
      <!-- Loading state -->
      <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-6 bg-red-50 rounded-lg">
        <div class="text-center">
          <div class="w-full flex justify-center items-center">
            <BaseAnimation type="error" />
          </div>
          <h3 class="mt-2 text-xl font-medium text-red-900">Error</h3>
          <p class="mt-1 text-red-500">{{ error }}</p>
        </div>
      </div>

      <!-- Success state -->
      <div v-else-if="success" class="p-6 bg-green-50 rounded-lg">
        <div class="text-center">
          <div class="w-full flex justify-center items-center">
            <BaseAnimation type="success" />
          </div>
          <h3 class="mt-2 text-xl font-medium text-green-900">Success</h3>
          <p class="mt-1 text-green-500">{{ success }}</p>
        </div>
      </div>
      // ... existing code ...
    </div>
  </template>
} 