<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">Quiz Analysis Reports</h2>
    <h3 class="text-gray-500 text-sm mb-6">View and analyze quiz results for your classes. You can also view trends around students' answers and correct answers for each question.</h3>

    <!-- Teacher Overview Chart -->
    <div v-if="teacherOverviewData && teacherOverviewData.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Overall Class Performance Average</h3>
      <div class="h-72">
        <canvas ref="teacherOverviewChart"></canvas>
      </div>
    </div>
    <div v-else-if="loadingInitialOverview" class="min-h-[200px] flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md mb-8">
        <BaseAnimation type="loading" :loop="true" />
        <p class="text-gray-500 mt-2">Loading overall class performance...</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'standard'"
          :class="[
            activeTab === 'standard'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Standard Reports
        </button>
        <button
          v-if="isPaidUser"
          @click="activeTab = 'premium'"
          :class="[
            activeTab === 'premium'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Premium Reports
        </button>
      </nav>
    </div>

    <!-- Standard Reports Tab Content -->
    <div v-show="activeTab === 'standard'" class="space-y-6">
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

      <!-- Loader for Class Performance Across Quizzes -->
      <div v-if="selectedClass && loadingClassWidePerformance" class="min-h-[200px] flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md mt-4 mb-8">
        <BaseAnimation type="loading" :loop="true" />
        <p class="text-gray-500 mt-2">Loading class performance overview...</p>
      </div>
      <!-- Class Performance Across Quizzes Chart -->
      <div v-else-if="selectedClass && !loadingClassWidePerformance && reportData?.classQuizPerformances && reportData.classQuizPerformances.length > 0" class="bg-white rounded-lg shadow-md p-6 mt-4 mb-8">
        <h3 class="text-lg font-semibold mb-4">Class Performance Across All Quizzes (Class: {{ classes.find(c => c.id === selectedClass)?.name }})</h3>
        <div class="h-72">
          <canvas ref="classQuizPerformanceChart"></canvas>
        </div>
      </div>
      <div v-else-if="selectedClass && !loadingClassWidePerformance && (!reportData?.classQuizPerformances || reportData.classQuizPerformances.length === 0)" class="text-center text-gray-500 py-4 mt-4 mb-8 border rounded-lg p-6">
        No performance data found across quizzes for this class.
      </div>

      <!-- Loader for Average Quiz Duration -->
      <div v-if="selectedClass && loadingClassWideDurations" class="min-h-[200px] flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md mb-8">
        <BaseAnimation type="loading" :loop="true" />
        <p class="text-gray-500 mt-2">Loading average quiz durations...</p>
      </div>
      <!-- Average Quiz Duration Chart -->
      <div v-else-if="selectedClass && !loadingClassWideDurations && reportData?.averageQuizDurations && reportData.averageQuizDurations.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4">Average Quiz Completion Time per Quiz (Class: {{ classes.find(c => c.id === selectedClass)?.name }})</h3>
        <div class="h-64">
          <canvas ref="averageDurationChart"></canvas>
        </div>
      </div>
       <div v-else-if="selectedClass && !loadingClassWideDurations && (!reportData?.averageQuizDurations || reportData.averageQuizDurations.length === 0)" class="text-center text-gray-500 py-4 mb-8 border rounded-lg p-6">
        No quiz duration data found for this class.
      </div>
      
      <!-- Quiz Selection (Only show if a class is selected) -->
      <div v-if="selectedClass" class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
        <select 
          v-model="selectedQuiz" 
          @change="loadReport"
          class="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          :disabled="quizzes.length === 0"
        >
          <option value="">{{ quizzes.length === 0 ? 'No quizzes in this class' : 'Select a Quiz' }}</option>
          <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
            {{ quiz.title }}
          </option>
        </select>
      </div>

      <!-- NEW: Numerical Display for Average Score on Selected Quiz -->
      <div v-if="selectedQuiz && reportData?.classPerformance && reportData.classPerformance[selectedClass]" class="mt-0 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h4 class="text-md font-semibold text-gray-700">Average Score for "{{ quizzes.find(q => q.id === selectedQuiz)?.title }}" in {{ classes.find(c => c.id === selectedClass)?.name }}: 
          <span class="text-xl font-bold text-primary-600">{{ reportData.classPerformance[selectedClass].averageScore.toFixed(1) }}%</span>
          <span class="text-sm text-gray-500 ml-2"> ({{ reportData.classPerformance[selectedClass].totalAttempts }} attempt{{ reportData.classPerformance[selectedClass].totalAttempts === 1 ? '' : 's' }})</span>
        </h4>
      </div>

      <!-- Loading State for quiz-specific reports -->
      <div v-if="selectedQuiz && loading" class="min-h-[400px] flex flex-col items-center justify-center p-6">
        <BaseAnimation type="loading" :loop="true" />
        <p class="text-gray-500 mt-2">Loading quiz report...</p>
      </div>

      <!-- Quiz-Specific Report Content (Only show if a quiz is selected and not loading) -->
      <div v-else-if="selectedQuiz && !loading && reportData?.questions && reportData.questions.length > 0" class="space-y-8">
        <!-- Question Difficulty Chart -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">Question Difficulty Analysis (Quiz: {{ quizzes.find(q => q.id === selectedQuiz)?.title }})</h3>
          <div class="h-64">
            <canvas ref="difficultyChart"></canvas>
          </div>
        </div>

        <!-- NEW: Time Spent per Quiz Attempt Chart -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">Time Spent per Attempt (Quiz: {{ quizzes.find(q => q.id === selectedQuiz)?.title }})</h3>
          <div class="h-96"> <!-- Increased height for potentially many bars -->
            <canvas ref="quizAttemptTimeChart"></canvas> <!-- Changed ref from classChart -->
          </div>
        </div>

        <!-- Question Details Table -->
        <div class="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">Question Details (Quiz: {{ quizzes.find(q => q.id === selectedQuiz)?.title }})</h3>
          <table class="min-w-full divide-y divide-gray-200 ">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correct Rate</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wrong Answer Distribution</th> 
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
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="question.wrongAnswerDistribution && question.wrongAnswerDistribution.length > 0">
                    <div v-for="distItem in question.wrongAnswerDistribution" :key="distItem.optionText" class="text-red-600">
                      {{ distItem.optionText }}: {{ distItem.count }}
                    </div>
                  </div>
                  <div v-else class="text-green-600">
                    N/A
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else-if="selectedQuiz && !loading && (!reportData?.questions || reportData.questions.length === 0)" class="text-center text-gray-500 py-8">
        No detailed report data found for this quiz, or the quiz has no questions.
      </div>

      <!-- General messages if nothing specific is to be shown -->
      <div v-if="!selectedClass && !loadingInitialOverview" class="text-center text-gray-500 py-8">
        Select a class to begin viewing reports.
      </div>

    </div>

    <!-- Premium Reports Tab Content -->
    <div v-if="isPaidUser" v-show="activeTab === 'premium'" class="space-y-6">
      <h3 class="text-xl font-semibold">Premium Reports</h3>
      <p class="text-gray-600">Advanced reporting and analytics for paid users.</p>

      <!-- Class and Quiz selection are still primary filters from Standard tab -->
      <div v-if="!selectedClass || !selectedQuiz" class="text-center text-gray-500 py-8">
        Please select a class and a quiz from the Standard Reports tab to view student rankings.
      </div>

      <!-- Student Ranking Table -->
      <div v-if="selectedClass && selectedQuiz && studentRankingData && studentRankingData.length > 0" class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h4 class="text-lg font-semibold mb-4">Student Ranking for {{ quizzes.find(q => q.id === selectedQuiz)?.title }} in {{ classes.find(c => c.id === selectedClass)?.name }}</h4>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Highest Score %</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Highest Score</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(student, index) in studentRankingData" :key="student.studentId">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.studentName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.highestScore.toFixed(1) }}%</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(student.attemptTimestamp).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="selectedClass && selectedQuiz" class="text-center text-gray-500 py-4">
        No submission data available for ranking for the selected quiz and class.
      </div>

      <!-- Student Performance Trend Chart -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h4 class="text-lg font-semibold mb-2">Student Performance Trend</h4>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
          <select 
            v-model="selectedStudentIdForTrend"
            @change="loadStudentPerformanceTrend"
            class="w-full md:w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            :disabled="availableStudents.length === 0"
          >
            <option value="">{{ availableStudents.length === 0 ? 'No students with attempts' : 'Select a student' }}</option>
            <option v-for="student in availableStudents" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.id.substring(0,6) }}...)
            </option>
          </select>
        </div>
        <div v-if="selectedStudentIdForTrend && studentTrendData" class="h-72">
          <canvas ref="studentTrendChart"></canvas>
        </div>
        <div v-else-if="selectedStudentIdForTrend && !studentTrendData" class="text-center text-gray-500 py-4">
          Loading trend data or no attempts found for this student.
        </div>
         <div v-else class="text-center text-gray-500 py-4">
          Select a student to view their performance trend over time.
        </div>
      </div>

      <div v-if="!isPaidUser" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
        <p class="font-bold">Coming Soon!</p>
        <p>Exciting premium reports are under development.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useAuth } from '../stores/auth';
