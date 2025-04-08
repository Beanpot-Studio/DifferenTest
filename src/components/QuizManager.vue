<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" />
    </div>

    <!-- Quiz List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Your Quizzes</h2>
      
      <!-- Notification -->
      <div v-if="notification.show" 
           :class="['mb-4 p-4 rounded-lg', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
        {{ notification.message }}
      </div>

      <!-- Quiz List -->
      <div v-if="quizzes.length > 0" class="space-y-2">
        <div v-for="quiz in quizzes" :key="quiz.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
          <div>
            <h3 class="text-lg font-semibold">{{ quiz.title }}</h3>
            <p class="text-sm text-gray-500">{{ quiz.questions?.length || 0 }} questions</p>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="quiz.lessonPlan"
              @click="viewLessonPlan(quiz)"
              class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              View Lesson Plan
            </button>
           
            <button
              @click="openEditModal(quiz)"
              class="text-primary-600 hover:text-primary-800 font-medium"
            >
              Edit
            </button>
            <button
              @click="deleteQuiz(quiz.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Delete quiz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">No quizzes created yet.</p>
    </div>

    <!-- Edit Quiz Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Edit Quiz: {{ currentQuiz.title }}</h3>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quiz Title -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
          <input
            v-model="currentQuiz.title"
            type="text"
            class="w-full p-2 border rounded-lg"
            @input="saveQuiz"
          />
        </div>

        <!-- Questions -->
        <div v-for="(question, index) in currentQuiz.questions" :key="index" class="border rounded-lg p-4 mb-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Question {{ index + 1 }}</label>
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

        <div class="flex justify-end space-x-4 mt-6">
          <button
            @click="closeEditModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
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

   
    <!-- View Lesson Plan Modal -->
    <div v-if="showLessonPlanModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Lesson Plan</h3>
          <button @click="closeLessonPlanModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Lesson Plan</label>
          <textarea
            v-model="currentLessonPlan.content"
            class="w-full p-2 border rounded-lg"
            rows="3"
            readonly
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
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
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAnimation from './BaseAnimation.vue';

const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

export default {
  name: 'QuizManager',
  components: {
    BaseAnimation
  },
  props: {
    classId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { user } = useAuth();
    const quizzes = ref([]);
    const showEditModal = ref(false);
    const currentQuiz = ref(null);
    const notification = ref({ show: false, message: '', type: 'success' });
    const showLessonPlanModal = ref(false);
    const currentLessonPlan = ref(null);
    const lessonPlanText = ref('');
    const generating = ref(false);
    const error = ref(null);
    const success = ref(null);
    const loading = ref(false);

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type };
      setTimeout(() => {
        notification.value.show = false;
      }, 3000);
    };

    const fetchQuizzes = async () => {
      if (!user.value) return;

      try {
        const q = query(
          collection(db, 'quizzes'),
          where('userId', '==', user.value.uid)
        );
        const querySnapshot = await getDocs(q);
        quizzes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        showNotification('Error fetching quizzes', 'error');
      }
    };

    const openEditModal = (quiz) => {
      currentQuiz.value = { ...quiz };
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      currentQuiz.value = null;
      fetchQuizzes(); // Refresh the list
    };

    const saveQuiz = async () => {
      if (!currentQuiz.value) return;

      try {
        await updateDoc(doc(db, 'quizzes', currentQuiz.value.id), {
          ...currentQuiz.value,
          updatedAt: new Date()
        });
        showNotification('Quiz updated successfully');
      } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification('Error saving quiz', 'error');
      }
    };

    const deleteQuiz = async (quizId) => {
      if (!confirm('Are you sure you want to delete this quiz?')) return;

      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        quizzes.value = quizzes.value.filter(q => q.id !== quizId);
        showNotification('Quiz deleted successfully');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showNotification('Error deleting quiz', 'error');
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

    

    const viewLessonPlan = async (quiz) => {
      if (!quiz.lessonPlan) {
        error.value = 'No lesson plan available for this quiz';
        return;
      }

      try {
        currentLessonPlan.value = { content: quiz.lessonPlan };
        showLessonPlanModal.value = true;
      } catch (err) {
        console.error('Error loading lesson plan:', err);
        error.value = 'Failed to load lesson plan';
      }
    };

    const closeLessonPlanModal = () => {
      showLessonPlanModal.value = false;
      currentLessonPlan.value = null;
    };

    onMounted(() => {
      fetchQuizzes();
    });

    return {
      quizzes,
      showEditModal,
      currentQuiz,
      notification,
      openEditModal,
      closeEditModal,
      saveQuiz,
      deleteQuiz,
      addOption,
      removeOption,
      showLessonPlanModal,
      currentLessonPlan,
      lessonPlanText,
      generating,
      error,
      success,
      viewLessonPlan,
      closeLessonPlanModal,
      loading
    };
  }
};
</script> 