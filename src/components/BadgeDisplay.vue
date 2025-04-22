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
    <div v-else class="grid w-full">
      <div v-for="badge in badges" :key="badge.id" class="bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
              <img :src="badge.metadata.badgeImage" alt="Badge" class="w-24 h-24" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start pt-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ badge.metadata?.title || 'Achievement' }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {{ formatDate(badge.issuanceDate) }}
              </span>
            </div>
            <p class="text-gray-700 mb-2">{{ badge.metadata?.badgeDescription }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <button @click="shareOnTwitter(badge)" class="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-xs">Share on Twitter</button>
              <button @click="shareOnLinkedIn(badge)" class="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-xs">Share on LinkedIn</button>
              <button @click="shareOnFacebook(badge)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Share on Facebook</button>
              <button @click="copyLink(badge)" class="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs">Copy Link</button>
            </div>
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

    // Social sharing methods
    const getShareUrl = (badge) => {
      // Use badge.image if it's a valid public URL, otherwise fallback to /badges/{badge.id}
      if (badge.image && /^https?:\/\//.test(badge.image)) {
        return badge.image;
      }
      return `${window.location.origin}/badges/${badge.id}`;
    };
    const shareOnTwitter = (badge) => {
      const text = encodeURIComponent(`I just earned the '${badge.metadata?.title}' badge! 🎉 Check it out: ${getShareUrl(badge)}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };
    const shareOnLinkedIn = (badge) => {
      const url = encodeURIComponent(getShareUrl(badge));
      const title = encodeURIComponent(badge.metadata?.title || 'Achievement Badge');
      const summary = encodeURIComponent(badge.metadata?.description || 'I earned a badge!');
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
    };
    const shareOnFacebook = (badge) => {
      const url = encodeURIComponent(getShareUrl(badge));
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };
    const copyLink = async (badge) => {
      try {
        await navigator.clipboard.writeText(getShareUrl(badge));
        alert('Link copied to clipboard!');
      } catch {
        alert('Failed to copy link');
      }
    };

    onMounted(loadBadges);

    return {
      badges,
      loading,
      error,
      formatDate,
      shareOnTwitter,
      shareOnLinkedIn,
      shareOnFacebook,
      copyLink
    };
  }
};
</script> 