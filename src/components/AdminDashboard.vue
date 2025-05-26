<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Auth Error State -->
    <div v-else-if="!user" class="bg-red-50 text-red-600 p-4 rounded-lg">
      Please log in to access the admin dashboard
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-8">
      <!-- Pending Approvals Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">Pending Class Approvals</h2>
        <div v-if="pendingClasses.length === 0" class="text-gray-500 italic">
          No pending class approvals
        </div>
        <div v-else class="space-y-4">
          <div v-for="classItem in pendingClasses" :key="classItem.id" class="border rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">{{ classItem.name }}</h3>
                <p class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="approveClass(classItem.id)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  @click="rejectClass(classItem.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Approved Public Classes Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">Approved Public Classes</h2>
        <div v-if="approvedClasses.length === 0" class="text-gray-500 italic">
          No approved public classes
        </div>
        <div v-else class="space-y-6">
          <div v-for="classItem in approvedClasses" :key="classItem.id" class="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <IconService name="open-lock" color="text-green-600" size="5" tooltip="This class is public" />
                <h3 class="text-xl font-semibold">{{ classItem.name }}</h3>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</span>
                <button
                  @click="revokeApproval(classItem.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Revoke Approval
                </button>
              </div>
            </div>

            <!-- Lessons Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div 
                v-for="quiz in classItem.quizzes" 
                :key="quiz.id" 
                class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="openLessonModal(quiz)"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="quiz.badgeImage || '/badge.png'"
                    :alt="`${quiz.title} badge`"
                    class="w-12 h-12 object-contain"
                  />
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">{{ quiz.title }}</h4>
                    <p v-if="quiz.description" class="text-sm text-gray-500 mt-1">{{ quiz.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Modal -->
    <BaseModal
      v-if="selectedLesson"
      :is-open="!!selectedLesson"
      @close="selectedLesson = null"
      :title="selectedLesson.title"
    >
      <div class="space-y-6">
        <div v-if="selectedLesson.description" class="text-gray-600">
          {{ selectedLesson.description }}
        </div>
        <div v-if="selectedLesson.lessonPlan" class="prose max-w-none">
          <div v-html="renderedLessonPlan"></div>
        </div>
        <div v-else-if="selectedLesson.lessonSteps?.length" class="prose max-w-none">
          <div v-for="(step, index) in selectedLesson.lessonSteps" :key="index" class="mb-4">
            <h3 class="text-lg font-semibold mb-2">Step {{ index + 1 }}</h3>
            <div v-html="renderedLessonStep(step)"></div>
          </div>
        </div>
        <div v-if="selectedLesson.text" class="prose max-w-none">
          <div v-html="renderedText"></div>
        </div>
        <div v-if="selectedLesson.questions" class="space-y-4">
          <h3 class="text-lg font-semibold">Quiz Questions</h3>
          <div v-for="(question, index) in selectedLesson.questions" :key="index" class="p-4 bg-gray-50 rounded-lg">
            <p class="font-medium">{{ question.text }}</p>
            <div class="mt-2 space-y-2">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center space-x-2">
                <span class="text-sm" :class="option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'">
                  {{ option.text }}
                </span>
                <IconService v-if="option.isCorrect" name="check" color="text-green-600" size="4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import FirebaseService from '../lib/firebaseService';
import IconService from './services/IconService.vue';
import BaseAnimation from './services/BaseAnimation.vue';
import BaseModal from './ui/modals/BaseModal.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default {
  name: 'AdminDashboard',
  components: {
    IconService,
    BaseAnimation,
    BaseModal
  },
  setup() {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const loading = ref(true);
    const error = ref(null);
    const pendingClasses = ref([]);
    const allClasses = ref([]);
    const selectedLesson = ref(null);

    const approvedClasses = computed(() => 
      allClasses.value.filter(c => c.isPublic && c.adminApproved)
    );

    const renderedLessonPlan = computed(() => {
      if (!selectedLesson.value?.lessonPlan) return '';
      return DOMPurify.sanitize(marked(selectedLesson.value.lessonPlan));
    });

    const renderedLessonStep = (step) => {
      if (!step) return '';
      return DOMPurify.sanitize(marked(step));
    };

    const renderedText = computed(() => {
      if (!selectedLesson.value?.text) return '';
      return DOMPurify.sanitize(marked(selectedLesson.value.text));
    });

    const loadClasses = async () => {
      if (!user.value) {
        error.value = 'Please log in to access the admin dashboard';
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        // Get all classes with their quizzes
        const { classes } = await FirebaseService.getClasses({
          includeQuizzes: true,
          includeTeacherInfo: true
        });

        // Separate pending and approved classes
        pendingClasses.value = classes.filter(c => c.isPublic && !c.adminApproved);
        allClasses.value = classes;

      } catch (err) {
        console.error('Error loading classes:', err);
        error.value = 'Failed to load classes';
        showError('Failed to load classes');
      } finally {
        loading.value = false;
      }
    };

    const approveClass = async (classId) => {
      try {
        await FirebaseService.updateClass(classId, { adminApproved: true });
        showSuccess('Class approved successfully');
        await loadClasses();
      } catch (err) {
        console.error('Error approving class:', err);
        showError('Failed to approve class');
      }
    };

    const rejectClass = async (classId) => {
      try {
        await FirebaseService.updateClass(classId, { isPublic: false, adminApproved: false });
        showSuccess('Class rejected successfully');
        await loadClasses();
      } catch (err) {
        console.error('Error rejecting class:', err);
        showError('Failed to reject class');
      }
    };

    const revokeApproval = async (classId) => {
      try {
        await FirebaseService.updateClass(classId, { adminApproved: false });
        showSuccess('Class approval revoked successfully');
        await loadClasses();
      } catch (err) {
        console.error('Error revoking approval:', err);
        showError('Failed to revoke class approval');
      }
    };

    const openLessonModal = (lesson) => {
      selectedLesson.value = lesson;
    };

    onMounted(async () => {
      try {
        await loadClasses();
      } catch (err) {
        console.error('Error in onMounted:', err);
        error.value = 'Failed to initialize dashboard';
      }
    });

    return {
      loading,
      error,
      user,
      pendingClasses,
      approvedClasses,
      selectedLesson,
      renderedLessonPlan,
      renderedLessonStep,
      renderedText,
      approveClass,
      rejectClass,
      revokeApproval,
      openLessonModal
    };
  }
};
</script>

<style>
.prose {
  @apply text-gray-800;
}

.prose h1 {
  @apply text-3xl font-bold mb-4;
}

.prose h2 {
  @apply text-2xl font-bold mb-3;
}

.prose h3 {
  @apply text-xl font-bold mb-2;
}

.prose p {
  @apply mb-4;
}

.prose ul {
  @apply list-disc list-inside mb-4;
}

.prose ol {
  @apply list-decimal list-inside mb-4;
}

.prose li {
  @apply mb-1;
}

.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

.prose a {
  @apply text-primary-600 hover:text-primary-800 underline;
}

.prose img {
  @apply max-w-full h-auto rounded-lg my-4;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th {
  @apply border border-gray-300 px-4 py-2 bg-gray-100 font-semibold;
}

.prose td {
  @apply border border-gray-300 px-4 py-2;
}
</style> 