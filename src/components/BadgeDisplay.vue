<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <BaseAnimation type="loading" :size="50" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-red-50 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- No badges state -->
    <div v-else-if="badges.length === 0" class="text-center py-8">
      <div class="flex justify-center mb-4">
        <div class="p-4 rounded-full bg-gray-100">
          <IconService name="star" size="8" color="text-gray-400" />
        </div>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">No Badges Yet</h3>
      <p class="text-gray-500">Complete quizzes with perfect scores to earn badges!</p>
    </div>

    <!-- Badges grid -->
    <div v-else class="grid w-full">
      <div v-for="badge in badges" :key="badge.badgeId" class="bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="p-3 rounded-full" :class="`bg-${badge.metadata?.color || 'yellow'}-100`">
              <span class="text-2xl">{{ badge.metadata?.icon || '🏆' }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-semibold text-gray-900">{{ badge.metadata?.title || 'Achievement' }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {{ formatDate(badge.timestamp) }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ badge.metadata?.description || 'No description available' }}</p>
            <p class="text-sm text-gray-500 mt-1">Quiz: {{ badge.quizTitle }}</p>
            
            <div v-if="badge.blockchainVerification" class="mt-2 flex items-center space-x-1">
              <IconService name="verified" size="4" color="text-gray-400" />
              <span class="text-xs text-gray-500">Verified on {{ badge.blockchainVerification.network }}</span>
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
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'BadgeDisplay',
  components: {
    BaseAnimation,
    IconService
  },
  setup() {
    const { user } = useAuth();
    const badges = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const loadBadges = async () => {
      try {
        if (!user.value) {
          throw new Error('User must be logged in to view badges');
        }

        badges.value = await FirebaseService.getUserBadges(user.value.uid);
        console.log('Loaded badges:', badges.value); // Debug log
       
      } catch (err) {
        console.error('Error loading badges:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (timestamp) => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    onMounted(loadBadges);

    return {
      badges,
      loading,
      error,
      formatDate
    };
  }
};
</script> 