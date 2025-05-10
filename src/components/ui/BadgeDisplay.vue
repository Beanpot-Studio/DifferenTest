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
      </div>
      <h3 class="text-lg font-semibold text-gray-900">No Badges Yet</h3>
      <p class="text-gray-500">Complete quizzes with perfect scores to earn badges!</p>
    </div>

    <!-- Badges grid -->
    <div v-else class="space-y-4">
      <div 
        v-for="badge in badges" 
        :key="badge.id" 
        class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-yellow-50 to-amber-100 hover:shadow-xl transition-shadow duration-300"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
              <img :src="badge.metadata.badgeImage" alt="Badge" class="w-24 h-24" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start pt-3">
              <h3 class="text-lg font-semibold text-gray-800">{{ badge.metadata?.title || 'Achievement' }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {{ formatDate(badge.issuanceDate) }}
              </span>
            </div>
            <p class="text-gray-700 mb-2">{{ badge.metadata?.badgeDescription }}</p>
           
            <a
                :href="`/badges/${badge.id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Verify Badge
              </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../../stores/auth';
import BaseAnimation from '../services/BaseAnimation.vue';
import IconService from '../services/IconService.vue';
import FirebaseService from '../../lib/firebaseService';

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
      formatDate,
      
    };
  }
};
</script> 