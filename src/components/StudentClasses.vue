<template>
  <div class="space-y-6">
    <!-- Join Class -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Join a Class</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Class Code
          </label>
          <div class="flex space-x-2">
            <input
              v-model="classCode"
              type="text"
              class="flex-1 p-2 border rounded-lg"
              placeholder="Enter class code"
            />
            <button
              @click="joinClass"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- My Classes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">My Classes</h2>
      <div v-if="classes.length === 0" class="text-gray-500 text-center py-4">
        You haven't joined any classes yet.
      </div>
      <div v-else class="space-y-6">
        <div v-for="classItem in classes" :key="classItem.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ classItem.name }}</h3>
              <p class="text-sm text-gray-500">
                Teacher: {{ classItem.teacherName }}
              </p>
            </div>
            <button
              @click="leaveClass(classItem.id)"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Leave
            </button>
          </div>

          <!-- Class Quizzes -->
          <div class="mt-4">
            <h4 class="font-medium mb-2">Available Quizzes</h4>
            <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
              No quizzes available yet.
            </div>
            <div v-else class="space-y-2">
              <div v-for="quiz in classItem.quizzes" :key="quiz.id" class="border rounded p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="font-medium">{{ quiz.title }}</h5>
                    <p class="text-sm text-gray-500">
                      {{ quiz.questions?.length || 0 }} questions
                    </p>
                  </div>
                  <button
                    @click="startQuiz(classItem.id, quiz)"
                    class="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Modal -->
    <div v-if="currentQuiz" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ currentQuiz.title }}</h2>
        <div v-for="(question, index) in currentQuiz.questions" :key="index" class="mb-6">
          <p class="font-medium mb-2">Question {{ index + 1 }}: {{ question.text }}</p>
          <div class="space-y-2">
            <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center space-x-2">
              <input
                type="radio"
                :name="'answer-' + index"
                :value="optionIndex"
                v-model="answers[index]"
                class="text-primary-600"
              />
              <span>{{ option.text }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
            @click="currentQuiz = null"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="submitQuiz"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default {
  name: 'StudentClasses',
  setup() {
    const { user } = useAuth();
    const classes = ref([]);
    const classCode = ref('');
    const currentQuiz = ref(null);
    const answers = ref([]);

    const joinClass = async () => {
      if (!classCode.value.trim()) return;

      try {
        // Find class by code
        const q = query(
          collection(db, 'classes'),
          where('code', '==', classCode.value.trim().toUpperCase())
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          alert('Class not found. Please check the code and try again.');
          return;
        }

        const classDoc = querySnapshot.docs[0];
        const classData = classDoc.data();

        // Add student to class
        await updateDoc(doc(db, 'classes', classDoc.id), {
          students: arrayUnion(user.value.uid),
          updatedAt: new Date()
        });

        // Get teacher's name
        const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
        const teacherName = teacherDoc.data()?.name || 'Unknown Teacher';

        // Add class to student's list
        classes.value.push({
          id: classDoc.id,
          ...classData,
          teacherName
        });

        classCode.value = '';
      } catch (error) {
        console.error('Error joining class:', error);
        alert('Error joining class. Please try again.');
      }
    };

    const fetchClasses = async () => {
      if (!user.value) return;

      try {
        const q = query(
          collection(db, 'classes'),
          where('students', 'array-contains', user.value.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const classPromises = querySnapshot.docs.map(async (doc) => {
          const classData = doc.data();
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherName = teacherDoc.data()?.name || 'Unknown Teacher';
          
          return {
            id: doc.id,
            ...classData,
            teacherName
          };
        });

        classes.value = await Promise.all(classPromises);
      } catch (error) {
        console.error('Error fetching classes:', error);
        alert('Error fetching classes. Please try again.');
      }
    };

    const leaveClass = async (classId) => {
      if (!confirm('Are you sure you want to leave this class?')) return;

      try {
        await updateDoc(doc(db, 'classes', classId), {
          students: arrayRemove(user.value.uid),
          updatedAt: new Date()
        });
        
        classes.value = classes.value.filter(c => c.id !== classId);
      } catch (error) {
        console.error('Error leaving class:', error);
        alert('Error leaving class. Please try again.');
      }
    };

    const startQuiz = async (classId, quiz) => {
      try {
        // Get full quiz data
        const quizDoc = await getDoc(doc(db, 'quizzes', quiz.id));
        currentQuiz.value = {
          ...quizDoc.data(),
          id: quiz.id,
          classId
        };
        answers.value = new Array(currentQuiz.value.questions.length).fill(null);
      } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Error starting quiz. Please try again.');
      }
    };

    const submitQuiz = async () => {
      if (!currentQuiz.value) return;

      try {
        // Calculate score
        const score = currentQuiz.value.questions.reduce((total, question, index) => {
          return total + (answers.value[index] === question.correctIndex ? 1 : 0);
        }, 0);

        // Save quiz result
        await addDoc(collection(db, 'quizResults'), {
          quizId: currentQuiz.value.id,
          classId: currentQuiz.value.classId,
          studentId: user.value.uid,
          answers: answers.value,
          score,
          totalQuestions: currentQuiz.value.questions.length,
          submittedAt: new Date()
        });

        alert(`Quiz submitted! Your score: ${score}/${currentQuiz.value.questions.length}`);
        currentQuiz.value = null;
        answers.value = [];
      } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
      }
    };

    onMounted(fetchClasses);

    return {
      classes,
      classCode,
      currentQuiz,
      answers,
      joinClass,
      leaveClass,
      startQuiz,
      submitQuiz
    };
  }
};
</script> 