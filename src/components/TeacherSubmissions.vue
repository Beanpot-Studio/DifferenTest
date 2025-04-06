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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
              {{ formatTimeSpent(submission.timeSpent) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(submission.submittedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-blue-100 text-blue-800': submission.status === 'completed',
                  'bg-purple-100 text-purple-800': submission.isRetake,
                  'bg-gray-100 text-gray-800': submission.status !== 'completed'
                }"
              >
                {{ submission.isRetake ? 'Retake' : submission.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="viewSubmission(submission)"
                class="text-primary-600 hover:text-primary-900 mr-4"
                title="View Details"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
            Quiz Details: {{ currentSubmission.quizTitle }}
          </h3>
          <div class="mb-6">
            <p class="text-gray-600">Student: {{ currentSubmission.studentName }}</p>
            <p class="text-gray-600">Class: {{ currentSubmission.className }}</p>
            <p class="text-gray-600">Submitted: {{ formatDate(currentSubmission.submittedAt) }}</p>
            <p class="text-gray-600">Score: {{ currentSubmission.score }}%</p>
            <p class="text-gray-600">Time Spent: {{ formatTimeSpent(currentSubmission.timeSpent) }}</p>
            <p class="text-gray-600">Total Questions: {{ currentSubmission.totalQuestions }}</p>
            <p class="text-gray-600">Correct Answers: {{ currentSubmission.correctAnswers }}</p>
            <p class="text-gray-600">Status: {{ currentSubmission.isRetake ? 'Retake' : currentSubmission.status }}</p>
            <p v-if="currentSubmission.improvement" class="text-gray-600">
              Improvement: {{ currentSubmission.improvement }}%
            </p>
          </div>

          <div class="space-y-6">
            <div class="border-b pb-4">
              <p class="font-medium mb-2">Activity Description:</p>
              <p class="text-sm text-gray-600">{{ currentSubmission.activityDescription }}</p>
            </div>

            <div v-if="currentSubmission.answers && currentSubmission.answers.length > 0">
              <h4 class="font-medium mb-4">Incorrect Answers:</h4>
              <div v-for="(answer, index) in currentSubmission.answers.filter(a => !a.isCorrect)" :key="index" class="mb-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-3">
                    <span class="inline-flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {{ index + 1 }}
                    </span>
                  </div>
                  <div class="flex-grow">
                    <p class="font-medium text-gray-900">{{ answer.question }}</p>
                    <div class="mt-2 space-y-2">
                      <div class="p-2 rounded bg-red-50 text-red-800">
                        <p class="text-sm font-medium">Student's Answer:</p>
                        <p class="text-sm">{{ answer.selectedOption.text }}</p>
                      </div>
                      <div class="p-2 rounded bg-green-50 text-green-800">
                        <p class="text-sm font-medium">Correct Answer:</p>
                        <p class="text-sm">{{ answer.correctOption.text }}</p>
                      </div>
                    </div>
                  </div>
                </div>
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
        console.log('Loading student activities');
        const activitiesRef = collection(db, 'activities');
        let q = query(activitiesRef, where('type', '==', 'quiz_completed'));
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
          console.log('No quiz activities found');
          submissions.value = [];
          return;
        }

        const submissionsData = [];

        for (const docSnapshot of querySnapshot.docs) {
          const activity = docSnapshot.data();
          console.log('Processing activity:', activity);
          
          try {
            // Get student data using userId
            const studentDocRef = doc(db, 'users', activity.userId);
            const studentDoc = await getDoc(studentDocRef);
            console.log('Student document:', {
              id: activity.userId,
              exists: studentDoc.exists(),
              data: studentDoc.exists() ? studentDoc.data() : null
            });

            // Get quiz attempt details
            const quizAttemptsRef = collection(db, 'quizAttempts');
            const attemptQuery = query(
              quizAttemptsRef,
              where('userId', '==', activity.userId),
              where('quizId', '==', activity.quizId),
              where('classId', '==', activity.classId)
            );
            const attemptSnapshot = await getDocs(attemptQuery);
            const attemptData = attemptSnapshot.docs[0]?.data() || {};

            // Get quiz data from quizzes collection
            const quizDocRef = doc(db, 'quizzes', activity.quizId);
            const quizDoc = await getDoc(quizDocRef);
            const quizData = quizDoc.data() || {};

            // Compare student answers with correct answers
            const processedAnswers = attemptData.answers?.map((selectedIndex, questionIndex) => {
              const question = quizData.questions?.[questionIndex] || {};
              const isCorrect = selectedIndex === question.correctIndex;
              
              return {
                question: question.text || 'Unknown Question',
                selectedOption: {
                  text: question.options?.[selectedIndex - 1] || 'No answer selected'
                },
                correctOption: {
                  text: question.options?.[question.correctIndex - 1] || 'Unknown correct answer'
                },
                isCorrect
              };
            }) || [];

            const submissionData = {
              id: docSnapshot.id,
              ...activity,
              studentName: studentDoc.exists() ? studentDoc.data()?.name || 'Unknown Student' : 'Unknown Student',
              score: activity.score || 0,
              submittedAt: activity.timestamp || new Date(),
              totalQuestions: activity.totalQuestions || 0,
              correctAnswers: activity.correctAnswers || 0,
              timeSpent: activity.timeSpent || 0,
              isRetake: activity.isRetake || false,
              status: activity.status || 'completed',
              improvement: activity.improvement || 0,
              answers: processedAnswers
            };
            console.log('Processed submission data:', submissionData);
            submissionsData.push(submissionData);
          } catch (error) {
            console.error('Error processing activity:', error);
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
        console.error('Error loading activities:', error);
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

    const formatTimeSpent = (timeSpent) => {
      if (!timeSpent) return 'N/A';
      try {
        // Convert milliseconds to seconds
        const totalSeconds = Math.floor(timeSpent / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes} minutes ${seconds} seconds`;
      } catch (error) {
        console.error('Error formatting time spent:', error);
        return 'Invalid Time';
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
      formatDate,
      formatTimeSpent
    };
  }
};
</script> 