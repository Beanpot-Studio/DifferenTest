<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Student Submissions</h1>

    <!-- Class Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
      <select 
        v-model="selectedClass" 
        @change="loadSubmissions"
        class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Classes</option>
        <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
          {{ classItem.name }}
        </option>
      </select>
    </div>

    <!-- Quiz Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
      <select 
        v-model="selectedQuiz" 
        @change="loadSubmissions"
        class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Quizzes</option>
        <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
          {{ quiz.title }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="w-full flex justify-center items-center">
        <DotLottieVue style="height: 200px; width: 200px" autoplay loop src="../../loading.lottie" />
      </div>
    </div>

    <!-- Submissions Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">
                  {{ submission.studentName }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ submission.className }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ submission.quizTitle }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': submission.score >= 70,
                  'bg-yellow-100 text-yellow-800': submission.score >= 50 && submission.score < 70,
                  'bg-red-100 text-red-800': submission.score < 50
                }"
              >
                {{ submission.score }}%
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(submission.submittedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="viewSubmission(submission)"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Submission Details Modal -->
    <div v-if="showSubmissionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="closeSubmissionModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div v-if="currentSubmission">
          <h3 class="text-xl font-bold mb-4">
            Submission Details: {{ currentSubmission.quizTitle }}
          </h3>
          <div class="mb-6">
            <p class="text-gray-600">Student: {{ currentSubmission.studentName }}</p>
            <p class="text-gray-600">Class: {{ currentSubmission.className }}</p>
            <p class="text-gray-600">Submitted: {{ formatDate(currentSubmission.submittedAt) }}</p>
            <p class="text-gray-600">Score: {{ currentSubmission.score }}%</p>
          </div>

          <div class="space-y-6">
            <div 
              v-for="(answer, index) in currentSubmission.answers" 
              :key="index"
              class="border-b pb-4"
            >
              <p class="font-medium mb-2">{{ index + 1 }}. {{ answer.question }}</p>
              <div class="ml-4">
                <p class="text-sm text-gray-600 mb-1">Student's Answer: {{ answer.selectedOption }}</p>
                <p class="text-sm text-gray-600">Correct Answer: {{ answer.correctOption }}</p>
                <p 
                  :class="{
                    'text-sm mt-1': true,
                    'text-green-600': answer.isCorrect,
                    'text-red-600': !answer.isCorrect
                  }"
                >
                  {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

export default {
  name: 'TeacherSubmissions',
  components: {
    DotLottieVue
  },
  setup() {
    const { user } = useAuth();
    const loading = ref(false);
    const classes = ref([]);
    const quizzes = ref([]);
    const submissions = ref([]);
    const selectedClass = ref('');
    const selectedQuiz = ref('');
    const showSubmissionModal = ref(false);
    const currentSubmission = ref(null);

    const loadClasses = async () => {
      try {
        console.log('Loading classes for teacher:', user.value.uid);
        const classesRef = collection(db, 'classes');
        const q = query(classesRef, where('teacherId', '==', user.value.uid));
        const querySnapshot = await getDocs(q);
        
        const loadedClasses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Loaded classes:', loadedClasses);
        classes.value = loadedClasses;
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };

    const loadQuizzes = async () => {
      try {
        console.log('Loading quizzes for teacher:', user.value.uid);
        // Since quizzes are stored within classes, we'll get them from the loaded classes
        const allQuizzes = [];
        
        // If a class is selected, only show quizzes from that class
        if (selectedClass.value) {
          const selectedClassData = classes.value.find(c => c.id === selectedClass.value);
          if (selectedClassData?.quizzes && Array.isArray(selectedClassData.quizzes)) {
            selectedClassData.quizzes.forEach(quiz => {
              allQuizzes.push({
                id: quiz.id,
                title: quiz.title,
                classId: selectedClassData.id
              });
            });
          }
        } else {
          // If no class is selected, show all quizzes from all teacher's classes
          classes.value.forEach(classItem => {
            if (classItem.quizzes && Array.isArray(classItem.quizzes)) {
              classItem.quizzes.forEach(quiz => {
                allQuizzes.push({
                  id: quiz.id,
                  title: quiz.title,
                  classId: classItem.id
                });
              });
            }
          });
        }
        
        console.log('Loaded quizzes from classes:', allQuizzes);
        quizzes.value = allQuizzes;
        
        // If a quiz is selected but it's not in the current list, clear the selection
        if (selectedQuiz.value && !allQuizzes.some(q => q.id === selectedQuiz.value)) {
          selectedQuiz.value = '';
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      }
    };

    const loadSubmissions = async () => {
      loading.value = true;
      try {
        console.log('Loading student quiz attempts');
        const quizAttemptsRef = collection(db, 'quizAttempts');
        let q = query(quizAttemptsRef);
        console.log('Base query:', q);

        if (selectedClass.value) {
          q = query(q, where('classId', '==', selectedClass.value));
          console.log('Query with class filter:', q);
        }

        if (selectedQuiz.value) {
          q = query(q, where('quizId', '==', selectedQuiz.value));
          console.log('Query with quiz filter:', q);
        }

        const querySnapshot = await getDocs(q);
        console.log('Query snapshot:', {
          empty: querySnapshot.empty,
          size: querySnapshot.size,
          docs: querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        });
        
        if (querySnapshot.empty) {
          console.log('No quiz attempts found');
          submissions.value = [];
          return;
        }

        const submissionsData = [];

        for (const docSnapshot of querySnapshot.docs) {
          const attempt = docSnapshot.data();
          console.log('Processing quiz attempt:', attempt);
          
          try {
            // Get student data using userId
            const studentDocRef = doc(db, 'users', attempt.userId);
            const studentDoc = await getDoc(studentDocRef);
            console.log('Student document:', {
              id: attempt.userId,
              exists: studentDoc.exists(),
              data: studentDoc.exists() ? studentDoc.data() : null
            });
            
            // Get class data
            const classDocRef = doc(db, 'classes', attempt.classId);
            const classDoc = await getDoc(classDocRef);
            console.log('Class document:', {
              id: attempt.classId,
              exists: classDoc.exists(),
              data: classDoc.exists() ? classDoc.data() : null
            });

            // Find the quiz in the class's quizzes array
            const classData = classDoc.exists() ? classDoc.data() : null;
            const quiz = classData?.quizzes?.find(q => q.id === attempt.quizId);
            console.log('Found quiz in class:', quiz);

            // Only include the submission if the quiz exists in the class
            if (quiz) {
              const submissionData = {
                id: docSnapshot.id,
                ...attempt,
                studentName: studentDoc.exists() ? studentDoc.data()?.name || 'Unknown Student' : 'Unknown Student',
                className: classDoc.exists() ? classDoc.data()?.name || 'Unknown Class' : 'Unknown Class',
                quizTitle: quiz.title,
                score: attempt.score || 0,
                submittedAt: attempt.submittedAt || new Date(),
                answers: attempt.answers || []
              };
              console.log('Processed submission data:', submissionData);
              submissionsData.push(submissionData);
            }
          } catch (error) {
            console.error('Error processing quiz attempt:', error);
            console.error('Error details:', {
              message: error.message,
              code: error.code,
              stack: error.stack
            });
          }
        }

        // Sort submissions by submission date, most recent first
        submissionsData.sort((a, b) => {
          const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt);
          const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        console.log('Final submissions data:', submissionsData);
        submissions.value = submissionsData;
      } catch (error) {
        console.error('Error loading quiz attempts:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      } finally {
        loading.value = false;
      }
    };

    const viewSubmission = (submission) => {
      currentSubmission.value = submission;
      showSubmissionModal.value = true;
    };

    const closeSubmissionModal = () => {
      showSubmissionModal.value = false;
      currentSubmission.value = null;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        // Check if it's a Firestore timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    };

    onMounted(async () => {
      console.log('Component mounted, user:', user.value);
      if (!user.value) {
        console.error('No user found');
        return;
      }
      await loadClasses();
      await loadQuizzes();
      await loadSubmissions();
    });

    return {
      loading,
      classes,
      quizzes,
      submissions,
      selectedClass,
      selectedQuiz,
      showSubmissionModal,
      currentSubmission,
      loadSubmissions,
      viewSubmission,
      closeSubmissionModal,
      formatDate
    };
  }
};
</script> 