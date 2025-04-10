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
                     'bg-red-100': activity.type === 'class_left',
                     'bg-green-100': activity.type === 'quiz_completed',
                     'bg-blue-100': activity.type === 'quiz_started' || activity.type === 'enrollment_status_changed',
                     'bg-yellow-100': activity.type === 'badge_claimed'
                   }">
                <svg v-if="activity.type === 'class_joined'" class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else-if="activity.type === 'class_left'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                <svg v-else-if="activity.type === 'quiz_completed'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="activity.type === 'quiz_started'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <svg v-else-if="activity.type === 'enrollment_status_changed'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div v-else-if="activity.type === 'badge_claimed'" class="w-6 h-6 ">
                 🏆
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ getActivityTypeText(activity.type) }}</h3>
                <p class="text-sm text-gray-500">Class: {{ activity.className }}</p>
                <p class="text-sm text-gray-500">Teacher: {{ activity.teacherName || 'Unknown Teacher' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
              <span v-if="activity.type === 'enrollment_status_changed'" :class="[
                'px-2 py-1 rounded text-sm',
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

export default {
  components: {
    BaseAnimation
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