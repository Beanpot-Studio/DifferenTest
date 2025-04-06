<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Your Teaching Hub
          </h1>
          <p class="mt-6 text-xl max-w-3xl mx-auto">
            Create engaging quizzes, track student progress, and manage your classes all in one place.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stats.totalStudents }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Active Classes
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stats.activeClasses }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Average Quiz Score
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stats.avgQuizScore }}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Pending Reviews
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stats.pendingReviews }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Recent Activity -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="flow-root">
                <ul class="-mb-8">
                  <li v-for="(activity, index) in recentActivities" :key="index">
                    <div class="relative pb-8">
                      <span v-if="index !== recentActivities.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">{{ activity.description }}</p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            <time :datetime="activity.timestamp">{{ formatTime(activity.timestamp) }}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="space-y-4">
                <button
                  @click="createNewClass"
                  class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Class
                </button>
                <button
                  @click="generateQuiz"
                  class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700"
                >
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Generate Quiz
                </button>
                <button
                  @click="viewAnalytics"
                  class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          <!-- Upcoming Quizzes -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Upcoming Quizzes
              </h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="space-y-4">
                <div v-for="quiz in upcomingQuizzes" :key="quiz.id" class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ quiz.title }}</p>
                    <p class="text-sm text-gray-500">{{ quiz.className }}</p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(quiz.status)">
                    {{ quiz.status }}
                  </span>
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../stores/auth';

export default {
  name: 'TeacherDashboard',
  setup() {
    const { user } = useAuth();
    const stats = ref({
      totalStudents: 0,
      activeClasses: 0,
      avgQuizScore: 0,
      pendingReviews: 0
    });
    const recentActivities = ref([]);
    const upcomingQuizzes = ref([]);

    const loadStats = async () => {
      if (!user.value?.uid) return;

      try {
        // Get total students
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('teacherId', '==', user.value.uid),
          where('status', '==', 'accepted')
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        stats.value.totalStudents = enrollmentsSnapshot.size;

        // Get active classes
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherId', '==', user.value.uid)
        );
        const classesSnapshot = await getDocs(classesQuery);
        stats.value.activeClasses = classesSnapshot.size;

        // Get average quiz score
        const attemptsQuery = query(
          collection(db, 'quizAttempts'),
          where('teacherId', '==', user.value.uid)
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const scores = attemptsSnapshot.docs.map(doc => doc.data().score);
        stats.value.avgQuizScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
          : 0;

        // Get pending reviews
        const reviewsQuery = query(
          collection(db, 'enrollments'),
          where('teacherId', '==', user.value.uid),
          where('status', '==', 'pending')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        stats.value.pendingReviews = reviewsSnapshot.size;
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const loadRecentActivities = async () => {
      if (!user.value?.uid) return;

      try {
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('teacherId', '==', user.value.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(activitiesQuery);
        recentActivities.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    const loadUpcomingQuizzes = async () => {
      if (!user.value?.uid) return;

      try {
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('teacherId', '==', user.value.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(quizzesQuery);
        upcomingQuizzes.value = await Promise.all(snapshot.docs.map(async doc => {
          const quizData = doc.data();
          const classDoc = await getDoc(quizData.classId);
          return {
            id: doc.id,
            ...quizData,
            className: classDoc.data()?.name || 'Unknown Class',
            status: 'Upcoming'
          };
        }));
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    };

    const formatTime = (timestamp) => {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    };

    const getStatusClass = (status) => {
      switch (status.toLowerCase()) {
        case 'upcoming':
          return 'bg-blue-100 text-blue-800';
        case 'in progress':
          return 'bg-yellow-100 text-yellow-800';
        case 'completed':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const createNewClass = () => {
      // Navigate to class creation page
      window.location.href = '/teacher/classes/new';
    };

    const generateQuiz = () => {
      // Navigate to quiz generation page
      window.location.href = '/teacher/quizzes/generate';
    };

    const viewAnalytics = () => {
      // Navigate to analytics page
      window.location.href = '/teacher/analytics';
    };

    onMounted(async () => {
      await Promise.all([
        loadStats(),
        loadRecentActivities(),
        loadUpcomingQuizzes()
      ]);
    });

    return {
      stats,
      recentActivities,
      upcomingQuizzes,
      formatTime,
      getStatusClass,
      createNewClass,
      generateQuiz,
      viewAnalytics
    };
  }
};
</script> 