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
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 class="text-xl font-bold">Create New Quiz</h3>
          <button @click="showCreateModal = false" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 pr-2">
          <!-- 1. Select Class (Required) -->
          <div>
            <label for="quiz-class" class="block text-sm font-medium text-gray-700 mb-1">1. Select Class (Required)</label>
            <div class="relative mt-1">
              <select 
                id="quiz-class" 
                v-model="newQuiz.classId" 
                class="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
              >
                <option value="" disabled>-- Select a Class --</option>
                <option v-for="cls in availableClassesForNewQuiz" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <IconService name="chevron-down" size="5" />
              </div>
            </div>
          </div>

          <!-- 2. Quiz Title (Required) -->
          <div>
            <label for="quiz-title" class="block text-sm font-medium text-gray-700 mb-1">2. Quiz Title (Required)</label>
            <input type="text" id="quiz-title" v-model="newQuiz.title" placeholder="Enter quiz title" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <!-- 3. Badge Image  -->
          <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">3. Badge Image</label>
             <div v-if="!isPaidUser" class="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">
               Custom badge upload requires a premium subscription. A default badge will be used.
             </div>
            <div v-else class="mt-1 flex items-center space-x-4">
              <img v-if="newBadgeImagePreview" :src="newBadgeImagePreview" alt="Badge Preview" class="h-16 w-16 rounded-md object-cover">
               <span v-else class="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                 Preview
               </span>
              <label class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span>{{ newBadgeImageName ? 'Change Image' : 'Upload Image' }}</span>
                <input type="file" @change="handleNewBadgeImageUpload" accept="image/*" class="sr-only">
              </label>
              <span v-if="newBadgeImageName" class="text-sm text-gray-500 truncate">{{ newBadgeImageName }}</span>
            </div>
          </div>

          <!-- 4. Lesson Plan & Question Generation -->
          <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">4. Lesson Plan & Question Generation</label>
             
              <!-- Lesson Type Selection -->
              <div class="mt-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">Lesson Format:</label>
                 <div class="flex items-center space-x-4">
                   <label class="inline-flex items-center">
                     <input type="radio" v-model="newQuiz.lessonType" value="full" class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out">
                     <span class="ml-2">Full Lesson Text</span>
                   </label>
                   <label class="inline-flex items-center" :class="{ 'opacity-50 cursor-not-allowed': !isPaidUser }">
                     <input type="radio" v-model="newQuiz.lessonType" value="steps" class="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" :disabled="!isPaidUser">
                     <span class="ml-2">Stepped Lesson</span>
                      <IconService v-if="!isPaidUser" name="lock-closed" size="4" class="ml-1 text-yellow-500" />
                   </label>
                 </div>
                 <p v-if="!isPaidUser && newQuiz.lessonType === 'steps'" class="text-xs text-red-600">Stepped lessons require a premium subscription.</p>
              </div>
             
             <!-- Full Lesson Text Input -->
             <div v-if="newQuiz.lessonType === 'full'" class="mt-4">
                <label for="lesson-plan-content" class="block text-sm font-medium text-gray-700">Lesson Content:</label>
               <textarea id="lesson-plan-content" v-model="newQuiz.lessonPlan" rows="6" placeholder="Paste or type your lesson plan here..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
               <div class="mt-2">
                 <label class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                   <span>{{ lessonPlanName ? 'Change File' : 'Upload Lesson File (.txt, .md)' }}</span>
                   <input type="file" @change="handleLessonPlanUpload" accept=".txt,.md" class="sr-only">
                 </label>
                 <span v-if="lessonPlanName" class="ml-3 text-sm text-gray-500 truncate">{{ lessonPlanName }}</span>
               </div>
             </div>

             <!-- Stepped Lesson Builder -->
             <div v-if="newQuiz.lessonType === 'steps' && isPaidUser" class="mt-4 border p-4 rounded-md space-y-3">
                <label class="block text-sm font-medium text-gray-700">Lesson Steps:</label>
               <div v-for="(step, index) in newQuiz.lessonSteps" :key="index" class="border p-3 rounded bg-gray-50 relative">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Step {{ index + 1 }}</label>
                 <textarea v-model="step.content" rows="3" placeholder="Step content (Markdown supported)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  <button @click="removeLessonStep(index)" class="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 rounded-full bg-white bg-opacity-50 hover:bg-opacity-80">
                    <IconService name="trash" size="4" />
                  </button>
               </div>
               <button @click="addLessonStep" type="button" class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                 <IconService name="plus-circle" size="5" class="mr-1" /> Add Step
               </button>
             </div>
             
             <!-- Question Generation -->
             <div v-if="newQuiz.lessonPlan || (newQuiz.lessonType === 'steps' && newQuiz.lessonSteps?.length > 0)" class="mt-4 pt-4 border-t">
              <label for="question-count" class="block text-sm font-medium text-gray-700">5. Generate Questions (Optional)</label>
              <div class="mt-1 flex items-center space-x-2">
                <input type="number" id="question-count" v-model.number="newQuiz.questionCount" min="1" max="10" class="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <button 
                    @click="generateQuestionsFromLesson" 
                    :disabled="generatingQuestions || (!newQuiz.lessonPlan && !(newQuiz.lessonType === 'steps' && newQuiz.lessonSteps.some(step => step.content?.trim()))) " 
                    class="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  {{ generatingQuestions ? 'Generating...' : 'Generate Questions (AI)' }}
                </button>
              </div>
              <p v-if="generationError" class="text-red-600 text-sm mt-2">{{ generationError }}</p>
            </div>
          </div>

          <!-- 6. Manually Added Questions -->
           <div class="mt-4 pt-4 border-t">
             <h4 class="text-sm font-medium text-gray-700 mb-2">6. Questions (Add Manually or Edit Generated)</h4>
            <div v-if="newQuiz.questions.length === 0" class="text-sm text-gray-500 italic">
              No questions added yet. Use the generator above or add manually.
            </div>
            <div v-else class="space-y-3">
              <div v-for="(question, index) in newQuiz.questions" :key="index" class="border p-3 rounded bg-gray-50 space-y-2 relative">
                <label class="block text-xs font-medium text-gray-600">Question {{ index + 1 }}</label>
                <textarea v-model="question.text" rows="2" placeholder="Question text" class="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"></textarea>
                <label class="block text-xs font-medium text-gray-600 mt-1">Options (Mark Correct)</label>
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center space-x-2">
                  <input type="radio" :name="`correct-${index}`" :value="optIndex" :checked="question.correctIndex === optIndex" @change="question.correctIndex = optIndex" class="form-radio h-4 w-4 text-indigo-600">
                  <input type="text" v-model="option.text" placeholder="Option text" class="flex-grow border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm">
                  <button @click="removeManualOption(index, optIndex)" class="text-red-500 hover:text-red-700 p-0.5 rounded-full bg-white bg-opacity-50 hover:bg-opacity-80">
                    <IconService name="x" size="4" />
                  </button>
                </div>
                <button @click="addManualOption(index)" type="button" class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                   <IconService name="plus-circle" size="4" class="mr-1" /> Add Option
                </button>
                 <button @click="removeQuestion(index)" class="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 rounded-full bg-white bg-opacity-50 hover:bg-opacity-80">
                   <IconService name="trash" size="4" />
                 </button>
              </div>
            </div>
             <button @click="addQuestion" type="button" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
               <IconService name="plus-circle" size="5" class="mr-1" /> Add Question Manually
             </button>
           </div>
        </div>

        <!-- Modal Footer -->
        <div class="mt-6 pt-4 border-t flex justify-end space-x-3">
          <button 
            @click="saveNewQuiz"
            :disabled="!isCreateFormValid || savingQuiz" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <BaseAnimation v-if="savingQuiz" animation-name="dots" class="w-6 h-6 mr-2" />
            {{ savingQuiz ? 'Saving...' : 'Create Quiz' }}
          </button>
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
import { ref, onMounted, computed, watch } from 'vue';
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
      lessonSteps: [{ content: '' }],
      questions: [],
      questionCount: 5
    });
    const newBadgeImageFile = ref(null);
    const newBadgeImageName = ref('');
    const newBadgeImageInput = ref(null);
    const printingQuizId = ref(null);
    const lessonPlanFile = ref(null);
    const lessonPlanName = ref('');
    const generatingQuestions = ref(false);
    const generationError = ref(null);

    // Filtered classes for the dropdown (excluding completed)
    const availableClassesForNewQuiz = computed(() => classes.value.filter(c => !c.isComplete));

    // Computed property for paid status
    const isPaidUser = computed(() => user.value?.paid === true);

    // Computed property to get combined content from steps
    const lessonStepsContent = computed(() => {
      return newQuiz.value.lessonSteps.map(step => step.content).join('\n\n---\n\n');
    });

    // Default badge URL
    const defaultBadgeUrl = "https://res.cloudinary.com/front-end-foxes/image/upload/v1745952718/differentest-lesson-images/grlih7sjws2vfu5as7dx.png";

    const isCreateFormValid = computed(() => {
      return (
        !!newQuiz.value.classId && 
        !!newQuiz.value.title?.trim() &&
        newQuiz.value.questions?.length > 0 // Also require questions
      );
    });

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
        lessonSteps: [{ content: '' }],
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
      newQuiz.value.lessonSteps.push({ content: '' });
    };

    // Function to remove a lesson step
    const removeLessonStep = (index) => {
      if (newQuiz.value.lessonSteps.length > 1) {
        newQuiz.value.lessonSteps.splice(index, 1);
      } else {
        showError("You must have at least one lesson step.");
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

    const handleLessonPlanUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        lessonPlanFile.value = file;
        lessonPlanName.value = file.name;
        try {
          newQuiz.value.lessonPlan = await readFileAsText(file);
          // Clear generated questions if a new file is uploaded
          newQuiz.value.questions = []; 
          generationError.value = null; // Clear previous errors
        } catch (err) {
          console.error("Error reading lesson plan file:", err);
          showError("Failed to read the lesson plan file.");
          newQuiz.value.lessonPlan = ''; // Clear content on error
          lessonPlanName.value = '';
          lessonPlanFile.value = null;
        }
      } else {
        // Handle case where user cancels file selection
        lessonPlanFile.value = null;
        lessonPlanName.value = '';
        newQuiz.value.lessonPlan = ''; 
        newQuiz.value.questions = [];
      }
    };

    const generateQuestionsFromLesson = async () => {
        let contentToProcess = '';
        if (newQuiz.value.lessonType === 'full') {
            contentToProcess = newQuiz.value.lessonPlan;
        } else if (newQuiz.value.lessonType === 'steps' && isPaidUser.value) {
            const nonEmptySteps = newQuiz.value.lessonSteps.filter(step => step.content?.trim() !== '');
            if (nonEmptySteps.length === 0) {
                 showError('Please add content to at least one lesson step.');
                 return;
            }
            contentToProcess = nonEmptySteps.map(step => step.content).join('\n\n---\n\n'); // Combine step content
        } else {
            showError('Invalid lesson type or not authorized.');
            return;
        }

        if (!contentToProcess || contentToProcess.trim().length === 0) {
            showError('Please provide lesson content before generating questions.');
            return;
        }

        generatingQuestions.value = true; // Set loading state
        generationError.value = null; // Clear previous error
        try {
            const generatedQuiz = await FirebaseService.generateQuiz(contentToProcess, newQuiz.value.questionCount);
            newQuiz.value.questions = generatedQuiz.questions;
            showSuccess('Questions generated successfully!');
        } catch (error) {
            console.error('Error generating questions:', error);
            generationError.value = 'Failed to generate questions: ' + error.message; // Set error message
            showError('Failed to generate questions: ' + error.message);
        } finally {
            generatingQuestions.value = false; // Clear loading state
        }
    };

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
        
        let quizContentHtml = '';
        if (quiz.questions && quiz.questions.length > 0) {
          quizContentHtml = '<h2>Quiz Questions</h2><ol>' +
            quiz.questions.map((q, index) => {
              let optionsHtml = '<ul style="list-style: none; padding-left: 0;">' +
                q.options.map((opt, optIndex) => {
                  const symbol = '○'; // Use empty circle for worksheet style
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
              <!-- Remove lessonContentHtml and hr -->
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
         finalLessonSteps = newQuiz.value.lessonSteps.map(step => step.content.trim()).filter(step => step !== '');
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
          lessonSteps: [{ content: '' }],
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

    // --- Manual Question Editing --- 
    const addQuestion = () => {
      newQuiz.value.questions.push({
        text: '',
        options: [{ text: '' }, { text: '' }], // Start with two empty options
        correctIndex: 0,
      });
    };

    const removeQuestion = (index) => {
      newQuiz.value.questions.splice(index, 1);
    };

    const addManualOption = (questionIndex) => {
      newQuiz.value.questions[questionIndex].options.push({ text: '' });
    };

    const removeManualOption = (questionIndex, optionIndex) => {
      // Prevent removing the last option
      if (newQuiz.value.questions[questionIndex].options.length > 1) {
           // Adjust correctIndex if the removed option was the correct one or before it
           const currentCorrect = newQuiz.value.questions[questionIndex].correctIndex;
           if (optionIndex === currentCorrect) {
               newQuiz.value.questions[questionIndex].correctIndex = 0; // Reset to first option
           } else if (optionIndex < currentCorrect) {
               newQuiz.value.questions[questionIndex].correctIndex--;
           }
           newQuiz.value.questions[questionIndex].options.splice(optionIndex, 1);
      } else {
          showError("Each question must have at least one option.");
      }
    };
    // -------------------------------

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
      printQuizPdf,
      isCreateFormValid,
      lessonPlanFile,
      lessonPlanName,
      handleLessonPlanUpload,
      generatingQuestions,
      generationError,
      addQuestion,
      removeQuestion,
      addManualOption,
      removeManualOption,
      availableClassesForNewQuiz,
    };
  }
};
</script> 