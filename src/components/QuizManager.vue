<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Quiz List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Your Quizzes</h2>
      
      <!-- Quiz List -->
      <div v-if="quizzes.length > 0" class="space-y-2">
        <div v-for="quiz in quizzes" :key="quiz.id" class="border flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
          <div>
            <div class="flex items-center space-x-2">
              <!--all quizzes are de facto private-->
              <!--<span v-if="quiz.isPublic" class="text-yellow-500" title="Public Class">
                <IconService name="star" size="4" />
              </span>
              <span v-else class="text-gray-600" title="Private Class">
                <IconService name="lock" size="4" />
              </span>-->
              <h3 class="text-lg font-bold">{{ quiz.title }}</h3>
              
            </div>
            <p class="text-sm text-gray-500">Class: {{ quiz.className }} / {{ quiz.questions?.length || 0 }} questions</p>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="quiz.lessonPlan"
              @click="viewLessonPlan(quiz)"
              class="px-3 py-1 text-blue-600"
            >
            <IconService name="search" size="6" />
            </button>
           
            <button
              @click="openEditModal(quiz)"
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
      <p v-else class="text-gray-500">No quizzes created yet.</p>
    </div>

    <!-- Edit Quiz Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Edit Quiz: {{ currentQuiz.title }}</h3>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
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
          <h3 class="text-xl font-bold">Lesson Plan: {{ currentLessonPlan?.title }}</h3>
          <button @click="closeLessonPlanModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <div class="mb-6">
          <div class="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
            {{ currentLessonPlan?.content }}
          </div>
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
import { useNotification } from '../composables/useNotification';
import BaseAnimation from './BaseAnimation.vue';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

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
    const showEditModal = ref(false);
    const currentQuiz = ref(null);
    const { showNotification } = useNotification();
    const showLessonPlanModal = ref(false);
    const currentLessonPlan = ref(null);
    const lessonPlanText = ref('');
    const generating = ref(false);
    const error = ref(null);
    const success = ref(null);
    const loading = ref(false);

    const fetchQuizzes = async () => {
      if (!user.value) return;

      try {
        quizzes.value = await FirebaseService.getTeacherQuizzes(user.value.uid);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        showNotification('Error', 'Error fetching quizzes', 'error');
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
        await FirebaseService.updateQuiz(currentQuiz.value.id, {
          ...currentQuiz.value,
          updatedAt: new Date()
        });
        showNotification('Success', 'Quiz updated successfully', 'success');
      } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification('Error', 'Error saving quiz', 'error');
      }
    };

    const deleteQuiz = async (quizId) => {
      if (!confirm('Are you sure you want to delete this quiz?')) return;

      try {
        await FirebaseService.deleteQuiz(quizId);
        showNotification('Success', 'Quiz deleted successfully', 'success');
        fetchQuizzes(); // Refresh the list
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showNotification('Error', 'Error deleting quiz', 'error');
      }
    };

    const viewLessonPlan = (quiz) => {
      if (!quiz.lessonPlan) {
        showNotification('Info', 'No lesson plan available for this quiz', 'info');
        return;
      }
      currentLessonPlan.value = {
        title: quiz.title,
        content: quiz.lessonPlan
      };
      showLessonPlanModal.value = true;
    };

    const closeLessonPlanModal = () => {
      showLessonPlanModal.value = false;
      currentLessonPlan.value = null;
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
      fetchQuizzes();
    });

    return {
      quizzes,
      loading,
      showEditModal,
      currentQuiz,
      showLessonPlanModal,
      currentLessonPlan,
      lessonPlanText,
      generating,
      error,
      success,
      openEditModal,
      closeEditModal,
      saveQuiz,
      deleteQuiz,
      viewLessonPlan,
      closeLessonPlanModal,
      addOption,
      removeOption
    };
  }
};
</script> 