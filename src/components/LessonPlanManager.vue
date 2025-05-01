<template>
  <div class="space-y-6">
      <h2 class="text-2xl font-bold">Lesson Plan Manager</h2>
      <h3 class="text-gray-500 text-sm">Edit lesson plans for your classes. Lesson plans are used to generate quizzes for your students and can also be viewed by students as part of a lesson interface.</h3>

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
      <!-- Outer loop -->
      <div v-for="classItem in classesWithLessonPlans" :key="classItem.id" class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-900">{{ classItem.name }}</h3>
        <div class="space-y-2">
          <!-- Inner loop for quizzes -->
          <div
            v-for="quiz in classItem.quizzes"
            :key="quiz.id"
            class="border flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div>
              <div class="flex items-center space-x-2">
                <!-- Conditional Link -->
                <a 
                  v-if="classItem.isPublic" 
                  :href="`/classes/${classItem.id}/quiz/${quiz.id}`"
                  class="text-lg font-bold text-primary-600 hover:text-primary-800" 
                  :title="`View Public Quiz: ${quiz.title}`"
                >
                <IconService name="open-lock" size="4" class="inline-block ml-1 text-green-600" />

                  {{ quiz.title }}
                </a>
                <a 
                  v-else 
                  :href="`/lesson/${classItem.id}/quiz/${quiz.id}`" 
                  class="text-lg font-bold text-primary-600 hover:text-primary-800" 
                  :title="`View Lesson/Quiz: ${quiz.title}`"
                >
                <IconService name="lock" size="4" class="inline-block ml-1 text-red-600" />

                  {{ quiz.title }}
                </a>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="() => { editLessonPlan(quiz); }"
                class="text-primary-600 hover:text-primary-800 font-medium"
                title="Edit Lesson Plan"
              >
                 <IconService name="edit" size="6" />
              </button>
            </div>
          </div>
          <!-- Message if no quizzes in this class -->
          <p v-if="!classItem.quizzes || classItem.quizzes.length === 0" class="text-sm text-gray-400 italic px-3">
            No quizzes found in this class.
          </p>
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

            <!-- Full Lesson Editor -->
            <div v-if="editedLessonType === 'full'">
              <label for="fullLessonContent" class="block text-sm font-medium text-gray-700 mb-1">Lesson Content (Markdown supported)</label>
              <textarea
                id="fullLessonContent"
                v-model="editedLessonPlanContent"
                class="w-full h-[60vh] p-4 border rounded-lg font-mono text-sm"
                placeholder="Edit your lesson plan content here..."
              ></textarea>
            </div>

            <!-- Stepped Lesson Editor -->
            <div v-else-if="editedLessonType === 'steps' && isPaidUser">
              <label class="block text-sm font-medium text-gray-700 mb-2">Lesson Steps (Markdown supported)</label>
              <div v-for="(step, index) in editedLessonSteps" :key="index" class="mb-3 relative group">
                <textarea
                   v-model="editedLessonSteps[index]"
                   class="w-full p-3 border rounded-lg font-mono text-sm focus:ring-secondary-500 focus:border-secondary-500"
                ></textarea>
              </div>
            </div>
            <div v-else-if="editedLessonType === 'steps' && !isPaidUser">
              <p class="text-center text-gray-600 bg-yellow-50 p-4 rounded-lg">
                  Stepped lesson plans are a premium feature. Upgrade your account to create and edit stepped lessons.
                  <br/>Switch to 'Full Lesson' format to edit.
              </p>
            </div>
            <div v-else>
            </div>
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
import { ref, onMounted, computed } from 'vue';
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
    const editedLessonType = ref('full');
    const editedLessonSteps = ref([]);
    const editedLessonPlanContent = ref('');

    const isPaidUser = computed(() => user.value?.paid === true);

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
        
        const classMap = new Map();
        
        for (const classData of loadedClasses) {
          if (classData && classData.id) { 
             classMap.set(classData.id, {
                 id: classData.id,
                 name: classData.name || 'Unnamed Class',
                 isPublic: classData.isPublic === true,
                 quizzes: []
             });
          }
        }
        
        for (const classData of loadedClasses) {
          if (classData && Array.isArray(classData.quizzes) && classMap.has(classData.id)) {
             for (const quiz of classData.quizzes) {
                 if (quiz && quiz.id && quiz.title) {
                      classMap.get(classData.id).quizzes.push(quiz);
                 }
             }
          }
        }

        classesWithLessonPlans.value = Array.from(classMap.values());
      } catch (err) {
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
      editedLessonType.value = 'full';
      editedLessonSteps.value = [];
      editedLessonPlanContent.value = '';
    };

    const editLessonPlan = (quiz) => {
      try {
        currentLessonPlan.value = JSON.parse(JSON.stringify(quiz));

        const type = currentLessonPlan.value.lessonType || 'full';
        editedLessonType.value = type;

        if (type === 'steps') {
          editedLessonSteps.value = Array.isArray(currentLessonPlan.value.lessonSteps) && currentLessonPlan.value.lessonSteps.length > 0 
            ? [...currentLessonPlan.value.lessonSteps] 
            : ['']; 
          editedLessonPlanContent.value = ''; 
        } else {
          editedLessonPlanContent.value = currentLessonPlan.value.lessonPlan || '';
          editedLessonSteps.value = ['']; 
        }
        
        uploadedImageUrl.value = null;
        lessonPlanImageFile.value = null;
        lessonPlanImageName.value = '';
         if (lessonPlanImageInput.value) {
             lessonPlanImageInput.value.value = ''; 
         }

        isEditing.value = true; 
        showLessonPlanModal.value = true;
      } catch (err) {
        showError(`Failed to open lesson plan editor: ${err.message}`);
        closeLessonPlanModal(); 
      }
    };

    const saveLessonPlan = async () => {
      if (!currentLessonPlan.value) return;

      try {
        loading.value = true;
        const quizId = currentLessonPlan.value.id;
        const updatedContent = editedLessonPlanContent.value;

        await FirebaseService.updateQuiz(quizId, { 
          lessonPlan: updatedContent,
          updatedAt: new Date()
        });

        currentLessonPlan.value.lessonPlan = updatedContent;
        const classIndex = classesWithLessonPlans.value.findIndex(c => c.id === currentLessonPlan.value.classId);
        if (classIndex !== -1) {
          const quizIndex = classesWithLessonPlans.value[classIndex].quizzes.findIndex(q => q.id === quizId);
          if (quizIndex !== -1) {
            classesWithLessonPlans.value[classIndex].quizzes[quizIndex].lessonPlan = updatedContent;
          }
        }

        isEditing.value = false;
        showSuccess('Lesson plan updated successfully');
      } catch (err) {
        showError('Failed to save lesson plan. Please try again.');
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
          
          const imageUrl = await uploadToCloudinary(file, 'differentest-lesson-images/lesson-plans');
          uploadedImageUrl.value = imageUrl;
          
          showSuccess('Image uploaded successfully! Use this markdown: ![Image](' + imageUrl + ')');
        } catch (error) {
          showError('Failed to upload image');
          lessonPlanImageName.value = '';
        } finally {
          loading.value = false;
        }
      }
    };

    const copyMarkdownImage = () => {
      if (uploadedImageUrl.value) {
        const markdown = `![Image](${uploadedImageUrl.value})`;
        navigator.clipboard.writeText(markdown)
          .then(() => {
            showSuccess('Markdown copied to clipboard!');
            uploadedImageUrl.value = null;
            lessonPlanImageFile.value = null;
            lessonPlanImageName.value = '';
          })
          .catch(err => {
            showError('Could not copy markdown to clipboard.');
          });
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        return new Date(timestamp).toLocaleDateString();
      } catch (e) {
        console.warn("Invalid date format encountered:", timestamp);
        return 'Invalid Date';
      }
    };

    onMounted(() => {
      loadLessonPlans();
    });

    return {
      classesWithLessonPlans,
      loading,
      error,
      editingLessonPlan,
      currentLessonPlan,
      editLessonPlan,
      closeLessonPlanModal,
      saveLessonPlan,
      deleteLessonPlan,
      formatDate,
      showLessonPlanModal,
      currentLessonPlan,
      isEditing,
      editedLessonPlan,
      lessonPlanImageFile,
      lessonPlanImageName,
      lessonPlanImageInput,
      uploadedImageUrl,
      editedLessonType,
      editedLessonSteps,
      editedLessonPlanContent,
      isPaidUser,
      handleLessonPlanImageUpload,
      copyMarkdownImage
    };
  }
};
</script> 