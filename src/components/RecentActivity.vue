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
        <IconService name="activity" size="8" color="text-gray-400" />
        <h3 class="mt-4 text-lg font-semibold text-gray-900">No Recent Activity</h3>
        <p class="mt-2 text-gray-500">Your activity will appear here</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3 p-4 bg-white border rounded ">
          <div class="flex-shrink-0">
            <div class="p-2 rounded-full" :class="{
              'bg-purple-100': activity.type === 'class_joined',
              'bg-red-100': activity.type === 'class_left',
              'bg-green-100': activity.type === 'quiz_completed',
              'bg-yellow-100': activity.type === 'badge_claimed',
              'bg-blue-100': activity.type === 'quiz_started' || activity.type === 'enrollment_status_changed'
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
                v-else-if="activity.type === 'badge_claimed'" 
                name="star" 
                size="4" 
                color="text-yellow-600"
              />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ getActivityTypeText(activity.type) }}</h3>
              <p class="text-sm text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
            </div>
            <div class="mt-1 space-y-1">
              <p class="text-sm text-gray-500">
                {{ activity.className }}
              </p>
              <p class="text-sm text-gray-500">
                {{ activity.teacherName || 'Unknown Teacher' }}
              </p>
            </div>
            <div v-if="activity.type === 'enrollment_status_changed'" class="mt-2">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                activity.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';
import IconService from './IconService.vue'

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
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(
          activitiesRef,
          where('userId', '==', user.value.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        const activityList = [];
        for (const docSnap of activitiesSnapshot.docs) {
          const activity = docSnap.data();
          let className = 'Unknown Class';
          let teacherName = 'Unknown Teacher';
          
          if (activity.classId) {
            try {
              const classDoc = await getDoc(doc(db, 'classes', activity.classId));
              if (classDoc.exists()) {
                className = classDoc.data().name || 'Unknown Class';
                const teacherId = classDoc.data().teacherId;
                if (teacherId) {
                  const teacherDoc = await getDoc(doc(db, 'users', teacherId));
                  teacherName = teacherDoc.exists() ? teacherDoc.data().name : 'Unknown Teacher';
                }
              }
            } catch (err) {
              console.error('Error loading class or teacher details:', err);
            }
          }
          
          activityList.push({
            id: docSnap.id,
            ...activity,
            timestamp: activity.timestamp?.toDate() || new Date(),
            className: className,
            teacherName: teacherName
          });
        }
        
        activities.value = activityList;
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
        case 'class_joined':
          return 'Joined Class';
        case 'class_left':
          return 'Left Class';
        case 'quiz_completed':
          return 'Completed Quiz';
        case 'quiz_started':
          return 'Started Quiz';
        case 'enrollment_status_changed':
          return 'Enrollment Status Changed';
        case 'badge_claimed':
          return 'Earned Achievement';
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