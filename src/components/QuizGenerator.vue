<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">Generate Quiz from Lesson Plan</h2>
    
    <!-- Upload Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Upload Lesson Plan (PDF or Text)
      </label>
      <div class="flex items-center space-x-4">
        <input
          type="file"
          ref="fileInput"
          accept=".pdf,.txt"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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
              class="text-red-600 hover:text-red-800"
            >
              Remove
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

    // Get API key from environment variable
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
    console.log('Environment:', import.meta.env);
    console.log('API Key:', apiKey);
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      isGenerating.value = true;

      try {
        // Read file content
        const text = await file.text();
        fileContent.value = text;

        // Generate quiz using Gemini
        await generateQuiz(text);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please try again.');
      } finally {
        isGenerating.value = false;
      }
    };

    const generateQuiz = async (content) => {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        
        const prompt = `Generate a 3-question multiple choice quiz based on this lesson plan. 
        Format the response as a JSON object with this structure:
        {
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
        
        // Clean up the response by removing markdown code block formatting
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse the JSON response
        quiz.value = JSON.parse(text);
        
        // Save to Firebase
        await saveQuiz();
      } catch (error) {
        console.error('Error generating quiz:', error);
        console.error('Raw response:', response?.text());
        alert('Error generating quiz. Please try again.');
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
          // Create new quiz
          const docRef = await addDoc(collection(db, 'quizzes'), quizData);
          quiz.value.id = docRef.id;
        } else {
          // Update existing quiz
          await updateDoc(doc(db, 'quizzes', quiz.value.id), quizData);
        }
      } catch (error) {
        console.error('Error saving quiz:', error);
        alert('Error saving quiz. Please try again.');
      }
    };

    const addOption = (questionIndex) => {
      quiz.value.questions[questionIndex].options.push({ text: '' });
      saveQuiz();
    };

    const removeOption = (questionIndex, optionIndex) => {
      const question = quiz.value.questions[questionIndex];
      question.options.splice(optionIndex, 1);
      
      // Update correctIndex if needed
      if (question.correctIndex >= optionIndex) {
        question.correctIndex = Math.max(0, question.correctIndex - 1);
      }
      
      saveQuiz();
    };

    const generateNewQuiz = async () => {
      if (!fileContent.value) {
        alert('Please upload a lesson plan first.');
        return;
      }
      
      isGenerating.value = true;
      await generateQuiz(fileContent.value);
      isGenerating.value = false;
    };

    return {
      fileInput,
      fileName,
      isGenerating,
      quiz,
      handleFileUpload,
      saveQuiz,
      addOption,
      removeOption,
      generateNewQuiz
    };
  }
};
</script> 