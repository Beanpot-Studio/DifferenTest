<template>
  <div class="space-y-8">
    <!-- Search -->
    <div class="max-w-2xl mx-auto">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search help articles..."
          class="w-full p-4 pl-12 border rounded-lg"
        />
       <IconService name="view" size="6" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>

    <!-- Getting Started Section -->
    <div>
      <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="article in gettingStartedArticles" :key="article.id" 
             class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer"
             @click="selectArticle(article)">
          <h3 class="text-lg font-semibold mb-2">{{ article.title }}</h3>
          <p class="text-gray-600 text-sm">{{ article.preview }}</p>
        </div>
      </div>
    </div>

    <!-- For Students Section -->
    <div>
      <h2 class="text-2xl font-bold mb-4">For Students</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="article in studentArticles" :key="article.id" 
             class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer"
             @click="selectArticle(article)">
          <h3 class="text-lg font-semibold mb-2">{{ article.title }}</h3>
          <p class="text-gray-600 text-sm">{{ article.preview }}</p>
        </div>
      </div>
    </div>

    <!-- For Teachers Section -->
    <div>
      <h2 class="text-2xl font-bold mb-4">For Teachers</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="article in teacherArticles" :key="article.id" 
             class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer"
             @click="selectArticle(article)">
          <h3 class="text-lg font-semibold mb-2">{{ article.title }}</h3>
          <p class="text-gray-600 text-sm">{{ article.preview }}</p>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <div v-if="showArticleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ selectedArticle?.title }}</h3>
          <button @click="closeArticleModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <div v-if="selectedArticle" class="prose max-w-none">
          <div v-html="selectedArticle.content"></div>
        </div>

        <div class="mt-6 pt-6 border-t">
          <p class="text-sm text-gray-500">Was this article helpful?</p>
          <div class="flex space-x-4 mt-2">
            <button
              @click="rateArticle(true)"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Yes
            </button>
            <button
              @click="rateArticle(false)"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import IconService from './IconService.vue';
export default {
  name: 'HelpCenter',
  components: {
    IconService
  },
  setup() {
    const searchQuery = ref('');
    const selectedArticle = ref(null);
    const showArticleModal = ref(false);

    const gettingStartedArticles = [
      {
        id: 'welcome',
        title: 'Welcome to DifferenTest',
        preview: 'Get started with our platform and learn about its key features.',
        content: `
          <h2>Welcome to DifferenTest!</h2>
          <p>DifferenTest is a comprehensive platform designed to help teachers create and manage quizzes, while providing students with an engaging learning experience.</p>
          <h3>Key Features:</h3>
          <ul>
            <li>Quiz Generation</li>
            <li>Class Management</li>
            <li>Student Progress Tracking</li>
            <li>Real-time Results</li>
          </ul>
        `
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        preview: 'Learn how to create and set up your account.',
        content: `
          <h2>Setting Up Your Account</h2>
          <p>To get started with DifferenTest, you'll need to create an account:</p>
          <ol>
            <li>Click on the "Sign Up" button</li>
            <li>Choose your role (Teacher or Student)</li>
            <li>Enter your email and create a password</li>
            <li>Complete your profile information</li>
            <li>Verify your email address</li>
          </ol>
        `
      }
    ];

    const studentArticles = [
      {
        id: 'take-quiz',
        title: 'Taking a Quiz',
        preview: 'Step-by-step guide to taking quizzes and viewing your results.',
        content: `
          <h2>Taking a Quiz</h2>
          <p>Here's how to take a quiz:</p>
          <ol>
            <li>Log in to your Student Portal</li>
            <li>Select the class containing the quiz</li>
            <li>Click on the quiz you want to take</li>
            <li>Read each question carefully and select your answer</li>
            <li>Submit your answers when finished</li>
            <li>Review your results</li>
          </ol>
        `
      },
      {
        id: 'view-results',
        title: 'Viewing Your Results',
        preview: 'Learn how to access and understand your quiz results.',
        content: `
          <h2>Viewing Your Results</h2>
          <p>After completing a quiz, you can view your results:</p>
          <ol>
            <li>Go to your Student Portal</li>
            <li>Navigate to the "Results" section</li>
            <li>Select the quiz you want to review</li>
            <li>View your score and detailed feedback</li>
            <li>See which questions you got right and wrong</li>
          </ol>
        `
      }
    ];

    const teacherArticles = [
      {
        id: 'create-quiz',
        title: 'Creating a Quiz',
        preview: 'Learn how to create and customize quizzes for your classes.',
        content: `
          <h2>Creating a Quiz</h2>
          <p>Follow these steps to create a new quiz:</p>
          <ol>
            <li>Navigate to the Quiz Generator in your Teacher Portal</li>
            <li>Upload your lesson plan or content</li>
            <li>Specify the number of questions</li>
            <li>Review and edit the generated questions</li>
            <li>Save and assign to your classes</li>
          </ol>
        `
      },
      {
        id: 'manage-classes',
        title: 'Managing Classes',
        preview: 'Learn how to create and manage your classes.',
        content: `
          <h2>Managing Classes</h2>
          <p>Here's how to manage your classes:</p>
          <ol>
            <li>Go to the Class Management section</li>
            <li>Create a new class or select an existing one</li>
            <li>Add students to your class</li>
            <li>Assign quizzes to the class</li>
            <li>Track student progress</li>
          </ol>
        `
      }
    ];

    const selectArticle = (article) => {
      selectedArticle.value = article;
      showArticleModal.value = true;
    };

    const closeArticleModal = () => {
      showArticleModal.value = false;
      selectedArticle.value = null;
    };

    const rateArticle = async (isHelpful) => {
      if (!selectedArticle.value) return;

      try {
        const articleRef = doc(db, 'help_articles', selectedArticle.value.id);
        await updateDoc(articleRef, {
          helpful: increment(isHelpful ? 1 : 0),
          notHelpful: increment(isHelpful ? 0 : 1)
        });
        closeArticleModal();
      } catch (error) {
        console.error('Error rating article:', error);
      }
    };

    return {
      searchQuery,
      gettingStartedArticles,
      studentArticles,
      teacherArticles,
      selectedArticle,
      showArticleModal,
      selectArticle,
      closeArticleModal,
      rateArticle
    };
  }
};
</script> 