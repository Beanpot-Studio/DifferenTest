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
      <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">No Badges Yet</h3>
      <p class="text-gray-500">Complete quizzes with perfect scores to earn badges!</p>
    </div>

    <!-- Badges grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="badge in badges" :key="badge.badgeId" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900">{{ badge.title }}</h3>
            <p class="text-sm text-gray-500">{{ badge.description }}</p>
            <div class="mt-2 flex items-center space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ badge.score }}% Score
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(badge.timestamp) }}
              </span>
            </div>
            <div v-if="badge.blockchainVerification" class="mt-2 flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
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
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'BadgeDisplay',
  components: {
    BaseAnimation
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

        const badgesQuery = query(
          collection(db, 'badges'),
          where('userId', '==', user.value.uid),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(badgesQuery);
        badges.value = querySnapshot.docs.map(doc => ({
          badgeId: doc.id,
          ...doc.data()
        }));
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