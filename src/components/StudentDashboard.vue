<template>
  <div class="space-y-6">
    <!-- Learning Progress Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Active Classes</h3>
            <p class="text-3xl font-bold text-primary-600">{{ activeClassesCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Completed Quizzes</h3>
            <p class="text-3xl font-bold text-green-600">{{ completedQuizzesCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
         
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Average Score</h3>
            <p class="text-3xl font-bold text-yellow-600">{{ averageScore }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Classes and Quizzes -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <StudentClasses />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { auth } from '../lib/firebase';
import FirebaseService from '../lib/firebaseService';
import StudentClasses from './StudentClasses.vue';
import IconService from './IconService.vue';

const activeClassesCount = ref(0);
const completedQuizzesCount = ref(0);
const averageScore = ref(0);

const updateDashboardStats = async (userId) => {
  try {
    // Get active classes count
    const classes = await FirebaseService.getClassesByStudent(userId);
    activeClassesCount.value = classes.length;

    // Get quiz attempts
    const attempts = await FirebaseService.getQuizAttemptsByUser(userId);
    completedQuizzesCount.value = attempts.length;

    // Calculate average score
    if (attempts.length > 0) {
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
      averageScore.value = Math.round(totalScore / attempts.length);
    }
  } catch (error) {
    console.error("Error updating dashboard stats:", error);
  }
};

const handleClassJoined = async (userId) => {
  await updateDashboardStats(userId);
  const studentClassesComponent = document.querySelector("student-classes");
  if (studentClassesComponent) {
    studentClassesComponent.dispatchEvent(new CustomEvent("refreshClasses"));
  }
};

const handleClassLeft = async (userId) => {
  console.log("Class left event received, updating dashboard...");
  await updateDashboardStats(userId);
  const studentClassesComponent = document.querySelector("student-classes");
  if (studentClassesComponent) {
    studentClassesComponent.dispatchEvent(new CustomEvent("refreshClasses"));
  }
};

const handleQuizCompleted = async (userId) => {
  console.log("Quiz completed event received, updating dashboard...");
  await updateDashboardStats(userId);
  const studentClassesComponent = document.querySelector("student-classes");
  if (studentClassesComponent) {
    studentClassesComponent.dispatchEvent(new CustomEvent("refreshClasses"));
  }
};

const handleEnrollmentStatusChanged = async (userId) => {
  console.log("Enrollment status changed event received, updating dashboard...");
  await updateDashboardStats(userId);
  const studentClassesComponent = document.querySelector("student-classes");
  if (studentClassesComponent) {
    studentClassesComponent.dispatchEvent(new CustomEvent("refreshClasses"));
  }
};

onMounted(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "/?auth=required";
      return;
    }

    try {
      // Initial updates
      await updateDashboardStats(user.uid);

      // Add event listeners
      window.addEventListener("classJoined", () => handleClassJoined(user.uid));
      window.addEventListener("classLeft", () => handleClassLeft(user.uid));
      window.addEventListener("quizCompleted", () => handleQuizCompleted(user.uid));
      window.addEventListener("enrollmentStatusChanged", () => handleEnrollmentStatusChanged(user.uid));
    } catch (error) {
      console.error("Error updating dashboard:", error);
    }
  });

  onUnmounted(() => {
    unsubscribe();
    window.removeEventListener("classJoined", handleClassJoined);
    window.removeEventListener("classLeft", handleClassLeft);
    window.removeEventListener("quizCompleted", handleQuizCompleted);
    window.removeEventListener("enrollmentStatusChanged", handleEnrollmentStatusChanged);
  });
});
</script> 