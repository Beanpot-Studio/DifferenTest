<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Quiz History -->
    <div v-else class="space-y-4">
      <div v-if="quizHistory.length === 0" class="text-center py-8">
        <p class="text-gray-500">No quiz history found.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="attempt in quizHistory" :key="attempt.id" class="border rounded p-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold">{{ attempt.quizTitle }}</h3>
              <p class="text-sm text-gray-500">Class: {{ attempt.className }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatDate(attempt.submittedAt) }}</p>
              <span :class="[
                'px-2 py-1 rounded text-sm',
                attempt.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                Score: {{ attempt.score }}%
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <div v-for="(question, index) in attempt.questions" :key="index" class="border-t pt-2">
              <p class="font-medium">{{ question.text }}</p>
              <div class="mt-1">
                <p class="text-sm" :class="question.isCorrect ? 'text-green-600' : 'text-red-600'">
                  Your answer: {{ question.selectedAnswer }}
                </p>
                <p v-if="!question.isCorrect" class="text-sm text-gray-600">
                  Correct answer: {{ question.correctAnswer }}
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
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';

export default {
  components: {
    BaseAnimation
  },
  setup() {
    const { user } = useAuth();
    const quizHistory = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const selectedAttempt = ref(null);

    const loadQuizHistory = async () => {
      if (!user.value?.uid) {
        error.value = 'Please log in to view your quiz history.';
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        // Query quiz attempts
        const attemptsRef = collection(db, 'quizAttempts');
        const attemptsQuery = query(
          attemptsRef,
          where('userId', '==', user.value.uid),
          orderBy('timestamp', 'desc')
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        
        const attempts = [];
        for (const docSnap of attemptsSnapshot.docs) {
          const attempt = docSnap.data();
          
          // Get class name
          let className = 'Unknown Class';
          if (attempt.classId) {
            const classDocRef = doc(db, 'classes', attempt.classId);
            const classDoc = await getDoc(classDocRef);
            if (classDoc.exists()) {
              className = classDoc.data().name || className;
            }
          }

          // Get quiz details
          let quizTitle = attempt.quizTitle || 'Unknown Quiz';
          if (attempt.quizId) {
            const quizDocRef = doc(db, 'quizzes', attempt.quizId);
            const quizDoc = await getDoc(quizDocRef);
            if (quizDoc.exists()) {
              quizTitle = quizDoc.data().title || quizTitle;
            }
          }

          attempts.push({
            id: docSnap.id,
            ...attempt,
            className,
            quizTitle,
            submittedAt: attempt.timestamp?.toDate() || new Date()
          });
        }
        
        quizHistory.value = attempts;
      } catch (err) {
        console.error('Error loading quiz history:', err);
        error.value = 'Failed to load quiz history. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    

    onMounted(() => {
      loadQuizHistory();
    });

    return {
      quizHistory,
      loading,
      error,
      selectedAttempt,
      formatDate
    };
  }
};
</script> 