import BaseAnimation from './services/BaseAnimation.vue';
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
    const activeTab = ref('standard');

    // NEW refs for additional reports
    const averageDurationChart = ref(null);
    let averageDurationChartInstance = null;
    const studentRankingData = ref(null);
    const selectedStudentIdForTrend = ref('');
    const studentTrendData = ref(null);
    const studentTrendChart = ref(null);
    let studentTrendChartInstance = null;
    const availableStudents = ref([]);
    const classQuizPerformanceChart = ref(null);
    let classQuizPerformanceChartInstance = null;

    // NEW: For Teacher Overview Chart
    const teacherOverviewChart = ref(null);
    let teacherOverviewChartInstance = null;
    const teacherOverviewData = ref(null);
    const loadingInitialOverview = ref(false);

    // NEW: For Quiz Attempt Time Chart
    const quizAttemptTimeChart = ref(null);
    let quizAttemptTimeChartInstance = null;

    // Dedicated loaders for class-wide reports shown under class dropdown
    const loadingClassWidePerformance = ref(false);
    const loadingClassWideDurations = ref(false);

    const isPaidUser = computed(() => user.value?.paid === true);

    const populateAvailableStudents = async () => {
      if (!user.value) return;
      // This could be optimized, e.g., by fetching only necessary fields or caching
      // For now, fetch all submissions by teacher to get student names
      try {
        const allSubmissions = await FirebaseService.getTeacherSubmissions(user.value.uid, null, null);
        if (allSubmissions && allSubmissions.length > 0) {
          const uniqueStudents = allSubmissions.reduce((acc, sub) => {
            if (sub.userId && sub.studentName && !acc.find(s => s.id === sub.userId)) {
              acc.push({ id: sub.userId, name: sub.studentName });
            }
            return acc;
          }, []);
          availableStudents.value = uniqueStudents.sort((a,b) => a.name.localeCompare(b.name));
        } else {
          availableStudents.value = [];
        }
      } catch (error) {
        console.error('Error populating available students:', error);
        availableStudents.value = [];
      }
    };

    const loadClasses = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const response = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true
        });
        
        if (!response || !response.classes) {
          classes.value = [];
          return;
        }
        
        classes.value = response.classes.map(classData => ({
          id: classData.id,
          name: classData.name,
          quizzes: classData.quizzes || []
        }));
      } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes');
      } finally {
        loading.value = false;
      }
    };

    const loadQuizzes = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const response = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true
        });
        
        if (!response || !response.classes) {
          quizzes.value = [];
          return;
        }
        
        if (selectedClass.value) {
          // Filter quizzes for selected class
          const selectedClassData = response.classes.find(c => c.id === selectedClass.value);
          quizzes.value = selectedClassData?.quizzes || [];
        } else {
          // Get all quizzes from all classes
          quizzes.value = response.classes.flatMap(classData => 
            (classData.quizzes || []).map(quiz => ({
              ...quiz,
              className: classData.name,
              classId: classData.id
            }))
          );
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
        showError('Failed to load quizzes');
      } finally {
        loading.value = false;
      }
    };

    const loadReport = async () => {
      if (!selectedQuiz.value) return;
      
      if (!selectedClass.value) {
        if (reportData.value) {
            reportData.value.questions = [];
            reportData.value.classPerformance = {};
            // These are class-wide, but loadReport is quiz-specific; they are managed by loadClassWideReports
            // reportData.value.averageQuizDurations = null; 
            // reportData.value.classQuizPerformances = null;
        }
        if (difficultyChartInstance) difficultyChartInstance.destroy();
        if (classChartInstance) classChartInstance.destroy();
        // Do not destroy class-wide charts here as a class might still be selected.
        loading.value = false;
        return;
      }

      loading.value = true; // Main loader for quiz-specific section
      
      // Preserve existing class-wide data if available
      const existingAverageDurations = reportData.value?.averageQuizDurations;
      const existingClassQuizPerformances = reportData.value?.classQuizPerformances;

      try {
        const submissions = await FirebaseService.getTeacherSubmissions(
          user.value.uid,
          selectedClass.value, 
          selectedQuiz.value
        );
        const quiz = await FirebaseService.getQuiz(selectedQuiz.value);
        
        if (!quiz || !quiz.questions) {
          if (reportData.value) {
            reportData.value.questions = [];
            reportData.value.classPerformance = {};
          } else {
            reportData.value = {
                questions: [],
                classPerformance: {},
                averageQuizDurations: existingAverageDurations, // Carry over
                classQuizPerformances: existingClassQuizPerformances // Carry over
            };
          }
          loading.value = false;
          return;
        }
        
        const analysis = analyzeQuizData(submissions, quiz); // For quiz-specific question details & single-quiz class performance
        
        reportData.value = {
            questions: analysis.questions,
            classPerformance: analysis.classPerformance, // This is for the selected quiz
            averageQuizDurations: existingAverageDurations, // Carry over class-wide data
            classQuizPerformances: existingClassQuizPerformances, // Carry over class-wide data
            attemptTimes: analysis.attemptTimes
        };
        
        await nextTick();
        
        setTimeout(() => {
          if (reportData.value) { // Ensure reportData is populated
            updateCharts({ 
                questions: reportData.value.questions, 
                classPerformance: reportData.value.classPerformance, // Still needed for the numerical average score
                attemptTimes: reportData.value.attemptTimes // Pass data for the new chart
            }); 
          } else {
          }
        }, 100);

        if (activeTab.value === 'premium' && selectedClass.value && selectedQuiz.value) {
            loadStudentRankingReport(submissions);
        }

      } catch (error) {
        // Attempt to reset to a state with class-wide data if it existed
        reportData.value = {
            questions: [],
            classPerformance: {},
            averageQuizDurations: existingAverageDurations,
            classQuizPerformances: existingClassQuizPerformances
        };
      } finally {
        loading.value = false; // Main loader for quiz-specific section
      }
    };

    const analyzeQuizData = (submissions, quiz) => {
      // --- CRITICAL LOGS FOR INPUT DATA ---
      if (submissions && submissions.length > 0) {
        if (submissions[0]?.questions && submissions[0]?.questions.length > 0) {
        }
      } else {
      }
      // --- END CRITICAL LOGS ---

      if (!submissions || submissions.length === 0 || !quiz || !quiz.questions || quiz.questions.length === 0) {
        return {
          questions: [],
          classPerformance: {}
        };
      }

      const questionAnalysis = quiz.questions.map((question, questionIndex) => {
        
        const actualCorrectIndex = question.correctIndex; // from quiz.questions[questionIndex].correctIndex

        const answers = submissions.map(sub => {
          const studentQuestionAttempt = sub.questions?.[questionIndex];
          let studentSelectedAnswerIndex = studentQuestionAttempt?.selectedAnswer;
          let isStudentCorrect = false;

          if (typeof studentSelectedAnswerIndex === 'number' && typeof actualCorrectIndex === 'number') {
            isStudentCorrect = (studentSelectedAnswerIndex === actualCorrectIndex);
          }
          
          
          return {
            isCorrect: isStudentCorrect,
            selectedAnswerIndex: studentSelectedAnswerIndex 
          };
        });

        const correctCount = answers.filter(a => a.isCorrect === true).length;
        const totalAnswers = answers.length;
        const correctRate = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

        const wrongAnswerIndices = answers
          .filter(a => !a.isCorrect && typeof a.selectedAnswerIndex === 'number')
          .map(a => a.selectedAnswerIndex);
        
        const wrongAnswerCounts = wrongAnswerIndices.reduce((acc, answerIndex) => {
          acc[answerIndex] = (acc[answerIndex] || 0) + 1;
          return acc;
        }, {});
        
        const wrongAnswerDistribution = [];
        if (question.options && question.options.length > 0) {
          for (const answerIndexStr in wrongAnswerCounts) {
            const answerIndex = parseInt(answerIndexStr); // Ensure it's a number for array lookup
            const count = wrongAnswerCounts[answerIndexStr];
            

            if (question.options[answerIndex] && typeof question.options[answerIndex].text !== 'undefined') {
              wrongAnswerDistribution.push({
                optionText: question.options[answerIndex].text,
                count: count,
              });
            } else {
            }
          }
          wrongAnswerDistribution.sort((a, b) => b.count - a.count); 
        } else {
        }

        return {
          text: question.text,
          correctRate,
          wrongAnswerDistribution 
        };
      });

      // Class performance on THIS quiz (for the numerical display)
      const classPerformanceOnQuiz = {}; // Renamed for clarity
      if (selectedClass.value && submissions.length > 0) { // Ensure submissions are for the selected class context
          // Filter submissions again *just in case* `getTeacherSubmissions` didn't filter by class if classId was null earlier
          // Though loadReport should always pass a classId if a quiz is selected.
          const relevantSubmissions = submissions.filter(s => s.classId === selectedClass.value);
          
          if (relevantSubmissions.length > 0) {
            classPerformanceOnQuiz[selectedClass.value] = {
                name: relevantSubmissions[0].className || classes.value.find(c => c.id === selectedClass.value)?.name || 'Selected Class',
                totalAttempts: 0,
                totalCorrectAnswers: 0,
                totalPossibleAnswers: 0,
            };
            relevantSubmissions.forEach(sub => {
                const attemptScore = sub.correctAnswers || 0; 
                const attemptQuestionCount = sub.questionCount || quiz.questions.length; 
                classPerformanceOnQuiz[selectedClass.value].totalAttempts++;
                classPerformanceOnQuiz[selectedClass.value].totalCorrectAnswers += attemptScore;
                classPerformanceOnQuiz[selectedClass.value].totalPossibleAnswers += attemptQuestionCount;
            });
            const perf = classPerformanceOnQuiz[selectedClass.value];
            perf.averageScore = perf.totalPossibleAnswers > 0 
              ? Math.round((perf.totalCorrectAnswers / perf.totalPossibleAnswers) * 100) 
              : 0;
          }
      }

      // NEW: Extract time spent per attempt for the selected quiz
      const attemptTimes = submissions.map(sub => ({
        submissionId: sub.id,
        studentName: sub.studentName || 'Unknown Student', // Assuming getTeacherSubmissions provides studentName
        timeSpentMinutes: sub.timeSpent ? (parseFloat(sub.timeSpent) / 60).toFixed(2) : 0, // timeSpent is in seconds
        rawTimeSpent: parseFloat(sub.timeSpent || 0)
      })).sort((a,b) => a.rawTimeSpent - b.rawTimeSpent); // Sort by time spent, shortest first

      return {
        questions: questionAnalysis,
        classPerformance: classPerformanceOnQuiz, // Used for the numerical average score
        attemptTimes // New data for the time spent chart
      };
    };

    const updateCharts = (currentReportData) => { 
      // Update Difficulty Chart
      if (difficultyChartInstance) {
        difficultyChartInstance.destroy();
        difficultyChartInstance = null;
      }
      if (difficultyChart.value && currentReportData?.questions && currentReportData.questions.length > 0) {
        const difficultyCtx = difficultyChart.value.getContext('2d');
        
        const difficultyData = {
          labels: currentReportData.questions.map((q, i) => `Q${i + 1}`),
          datasets: [{
            label: 'Correct Rate (%)',
            data: currentReportData.questions.map(q => q.correctRate),
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
        console.warn('[updateCharts] Difficulty chart canvas or data not available.');
      }

      // The old classChart (single bar for class perf on quiz) is being replaced.
      // Its instance (classChartInstance) will now be quizAttemptTimeChartInstance.
      // Its canvas ref (classChart) will now be quizAttemptTimeChart.
      // So, we destroy the old one if it exists from a previous type of chart on that canvas
      if (quizAttemptTimeChartInstance) { // Use the new instance name
        quizAttemptTimeChartInstance.destroy();
        quizAttemptTimeChartInstance = null;
      }
      // Call the new update function for the attempt time chart
      if (quizAttemptTimeChart.value && currentReportData?.attemptTimes) {
           updateQuizAttemptTimeChart(currentReportData.attemptTimes);
      } else {
          console.warn('[updateCharts] Quiz Attempt Time chart canvas or data not available.');
           // Ensure any old chart on this canvas is cleared if data is not available
          if (quizAttemptTimeChart.value && quizAttemptTimeChartInstance) {
            quizAttemptTimeChartInstance.destroy();
            quizAttemptTimeChartInstance = null;
          }
      }
    };

    const updateQuizAttemptTimeChart = (attemptTimesData) => {
      if (quizAttemptTimeChartInstance) { 
          quizAttemptTimeChartInstance.destroy();
          quizAttemptTimeChartInstance = null;
      }
      if (!quizAttemptTimeChart.value || !attemptTimesData || attemptTimesData.length === 0) {
          console.error("[updateQuizAttemptTimeChart] Canvas element not found or no attempt time data for scatter plot.");
          return;
      }
      try {
          const ctx = quizAttemptTimeChart.value.getContext('2d');
          if (!ctx) {
              console.error("[updateQuizAttemptTimeChart] Failed to get 2D context from canvas.");
              return;
          }

          const scatterData = attemptTimesData.map((att, index) => ({
            x: index, // Use index for x-axis to spread points
            y: parseFloat(att.timeSpentMinutes), 
            studentName: att.studentName,
            submissionId: att.submissionId
          }));

          quizAttemptTimeChartInstance = new Chart(ctx, {
              type: 'scatter',
              data: {
                  datasets: [{
                      label: 'Time Spent per Attempt',
                      data: scatterData,
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgb(75, 192, 192)',
                      pointRadius: 5,
                      pointHoverRadius: 7
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      y: { // Time Spent (minutes)
                          beginAtZero: true,
                          title: { display: true, text: 'Time Spent (minutes)' }
                      },
                      x: { // Attempt Index
                          type: 'linear', // Ensure x-axis is treated as linear for scatter
                          title: { display: true, text: 'Attempt Sequence' },
                          ticks: {
                            // Hide ticks or format them if they don't represent a meaningful value other than sequence
                            callback: function(value, index, values) {
                                // Only show ticks for every N attempts or not at all if too cluttered
                                // For now, let's just show the index.
                                // return attemptTimesData[value]?.studentName || value; // This might be too much
                                return `Attempt ${value + 1}`;
                            }
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          display: true // Or false, label is in dataset
                      },
                      tooltip: {
                          callbacks: {
                              title: function(tooltipItems) {
                                  // const dataPoint = tooltipItems[0].raw;
                                  // return `Student: ${dataPoint.studentName}`;
                                  return ''; // Keep it clean, main info in label
                              },
                              label: function(context) {
                                  const dataPoint = context.raw;
                                  let label = `${dataPoint.studentName}: ${dataPoint.y.toFixed(2)} minutes`;
                                  return label;
                              }
                          }
                      }
                  }
              }
          });
      } catch (error) {
          console.error("[updateQuizAttemptTimeChart] Error creating Quiz Attempt Time scatter chart:", error);
      }
    };

    const analyzeAverageQuizDurations = (submissions, allClasses, allQuizzes) => {
        if (!submissions || submissions.length === 0) return null;

        const durationsByQuiz = submissions.reduce((acc, sub) => {
            if (sub.quizId && sub.timeSpent !== undefined && sub.timeSpent !== null) {
                if (!acc[sub.quizId]) {
                    acc[sub.quizId] = {
                        totalTime: 0,
                        count: 0,
                        quizTitle: allQuizzes.find(q => q.id === sub.quizId)?.title || sub.quizTitle || sub.quizId,
                        // Ensure quizTitle is available; might need to fetch if not on sub
                    };
                }
                acc[sub.quizId].totalTime += Number(sub.timeSpent); // Ensure timeSpent is a number
                acc[sub.quizId].count++;
            }
            return acc;
        }, {});

        const result = Object.values(durationsByQuiz).map(item => ({
            quizId: Object.keys(durationsByQuiz).find(key => durationsByQuiz[key] === item), // A bit convoluted way to get key back
            quizTitle: item.quizTitle,
            averageDuration: item.count > 0 ? (item.totalTime / item.count) / 60 : 0 // in minutes
        })).sort((a,b) => a.quizTitle.localeCompare(b.quizTitle)); // Sort by quiz title for consistent chart order

        return result.length > 0 ? result : null;
    };
    
    const updateAverageDurationChart = (durationData) => {
        if (averageDurationChartInstance) {
            averageDurationChartInstance.destroy();
            averageDurationChartInstance = null;
        }
        // Ensure canvas ref is valid AND data is present
        if (!averageDurationChart.value || !durationData || durationData.length === 0) {
            return;
        }
        try {
            const ctx = averageDurationChart.value.getContext('2d');
            if (!ctx) {
                console.error("[updateAverageDurationChart] Failed to get 2D context from canvas.");
                return;
            }
            averageDurationChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: durationData.map(d => d.quizTitle),
                    datasets: [{
                        label: 'Average Completion Time (minutes)',
                        data: durationData.map(d => d.averageDuration.toFixed(2)),
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Avg. Time (minutes)' }
                        },
                        x: {
                            title: { display: true, text: 'Quiz' }
                        }
                    }
                }
            });
        } catch (error) {
        }
    };

    const loadStudentRankingReport = async (submissionsForRanking) => {
        // If submissions are not passed, e.g. when tab is switched, re-fetch
        let submissions = submissionsForRanking;
        if (!submissions && selectedClass.value && selectedQuiz.value) {
             submissions = await FirebaseService.getTeacherSubmissions(
                user.value.uid,
                selectedClass.value,
                selectedQuiz.value
            );
        }

        if (!submissions || submissions.length === 0) {
            studentRankingData.value = [];
            return;
        }

        const studentScores = submissions.reduce((acc, sub) => {
            const score = parseFloat(sub.score); // score is already a percentage 0-100
            const studentId = sub.userId;
            const studentName = sub.studentName || 'Unknown Student';
            const attemptTimestamp = sub.timestamp;

            if (!acc[studentId] || score > acc[studentId].highestScore || (score === acc[studentId].highestScore && attemptTimestamp > acc[studentId].attemptTimestamp) ) {
                acc[studentId] = {
                    studentId,
                    studentName,
                    highestScore: score,
                    attemptTimestamp
                };
            }
            return acc;
        }, {});

        studentRankingData.value = Object.values(studentScores)
            .sort((a, b) => b.highestScore - a.highestScore || a.studentName.localeCompare(b.studentName));
    };

    const loadStudentPerformanceTrend = async () => {
        if (!selectedStudentIdForTrend.value) {
            studentTrendData.value = null;
            if (studentTrendChartInstance) studentTrendChartInstance.destroy();
            return;
        }
        loading.value = true; // Consider a more specific loading state for this chart
        try {
            const attempts = await FirebaseService.getQuizAttemptsByUser(selectedStudentIdForTrend.value);
            if (!attempts || attempts.length === 0) {
                studentTrendData.value = null; // No data to display
                if (studentTrendChartInstance) studentTrendChartInstance.destroy();
                loading.value = false;
                return;
            }

            const processedAttempts = attempts
                .map(att => ({
                    quizTitle: att.quizTitle || 'Unknown Quiz', // Ensure quizTitle exists
                    score: parseFloat(att.score), // score is 0-100
                    timestamp: att.timestamp instanceof Date ? att.timestamp : new Date(att.timestamp)
                }))
                .sort((a, b) => a.timestamp - b.timestamp); // Sort by date

            studentTrendData.value = {
                labels: processedAttempts.map(att => `${att.quizTitle} (${att.timestamp.toLocaleDateString()})`),
                scores: processedAttempts.map(att => att.score.toFixed(1))
            };
            
            await nextTick();
            updateStudentTrendChart();

        } catch (error) {
            console.error('Error loading student performance trend:', error);
            studentTrendData.value = null;
        } finally {
            loading.value = false;
        }
    };
    
    const updateStudentTrendChart = () => {
        if (studentTrendChartInstance) {
            studentTrendChartInstance.destroy();
        }
        if (!studentTrendChart.value || !studentTrendData.value) {
            return;
        }
        const ctx = studentTrendChart.value.getContext('2d');
        studentTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: studentTrendData.value.labels,
                datasets: [{
                    label: 'Score %',
                    data: studentTrendData.value.scores,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Score %' }
                    },
                    x: {
                        title: { display: true, text: 'Quiz Attempt (Sorted by Date)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                // Show full label in tooltip as x-axis might truncate
                                return studentTrendData.value.labels[tooltipItems[0].dataIndex];
                            }
                        }
                    }
                }
            }
        });
    };

    const analyzeClassQuizPerformance = (classSubmissions, quizzesInClass) => {
        if (!classSubmissions || classSubmissions.length === 0 || !quizzesInClass || quizzesInClass.length === 0) {
            return null;
        }

        const performanceByQuiz = quizzesInClass.map(quiz => {
            const attemptsForThisQuiz = classSubmissions.filter(sub => sub.quizId === quiz.id);
            let totalScore = 0;
            let numAttempts = 0;

            attemptsForThisQuiz.forEach(attempt => {
                // Assuming attempt.score is a percentage (0-100)
                // If not, calculate from attempt.correctAnswers and attempt.questionCount
                totalScore += parseFloat(attempt.score || 0);
                numAttempts++;
            });

            return {
                quizId: quiz.id,
                quizTitle: quiz.title || 'Unnamed Quiz',
                averageScore: numAttempts > 0 ? (totalScore / numAttempts) : 0,
                numAttempts: numAttempts
            };
        });
        // Filter out quizzes with no attempts for this class, or sort as needed
        return performanceByQuiz.filter(p => p.numAttempts > 0).sort((a,b) => a.quizTitle.localeCompare(b.quizTitle));
    };

    const updateClassQuizPerformanceChart = (performanceData) => {
        if (classQuizPerformanceChartInstance) {
            classQuizPerformanceChartInstance.destroy();
            classQuizPerformanceChartInstance = null;
        }
        // Ensure canvas ref is valid AND data is present before trying to create chart
        if (!classQuizPerformanceChart.value || !performanceData || performanceData.length === 0) {
            return;
        }
        try {
            const ctx = classQuizPerformanceChart.value.getContext('2d');
            if (!ctx) {
                return;
            }
            classQuizPerformanceChartInstance = new Chart(ctx, {
                type: 'bar', 
                data: {
                    labels: performanceData.map(p => p.quizTitle),
                    datasets: [{
                        label: 'Average Score %',
                        data: performanceData.map(p => p.averageScore.toFixed(1)),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgb(153, 102, 255)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Average Score %' }
                        },
                        x: {
                            title: { display: true, text: 'Quiz Title' }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y + '%';
                                    }
                                    const attempts = performanceData[context.dataIndex]?.numAttempts;
                                    if (attempts !== undefined) {
                                       label += ` (${attempts} attempt${attempts === 1 ? '' : 's'})`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
        }
    };

    const loadTeacherOverviewReport = async () => {
      if (!user.value) return;
      loadingInitialOverview.value = true;
      teacherOverviewData.value = null;
      try {
        // 1. Get all classes for the teacher
        const classResponse = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: false // We don't need quiz details on class objects for this overview
        });
        if (!classResponse || !classResponse.classes || classResponse.classes.length === 0) {
          teacherOverviewData.value = []; // Set to empty to hide loader
          loadingInitialOverview.value = false;
          return;
        }
        const teacherClasses = classResponse.classes;

        // 2. Get all submissions for the teacher
        // This might be a lot of data for teachers with many students/submissions.
        // Consider if FirebaseService can provide a more aggregated query in the future.
        const allSubmissions = await FirebaseService.getTeacherSubmissions(user.value.uid, null, null);

        if (!allSubmissions || allSubmissions.length === 0) {
          // Create overview data with 0 scores if classes exist but no submissions
          teacherOverviewData.value = teacherClasses.map(cls => ({
            classId: cls.id,
            className: cls.name,
            overallAverageScore: 0,
            totalAttempts: 0
          }));
          loadingInitialOverview.value = false;
          if (teacherOverviewData.value.length > 0) await nextTick(); updateTeacherOverviewChart();
          return;
        }

        // 3. Process submissions to calculate overall average score per class
        const overviewData = teacherClasses.map(cls => {
          const submissionsForThisClass = allSubmissions.filter(sub => sub.classId === cls.id);
          let totalScoreSum = 0;
          const numAttempts = submissionsForThisClass.length;

          submissionsForThisClass.forEach(sub => {
            totalScoreSum += parseFloat(sub.score || 0); // Assuming sub.score is 0-100 percentage
          });

          return {
            classId: cls.id,
            className: cls.name,
            overallAverageScore: numAttempts > 0 ? (totalScoreSum / numAttempts) : 0,
            totalAttempts: numAttempts
          };
        });

        teacherOverviewData.value = overviewData.sort((a,b) => a.className.localeCompare(b.className));
        await nextTick();
        updateTeacherOverviewChart();

      } catch (error) {
        teacherOverviewData.value = []; // Set to empty to hide loader on error
      } finally {
        loadingInitialOverview.value = false;
      }
    };

    const updateTeacherOverviewChart = () => {
      if (teacherOverviewChartInstance) {
        teacherOverviewChartInstance.destroy();
      }
      if (!teacherOverviewChart.value || !teacherOverviewData.value || teacherOverviewData.value.length === 0) {
        return;
      }
      const ctx = teacherOverviewChart.value.getContext('2d');
      // Use teacherOverviewData.value for color generation length, as it's what's being plotted.
      const numberOfBars = teacherOverviewData.value.length;

      teacherOverviewChartInstance = new Chart(ctx, {
        type: 'bar', 
        data: {
          labels: teacherOverviewData.value.map(cls => cls.className),
          datasets: [{
            label: 'Overall Average Score %',
            data: teacherOverviewData.value.map(cls => cls.overallAverageScore.toFixed(1)),
            backgroundColor: teacherOverviewData.value.map((_, index) => `hsl(${(index * 360 / numberOfBars)}, 70%, 60%)`), 
            borderColor: teacherOverviewData.value.map((_, index) => `hsl(${(index * 360 / numberOfBars)}, 70%, 40%)`),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'x', // Can be 'y' for horizontal bars
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: 'Average Score %' }
            },
            x: {
              title: { display: true, text: 'Class Name' }
            }
          },
          plugins: {
            legend: {
              display: false // Or true if you want to show the label if there's only one dataset
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + '%';
                  }
                  const attempts = teacherOverviewData.value[context.dataIndex]?.totalAttempts;
                  if (attempts !== undefined) {
                     label += ` (${attempts} total attempt${attempts === 1 ? '' : 's'} in class)`;
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    };

    const loadClassWideReports = async (classId, quizzesForClassArg) => {
        if (!classId || !user.value) return;
        loadingClassWidePerformance.value = true;
        loadingClassWideDurations.value = true;
        try {
            const classSubmissions = await FirebaseService.getTeacherSubmissions(user.value.uid, classId, null);

            // Use the passed quizzesForClassArg directly
            const currentQuizzesForClass = quizzesForClassArg || []; // Fallback if undefined, though it should be passed
            
            const durations = analyzeAverageQuizDurations(classSubmissions, classes.value, currentQuizzesForClass);
            loadingClassWideDurations.value = false; // Durations data ready or null

            const classPerf = analyzeClassQuizPerformance(classSubmissions, currentQuizzesForClass);
            loadingClassWidePerformance.value = false; // Performance data ready or null

            const existingQuestions = reportData.value?.questions || [];
            const existingSingleQuizClassPerformance = reportData.value?.classPerformance || {};

            reportData.value = {
                questions: existingQuestions, 
                classPerformance: existingSingleQuizClassPerformance, 
                averageQuizDurations: durations,
                classQuizPerformances: classPerf
            };

        } catch (e) {
            if(reportData.value) {
                reportData.value.averageQuizDurations = null;
                reportData.value.classQuizPerformances = null;
            } else {
                reportData.value = { averageQuizDurations: null, classQuizPerformances: null, questions: [], classPerformance: {} };
            }
        } finally {
            // Ensure loaders are false even if an intermediate step returned early
            loadingClassWidePerformance.value = false;
            loadingClassWideDurations.value = false;
        }
    };

    // NEW: Watchers for reportData properties to update charts
    watch(() => reportData.value?.averageQuizDurations, async (newDurations) => {
        if (newDurations && newDurations.length > 0) { // Ensure there's actual data
            await nextTick(); // Ensure canvas is ready if v-if just became true
            if (averageDurationChart.value) { // Double check ref
                updateAverageDurationChart(newDurations);
            } else {
                console.error("[Watcher] averageDurationChart.value is null even after nextTick. Chart cannot be updated.");
            }
        } else if ((!newDurations || newDurations.length === 0) && averageDurationChartInstance) {
            averageDurationChartInstance.destroy();
            averageDurationChartInstance = null; // Ensure instance is reset
        }
    }, { deep: true });

    watch(() => reportData.value?.classQuizPerformances, async (newClassPerf) => {
        if (newClassPerf && newClassPerf.length > 0) { // Ensure there's actual data to plot
            await nextTick(); // Ensure canvas is ready
            if (classQuizPerformanceChart.value) { // Double check ref before calling update
                 updateClassQuizPerformanceChart(newClassPerf);
            } else {
            }
        } else if ((!newClassPerf || newClassPerf.length === 0) && classQuizPerformanceChartInstance) {
            classQuizPerformanceChartInstance.destroy();
            classQuizPerformanceChartInstance = null; // Ensure instance is reset
        }
    }, { deep: true });

    watch(activeTab, async (newTab, oldTab) => {
        if (newTab === 'premium') {
            if (availableStudents.value.length === 0) { // Populate if not already done
                 await populateAvailableStudents();
            }
            if (selectedClass.value && selectedQuiz.value) {
                // Submissions for ranking would have been fetched by loadReport if quiz was selected
                // Or re-fetch if navigating to tab.
                const submissions = await FirebaseService.getTeacherSubmissions(user.value.uid, selectedClass.value, selectedQuiz.value);
                loadStudentRankingReport(submissions);
            }
        }
    });

    // Watch for student selection for trend chart
    watch(selectedStudentIdForTrend, (newStudentId) => {
      if (newStudentId) {
        loadStudentPerformanceTrend();
      } else {
        if(studentTrendChartInstance) studentTrendChartInstance.destroy();
        studentTrendData.value = null;
      }
    });

    onMounted(async () => {
      if (!user.value) return;
      await loadTeacherOverviewReport(); // Load this first
      await loadClasses();
      await populateAvailableStudents(); 
    });

    watch([selectedClass, selectedQuiz], async (newValues, oldValues) => {
      const newSelectedClass = newValues[0];
      const newSelectedQuiz = newValues[1];

      if (newSelectedClass && !newSelectedQuiz) { 
        await loadQuizzes(); // This updates reactive quizzes.value
        if (reportData.value) {
            reportData.value.questions = []; 
            reportData.value.classPerformance = {};
        }
        if (difficultyChartInstance) difficultyChartInstance.destroy();
        if (classChartInstance) classChartInstance.destroy();
        // Pass the just-loaded quizzes.value to loadClassWideReports
        await loadClassWideReports(newSelectedClass, quizzes.value);
      } else if (newSelectedClass && newSelectedQuiz) { 
        let quizzesForSelectedClass = quizzes.value.filter(q => q.classId === newSelectedClass);
        if (quizzesForSelectedClass.length === 0) { // If quizzes.value isn't populated for this class yet
            await loadQuizzes(); 
             // After loadQuizzes, quizzes.value should be updated, re-filter or pass quizzes.value if loadReport needs it
        }
        // loadReport itself will also need access to the correct quiz list for the selected class if it does class-wide calcs
        // However, loadReport has been modified to preserve class-wide data set by loadClassWideReports.
        // The main concern for loadReport is that `selectedQuiz` object is found in `quizzes.value` for its title etc.
        await loadReport(); 
      } else if (!newSelectedClass) { 
        quizzes.value = [];
        reportData.value = null; // This will trigger watchers to clear/destroy charts
        studentRankingData.value = null; 
        selectedStudentIdForTrend.value = ''; 
        // Explicitly destroy all chart instances when no class is selected
        if (difficultyChartInstance) difficultyChartInstance.destroy();
        if (classChartInstance) classChartInstance.destroy();
        if (averageDurationChartInstance) averageDurationChartInstance.destroy();
        if (classQuizPerformanceChartInstance) classQuizPerformanceChartInstance.destroy();
        if (studentTrendChartInstance) studentTrendChartInstance.destroy(); 
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
      classChart,
      activeTab,
      isPaidUser,
      // Expose new refs and methods
      averageDurationChart,
      studentRankingData,
      selectedStudentIdForTrend,
      studentTrendData,
      studentTrendChart,
      availableStudents,
      loadStudentPerformanceTrend, // might be called by @change directly
      classQuizPerformanceChart, // Expose new chart ref
      teacherOverviewChart,
      teacherOverviewData,
      loadingInitialOverview,
      // Expose dedicated loaders
      loadingClassWidePerformance,
      loadingClassWideDurations,
      quizAttemptTimeChart // Expose new chart ref
    };
  }
};
</script> 