<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">Class Manager</h2>
    <!-- Create New Class -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Create New Class</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Class Name
          </label>
          <input
            v-model="newClass.name"
            type="text"
            class="w-full p-2 border rounded-lg"
            placeholder="Enter class name"
          />
        </div>
        <div class="mb-4 rounded bg-gray-50 p-4">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="newClass.isPublic"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm font-medium text-gray-700">Make this class public</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Public classes can be discovered and joined by any student.
          </p>
        </div>
        <button
          @click="createClass"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Create Class
        </button>
      </div>
    </div>

    <!-- Class List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Your Classes</h2>
      <div v-if="classes.length === 0" class="text-gray-500 text-center py-4">
        No classes created yet.
      </div>
      <div v-else class="space-y-6">
        <div v-for="classItem in classes" :key="classItem.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <IconService v-if="!classItem.isPublic" name="lock" color="gray" size="4" tooltip="This class is private, open only to enrolled students" />
                <h3 class="text-lg font-semibold mt-2">{{ classItem.name }}</h3>
              </div>
              <p class="text-sm text-gray-500">
                Created: {{ formatDate(classItem.createdAt) }}
              </p>
              <p class="text-sm text-gray-500">
                Students: {{ classItem.students?.length || 0 }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editClass(classItem)"
                class="text-primary-600 hover:text-primary-800 p-1"
                title="Edit class"
              >
              <IconService name="edit" size="6" />
              </button>
              <button
                @click="deleteClass(classItem.id)"
                class="text-red-600 hover:text-red-800 p-1"
                title="Delete class"
              >
              <IconService name="trash" size="6" />
              </button>
            </div>
          </div>

          <!-- Class Quizzes -->
          <div class="mt-4">
            <h4 class="font-medium mb-2">Quizzes</h4>
            <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
              No quizzes in this class yet.
            </div>
            <div v-else class="space-y-2">
              <div v-for="quiz in classItem.quizzes" :key="quiz.id" class="border rounded p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <button 
                      @click="$emit('select-quiz', quiz.id)"
                      class="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {{ quiz.title }}
                    </button>
                    <p class="text-sm text-gray-500 mt-1">
                      Total Submissions: {{ classItem.totalSubmissions || 0 }}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="removeQuizFromClass(classItem.id, quiz.id)"
                      class="text-red-600 hover:text-red-800 p-1"
                      title="Remove from class"
                    >
                    <IconService name="trash" size="6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Quiz to Class -->
          <div class="mt-4">
            <select
              v-model="selectedQuiz"
              class="w-full p-2 border rounded-lg"
              @change="addQuizToClass(classItem.id)"
            >
              <option value="">Select a quiz to add</option>
              <option v-for="quiz in availableQuizzes" :key="quiz.id" :value="quiz.id">
                {{ quiz.title }}
              </option>
            </select>
          </div>

          <!-- Class Roster -->
          <div class="mt-6">
            <ClassRoster :classId="classItem.id" :className="classItem.name" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Class Modal -->
    <div v-if="editingClass" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-4">Edit Class</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <input
              v-model="editingClass.name"
              type="text"
              class="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Class Code (for students to join)
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-model="editingClass.code"
                type="text"
                class="w-full p-2 border rounded-lg"
                readonly
              />
              <button
                @click="copyClassCode"
                class="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-6">
          <button
            @click="editingClass = null"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="saveClass"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import ClassRoster from './ClassRoster.vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

export default {
  name: 'ClassManager',
  components: {
    ClassRoster, IconService
  },
  setup() {
    const { user } = useAuth();
    const classes = ref([]);
    const availableQuizzes = ref([]);
    const newClass = ref({
      name: '',
      description: '',
      code: '',
      isPublic: false
    });
    const editingClass = ref(null);
    const selectedQuiz = ref('');
    const { showNotification } = useNotification();
    const loading = ref(false);
    const showCreateClassModal = ref(true);

    const createClass = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const classData = {
          name: newClass.value.name,
          description: newClass.value.description,
          code: newClass.value.code,
          isPublic: newClass.value.isPublic,
          teacherId: user.value.uid,
          teacherName: user.value.displayName || 'Unknown Teacher',
          createdAt: new Date(),
          updatedAt: new Date(),
          quizzes: [],
          students: []
        };
        
        await FirebaseService.createClass(classData);
        
        // Reset form
        newClass.value = {
          name: '',
          description: '',
          code: '',
          isPublic: false
        };
        
        showCreateClassModal.value = false;
        showNotification('Success', 'Class created successfully', 'success');
        await fetchClasses();
      } catch (error) {
        showNotification('Error', 'Failed to create class', 'error');
      } finally {
        loading.value = false;
      }
    };

    const fetchClasses = async () => {
      if (!user.value) return;

      try {
        const { classes: loadedClasses, totalSubmissions } = await FirebaseService.getTeacherClasses(user.value.uid);
        classes.value = loadedClasses.map(classItem => ({
          ...classItem,
          totalSubmissions
        }));
      } catch (error) {
        console.error('Error fetching classes:', error);
        showNotification('Error', 'Error fetching classes. Please try again.', 'error');
      }
    };

    const fetchQuizzes = async () => {
      if (!user.value) return;

      try {
        availableQuizzes.value = await FirebaseService.getTeacherQuizzes(user.value.uid);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        showNotification('Error', 'Error fetching quizzes. Please try again.', 'error');
      }
    };

    const editClass = (classItem) => {
      editingClass.value = { ...classItem };
    };

    const saveClass = async () => {
      if (!editingClass.value) return;

      try {
        await FirebaseService.updateClass(editingClass.value.id, {
          name: editingClass.value.name,
          updatedAt: new Date()
        });
        
        const index = classes.value.findIndex(c => c.id === editingClass.value.id);
        if (index !== -1) {
          classes.value[index] = { ...editingClass.value };
        }
        
        editingClass.value = null;
        showNotification('Success', 'Class updated successfully', 'success');
      } catch (error) {
        console.error('Error saving class:', error);
        showNotification('Error', 'Error saving class. Please try again.', 'error');
      }
    };

    const deleteClass = async (classId) => {
      if (!confirm('Are you sure you want to delete this class?')) return;

      try {
        await FirebaseService.deleteClass(classId);
        classes.value = classes.value.filter(c => c.id !== classId);
        showNotification('Success', 'Class deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting class:', error);
        showNotification('Error', 'Error deleting class. Please try again.', 'error');
      }
    };

    const addQuizToClass = async (classId) => {
      if (!selectedQuiz.value) return;

      try {
        const quiz = availableQuizzes.value.find(q => q.id === selectedQuiz.value);
        if (!quiz) return;

        // Check if quiz is already in the class
        const classItem = classes.value.find(c => c.id === classId);
        if (classItem?.quizzes?.some(q => q.id === quiz.id)) {
          showNotification('Info', 'This quiz is already in the class', 'info');
          selectedQuiz.value = '';
          return;
        }

        await FirebaseService.addQuizToClass(classId, {
          id: quiz.id,
          title: quiz.title
        });

        const classIndex = classes.value.findIndex(c => c.id === classId);
        if (classIndex !== -1) {
          classes.value[classIndex].quizzes = [
            ...(classes.value[classIndex].quizzes || []),
            { id: quiz.id, title: quiz.title }
          ];
        }

        selectedQuiz.value = '';
        showNotification('Success', 'Quiz added to class successfully', 'success');
      } catch (error) {
        console.error('Error adding quiz to class:', error);
        showNotification('Error', 'Error adding quiz to class. Please try again.', 'error');
      }
    };

    const removeQuizFromClass = async (classId, quizId) => {
      try {
        await FirebaseService.removeQuizFromClass(classId, quizId);

        const classIndex = classes.value.findIndex(c => c.id === classId);
        if (classIndex !== -1) {
          classes.value[classIndex].quizzes = classes.value[classIndex].quizzes.filter(
            q => q.id !== quizId
          );
        }
        showNotification('Success', 'Quiz removed from class successfully', 'success');
      } catch (error) {
        showNotification('Error', 'Error removing quiz from class. Please try again.', 'error');
      }
    };

    const copyClassCode = () => {
      if (!editingClass.value?.code) return;
      navigator.clipboard.writeText(editingClass.value.code);
      showNotification('Success', 'Class code copied to clipboard!', 'success');
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    onMounted(() => {
      fetchClasses();
      fetchQuizzes();
    });

    return {
      classes,
      availableQuizzes,
      newClass,
      editingClass,
      selectedQuiz,
      createClass,
      editClass,
      saveClass,
      deleteClass,
      addQuizToClass,
      removeQuizFromClass,
      copyClassCode,
      formatDate
    };
  }
};
</script> 