<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">Generate Quiz from Lesson Plan</h2>
    
    <!-- Notification -->
    <div v-if="notification.show" 
         :class="['mb-4 p-4 rounded-lg', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
      {{ notification.message }}
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
        Upload Lesson Plan (PDF or Text)
      </label>
      <div class="flex items-center">
        <input
          type="file"
          ref="fileInput"
          accept=".pdf,.txt"
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
    <div v-if="isGenerating" class="mb-6">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
        <span class="text-gray-600">Generating quiz...</span>
      </div>
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
            @input="saveQuiz"
          ></textarea>
        </div>
        
        <div class="space-y-2">
          <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center space-x-2">
            <input
              type="radio"
              :name="'correct-' + index"
              :checked="optionIndex === question.correctIndex"
              @change="question.correctIndex = optionIndex; saveQuiz()"
              class="text-primary-600"
            />
            <input
              v-model="option.text"
              class="flex-1 p-2 border rounded-lg"
              @input="saveQuiz"
            />
            <button
              @click="removeOption(index, optionIndex)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Remove option"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
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
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default {
  name: 'QuizGenerator',
  setup() {
    const { user } = useAuth();
    const fileInput = ref(null);
    const fileName = ref('');
    const isGenerating = ref(false);
    const quiz = ref(null);
    const fileContent = ref('');
    const numQuestions = ref(3);
    const quizTitle = ref('');
    const notification = ref({ show: false, message: '', type: 'success' });

    // Get API key from environment variable
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type };
      setTimeout(() => {
        notification.value.show = false;
      }, 3000);
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      isGenerating.value = true;

      try {
        const text = await file.text();
        fileContent.value = text;
        await generateQuiz(text);
      } catch (error) {
        console.error('Error processing file:', error);
        showNotification('Error processing file. Please try again.', 'error');
      } finally {
        isGenerating.value = false;
      }
    };

    const generateQuiz = async (content) => {
      try {
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
        
        await saveQuiz();
        showNotification('Quiz generated successfully!');
      } catch (error) {
        console.error('Error generating quiz:', error);
        showNotification('Error generating quiz. Please try again.', 'error');
      }
    };

    const saveQuiz = async () => {
      if (!quiz.value || !user.value) return;

      try {
        const quizData = {
          ...quiz.value,
          userId: user.value.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (!quiz.value.id) {
          const docRef = await addDoc(collection(db, 'quizzes'), quizData);
          quiz.value.id = docRef.id;
          showNotification('Quiz saved successfully!');
        } else {
          await updateDoc(doc(db, 'quizzes', quiz.value.id), quizData);
          showNotification('Quiz updated successfully!');
        }
      } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification('Error saving quiz. Please try again.', 'error');
      }
    };

    const addOption = (questionIndex) => {
      quiz.value.questions[questionIndex].options.push({ text: '' });
      saveQuiz();
    };

    const removeOption = (questionIndex, optionIndex) => {
      quiz.value.questions[questionIndex].options.splice(optionIndex, 1);
      saveQuiz();
    };

    const generateNewQuiz = () => {
      if (fileContent.value) {
        generateQuiz(fileContent.value);
      }
    };

    return {
      fileInput,
      fileName,
      isGenerating,
      quiz,
      numQuestions,
      quizTitle,
      notification,
      handleFileUpload,
      addOption,
      removeOption,
      generateNewQuiz,
      saveQuiz
    };
  }
};
</script> 