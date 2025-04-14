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

    <!-- Recent Activity -->
    <div v-else class="space-y-4">
      <div v-if="activities.length === 0" class="text-center py-8">
        <p class="text-gray-500">No recent activity found.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="border-b">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                   :class="{
                     'bg-purple-100': activity.type === 'class_joined',
                     'bg-red-100': activity.type === 'class_left' || activity.type === 'enrollment_rejected',
                     'bg-green-100': activity.type === 'quiz_completed' || activity.type === 'enrollment_accepted',
                     'bg-blue-100': activity.type === 'quiz_started' || activity.type === 'enrollment_status_changed',
                     'bg-yellow-100': activity.type === 'badge_claimed' || activity.type === 'achievement',
                     'bg-indigo-100': activity.type === 'enrollment_request',
                     'bg-orange-100': activity.type === 'progress' || activity.type === 'quiz_retake'
                   }">
                <IconService 
                  v-if="activity.type === 'class_joined'" 
                  name="class-joined" 
                  size="4" 
                  color="text-purple-600"
                />
                <IconService 
                  v-else-if="activity.type === 'class_left'" 
                  name="x" 
                  size="4" 
                  color="text-red-600"
                />
                <IconService 
                  v-else-if="activity.type === 'quiz_completed'" 
                  name="quiz-completed" 
                  size="4" 
                  color="text-green-600"
                />
                <IconService 
                  v-else-if="activity.type === 'quiz_started'" 
                  name="quiz-started" 
                  size="4" 
                  color="text-blue-600"
                />
                <IconService 
                  v-else-if="activity.type === 'enrollment_status_changed'" 
                  name="enrollment-changed" 
                  size="4" 
                  color="text-blue-600"
                />
                <IconService 
                  v-else-if="activity.type === 'badge_claimed' || activity.type === 'achievement'" 
                  name="star" 
                  size="4" 
                  color="text-yellow-600"
                />
                <IconService 
                  v-else-if="activity.type === 'enrollment_request'" 
                  name="user-plus" 
                  size="4" 
                  color="text-indigo-600"
                />
                <IconService 
                  v-else-if="activity.type === 'progress'" 
                  name="trending-up" 
                  size="4" 
                  color="text-orange-600"
                />
                <IconService 
                  v-else-if="activity.type === 'enrollment_accepted'" 
                  name="check" 
                  size="4" 
                  color="text-green-600"
                />
                <IconService 
                  v-else-if="activity.type === 'enrollment_rejected'" 
                  name="x" 
                  size="4" 
                  color="text-red-600"
                />
                <IconService 
                  v-else-if="activity.type === 'quiz_retake'" 
                  name="refresh" 
                  size="4" 
                  color="text-orange-600"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ activity.typeText }}: {{ activity.quizTitle }}</h3>
                <p class="text-sm text-gray-500">Class: {{ activity.className }}</p>
                <p class="text-sm text-gray-500">Teacher: {{ activity.teacherName || 'Unknown Teacher' }}</p>
                <p v-if="typeof activity.score === 'number'" class="text-sm text-gray-500">Score: {{ activity.score }}%</p>
                <p v-if="activity.improvement" class="text-sm text-green-600">Improved by {{ activity.improvement }}%</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
              <span v-if="activity.status" :class="[
                'px-2 py-1 rounded text-sm',
                activity.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              ]">
                {{ getStatusText(activity.status) }}
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
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  components: {
    BaseAnimation,
    IconService
  },
  setup() {
    const { user } = useAuth();
    const activities = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const loadRecentActivity = async () => {
      if (!user.value?.uid) {
        error.value = 'Please log in to view your recent activity.';
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        activities.value = await FirebaseService.getUserActivities(user.value.uid, 5);
      } catch (err) {
        console.error('Error loading recent activity:', err);
        error.value = 'Failed to load recent activity. Please try again.';
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

    const formatRelativeTime = (timestamp) => {
      const now = new Date();
      const then =
        typeof timestamp.toDate === 'function'
          ? timestamp.toDate()
          : new Date(timestamp);
      const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return then.toLocaleDateString();
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'accepted':
          return 'Accepted';
        case 'rejected':
          return 'Rejected';
        case 'pending':
          return 'Pending';
        default:
          return 'Unknown';
      }
    };

    const getActivityTypeText = (type) => {
      switch (type) {
        case 'enrollment_request':
          return 'Requested to join class';
        case 'enrollment_accepted':
          return 'Enrollment accepted';
        case 'enrollment_rejected':
          return 'Enrollment rejected';
        case 'quiz_started':
          return 'Started quiz';
        case 'quiz_completed':
          return 'Completed quiz';
        case 'quiz_retake':
          return 'Retook quiz';
        case 'achievement':
          return 'Earned achievement';
        case 'progress':
          return 'Made progress';
        case 'class_joined':
          return 'Joined class';
        case 'class_left':
          return 'Left class';
        default:
          return 'Unknown Activity';
      }
    };

    onMounted(() => {
      loadRecentActivity();
    });

    return {
      activities,
      loading,
      error,
      formatDate,
      formatRelativeTime,
      getStatusText,
      getActivityTypeText
    };
  }
};
</script> 