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
        :class="{ 'border-red-500': !selectedClassId }"
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
      <p v-if="!selectedClassId" class="mt-1 text-sm text-red-600">
        Please select a class
      </p>
    </div>

    <!-- Public Enrollment -->
    <div class="mb-6 p-4 border rounded-lg bg-gray-50">
      <div class="flex items-center justify-between">
        <div>
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="isPublic"
              class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span class="text-sm font-medium text-gray-700">Make this quiz public</span>
          </label>
          <p class="mt-1 text-sm text-gray-500">When enabled, any student can access this quiz without needing to register and be accepted.</p>
        </div>
        <div v-if="isPublic" class="flex items-center space-x-2">
          <span class="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            Public Quiz
          </span>
        </div>
      </div>
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
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../stores/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAnimation from './BaseAnimation.vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'QuizGenerator',
  components: {
    BaseAnimation, IconService
  },
  setup() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
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
    const selectedClass = ref('');
    const questions = ref([]);
    const isLoading = ref(false);

    // Get API key from environment variable
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const loadClasses = async () => {
      if (!user.value) return;
      
      try {
        isLoading.value = true;
        const teacherClasses = await FirebaseService.getClassesByTeacher(user.value.uid);
        classes.value = teacherClasses;
        console.log('Loaded classes:', teacherClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
        showNotification('Error', 'Failed to load classes', 'error');
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
          showNotification('Error', 'PDF parsing not yet implemented', 'error');
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
        await generateQuiz(text);
      } catch (error) {
        console.error('Error processing file:', error);
        showNotification('Error', 'Error processing file. Please try again.', 'error');
      } finally {
        loading.value = false;
      }
    };

    const generateQuiz = async (content) => {
      try {
        //generate 5 questions from the lesson plan using Gemini lite
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        
        const prompt = `Generate a ${numQuestions.value}-question multiple choice quiz based on this lesson plan. 
        Format the response as a JSON object with this structure:
        {
          "title": "quiz title",
          "questions": [
            {
              "text": "question text",
              "options": [
                {"text": "option text"},
                {"text": "option text"},
                {"text": "option text"},
                {"text": "option text"}
              ],
              "correctIndex": 0
            }
          ]
        }
        
        Lesson plan:
        ${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        quiz.value = JSON.parse(text);
        quiz.value.title = quizTitle.value || quiz.value.title;
        
        showNotification('Success', 'Quiz generated successfully!');
      } catch (error) {
        console.error('Error generating quiz:', error);
        showNotification('Error', 'Error generating quiz. Please try again.', 'error');
      }
    };

    const saveQuiz = async () => {
      if (!quiz.value || !user.value || !selectedClassId.value) {
        showNotification('Error', 'Please select a class', 'error');
        return;
      }

      try {
        const quizData = {
          ...quiz.value,
          userId: user.value.uid,
          classId: selectedClassId.value,
          isPublic: isPublic.value,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessonPlan: fileContent.value
        };

        await FirebaseService.createQuiz(quizData);
        showNotification('Success', `Quiz "${quiz.value.title}" saved successfully!`, 'success');
        
        // Reset form after successful save
        quiz.value = null;
        fileContent.value = '';
        fileName.value = '';
        quizTitle.value = '';
        selectedClassId.value = '';
        isPublic.value = false;
      } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification('Error', `Error saving quiz "${quiz.value.title}". Please try again.`, 'error');
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
        generateQuiz(fileContent.value);
      }
    };

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
      saveQuiz
    };
  }
};
</script> 