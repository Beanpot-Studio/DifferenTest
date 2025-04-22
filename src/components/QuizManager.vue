<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Quiz List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Quiz Manager</h2>
      
      <!-- Quiz List -->
      <div v-if="classesWithQuizzes.length > 0" class="space-y-8">
        <div v-for="classItem in classesWithQuizzes" :key="classItem.id" class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900">{{ classItem.name }}</h3>
          <div class="space-y-2">
            <div
              v-for="quiz in classItem.quizzes"
              :key="quiz.id"
              class="border flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-lg font-bold">{{ quiz.title }}</h3>
                  <!-- Badge Image -->
                  <div v-if="quiz.badgeImage" class="relative group">
                    <img 
                      :src="quiz.badgeImage" 
                      alt="Quiz Badge" 
                      class="w-8 h-8 rounded-full object-cover"
                    />
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Quiz Badge
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-500">{{ quiz.questions?.length || 0 }} questions</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editQuiz(quiz)"
                  class="text-primary-600 hover:text-primary-800 font-medium"
                >
                  <IconService name="edit" size="6" />
                </button>
                <button
                  @click="deleteQuiz(quiz.id)"
                  class="text-red-600 hover:text-red-800 p-1"
                  title="Delete quiz"
                >
                  <IconService name="trash" size="6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">No quizzes created yet.</p>
    </div>

    <!-- Edit Quiz Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">Edit Quiz</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input
              v-model="currentQuiz.title"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

         

          <div>
            <label class="block text-sm font-medium text-gray-700">Badge Image</label>
            <div class="mt-1 flex items-center space-x-4">
              <input
                ref="badgeImageInput"
                type="file"
                accept="image/*"
                @change="handleBadgeImageUpload"
                class="hidden"
              />
              <button
                @click="badgeImageInput.click()"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {{ badgeImageName || 'Upload Badge Image' }}
              </button>
              <div v-if="currentQuiz.badgeImage" class="flex items-center space-x-2">
                <img :src="currentQuiz.badgeImage" class="w-10 h-10 rounded-full object-cover" />
                <span class="text-sm text-gray-500">Current badge</span>
              </div>
            </div>
          </div>

          <!-- Questions Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Questions</h3>
            <div v-for="(question, index) in currentQuiz.questions" :key="index" class="border rounded-lg p-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Question {{ index + 1 }}</label>
                <textarea
                  v-model="question.text"
                  rows="2"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>

              <div class="space-y-2">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center space-x-2">
                  <input
                    type="radio"
                    :name="'correct-' + index"
                    :checked="optionIndex === question.correctIndex"
                    @change="question.correctIndex = optionIndex"
                    class="text-primary-600"
                  />
                  <input
                    v-model="option.text"
                    class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button
                    @click="removeOption(index, optionIndex)"
                    class="text-red-600 hover:text-red-800 p-1"
                    title="Remove option"
                  >
                    <IconService name="x" size="4" />
                  </button>
                </div>
              </div>

              <button
                @click="addOption(index)"
                class="mt-2 text-sm text-primary-600 hover:text-primary-800"
              >
                + Add Option
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              @click="showEditModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="saveQuiz"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { useNotification } from '../composables/useNotification';
import BaseAnimation from './BaseAnimation.vue';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export default {
  name: 'QuizManager',
  components: {
    BaseAnimation, IconService
  },
  props: {
    classId: {
      type: String,
      required: false,
      default: null
    }
  },
  setup(props) {
    const { user } = useAuth();
    const quizzes = ref([]);
    const classesWithQuizzes = ref([]);
    const showEditModal = ref(false);
    const currentQuiz = ref(null);
    const badgeImageFile = ref(null);
    const badgeImageName = ref('');
    const badgeImageInput = ref(null);
    const { showSuccess, showError } = useNotification();
    const loading = ref(false);
    const error = ref(null);

    const loadQuizzes = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const fetchedQuizzes = await FirebaseService.getTeacherQuizzes(user.value.uid);
        
        // Group quizzes by class
        const classMap = new Map();
        
        for (const quiz of fetchedQuizzes) {
          if (!classMap.has(quiz.classId)) {
            const classData = await FirebaseService.getClass(quiz.classId);
            classMap.set(quiz.classId, {
              id: quiz.classId,
              name: classData?.name || 'Unknown Class',
              quizzes: []
            });
          }
          
          classMap.get(quiz.classId).quizzes.push(quiz);
        }
        
        classesWithQuizzes.value = Array.from(classMap.values());
      } catch (error) {
        console.error('Error loading quizzes:', error);
        showError('Failed to load quizzes');
      } finally {
        loading.value = false;
      }
    };

    const editQuiz = (quiz) => {
      currentQuiz.value = { ...quiz };
      badgeImageFile.value = null;
      badgeImageName.value = '';
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      currentQuiz.value = null;
      badgeImageFile.value = null;
      badgeImageName.value = '';
      loadQuizzes(); // Refresh the list
    };

    const handleBadgeImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
          name: file.name,
          type: file.type,
          size: file.size
        });
        badgeImageFile.value = file;
        badgeImageName.value = file.name;
      }
    };

    const saveQuiz = async () => {
      if (!currentQuiz.value) return;
      
      try {
        loading.value = true;
        
        // Handle badge image upload if provided
        let badgeImageUrl = currentQuiz.value.badgeImage;
        if (badgeImageFile.value) {
          badgeImageUrl = await uploadToCloudinary(badgeImageFile.value);
          
          if (!badgeImageUrl) {
            throw new Error('Failed to get badge image URL');
          }
        }

        // Update quiz with new data
        const quizData = {
          ...currentQuiz.value,
          badgeImage: badgeImageUrl,
          updatedAt: new Date()
        };

        await FirebaseService.updateQuiz(currentQuiz.value.id, quizData);
        showSuccess('Quiz updated successfully');
        
        // Reset form
        showEditModal.value = false;
        currentQuiz.value = null;
        badgeImageFile.value = null;
        badgeImageName.value = '';
        
        // Refresh the list
        loadQuizzes();
      } catch (error) {
        console.error('Error updating quiz:', error);
        showError('Failed to update quiz');
      } finally {
        loading.value = false;
      }
    };

    const deleteQuiz = async (quizId) => {
      if (!confirm('Are you sure you want to delete this quiz?')) return;

      try {
        await FirebaseService.deleteQuiz(quizId);
        showSuccess('Quiz deleted successfully');
        loadQuizzes(); // Refresh the list
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showError('Error deleting quiz');
      }
    };

    const addOption = (questionIndex) => {
      currentQuiz.value.questions[questionIndex].options.push({ text: '' });
      saveQuiz();
    };

    const removeOption = (questionIndex, optionIndex) => {
      currentQuiz.value.questions[questionIndex].options.splice(optionIndex, 1);
      saveQuiz();
    };

    onMounted(() => {
      loadQuizzes();
    });

    return {
      classesWithQuizzes,
      loading,
      showEditModal,
      currentQuiz,
      badgeImageFile,
      badgeImageName,
      badgeImageInput,
      handleBadgeImageUpload,
      editQuiz,
      saveQuiz,
      closeEditModal,
      deleteQuiz,
      addOption,
      removeOption
    };
  }
};
</script> 