<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Lesson Plan Manager</h2>
     
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Lesson Plans List -->
    <div v-else class="space-y-8">
      <div v-for="classItem in classesWithLessonPlans" :key="classItem.id" class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-900">{{ classItem.name }}</h3>
        <div class="space-y-2">
          <div
            v-for="quiz in classItem.quizzes"
            :key="quiz.id"
            class="border flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div>
              <div class="flex items-center space-x-2">
                <a 
                  :href="'/classes/' + quiz.classId + '/assignments/' + quiz.id"
                  class="text-lg font-bold text-primary-600 hover:text-primary-800"
                >
                  {{ quiz.title }}
                </a>
              </div>
              <p class="text-sm text-gray-500">Class: {{ classItem.name }}</p>
            </div>
            <div class="flex space-x-2">
            
              <button
                @click="editLessonPlan(quiz)"
                class="text-primary-600 hover:text-primary-800 font-medium"
                title="Edit Lesson Plan"
              >
                <IconService name="edit" size="6" />
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Lesson Plan Modal -->
    <div v-if="showLessonPlanModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Lesson Plan: {{ currentLessonPlan?.title }}</h3>
          <div class="flex items-center space-x-2">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="text-primary-600 hover:text-primary-700"
              title="Edit lesson plan"
            >
              <IconService name="edit" size="6" />
            </button>
            <button @click="closeLessonPlanModal" class="text-gray-500 hover:text-gray-700">
              <IconService name="x" size="6" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto mb-6">
          <div v-if="!isEditing" class="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
            {{ currentLessonPlan?.content }}
          </div>
          <div v-else>
            <!-- Image Upload Section -->
            <div class="mb-4 p-4 border rounded-lg bg-gray-50">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Upload Image</h4>
              <div class="flex items-center space-x-4">
                <input
                  ref="lessonPlanImageInput"
                  type="file"
                  accept="image/*"
                  @change="handleLessonPlanImageUpload"
                  class="hidden"
                />
                <button
                  @click="lessonPlanImageInput.click()"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {{ lessonPlanImageName || 'Choose Image' }}
                </button>
                <button
                  v-if="uploadedImageUrl"
                  @click="copyMarkdownImage"
                  class="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  Copy Markdown
                </button>
              </div>
              <div v-if="uploadedImageUrl" class="mt-2">
                <img :src="uploadedImageUrl" class="max-w-xs rounded-lg" />
              </div>
            </div>

            <textarea
              v-model="editedLessonPlan"
              class="w-full h-[60vh] p-4 border rounded-lg font-mono text-sm"
              placeholder="Edit your lesson plan content here..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
            v-if="isEditing"
            @click="saveLessonPlan"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
          <button
            v-if="!isEditing"
            @click="closeLessonPlanModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
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
import FirebaseService from '../lib/firebaseService';
import IconService from './IconService.vue';
import BaseAnimation from './BaseAnimation.vue';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export default {
  name: 'LessonPlanManager',
  components: {
    IconService,
    BaseAnimation
  },
  setup() {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const classesWithLessonPlans = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const editingLessonPlan = ref(null);
    const currentLessonPlan = ref({
      title: '',
      lessonPlan: {
        content: ''
      }
    });
    const showLessonPlanModal = ref(false);
    const isEditing = ref(false);
    const editedLessonPlan = ref('');
    const lessonPlanImageFile = ref(null);
    const lessonPlanImageName = ref('');
    const lessonPlanImageInput = ref(null);
    const uploadedImageUrl = ref(null);

    const loadLessonPlans = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        const { classes: loadedClasses } = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true
        });
        
        // Group quizzes by class
        const classMap = new Map();
        
        for (const classData of loadedClasses) {
          classMap.set(classData.id, {
            id: classData.id,
            name: classData.name,
            quizzes: []
          });
        }
        
        for (const quiz of loadedClasses.flatMap(c => c.quizzes)) {
          if (!quiz.lessonPlan) continue;
          
          if (classMap.has(quiz.classId)) {
            classMap.get(quiz.classId).quizzes.push(quiz);
          }
        }
        
        classesWithLessonPlans.value = Array.from(classMap.values());
      } catch (err) {
        console.error('Error loading lesson plans:', err);
        error.value = 'Failed to load lesson plans';
        showError('Failed to load lesson plans');
      } finally {
        loading.value = false;
      }
    };

  
    const closeLessonPlanModal = () => {
      showLessonPlanModal.value = false;
      currentLessonPlan.value = null;
      uploadedImageUrl.value = null;
      lessonPlanImageFile.value = null;
      lessonPlanImageName.value = '';
    };

    const editLessonPlan = (quiz) => {
      currentLessonPlan.value = {
        ...quiz,
        content: quiz.lessonPlan || ''
      };
      editedLessonPlan.value = quiz.lessonPlan || '';
      isEditing.value = true;
      showLessonPlanModal.value = true;
    };

    const closeModal = () => {
      editingLessonPlan.value = null;
      currentLessonPlan.value = {
        title: '',
        lessonPlan: {
          content: ''
        }
      };
    };

    const saveLessonPlan = async () => {
      if (!currentLessonPlan.value) return;

      try {
        loading.value = true;
        const quizData = {
          ...currentLessonPlan.value,
          lessonPlan: editedLessonPlan.value
        };

        await FirebaseService.updateQuiz(currentLessonPlan.value.id, quizData);
        showSuccess('Lesson plan updated successfully');
        await loadLessonPlans();
        closeLessonPlanModal();
      } catch (err) {
        console.error('Error saving lesson plan:', err);
        showError('Failed to save lesson plan');
      } finally {
        loading.value = false;
      }
    };

    const deleteLessonPlan = async (id) => {
      if (!confirm('Are you sure you want to delete this lesson plan?')) return;

      try {
        loading.value = true;
        await FirebaseService.deleteQuiz(id);
        showSuccess('Lesson plan deleted successfully');
        await loadLessonPlans();
      } catch (err) {
        console.error('Error deleting lesson plan:', err);
        showError('Failed to delete lesson plan');
      } finally {
        loading.value = false;
      }
    };

    const handleLessonPlanImageUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          loading.value = true;
          lessonPlanImageFile.value = file;
          lessonPlanImageName.value = file.name;
          
          // Upload to Cloudinary
          const imageUrl = await uploadToCloudinary(file, 'differentest-lesson-images/lesson-plans');
          uploadedImageUrl.value = imageUrl;
          
          // Show success message with markdown format
          showSuccess('Image uploaded successfully! Use this markdown: ![Image](' + imageUrl + ')');
        } catch (error) {
          console.error('Error uploading image:', error);
          showError('Failed to upload image');
        } finally {
          loading.value = false;
        }
      }
    };

    const copyMarkdownImage = () => {
      if (uploadedImageUrl.value) {
        const markdown = `![Image](${uploadedImageUrl.value})`;
        navigator.clipboard.writeText(markdown);
        showSuccess('Markdown copied to clipboard!');
        
        // Clear the upload area
        uploadedImageUrl.value = null;
        lessonPlanImageFile.value = null;
        lessonPlanImageName.value = '';
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      return new Date(timestamp.toDate()).toLocaleDateString();
    };

    onMounted(loadLessonPlans);

    return {
      classesWithLessonPlans,
      loading,
      error,
      editingLessonPlan,
      currentLessonPlan,
      editLessonPlan,
      closeModal,
      saveLessonPlan,
      deleteLessonPlan,
      formatDate,
      showLessonPlanModal,
      currentLessonPlan,
      isEditing,
      editedLessonPlan,
      closeLessonPlanModal,
      lessonPlanImageFile,
      lessonPlanImageName,
      lessonPlanImageInput,
      handleLessonPlanImageUpload,
      uploadedImageUrl,
      copyMarkdownImage
    };
  }
};
</script> 