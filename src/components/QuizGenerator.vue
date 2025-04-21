<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">Generate Quiz from Lesson</h2>
    
    <!-- Class Selection -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">
          Select Class
        </label>
      </div>
      <select
        v-model="selectedClassId"
        class="w-full p-2 border rounded-lg"
        required
      >
        <option value="">Select a class</option>
        <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
          {{ classItem.name }}
          <template v-if="classItem.isPublic">
            (Public)
          </template>
        </option>
      </select>
    </div>

  
    <!-- Number of Questions -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Number of Questions
      </label>
      <input
        type="number"
        v-model="numQuestions"
        min="1"
        max="10"
        class="w-24 p-2 border rounded-lg"
      />
    </div>

    <!-- Quiz Title -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Quiz Title
      </label>
      <input
        type="text"
        v-model="quizTitle"
        class="w-full p-2 border rounded-lg"
      />
    </div>

    <!-- Badge Image Upload -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Badge Image (Optional)
      </label>
      <div class="flex items-center">
        <input
          type="file"
          ref="badgeImageInput"
          accept="image/*"
          class="hidden"
          @change="handleBadgeImageUpload"
        />
        <button
          @click="$refs.badgeImageInput.click()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Choose Badge Image
        </button>
        <span v-if="badgeImageName" class="text-sm text-gray-600 ml-2">{{ badgeImageName }}</span>
      </div>
      <p class="mt-1 text-sm text-gray-500">Upload a custom badge image for this quiz (recommended size: 512x512px)</p>
    </div>

    <!-- Upload Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Upload Lesson Plan (PDF, Text, or Markdown)
      </label>
      <div class="flex items-center">
        <input
          type="file"
          ref="fileInput"
          accept=".pdf,.txt,.md,.markdown"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Choose File
        </button>
        <span v-if="fileName" class="text-sm text-gray-600">{{ fileName }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Quiz Editor -->
    <div v-if="quiz" class="space-y-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">{{ quiz.title }}</h3>
      </div>
      
      <div v-for="(question, index) in quiz.questions" :key="index" class="border rounded-lg p-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Question {{ index + 1 }}
          </label>
          <textarea
            v-model="question.text"
            class="w-full p-2 border rounded-lg"
            rows="3"
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
              class="flex-1 p-2 border rounded-lg"
            />
            <button
              @click="removeOption(index, optionIndex)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Remove option"
            >
              <IconService name="x" size="6" />
            </button>
          </div>
          
          <button
            @click="addOption(index)"
            class="text-sm text-primary-600 hover:text-primary-800"
          >
            + Add Option
          </button>
        </div>
      </div>

      <div class="flex justify-between">
        <button
          @click="saveQuiz"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Save Quiz
        </button>
        <button
          @click="generateNewQuiz"
          class="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition"
        >
          Generate New Quiz
        </button>
      </div>
    </div>

    <!-- Lesson Plan Editor Modal -->
    <div v-if="showLessonPlanModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Edit Lesson Plan</h3>
          <button @click="showLessonPlanModal = false" class="text-gray-500 hover:text-gray-700">
            <IconService name="close" size="6" />
          </button>
        </div>

        <!-- Lesson Title -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title
          </label>
          <input
            v-model="quizTitle"
            class="w-full p-2 border rounded-lg"
            placeholder="Enter lesson title"
          />
        </div>

        <!-- Image Upload Section -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              ref="lessonImageInput"
              accept="image/*"
              class="hidden"
              @change="handleLessonImageUpload"
            />
            <button
              @click="$refs.lessonImageInput.click()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Upload Image
            </button>
            <span v-if="lessonImageUrl" class="text-sm text-gray-600">
              Image URL: {{ lessonImageUrl }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500">Upload an image and paste its URL into your lesson plan</p>
        </div>

        <!-- Lesson Plan Editor -->
        <div class="mb-4">
          <textarea
            v-model="editedLessonPlan"
            class="w-full h-[60vh] p-4 border rounded-lg font-mono text-sm"
            placeholder="Edit your lesson plan content here..."
          ></textarea>
        </div>
        <div class="flex justify-end space-x-4">
          <button
            @click="showLessonPlanModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="saveLessonPlan"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save & Generate Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export default {
  name: 'QuizGenerator',
  components: {
    BaseAnimation, IconService
  },
  
  emits: ['generated'],
  setup(props, { emit }) {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const fileInput = ref(null);
    const fileName = ref('');
    const loading = ref(false);
    const quiz = ref(null);
    const fileContent = ref('');
    const numQuestions = ref(3);
    const quizTitle = ref('');
    const selectedClassId = ref('');
    const classes = ref([]);
    const isPublic = ref(false);
    const isClassPublic = ref(false);
    const isLoading = ref(false);
    const showLessonPlanModal = ref(false);
    const editedLessonPlan = ref('');
    const badgeImageInput = ref(null);
    const badgeImageName = ref('');
    const badgeImageFile = ref(null);
    const lessonImageInput = ref(null);
    const lessonImageUrl = ref('');
    const modalTitle = ref('');

    
    const loadClasses = async () => {
      if (!user.value) return;
      
      try {
        isLoading.value = true;
        const teacherClasses = await FirebaseService.getClassesByTeacher(user.value.uid);
        classes.value = teacherClasses;
        console.log('Loaded classes:', teacherClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes');
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      if (user.value) {
        loadClasses();
      }
    });

    watch(user, (newUser) => {
      if (newUser) {
        loadClasses();
      }
    });

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      loading.value = true;

      try {
        let text;
        if (file.type === 'application/pdf') {
          // Handle PDF files (you'll need to implement PDF parsing)
          showError('PDF parsing not yet implemented');
          return;
        } else {
          // Handle text and markdown files
          text = await file.text();
          
          // If it's a markdown file, we can optionally convert it to plain text
          // or keep the markdown formatting for better quiz generation
          if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
            // For now, we'll keep the markdown formatting as it might help with
            // better quiz generation by preserving structure
            text = text;
          }
        }
        
        fileContent.value = text;
        editedLessonPlan.value = text;
        showLessonPlanModal.value = true;
      } catch (error) {
        console.error('Error processing file:', error);
        showError('Error processing file. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    const generateQuiz = async (content, numQuestions) => {
      try {
        loading.value = true;
        const generatedQuiz = await FirebaseService.generateQuiz(content, numQuestions);
        // Create a new quiz object instead of modifying the existing one
        const newQuiz = {
          ...generatedQuiz,
          title: quizTitle.value || generatedQuiz.title
        };
        quiz.value = newQuiz;
        emit('generated', newQuiz);
      } catch (error) {
        console.error('Error generating quiz:', error);
        showError('Failed to generate quiz: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    const handleBadgeImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log('Badge image selected:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        badgeImageFile.value = file;
        badgeImageName.value = file.name;
      }
    };

    const handleLessonImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        loading.value = true;
        const imageUrl = await uploadToCloudinary(file, 'differentest-lesson-images/lessons');
        lessonImageUrl.value = imageUrl;
        showSuccess('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        showError('Failed to upload image. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    const saveQuiz = async () => {
      if (!quiz.value || !user.value || !props.classId) {
        showError('Please select a class');
        return;
      }

      loading.value = true;
      try {
        // Handle badge image upload first if provided
        let badgeImageUrl = null;
        if (badgeImageFile.value) {
          console.log('Starting badge image upload process...');
          console.log('Badge image file:', {
            name: badgeImageFile.value.name,
            type: badgeImageFile.value.type,
            size: badgeImageFile.value.size
          });

          badgeImageUrl = await uploadToCloudinary(badgeImageFile.value);
          console.log('Badge image upload response:', badgeImageUrl);
          
          if (!badgeImageUrl) {
            throw new Error('Failed to get badge image URL');
          }
        }

        // Create the quiz with the badge image URL if available
        const quizData = {
          ...quiz.value,
          title: quizTitle.value || quiz.value.title,
          teacherId: user.value.uid,
          classId: props.classId,
          userId: user.value.uid,
          isPublic: isPublic.value,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessonPlan: fileContent.value
        };
        
        console.log('Creating quiz with data:', quizData);

        if (badgeImageUrl) {
          quizData.badgeImage = badgeImageUrl;
        }

      

        const quizId = await FirebaseService.createQuiz(quizData);
        console.log('Quiz created with ID:', quizId);
        
        if (!quizId) {
          throw new Error('Failed to create quiz');
        }

        showSuccess(`Quiz "${quizData.title}" saved successfully!`);
        
        // Emit event to update stats
        emit('quiz-updated');
        
        // Reset form after successful save
        quiz.value = null;
        fileContent.value = '';
        fileName.value = '';
        quizTitle.value = '';
        selectedClassId.value = '';
        isPublic.value = false;
        badgeImageFile.value = null;
        badgeImageName.value = '';
      } catch (error) {
        console.error('Error saving quiz:', error);
        showError(`Error saving quiz: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };

    const addOption = (questionIndex) => {
      quiz.value.questions[questionIndex].options.push({ text: '' });
    };

    const removeOption = (questionIndex, optionIndex) => {
      quiz.value.questions[questionIndex].options.splice(optionIndex, 1);
    };

    const generateNewQuiz = () => {
      if (fileContent.value) {
        generateQuiz(fileContent.value, numQuestions.value);
      }
    };

    const saveLessonPlan = async () => {
      loading.value = true;
      showLessonPlanModal.value = false;
      try {
        // Update the main quizTitle with the modal's title before generating
        quizTitle.value = modalTitle.value;
        await generateQuiz(fileContent.value, numQuestions.value);
        
        // Create the quiz with all required fields
        const quizData = {
          ...quiz.value,
          title: quizTitle.value || quiz.value.title,
          teacherId: user.value.uid,
          classId: selectedClassId.value,
          userId: user.value.uid,
          isPublic: isPublic.value,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessonPlan: fileContent.value
        };

        console.log('saving lesson plan for quiz with data:', quizData);


        const quizId = await FirebaseService.createQuiz(quizData);
        if (!quizId) {
          throw new Error('Failed to create quiz');
        }

        showSuccess('Lesson plan and quiz saved successfully!');
        
        // Emit event to update stats
        emit('quiz-updated');
      } catch (error) {
        console.error('Error saving lesson plan:', error);
        showError('Failed to save lesson plan. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    // Update the modal title when opening
    watch(showLessonPlanModal, (newValue) => {
      if (newValue) {
        modalTitle.value = quizTitle.value;
      }
    });

    return {
      fileInput,
      fileName,
      loading,
      quiz,
      numQuestions,
      quizTitle,
      selectedClassId,
      classes,
      isPublic,
      isClassPublic,
      handleFileUpload,
      addOption,
      removeOption,
      generateNewQuiz,
      saveQuiz,
      showLessonPlanModal,
      editedLessonPlan,
      saveLessonPlan,
      badgeImageInput,
      badgeImageName,
      handleBadgeImageUpload,
      lessonImageInput,
      lessonImageUrl,
      handleLessonImageUpload,
      modalTitle
    };
  }
};
</script> 