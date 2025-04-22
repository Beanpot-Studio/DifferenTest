<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center py-8">
      <BaseAnimation type="loading" :size="50" />
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
    </div>
    <div v-else-if="!hasAccess" class="p-4 bg-yellow-50 rounded-lg">
      <div class="flex items-center justify-center space-x-2 mb-2">
        <IconService name="lock" size="6" />
        <h3 class="text-lg font-semibold text-gray-900">Access Restricted</h3>
      </div>
      <p class="text-gray-500 text-center">You don't have permission to access this class.</p>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import FirebaseService from '../lib/firebaseService';
import BaseAnimation from './BaseAnimation.vue';
import IconService from './IconService.vue';

export default {
  name: 'ClassAccessGuard',
  components: {
    BaseAnimation,
    IconService
  },
  props: {
    classData: {
      type: Object,
      required: true
    },
    classId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { user } = useAuth();
    const loading = ref(true);
    const error = ref(null);
    const hasAccess = ref(false);

    const checkAccess = async () => {
      try {
        loading.value = true;
        error.value = null;

        // If class is public, allow access
        if (props.classData.isPublic) {
          hasAccess.value = true;
          return;
        }

        // If no user is logged in, deny access
        if (!user.value) {
          hasAccess.value = false;
          return;
        }

        // Get user profile
        const userProfile = await FirebaseService.getUserProfile(user.value.uid);
        if (!userProfile) {
          hasAccess.value = false;
          return;
        }

        // If user is the teacher of this class, allow access
        if (userProfile.role === 'teacher' && props.classData.teacherId === user.value.uid) {
          hasAccess.value = true;
          return;
        }

        // If user is a student, check enrollment
        if (userProfile.role === 'student') {
          const enrollmentStatus = await FirebaseService.getEnrollmentStatus(user.value.uid, props.classId);
          hasAccess.value = enrollmentStatus === 'enrolled';
          return;
        }

        // Default to no access
        hasAccess.value = false;
      } catch (err) {
        console.error('Error checking access:', err);
        error.value = 'Failed to check access permissions';
        hasAccess.value = false;
      } finally {
        loading.value = false;
      }
    };

    onMounted(checkAccess);

    return {
      loading,
      error,
      hasAccess
    };
  }
};
</script> 