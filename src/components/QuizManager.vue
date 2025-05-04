<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Quiz Manager</h2>

      <button
            @click="createQuiz"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            data-testid="create-quiz-button"
          >
            Create Quiz
          </button>
    </div>

    <h3 class="text-gray-500 text-sm">Create quizzes for your classes. Paste in a lesson plan to generate editable questions. Premium users can create step-by-step lessons and quizzes for use with custom skins.</h3>

    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Quiz List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      
      
      <!-- Quiz List -->
      <div v-if="classesWithQuizzes.length > 0" class="space-y-8" data-testid="quiz-list-container">
        <div 
          v-for="classItem in classesWithQuizzes" 
          :key="classItem.id" 
          class="space-y-4 p-6 rounded-lg shadow-md bg-gradient-to-br from-purple-50 to-indigo-50"
        >
          <div class="flex items-center gap-2">
            <IconService v-if="!classItem.isPublic" name="lock" color="text-red-600" size="5" tooltip="This class is private" />
            <IconService v-if="classItem.isPublic" name="open-lock" color="text-green-600" size="5" tooltip="This class is public" />
            <h3 class="text-xl font-semibold text-gray-900">{{ classItem.name }}</h3>
          </div>
          <div class="space-y-2">
            <div
              v-for="quiz in classItem.quizzes"
              :key="quiz.id"
              class="flex items-center justify-between p-4 rounded-lg shadow-md bg-gradient-to-br from-green-50 to-teal-100 text-gray-800"
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
                <p class="text-sm text-gray-600">{{ quiz.questions?.length || 0 }} questions</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editQuiz(quiz)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                  title="Edit quiz"
                >
                  <IconService name="edit" size="6" />
                </button>
                <button
                  @click="printQuizPdf(quiz)"
                  :disabled="printingQuizId === quiz.id"
                  class="text-teal-700 hover:text-teal-900 p-1 disabled:opacity-50"
                  title="Print Quiz PDF"
                >
                  <IconService v-if="printingQuizId !== quiz.id" name="printer" size="6" />
                  <BaseAnimation v-else type="loading-dots" :loop="true" />
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
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="create-quiz-modal">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Create New Quiz</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Class</label>
            <select
              v-model="newQuiz.classId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              data-testid="quiz-class-select"
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
              data-testid="quiz-title-input"
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
              data-testid="quiz-question-count-input"
            />
            <p class="mt-1 text-sm text-gray-500">Choose between 1-10 questions</p>
          </div>

          <!-- Lesson Plan Input Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Lesson Content</label>
            <div class="mt-2 space-y-2">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="newQuiz.lessonType" 
                  value="full" 
                  class="form-radio text-primary-600" 
                  data-testid="lesson-type-full"
                />
                <span class="ml-2">Paste Full Lesson</span>
              </label>
              <label class="inline-flex items-center ml-6">
                <input 
                  type="radio" 
                  v-model="newQuiz.lessonType" 
                  value="steps" 
                  class="form-radio text-primary-600"
                  :disabled="!isPaidUser"
                  data-testid="lesson-type-steps"
                />
                <span class="ml-2">Build Step-by-Step (Premium)</span>
                 <IconService v-if="!isPaidUser" name="lock" size="4" class="ml-1 text-yellow-500" tooltip="Upgrade to Premium to use Step-by-Step lessons." />
              </label>
               <p v-if="!isPaidUser && newQuiz.lessonType === 'steps'" class="mt-1 text-sm text-yellow-600">
                 Upgrade to Premium to create step-by-step lessons. Selecting this option will revert to 'Paste Full Lesson' on save unless you upgrade.
               </p>
            </div>
          </div>
          
          <!-- Full Lesson Plan Text Area -->
          <div v-if="newQuiz.lessonType === 'full'">
             <label class="block text-sm font-medium text-gray-700">Lesson Plan Content</label>
             <textarea
               v-model="newQuiz.lessonPlan"
               rows="8"
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
               placeholder="Paste your full lesson plan here..."
               data-testid="quiz-lesson-plan-textarea"
             ></textarea>
             <button
                 @click="generateQuestionsFromLesson"
                 :disabled="!newQuiz.lessonPlan || loading"
                 class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                 data-testid="generate-questions-button"
               >
                 {{ loading ? 'Generating...' : 'Generate Questions' }}
             </button>
           </div>

          <!-- Step-by-Step Lesson Builder (Premium) -->
           <div v-if="newQuiz.lessonType === 'steps' && isPaidUser">
             <label class="block text-sm font-medium text-gray-700">Lesson Steps</label>
             <div v-for="(step, index) in newQuiz.lessonSteps" :key="index" class="mt-2 border p-3 rounded-md space-y-2">
               <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-600">Step {{ index + 1 }}</label>
                   <button
                     v-if="newQuiz.lessonSteps.length > 1"
                     @click="removeLessonStep(index)"
                     class="text-red-500 hover:text-red-700 text-sm"
                     title="Remove Step"
                   >
                    <IconService name="trash" size="4" /> Remove
                   </button>
               </div>
                <textarea
                  v-model="newQuiz.lessonSteps[index]"
                  rows="5"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  :placeholder="`Enter content for step ${ index + 1 }...`"
                  :data-testid="`lesson-step-input-${index}`"
                ></textarea>
              </div>
             <button
               @click="addLessonStep"
               class="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
             >
               + Add Step
             </button>
              <button
                 @click="generateQuestionsFromLesson"
                 :disabled="!lessonStepsContent || loading"
                 class="mt-2 ml-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                 data-testid="generate-questions-button-steps"
               >
                 {{ loading ? 'Generating...' : 'Generate Questions' }}
             </button>
           </div>

          <!-- Badge Image Upload - Conditionally shown -->
          <div v-if="isPaidUser">
            <label class="block text-sm font-medium text-gray-700">Badge Image (Premium)</label>
            <div class="mt-1 flex items-center space-x-4">
              <input
                ref="newBadgeImageInput"
                type="file"
                accept="image/*"
                @change="handleNewBadgeImageUpload"
                class="hidden"
                data-testid="quiz-badge-image-input"
              />
              <button
                @click="newBadgeImageInput.click()"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {{ newBadgeImageName || 'Upload Badge Image' }}
              </button>
            </div>
          </div>
          <!-- Message for non-paid users -->
          <div v-else>
              <label class="block text-sm font-medium text-gray-700">Badge Image</label>
              <p class="mt-1 text-sm text-gray-500">Default badge will be used. Upgrade to Premium to upload custom badges.</p>
              <img 
                  src="https://res.cloudinary.com/front-end-foxes/image/upload/v1745952718/differentest-lesson-images/grlih7sjws2vfu5as7dx.png" 
                  alt="Default Badge" 
                  class="mt-2 w-10 h-10 rounded-full object-cover"
                />
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
              data-testid="quiz-save-button"
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
import { ref, onMounted, computed } from 'vue';
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
      lessonPlan: '',
      lessonType: 'full',
      lessonSteps: [''],
      questions: [],
      questionCount: 5
    });
    const newBadgeImageFile = ref(null);
    const newBadgeImageName = ref('');
    const newBadgeImageInput = ref(null);
    const printingQuizId = ref(null);

    // Computed property for paid status
    const isPaidUser = computed(() => user.value?.paid === true);

    // Computed property to get combined content from steps
    const lessonStepsContent = computed(() => {
      return newQuiz.value.lessonSteps.join('\\n\\n---\\n\\n'); // Combine steps with a separator
    });

    // Default badge URL
    const defaultBadgeUrl = "https://res.cloudinary.com/front-end-foxes/image/upload/v1745952718/differentest-lesson-images/grlih7sjws2vfu5as7dx.png";

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
        lessonPlan: '',
        lessonType: 'full',
        lessonSteps: [''],
        questions: [],
        questionCount: 5
      };
      newBadgeImageFile.value = null;
      newBadgeImageName.value = '';
      showCreateModal.value = true;
    };

    const handleNewBadgeImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        newBadgeImageFile.value = file;
        newBadgeImageName.value = file.name;
      }
    };

    // Function to add a new lesson step
    const addLessonStep = () => {
      newQuiz.value.lessonSteps.push('');
    };

    // Function to remove a lesson step
    const removeLessonStep = (index) => {
      if (newQuiz.value.lessonSteps.length > 1) {
        newQuiz.value.lessonSteps.splice(index, 1);
      } else {
        showError("You must have at least one lesson step.");
      }
    };

    // Function to generate questions (used by both full lesson and steps)
    const generateQuestionsFromLesson = async () => {
        let contentToProcess = '';
        if (newQuiz.value.lessonType === 'full') {
            contentToProcess = newQuiz.value.lessonPlan;
        } else if (newQuiz.value.lessonType === 'steps' && isPaidUser.value) {
            // Filter out empty steps before joining
            const nonEmptySteps = newQuiz.value.lessonSteps.filter(step => step.trim() !== '');
            if (nonEmptySteps.length === 0) {
                 showError('Please add content to at least one lesson step.');
                 return;
            }
            contentToProcess = nonEmptySteps.join('\\n\\n---\\n\\n'); // Combine steps
        } else {
            showError('Invalid lesson type or not authorized.');
            return;
        }

        if (!contentToProcess || contentToProcess.trim().length === 0) {
            showError('Please provide lesson content before generating questions.');
            return;
        }

        try {
            loading.value = true;
            const generatedQuiz = await FirebaseService.generateQuiz(contentToProcess, newQuiz.value.questionCount);
            newQuiz.value.questions = generatedQuiz.questions;
            showSuccess('Questions generated successfully!');
        } catch (error) {
            console.error('Error generating questions:', error);
            showError('Failed to generate questions: ' + error.message);
        } finally {
            loading.value = false;
        }
    };

    // Function to generate and print PDF
    const printQuizPdf = async (quiz) => {
      if (!quiz) return;

      // --- Dynamic Import --- 
      let html2pdf;
      try {
        const module = await import('html2pdf.js');
        html2pdf = module.default; // Access the default export
      } catch (importError) {
        console.error("Failed to load html2pdf.js dynamically:", importError);
        showError("Could not load the PDF generation library. Please refresh and try again.");
        return; // Stop execution if import fails
      }
      // --- End Dynamic Import ---

      printingQuizId.value = quiz.id;
      try {
        // 1. Create HTML content
        let lessonContentHtml = '';
        if (quiz.lessonType === 'steps' && quiz.lessonSteps && quiz.lessonSteps.length > 0) {
          lessonContentHtml = '<h2>Lesson Steps</h2><ol>' +
            quiz.lessonSteps.map(step => `<li>${step.replace(/\n/g, '<br/>')}</li>`).join('') +
            '</ol>';
        } else if (quiz.lessonPlan) {
          lessonContentHtml = `<h2>Lesson Plan</h2><p>${quiz.lessonPlan.replace(/\n/g, '<br/>')}</p>`;
        }

        let quizContentHtml = '';
        if (quiz.questions && quiz.questions.length > 0) {
          quizContentHtml = '<h2>Quiz Questions</h2><ol>' +
            quiz.questions.map((q, index) => {
              let optionsHtml = '<ul style="list-style: none; padding-left: 0;">' +
                q.options.map((opt, optIndex) => {
                  const symbol = '○';
                  return `<li style="margin-bottom: 5px;">${symbol} ${opt.text}</li>`;
                }).join('') +
                '</ul>';
              return `<li><p><strong>${q.text}</strong></p>${optionsHtml}</li>`;
            }).join('') +
            '</ol>';
        }

        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Quiz: ${quiz.title}</title>
              <style>
                  body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                  h1, h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                  h1 { font-size: 1.8em; }
                  h2 { font-size: 1.4em; margin-top: 30px; }
                  ol { padding-left: 20px; margin-bottom: 15px; }
                  ul { padding-left: 0; list-style: none; margin-top: 5px; }
                  li { margin-bottom: 10px; }
                  p { margin: 5px 0; }
                  strong { font-weight: bold; }
                  /* Add more styles as needed */
              </style>
          </head>
          <body>
              <h1>Quiz: ${quiz.title}</h1>
              <p><em>Class: ${quiz.className || 'N/A'}</em></p>
              ${lessonContentHtml}
              <hr style="margin: 30px 0;" />
              ${quizContentHtml}
          </body>
          </html>
        `;

        // 2. Configure html2pdf
        const options = {
          margin:       1,
          filename:     `${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quiz.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // 3. Generate PDF
        await html2pdf().from(fullHtml).set(options).save();
        showSuccess('PDF generated successfully!');

      } catch (err) {
        console.error('Error generating PDF:', err);
        showError('Failed to generate PDF. Please try again.');
      } finally {
        printingQuizId.value = null; // Reset printing state
      }
    };

    const saveNewQuiz = async () => {
      // Basic validation
      if (!newQuiz.value.classId || !newQuiz.value.title) {
        showError('Please select a class and enter a title');
        return;
      }
      if (!newQuiz.value.questions || newQuiz.value.questions.length === 0) {
         showError('Please generate questions for the quiz.');
         return;
      }

      // Handle non-paid users selecting 'steps' - revert to 'full'
       if (!isPaidUser.value && newQuiz.value.lessonType === 'steps') {
           newQuiz.value.lessonType = 'full';
           // Optionally clear steps if needed, but generateQuestions should handle content source
           // newQuiz.value.lessonSteps = ['']; 
           showError("Step-by-step lessons are a Premium feature. Saving as a full lesson."); // Inform user
       }

      // Content Validation based on type
       let finalLessonPlan = null;
       let finalLessonSteps = [];

       if (newQuiz.value.lessonType === 'full') {
         if (!newQuiz.value.lessonPlan || newQuiz.value.lessonPlan.trim() === '') {
           showError('Please enter the full lesson content.');
           return;
         }
         finalLessonPlan = newQuiz.value.lessonPlan.trim();
       } else if (newQuiz.value.lessonType === 'steps') {
         finalLessonSteps = newQuiz.value.lessonSteps.map(step => step.trim()).filter(step => step !== '');
         if (finalLessonSteps.length === 0) {
           showError('Please add content to at least one lesson step.');
           return;
         }
       } else {
          showError('Invalid lesson type selected.'); // Should not happen
          return;
       }


      try {
        loading.value = true;
        
        let badgeImageUrl = null;

        // Handle badge image upload only if user is paid and file is provided
        if (isPaidUser.value && newBadgeImageFile.value) {
          badgeImageUrl = await uploadToCloudinary(newBadgeImageFile.value);
          if (!badgeImageUrl) {
            throw new Error('Failed to upload badge image');
          }
        } else if (!isPaidUser.value) {
            // Set default badge for non-paid users
            badgeImageUrl = defaultBadgeUrl;
        }

        // Create quiz data
        const quizData = {
          classId: newQuiz.value.classId,
          title: newQuiz.value.title,
          badgeImage: badgeImageUrl,
          lessonType: newQuiz.value.lessonType,
          lessonPlan: finalLessonPlan, // Use validated content
          lessonSteps: finalLessonSteps, // Use validated content
          questions: newQuiz.value.questions,
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
          lessonPlan: '',
          lessonType: 'full',
          lessonSteps: [''],
          questions: [],
          questionCount: 5
        };
        newBadgeImageFile.value = null;
        newBadgeImageName.value = '';
        
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
      lessonStepsContent,
      isPaidUser,
      addLessonStep,
      removeLessonStep,
      generateQuestionsFromLesson,
      saveNewQuiz,
      readFileAsText,
      printingQuizId,
      printQuizPdf
    };
  }
};
</script> 