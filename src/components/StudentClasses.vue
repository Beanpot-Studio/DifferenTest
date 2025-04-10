<template>
  <div class="space-y-6">
    <!-- Class Search -->
    <ClassSearch @enrolled="loadClasses" @search="handleSearch" />

    <!-- My Classes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">My Classes</h2>
      <div v-if="loading" class="text-center py-4">
        <BaseAnimation type="loading" :loop="true" />
      </div>    
      
      <div v-else-if="classes.length === 0" class="text-gray-500 text-center py-4">
       
        You haven't joined any classes yet.
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="classItem in filteredClasses" :key="classItem.id" class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-gray-900">{{ classItem.name || 'Unnamed Class' }}</h3>
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p class="text-sm font-medium text-gray-700">
                  Teacher: <span class="text-primary-600">{{ classItem.teacherName || 'Unknown Teacher' }}</span>
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p class="text-sm font-medium text-gray-700">
                  Class Code: <span class="font-mono text-primary-600">{{ classItem.code || 'N/A' }}</span>
                </p>
              </div>
            </div>
            <button
              @click="leaveClass(classItem.id)"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Leave Class</span>
            </button>
          </div>

          <!-- Class Progress -->
          <!--<div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">Class Progress</h4>
              <span class="text-sm text-gray-500">
                {{ calculateProgress(classItem) }}% Complete
              </span>
            </div>
            <div class="bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-500 rounded-full h-2"
                :style="{ width: `${calculateProgress(classItem)}%` }"
              ></div>
            </div>
          </div>-->

          <!-- Class Quizzes -->
          <div class="mt-6">
            <h4 class="font-medium mb-2">Available Quizzes</h4>
            <div v-if="!classItem.quizzes || classItem.quizzes.length === 0" class="text-gray-500 text-sm">
              No quizzes available yet.
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="quiz in classItem.quizzes" 
                :key="quiz.id" 
                class="border rounded p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="font-medium">{{ quiz.title }}</h5>
                    <p class="text-sm text-gray-500">
                      {{ quiz.questions ? quiz.questions.length : 0 }} questions
                    </p>
                    <div v-if="getQuizAttempt(classItem.id, quiz.id)" class="mt-1">
                      <p class="text-sm">
                        Last attempt: 
                        <span :class="{'text-green-600': getQuizAttempt(classItem.id, quiz.id).score >= 80, 'text-yellow-600': getQuizAttempt(classItem.id, quiz.id).score >= 60, 'text-red-600': getQuizAttempt(classItem.id, quiz.id).score < 60}">
                          {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      v-if="getQuizAttempt(classItem.id, quiz.id)?.score < 100"
                      @click="reviewQuiz(classItem.id, quiz)"
                      class="px-3 py-1 bg-secondary-600 text-white rounded hover:bg-secondary-700"
                    >
                      Review
                    </button>
                    <button
                      v-if="!getQuizAttempt(classItem.id, quiz.id) || getQuizAttempt(classItem.id, quiz.id)?.score < 100"
                      @click="startQuiz(classItem.id, quiz)"
                      class="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      {{ getQuizAttempt(classItem.id, quiz.id) ? 'Retake' : 'Start' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Modal -->
    <BaseModal
      v-if="selectedQuiz"
      :is-open="isQuizModalOpen"
      @close="closeQuizModal"
      :title="selectedQuiz.title"
    >
      <QuizInterface
        :quiz-id="selectedQuiz.id"
        :class-id="selectedClass?.id"
        :is-embedded="false"
      />
    </BaseModal>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="closeReviewModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div v-if="currentQuiz">
          <h3 class="text-xl font-bold mb-4">Review: {{ currentQuiz.title }}</h3>
          
          <div class="space-y-8">
            <div 
              v-for="(question, index) in currentQuiz.questions" 
              :key="index"
              class="border-b pb-6"
            >
              <div class="mb-4">
                <p class="font-medium">{{ index + 1 }}. {{ question.text }}</p>
                <div class="mt-2 space-y-2">
                  <div 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    :class="{
                      'text-green-600': optionIndex === question.correctIndex,
                      'text-red-600': optionIndex === answers[index] && optionIndex !== question.correctIndex
                    }"
                    class="flex items-center space-x-2"
                  >
                    <span v-if="optionIndex === question.correctIndex">✓</span>
                    <span v-else-if="optionIndex === answers[index]">✗</span>
                    <span v-else>&nbsp;&nbsp;</span>
                    <span>{{ option.text }}</span>
                  </div>
                </div>
              </div>

              <div v-if="answers[index] !== question.correctIndex" class="mt-4">
                <button
                  @click="getExplanation(index)"
                  class="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Get detailed explanation
                </button>
                <div v-if="explanations[index]" class="mt-2 p-3 bg-primary-50 rounded">
                  {{ explanations[index] }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              @click="retakeQuiz"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retake Quiz
            </button>
            <button
              @click="closeReviewModal"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close Review
            </button>
          </div>
        </div>
      </div>
    </div>

    <nav class="-mb-px flex space-x-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          activeTab === tab.id
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
        ]"
      >
        {{ tab.name }}
      </button>
    </nav>

    <!-- Classes Tab -->
    <div v-if="activeTab === 'activities'" class="space-y-6">
      <RecentActivity />
    </div>

    <!-- Quiz History Tab -->
    <div v-else-if="activeTab === 'history'" class="space-y-6">
      <QuizHistory />
    </div>

    <!-- Achievements Tab -->
    <div v-else-if="activeTab === 'achievements'" class="space-y-6">
      <BadgeDisplay />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, getDoc, updateDoc, addDoc, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../stores/auth';
