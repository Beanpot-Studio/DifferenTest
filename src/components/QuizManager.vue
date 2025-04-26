<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Quiz List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Quiz Manager</h2>
        <button
          @click="createQuiz"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Create Quiz
        </button>
      </div>
      
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

    <!-- Create Quiz Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Create New Quiz</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Class</label>
            <select
              v-model="newQuiz.classId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select a Class</option>
              <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
                {{ classItem.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input
              v-model="newQuiz.title"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Number of Questions</label>
            <input
              v-model.number="newQuiz.questionCount"
              type="number"
              min="1"
              max="10"
              class="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p class="mt-1 text-sm text-gray-500">Choose between 1-10 questions</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Lesson Plan</label>
            <div class="mt-1 flex items-center space-x-4">
              <input
                ref="lessonPlanInput"
                type="file"
                accept=".txt,.md"
                @change="handleLessonPlanUpload"
                class="hidden"
              />
              <button
                @click="lessonPlanInput.click()"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {{ lessonPlanName || 'Upload Lesson Plan (txt or md)' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Badge Image</label>
            <div class="mt-1 flex items-center space-x-4">
              <input
                ref="newBadgeImageInput"
                type="file"
                accept="image/*"
                @change="handleNewBadgeImageUpload"
                class="hidden"
              />
              <button
                @click="newBadgeImageInput.click()"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {{ newBadgeImageName || 'Upload Badge Image' }}
              </button>
            </div>
          </div>

          <!-- Generated Questions Preview -->
          <div v-if="loading" class="flex flex-col items-center justify-center p-6">
            <BaseAnimation type="loading" :loop="true" />
            <p class="mt-4 text-gray-600">Generating questions from lesson plan...</p>
          </div>
          <div v-else-if="newQuiz.questions && newQuiz.questions.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Generated Questions</h3>
            <div v-for="(question, index) in newQuiz.questions" :key="index" class="border rounded-lg p-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Question {{ index + 1 }}</label>
                <p class="mt-1 text-gray-900">{{ question.text }}</p>
              </div>

              <div class="space-y-2">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center space-x-2">
                  <input
                    type="radio"
                    :name="'correct-' + index"
                    :checked="optionIndex === question.correctIndex"
                    disabled
                    class="text-primary-600"
                  />
                  <span :class="{ 'text-green-600 font-medium': optionIndex === question.correctIndex }">
                    {{ option.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4 sticky bottom-0 bg-white py-4">
            <button
              @click="showCreateModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="saveNewQuiz"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Quiz
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Quiz Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

          <div class="flex justify-end space-x-4 sticky bottom-0 bg-white py-4">
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
    const classesWithQuizzes = ref([]);
    const classes = ref([]);
    const showEditModal = ref(false);
    const currentQuiz = ref(null);
    const badgeImageFile = ref(null);
    const badgeImageName = ref('');
    const badgeImageInput = ref(null);
    const { showSuccess, showError } = useNotification();
    const loading = ref(false);
    const error = ref(null);
    const showCreateModal = ref(false);
    const newQuiz = ref({
      classId: '',
      title: '',
      badgeImage: null,
      lessonPlan: null,
      questions: [],
      questionCount: 5
    });
    const newBadgeImageFile = ref(null);
    const newBadgeImageName = ref('');
    const newBadgeImageInput = ref(null);
    const lessonPlanFile = ref(null);
    const lessonPlanName = ref('');
    const lessonPlanInput = ref(null);

    const loadQuizzes = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const response = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true
        });
        
        if (!response || !response.classes) {
          classesWithQuizzes.value = [];
          return;
        }
        
        // Group quizzes by class
        classesWithQuizzes.value = response.classes
          .filter(classData => classData.quizzes && classData.quizzes.length > 0)
          .map(classData => ({
            id: classData.id,
            name: classData.name,
            quizzes: classData.quizzes.map(quiz => ({
              ...quiz,
              className: classData.name,
              classId: classData.id
            }))
          }));
      } catch (error) {
        console.error('Error loading quizzes:', error);
        showError('Failed to load quizzes');
      } finally {
        loading.value = false;
      }
    };

    const loadClasses = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const response = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: false,
          includeTeacherInfo: false
        });
        
        if (!response || !response.classes) {
          classes.value = [];
          return;
        }
        
        classes.value = response.classes.map(classData => ({
          id: classData.id,
          name: classData.name
        }));
      } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes');
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
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size
        };
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

    const createQuiz = () => {
      newQuiz.value = {
        classId: '',
        title: '',
        badgeImage: null,
        lessonPlan: null,
        questions: [],
        questionCount: 5
      };
      newBadgeImageFile.value = null;
      newBadgeImageName.value = '';
      lessonPlanFile.value = null;
      lessonPlanName.value = '';
      showCreateModal.value = true;
    };

    const handleNewBadgeImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        newBadgeImageFile.value = file;
        newBadgeImageName.value = file.name;
      }
    };

    const handleLessonPlanUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
          showError('Please upload a .txt or .md file');
          return;
        }
        lessonPlanFile.value = file;
        lessonPlanName.value = file.name;
        
        try {
          loading.value = true;
          const lessonPlanContent = await readFileAsText(file);
          if (!lessonPlanContent) {
            throw new Error('Failed to read lesson plan file');
          }
          
          // Store the lesson plan content in the ref
          newQuiz.value.lessonPlan = lessonPlanContent;

          // Generate questions from lesson plan
          const generatedQuiz = await FirebaseService.generateQuiz(lessonPlanContent, newQuiz.value.questionCount);
          newQuiz.value.questions = generatedQuiz.questions;
          showSuccess('Questions generated successfully!');
        } catch (error) {
          console.error('Error generating questions:', error);
          showError('Failed to generate questions: ' + error.message);
        } finally {
          loading.value = false;
        }
      }
    };

    const saveNewQuiz = async () => {
      if (!newQuiz.value.classId || !newQuiz.value.title || !newQuiz.value.questions) {
        showError('Please fill in all required fields and generate questions');
        return;
      }

      try {
        loading.value = true;
        
        // Handle badge image upload if provided
        let badgeImageUrl = null;
        if (newBadgeImageFile.value) {
          badgeImageUrl = await uploadToCloudinary(newBadgeImageFile.value);
          if (!badgeImageUrl) {
            throw new Error('Failed to upload badge image');
          }
        }

        // Create quiz data
        const quizData = {
          ...newQuiz.value,
          badgeImage: badgeImageUrl,
          teacherId: user.value.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await FirebaseService.createQuiz(quizData);
        showSuccess('Quiz created successfully');
        
        // Reset form
        showCreateModal.value = false;
        newQuiz.value = {
          classId: '',
          title: '',
          badgeImage: null,
          lessonPlan: null,
          questions: [],
          questionCount: 5
        };
        newBadgeImageFile.value = null;
        newBadgeImageName.value = '';
        lessonPlanFile.value = null;
        lessonPlanName.value = '';
        
        // Refresh the list
        loadQuizzes();
      } catch (error) {
        console.error('Error creating quiz:', error);
        showError('Failed to create quiz: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    const readFileAsText = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    };

    onMounted(() => {
      loadQuizzes();
      loadClasses();
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
      removeOption,
      showCreateModal,
      newQuiz,
      newBadgeImageFile,
      newBadgeImageName,
      newBadgeImageInput,
      createQuiz,
      handleNewBadgeImageUpload,
      classes,
      loadClasses,
      lessonPlanFile,
      lessonPlanName,
      lessonPlanInput,
      handleLessonPlanUpload,
      saveNewQuiz,
      readFileAsText
    };
  }
};
</script> 