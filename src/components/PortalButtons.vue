<template>
  <div class="flex space-x-4">
    <a
      v-if="isTeacher"
      href="/teacher"
      class="py-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
    >
      Teacher Portal
    </a>
    <a
      v-else-if="isStudent"
      href="/student"
      class="py-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
    >
      Student Portal
    </a>
  </div>
</template>

<script>
import { useAuth } from '../stores/auth';

export default {
  name: 'PortalButtons',
  setup() {
    const { isTeacher, isStudent } = useAuth();
    
    return {
      isTeacher,
      isStudent
    };
  }
};
</script> 