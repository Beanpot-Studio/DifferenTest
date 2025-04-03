<template>
  <div class="flex space-x-4">

    <div v-if="isTeacher">
      <p class="text-secondary-600 mb-3">
          Manage courses and build quizzes
      </p>
      <a href="/teacher"
      class="text-primary-600 hover:text-primary-800 font-medium"
    >
      Teacher Portal →
    </a>
    </div>
    
    <div v-else-if="isStudent">
      <p class="text-secondary-600 mb-3">
        Enroll in courses, view progress and take quizzes
      </p>
  
      <a href="/student"
        class="text-primary-600 hover:text-primary-800 font-medium"
      >  
      Student Portal →
      </a>

    </div>
  
  </div>
</template>

<script>
import { useAuth } from '../stores/auth';

export default {
  name: 'PortalLinks',
  setup() {
    const { isTeacher, isStudent } = useAuth();
    
    return {
      isTeacher,
      isStudent
    };
  }
};
</script> 