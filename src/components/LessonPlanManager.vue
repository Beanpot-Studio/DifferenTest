<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Lesson Plans</h2>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Create New Lesson Plan
      </button>
    </div>

    <!-- Lesson Plans List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="lessonPlan in lessonPlans"
        :key="lessonPlan.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="relative h-48">
          <img
            v-if="lessonPlan.imageUrl"
            :src="lessonPlan.imageUrl"
            class="w-full h-full object-cover"
            :alt="lessonPlan.title"
          />
          <div
            v-else
            class="w-full h-full bg-gray-100 flex items-center justify-center"
          >
            <IconService name="image" size="8" class="text-gray-400" />
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ lessonPlan.title }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ lessonPlan.description }}</p>
          <div class="flex justify-end space-x-2">
            <button
              @click="editLessonPlan(lessonPlan)"
              class="text-primary-600 hover:text-primary-800"
            >
              <IconService name="edit" size="6" />
            </button>
            <button
              @click="deleteLessonPlan(lessonPlan.id)"
              class="text-red-600 hover:text-red-800"
            >
              <IconService name="trash" size="6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingLessonPlan"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">
          {{ editingLessonPlan ? 'Edit' : 'Create' }} Lesson Plan
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              v-model="currentLessonPlan.title"
              type="text"
              class="w-full p-2 border rounded-lg"
              placeholder="Enter lesson plan title"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="currentLessonPlan.description"
              class="w-full p-2 border rounded-lg"
              rows="3"
              placeholder="Enter lesson plan description"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <ImageUpload v-model="currentLessonPlan.imageUrl" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              v-model="currentLessonPlan.content"
              class="w-full p-2 border rounded-lg"
              rows="6"
              placeholder="Enter lesson plan content"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="saveLessonPlan"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import ImageUpload from './ImageUpload.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'LessonPlanManager',
  components: {
    IconService,
    ImageUpload
  },
  setup() {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const lessonPlans = ref([]);
    const showCreateModal = ref(false);
    const editingLessonPlan = ref(null);
    const currentLessonPlan = ref({
      title: '',
      description: '',
      content: '',
      imageUrl: ''
    });

    const loadLessonPlans = async () => {
      if (!user.value) return;

      try {
        lessonPlans.value = await FirebaseService.getAllLessonPlans(user.value.uid);
      } catch (error) {
        console.error('Error loading lesson plans:', error);
        showError('Failed to load lesson plans');
      }
    };

    const saveLessonPlan = async () => {
      if (!user.value) return;

      try {
        if (!currentLessonPlan.value.title.trim()) {
          showError('Please enter a title');
          return;
        }

        const lessonPlanData = {
          ...currentLessonPlan.value,
          teacherId: user.value.uid,
          updatedAt: new Date()
        };

        if (editingLessonPlan.value) {
          await FirebaseService.updateLessonPlan(
            editingLessonPlan.value.id,
            lessonPlanData
          );
          showSuccess('Lesson plan updated successfully');
        } else {
          await FirebaseService.createLessonPlan(lessonPlanData);
          showSuccess('Lesson plan created successfully');
        }

        closeModal();
        await loadLessonPlans();
      } catch (error) {
        console.error('Error saving lesson plan:', error);
        showError('Failed to save lesson plan');
      }
    };

    const editLessonPlan = (lessonPlan) => {
      editingLessonPlan.value = lessonPlan;
      currentLessonPlan.value = { ...lessonPlan };
    };

    const deleteLessonPlan = async (id) => {
      if (!confirm('Are you sure you want to delete this lesson plan?')) return;

      try {
        await FirebaseService.deleteLessonPlan(id);
        showSuccess('Lesson plan deleted successfully');
        await loadLessonPlans();
      } catch (error) {
        console.error('Error deleting lesson plan:', error);
        showError('Failed to delete lesson plan');
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      editingLessonPlan.value = null;
      currentLessonPlan.value = {
        title: '',
        description: '',
        content: '',
        imageUrl: ''
      };
    };

    onMounted(() => {
      loadLessonPlans();
    });

    return {
      lessonPlans,
      showCreateModal,
      editingLessonPlan,
      currentLessonPlan,
      saveLessonPlan,
      editLessonPlan,
      deleteLessonPlan,
      closeModal
    };
  }
};
</script> 