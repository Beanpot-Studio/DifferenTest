<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">Quiz Analysis Reports</h2>
    
    <!-- Class Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
      <select 
        v-model="selectedClass" 
        @change="loadQuizzes"
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
        @change="loadReport"
        class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Select a Quiz</option>
        <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
          {{ quiz.title }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
      <BaseAnimation type="loading" :loop="true" />
    </div>

    <!-- Report Content -->
    <div v-else-if="selectedQuiz && reportData" class="space-y-8">
      <!-- Question Difficulty Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Question Difficulty Analysis</h3>
        <div class="h-64">
          <canvas ref="difficultyChart"></canvas>
        </div>
      </div>

      <!-- Class Performance Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Class Performance</h3>
        <div class="h-64">
          <canvas ref="classChart"></canvas>
        </div>
      </div>

      <!-- Question Details Table -->
      <div class="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Question Details</h3>
        <table class="min-w-full divide-y divide-gray-200 ">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correct Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Most Common Wrong Answer</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(question, index) in reportData.questions" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ question.text }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ question.correctRate }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="question.mostCommonWrongAnswer === 'N/A' ? 'text-green-600' : 'text-red-600'">
                {{ question.mostCommonWrongAnswer }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- No Data Message -->
    <div v-else-if="!loading" class="text-center text-gray-500 py-8">
      Select a quiz to view its analysis report
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useAuth } from '../stores/auth';
import BaseAnimation from './BaseAnimation.vue';
import FirebaseService from '../lib/firebaseService';
import Chart from 'chart.js/auto';

export default {
  name: 'TeacherReports',
  components: {
    BaseAnimation
  },
  setup() {
    const { user } = useAuth();
    const loading = ref(false);
    const classes = ref([]);
    const quizzes = ref([]);
    const selectedClass = ref('');
    const selectedQuiz = ref('');
    const reportData = ref(null);
    const difficultyChart = ref(null);
    const classChart = ref(null);
    let difficultyChartInstance = null;
    let classChartInstance = null;

    const loadClasses = async () => {
      try {
        const { classes: loadedClasses } = await FirebaseService.getTeacherClasses(user.value.uid);
        classes.value = loadedClasses;
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };

    const loadQuizzes = async () => {
      try {
        if (selectedClass.value) {
          quizzes.value = await FirebaseService.getClassQuizzes(selectedClass.value);
        } else {
          quizzes.value = await FirebaseService.getTeacherQuizzes(user.value.uid);
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    };

    const loadReport = async () => {
      if (!selectedQuiz.value) return;
      
      loading.value = true;
      try {
        
        // Get all submissions for the selected quiz
        const submissions = await FirebaseService.getTeacherSubmissions(
          user.value.uid,
          selectedClass.value,
          selectedQuiz.value
        );

        // Get quiz details
        const quiz = await FirebaseService.getQuiz(selectedQuiz.value);
        
        if (!quiz || !quiz.questions) {
          console.error('Quiz data is missing or invalid');
          return;
        }
        
        // Analyze the data
        const analysis = analyzeQuizData(submissions, quiz);
        
        // Set report data and wait for DOM update
        reportData.value = analysis;
        await nextTick();
        
        // Wait a bit longer to ensure canvas elements are mounted
        setTimeout(() => {
          if (!difficultyChart.value || !classChart.value) {
            console.error('Canvas elements not found after timeout');
            return;
          }
          updateCharts(analysis);
        }, 100);
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        loading.value = false;
      }
    };

    const analyzeQuizData = (submissions, quiz) => {
      
      if (!submissions || submissions.length === 0) {
        return {
          questions: [],
          classPerformance: {}
        };
      }

      const questionAnalysis = quiz.questions.map((question, index) => {
        const answers = submissions.map(sub => ({
          isCorrect: sub.questionResults?.[index]?.isCorrect,
          selectedAnswer: sub.questionResults?.[index]?.selectedAnswer
        }));

        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalAnswers = answers.length;
        const correctRate = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

        // Find most common wrong answer
        const wrongAnswers = answers.filter(a => !a.isCorrect).map(a => a.selectedAnswer);
        const wrongAnswerCounts = wrongAnswers.reduce((acc, answer) => {
          acc[answer] = (acc[answer] || 0) + 1;
          return acc;
        }, {});
        
        const mostCommonWrongAnswer = Object.entries(wrongAnswerCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
          text: question.text,
          correctRate,
          mostCommonWrongAnswer
        };
      });

      // Group by class
      const classPerformance = {};
      submissions.forEach(sub => {
        if (!classPerformance[sub.classId]) {
          classPerformance[sub.classId] = {
            name: sub.className,
            total: 0,
            correct: 0
          };
        }
        classPerformance[sub.classId].total++;
        classPerformance[sub.classId].correct += sub.correctAnswers;
      });

      return {
        questions: questionAnalysis,
        classPerformance
      };
    };

    const updateCharts = (analysis) => {
      
      // Update Difficulty Chart
      if (difficultyChartInstance) {
        difficultyChartInstance.destroy();
      }
      
      if (difficultyChart.value) {
        const difficultyCtx = difficultyChart.value.getContext('2d');
        
        const difficultyData = {
          labels: analysis.questions.map((q, i) => `Q${i + 1}`),
          datasets: [{
            label: 'Correct Rate (%)',
            data: analysis.questions.map(q => q.correctRate),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        };
        
        difficultyChartInstance = new Chart(difficultyCtx, {
          type: 'bar',
          data: difficultyData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Correct Rate (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Question Number'
                }
              }
            }
          }
        });
      } else {
        console.error('Difficulty chart canvas not found');
      }

      // Update Class Performance Chart
      if (classChartInstance) {
        classChartInstance.destroy();
      }
      
      if (classChart.value) {
        const classCtx = classChart.value.getContext('2d');
        const classData = Object.values(analysis.classPerformance);
        
        const performanceData = {
          labels: classData.map(c => c.name),
          datasets: [{
            label: 'Average Score (%)',
            data: classData.map(c => Math.round((c.correct / c.total) * 100)),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          }]
        };
        
        classChartInstance = new Chart(classCtx, {
          type: 'bar',
          data: performanceData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Average Score (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Class'
                }
              }
            }
          }
        });
      } else {
        console.error('Class performance chart canvas not found');
      }
    };

    onMounted(async () => {
      if (!user.value) return;
      await loadClasses();
    });

    watch([selectedClass, selectedQuiz], () => {
      if (selectedClass.value) {
        loadQuizzes();
      }
      if (selectedQuiz.value) {
        loadReport();
      }
    });

    return {
      loading,
      classes,
      quizzes,
      selectedClass,
      selectedQuiz,
      reportData,
      difficultyChart,
      classChart
    };
  }
};
</script> 