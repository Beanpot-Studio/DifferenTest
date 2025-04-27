<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Quiz History -->
    <div v-else class="space-y-4">
      <div v-if="quizHistory.length === 0" class="text-center py-8">
        <p class="text-gray-500">No quiz history found.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="attempt in quizHistory" :key="attempt.id" class="border rounded p-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold">{{ attempt.quizTitle }}</h3>
              <p class="text-sm text-gray-500">Class: {{ attempt.className }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatDate(attempt.submittedAt) }}</p>
              <span :class="[
                'px-2 py-1 rounded text-sm',
                attempt.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                Score: {{ attempt.score }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  components: {
    BaseAnimation
  },
  setup() {
    const { user } = useAuth();
    const quizHistory = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const selectedAttempt = ref(null);

    const loadQuizHistory = async () => {
      if (!user.value?.uid) {
        error.value = 'Please log in to view your quiz history.';
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        const attempts = await FirebaseService.getUserQuizHistory(user.value.uid);
        quizHistory.value = attempts;
      } catch (err) {
        console.error('Error loading quiz history:', err);
        error.value = 'Failed to load quiz history. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      loadQuizHistory();
    });

    return {
      quizHistory,
      loading,
      error,
      selectedAttempt,
      formatDate
    };
  }
};
</script> 