import ClassSearch from './ClassSearch.vue';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAnimation from './BaseAnimation.vue';
import { useNotification } from '../composables/useNotification';
import QuizHistory from './QuizHistory.vue';
import RecentActivity from './RecentActivity.vue';
import QuizInterface from './QuizInterface.vue';
import BaseModal from './BaseModal.vue';
import BadgeDisplay from './BadgeDisplay.vue';
const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

export default {
  name: 'StudentClasses',
  components: {
    ClassSearch, BaseAnimation, QuizHistory, RecentActivity, QuizInterface, BaseModal, BadgeDisplay
  },
  setup() {
    const { user, initialized } = useAuth();
    const classes = ref([]);
    const loading = ref(true);
    const showQuizModal = ref(false);
    const showReviewModal = ref(false);
    const currentQuiz = ref(null);
    const currentClassId = ref(null);
    const selectedQuiz = ref(null);
    const selectedClass = ref(null);
    const isQuizModalOpen = ref(false);
    const answers = ref([]);
    const quizCompleted = ref(false);
    const quizScore = ref(0);
    const quizAttempts = ref({});
    const explanations = ref({});
    const quizStartTime = ref(0);
    const error = ref(null);
    const { showNotification } = useNotification();
    const activeTab = ref('activities');
    const enrollments = ref([]);
    const tabs = [
      { id: 'activities', name: 'Activities' },
      { id: 'history', name: 'Quiz History' },
      { id: 'achievements', name: 'Achievements' }
    ];

    // Add search query ref and filtered classes computed property
    const searchQuery = ref('');
    const filteredClasses = computed(() => {
      if (!searchQuery.value) return classes.value;
      
      const search = searchQuery.value.toLowerCase().trim();
      return classes.value.filter(classItem => {
        const nameMatch = classItem.name?.toLowerCase().includes(search);
        const teacherMatch = classItem.teacherName?.toLowerCase().includes(search);
        const descriptionMatch = classItem.description?.toLowerCase().includes(search);
        const statusMatch = classItem.enrollmentStatus?.toLowerCase().includes(search);
        
        return nameMatch || teacherMatch || descriptionMatch || statusMatch;
      });
    });

    // Handle search from ClassBrowser
    const handleSearch = (query) => {
      searchQuery.value = query;
      // Force a re-render of the filtered classes
      classes.value = [...classes.value];
    };

    const loadClasses = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        
        // Get all enrollments for the user
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.value.uid),
          where('status', '==', 'accepted')
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        if (enrollmentsSnapshot.empty) {
          classes.value = [];
          return;
        }

        // Get all class IDs from active enrollments
        const classIds = enrollmentsSnapshot.docs.map(doc => doc.data().classId);
        
        // Get all classes in parallel
        const classPromises = classIds.map(async (classId) => {
          const classDoc = await getDoc(doc(db, 'classes', classId));
          if (!classDoc.exists()) return null;

          const classData = classDoc.data();
          
          // Verify the student is still in the class's students array
          if (!classData.students?.includes(user.value.uid)) {
            return null;
          }
          
          // Get teacher's details
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherData = teacherDoc.data();
          const teacherName = teacherData?.name || teacherData?.fullName || 'Unknown Teacher';

          // Load full quiz data for each quiz in the class
          const quizzes = await Promise.all((classData.quizzes || []).map(async (quizRef) => {
            try {
              const quizId = typeof quizRef === 'string' ? quizRef : quizRef.id;
              const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
              if (!quizDoc.exists()) return null;
              return {
                id: quizDoc.id,
                ...quizDoc.data()
              };
            } catch (error) {
              console.error('Error loading quiz:', quizRef, error);
              return null;
            }
          }));

          return {
            id: classDoc.id,
            ...classData,
            teacherName,
            code: classData.code || 'N/A',
            quizzes: quizzes.filter(Boolean)
          };
        });

        const loadedClasses = (await Promise.all(classPromises)).filter(Boolean);
        classes.value = loadedClasses.sort((a, b) => b.updatedAt?.toDate() - a.updatedAt?.toDate());

        // Load quiz attempts
        if (loadedClasses.length > 0) {
          const attemptsQuery = query(
            collection(db, 'quizAttempts'),
            where('userId', '==', user.value.uid)
          );
          const attemptsSnapshot = await getDocs(attemptsQuery);
          
          quizAttempts.value = {};
          attemptsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!quizAttempts.value[data.classId]) {
              quizAttempts.value[data.classId] = {};
            }
            quizAttempts.value[data.classId][data.quizId] = data;
          });
        }
          
      } catch (error) {
        console.error('Error loading classes:', error);
        showNotification('Error', 'Failed to load classes', 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadEnrollments = async () => {
      try {
        loading.value = true;
        if (!user.value?.uid) return;

        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.value.uid)
        );
        const querySnapshot = await getDocs(enrollmentsQuery);
        enrollments.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error loading enrollments:', err);
        error.value = 'Failed to load enrollments';
      } finally {
        loading.value = false;
      }
    };

    // Watch for both user and initialization changes
    watch([() => user.value?.uid, () => initialized.value], ([newUserId, isInitialized]) => {
      console.log('Auth state changed:', { userId: newUserId, initialized: isInitialized });
      if (isInitialized && newUserId) {
        loadClasses();
      } else if (isInitialized) {
        classes.value = [];
        loading.value = false;
      }
    }, { immediate: true });

    const leaveClass = async (classId) => {
      if (!user.value) return;
      
      try {
        const enrollmentId = `${user.value.uid}_${classId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        
        // Update enrollment status to 'departed' instead of deleting
        await updateDoc(enrollmentRef, {
          status: 'departed',
          departedAt: new Date()
        });

        // Get class and teacher details
        const classRef = doc(db, 'classes', classId);
        const classDoc = await getDoc(classRef);
        if (classDoc.exists()) {
          const classData = classDoc.data();
          
          // Get teacher's details
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherData = teacherDoc.data();
          const teacherName = teacherData?.name || teacherData?.fullName || 'Unknown Teacher';
          
          // Update class student count and remove student from students array
          await updateDoc(classRef, {
            studentCount: Math.max((classData.studentCount || 1) - 1, 0),
            students: arrayRemove(user.value.uid),
            updatedAt: new Date()
          });

          // Log activity
          await addDoc(collection(db, 'activities'), {
            userId: user.value.uid,
            type: 'class_left',
            classId: classId,
            className: classData.name || 'Unknown Class',
            teacherName: teacherName,
            timestamp: new Date()
          });
        }

        // Remove the class from the local state
        classes.value = classes.value.filter(c => c.id !== classId);

        // Dispatch event to update dashboard
        window.dispatchEvent(new CustomEvent('classLeft'));

        showNotification('Success', 'Successfully left the class', 'success');
      } catch (error) {
        console.error('Error leaving class:', error);
        showNotification('Error', 'Failed to leave the class. Please try again.', 'error');
      }
    };

    const startQuiz = async (classId, quiz) => {
      if (!user.value) return;

      const enrollment = enrollments.value.find(e => e.classId === classId);
      if (enrollment?.status !== 'accepted') {
        showNotification('Error', 'Your enrollment request is still pending or has been rejected. Please wait for the teacher to accept your request.', 'error');
        return;
      }

      const quizDoc = await getDoc(doc(db, 'quizzes', quiz.id));
      if (!quizDoc.exists()) {
        showNotification('Error', 'Quiz not found.', 'error');
        return;
      }

      try {
        selectedClass.value = classes.value.find(c => c.id === classId);
        selectedQuiz.value = {
          id: quiz.id,
          title: quizDoc.data().title,
          questions: quizDoc.data().questions,
          classId: classId
        };
        isQuizModalOpen.value = true;

        // Log quiz start activity
        await addDoc(collection(db, 'activities'), {
          userId: user.value.uid,
          type: 'quiz_started',
          quizId: quiz.id,
          quizTitle: quizDoc.data().title,
          classId: classId,
          timestamp: new Date(),
          isRetake: !!getQuizAttempt(classId, quiz.id)
        });
      } catch (error) {
        console.error('Error starting quiz:', error);
        showNotification('Error', 'Failed to start quiz. Please try again.', 'error');
      }
    };

    const calculateQuizScore = () => {
      if (!currentQuiz.value || !currentQuiz.value.questions) return 0;
      
      let correctAnswers = 0;
      const totalQuestions = currentQuiz.value.questions.length;
      
      for (let i = 0; i < totalQuestions; i++) {
        const question = currentQuiz.value.questions[i];
        const userAnswer = answers.value[i];
        
        if (question && typeof question.correctIndex === 'number' && userAnswer === question.correctIndex) {
          correctAnswers++;
        }
      }
      
      console.log('Quiz scoring:', {
        correctAnswers,
        totalQuestions,
        answers: answers.value,
        questions: currentQuiz.value.questions.map(q => q.correctIndex)
      });
      
      return Math.round((correctAnswers / totalQuestions) * 100);
    };

    const submitQuiz = async () => {
      if (!currentQuiz.value || !user.value) return;
      
      const unansweredQuestions = answers.value.filter(answer => answer === null).length;
      if (unansweredQuestions > 0) {
        showNotification('Error', `Please answer all questions before submitting. You have ${unansweredQuestions} unanswered questions.`, 'error');
        return;
      }
      
      const score = calculateQuizScore();
      console.log('Quiz submitted with score:', score);
      quizScore.value = score;
      quizCompleted.value = true;
      
      try {
        const attemptId = `${user.value.uid}_${currentClassId.value}_${currentQuiz.value.id}`;
        
        // Create detailed question results
        const questionResults = currentQuiz.value.questions.map((question, index) => ({
          questionIndex: index,
          questionText: question.text,
          correctIndex: question.correctIndex,
          userAnswer: answers.value[index],
          isCorrect: answers.value[index] === question.correctIndex,
          selectedOption: question.options[answers.value[index]]
        }));
        
        const attemptData = {
          userId: user.value.uid,
          classId: currentClassId.value,
          quizId: currentQuiz.value.id,
          quizTitle: currentQuiz.value.title,
          score: score,
          answers: answers.value,
          timestamp: new Date(),
          questionCount: currentQuiz.value.questions.length,
          correctAnswers: questionResults.filter(q => q.isCorrect).length,
          questionResults: questionResults,
          timeSpent: Date.now() - quizStartTime.value
        };
        
        console.log('Saving quiz attempt:', attemptData);
        await setDoc(doc(db, 'quizAttempts', attemptId), attemptData);
        
        // Log detailed activity
        await addDoc(collection(db, 'activities'), {
          userId: user.value.uid,
          type: 'quiz_completed',
          classId: currentClassId.value,
          className: classes.value.find(c => c.id === currentClassId.value)?.name || 'Unknown Class',
          quizId: currentQuiz.value.id,
          quizTitle: currentQuiz.value.title,
          score: score,
          timestamp: new Date(),
          correctAnswers: questionResults.filter(q => q.isCorrect).length,
          totalQuestions: currentQuiz.value.questions.length,
          timeSpent: Date.now() - quizStartTime.value,
          improvement: await calculateImprovement(currentClassId.value, currentQuiz.value.id, score),
          activityDescription: `Completed "${currentQuiz.value.title}" quiz in ${classes.value.find(c => c.id === currentClassId.value)?.name || 'Unknown Class'} with ${score}% score`,
          status: score >= 80 ? 'passed' : 'needs_improvement',
          isRetake: !!getQuizAttempt(currentClassId.value, currentQuiz.value.id),
          incorrectAnswers: questionResults
            .filter(q => !q.isCorrect)
            .map(q => ({
              question: q.questionText,
              selectedOption: q.selectedOption?.text || 'No answer selected',
              correctOption: currentQuiz.value.questions[q.questionIndex].options[q.correctIndex]?.text || 'Unknown correct answer'
            }))
        });

        // If this is a perfect score, add a special achievement activity
        if (score === 100) {
          await addDoc(collection(db, 'activities'), {
            userId: user.value.uid,
            type: 'achievement',
            classId: currentClassId.value,
            className: classes.value.find(c => c.id === currentClassId.value)?.name,
            quizId: currentQuiz.value.id,
            quizTitle: currentQuiz.value.title,
            timestamp: new Date(),
            activityDescription: `🎉 Achieved perfect score on "${currentQuiz.value.title}" quiz!`,
            achievement: 'perfect_score'
          });
        }
        
        // If there was improvement from previous attempts, log it as a progress activity
        const improvement = await calculateImprovement(currentClassId.value, currentQuiz.value.id, score);
        if (improvement > 0) {
          await addDoc(collection(db, 'activities'), {
            userId: user.value.uid,
            type: 'progress',
            classId: currentClassId.value,
            className: classes.value.find(c => c.id === currentClassId.value)?.name,
            quizId: currentQuiz.value.id,
            quizTitle: currentQuiz.value.title,
            timestamp: new Date(),
            activityDescription: `📈 Improved score on "${currentQuiz.value.title}" by ${improvement}%`,
            improvement
          });
        }
        
        // Dispatch quiz completed event
        window.dispatchEvent(new CustomEvent('quizCompleted'));
        
        await loadClasses();
      } catch (error) {
        console.error('Error saving quiz results:', error);
        showNotification('Error', 'There was an error saving your quiz results. Please try again.', 'error');
      }
    };

    const getQuizAttempt = (classId, quizId) => {
      return quizAttempts.value[classId]?.[quizId];
    };

    const calculateProgress = (classItem) => {
      if (!classItem.quizzes || !classItem.quizzes.length) return 0;
      
      const attempts = quizAttempts.value[classItem.id] || {};
      const totalQuizzes = classItem.quizzes.length;
      const completedQuizzes = Object.values(attempts).filter(attempt => attempt.score >= 80).length;
      
      return Math.round((completedQuizzes / totalQuizzes) * 100);
    };

    const reviewQuiz = (classId, quiz) => {
      currentClassId.value = classId;
      currentQuiz.value = quiz;
      const attempt = getQuizAttempt(classId, quiz.id);
      if (attempt) {
        answers.value = attempt.answers;
      }
      showReviewModal.value = true;
    };

    const getExplanation = async (questionIndex) => {
      if (!currentQuiz.value) return;
      //the chosen answer is: question.options[answers.value[questionIndex]].text
      //the correct answer is: question.options[question.correctIndex].text
      try {
        const question = currentQuiz.value.questions[questionIndex];
        const prompt = `Explain in simple, concise language why "${question.options[question.correctIndex].text}" is the correct answer 
        to the question: "${question.text}". Only address how the correct answer is different from the student's chosen answer:
         "${question.options[answers.value[questionIndex]].text}". Use simple, professional language and no formatting. Don't give more than 4-5 sentences.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
        const result = await model.generateContent(prompt);
        const explanation = result.response.text();
        
        explanations.value[questionIndex] = explanation;
      } catch (error) {
        console.error('Error getting explanation:', error);
        explanations.value[questionIndex] = "Sorry, couldn't generate an explanation at this time.";
      }
    };

    const retakeQuiz = () => {
      showReviewModal.value = false;
      startQuiz(currentClassId.value, currentQuiz.value);
    };

    const closeQuizModal = () => {
      isQuizModalOpen.value = false;
      selectedQuiz.value = null;
      selectedClass.value = null;
    };

    const closeReviewModal = () => {
      showReviewModal.value = false;
      explanations.value = {};
    };

    const calculateImprovement = async (classId, quizId, currentScore) => {
      try {
        const previousAttempts = await getDocs(
          query(
            collection(db, 'quizAttempts'),
            where('userId', '==', user.value.uid),
            where('quizId', '==', quizId),
            where('timestamp', '<', new Date())
          )
        );
        
        if (previousAttempts.empty) return null;
        
        const scores = previousAttempts.docs.map(doc => doc.data().score);
        const previousBest = Math.max(...scores);
        return currentScore > previousBest ? currentScore - previousBest : 0;
      } catch (error) {
        console.error('Error calculating improvement:', error);
        return null;
      }
    };

    onMounted(async () => {
      console.log('StudentClasses mounted, user:', user.value?.uid);
      if (user.value?.uid && initialized.value) {
        await Promise.all([loadClasses(), loadEnrollments()]);
      }
      
      // Listen for class joined event
      window.addEventListener('classJoined', async () => {
        console.log('Class joined event received');
        await Promise.all([loadClasses(), loadEnrollments()]);
      });

      // Listen for custom refresh event
      const component = document.querySelector('student-classes');
      if (component) {
        component.addEventListener('refreshClasses', async () => {
          console.log('Refresh classes event received');
          await Promise.all([loadClasses(), loadEnrollments()]);
        });
      }
    });

    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('classJoined', loadClasses);
      const component = document.querySelector('student-classes');
      if (component) {
        component.removeEventListener('refreshClasses', loadClasses);
      }
    });

    return {
      classes,
      loading,
      error,
      showQuizModal,
      showReviewModal,
      currentQuiz,
      selectedQuiz,
      selectedClass,
      isQuizModalOpen,
      answers,
      quizCompleted,
      quizScore,
      explanations,
      loadClasses,
      leaveClass,
      startQuiz,
      submitQuiz,
      getQuizAttempt,
      calculateProgress,
      reviewQuiz,
      getExplanation,
      retakeQuiz,
      closeQuizModal,
      closeReviewModal,
      showNotification,
      activeTab,
      tabs,
      filteredClasses,
      handleSearch,
      searchQuery,
      loadEnrollments
    };
  }
};
</script> 