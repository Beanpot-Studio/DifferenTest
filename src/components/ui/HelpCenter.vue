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
       <IconService name="search" size="6" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>

    <!-- Filtered Results -->
    <div v-if="filteredArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <div v-for="article in filteredArticles" :key="article.id" 
             class="border rounded-lg p-8 hover:shadow-md transition cursor-pointer flex flex-col justify-between" 
             @click="selectArticle(article)">
          <div>
            <h3 class="text-lg font-semibold mb-3">{{ article.title }}</h3>
            <p class="text-gray-600 text-sm mb-6">{{ article.preview }}</p>
          </div>
          <span class="text-xs text-gray-400 mt-auto">Category: {{ article.category }}</span>
        </div>
    </div>
     <div v-else-if="searchQuery" class="text-center text-gray-500 py-6">
      No articles found matching your search.
    </div>

    <!-- Categories (shown when not searching) -->
    <div v-else>
      <!-- Getting Started Section -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div v-for="article in gettingStartedArticles" :key="article.id" 
              class="border rounded-lg p-8 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              @click="selectArticle(article)">
            <div>
              <h3 class="text-lg font-semibold mb-3">{{ article.title }}</h3>
              <p class="text-gray-600 text-sm mb-6">{{ article.preview }}</p>
            </div>
             <span class="text-xs text-gray-400 mt-auto">Category: Getting Started</span>
          </div>
        </div>
      </div>

      <!-- For Students Section -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">For Students</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="article in studentArticles" :key="article.id" 
              class="border rounded-lg p-8 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              @click="selectArticle(article)">
             <div>
              <h3 class="text-lg font-semibold mb-3">{{ article.title }}</h3>
              <p class="text-gray-600 text-sm mb-6">{{ article.preview }}</p>
            </div>
             <span class="text-xs text-gray-400 mt-auto">Category: For Students</span>
          </div>
        </div>
      </div>

      <!-- For Teachers Section -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">For Teachers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="article in teacherArticles" :key="article.id" 
              class="border rounded-lg p-8 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              @click="selectArticle(article)">
             <div>
              <h3 class="text-lg font-semibold mb-3">{{ article.title }}</h3>
              <p class="text-gray-600 text-sm mb-6">{{ article.preview }}</p>
            </div>
            <span class="text-xs text-gray-400 mt-auto">Category: For Teachers</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <div v-if="showArticleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 class="text-xl font-bold">{{ selectedArticle?.title }}</h3>
          <button @click="closeArticleModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto mb-6">
          <div v-if="selectedArticle" class="prose max-w-none" v-html="selectedArticle.content"></div>
        </div>

        <div class="mt-auto pt-6 border-t">
          <p class="text-sm text-gray-500">Was this article helpful?</p>
          <div class="flex space-x-4 mt-2">
            <button
              @click="rateArticle(true)"
              class="px-4 py-2 border rounded-lg hover:bg-green-50 text-sm"
            >
              Yes 👍
            </button>
            <button
              @click="rateArticle(false)"
              class="px-4 py-2 border rounded-lg hover:bg-red-50 text-sm"
            >
              No 👎
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import IconService from '../services/IconService.vue';
import FirebaseService from '../../lib/firebaseService';
import { marked } from 'marked'; // Import marked if using markdown in content

export default {
  name: 'HelpCenter',
  components: {
    IconService
  },
  setup() {
    const searchQuery = ref('');
    const selectedArticle = ref(null);
    const showArticleModal = ref(false);

    // --- Article Definitions ---
    const allArticles = ref([
      // == Getting Started ==
      {
        id: 'welcome-all',
        category: 'Getting Started',
        title: 'Welcome to DifferenTest',
        preview: 'An overview of the platform and its main capabilities.',
        content: `
          <h2>Welcome to DifferenTest!</h2>
          <p>DifferenTest is designed to make learning more personalized and engaging. Teachers can easily create classes, upload lesson materials, generate quizzes, and track student progress. Students can join classes, access lessons, take quizzes, and see their results instantly.</p>
          <h3>Main Areas:</h3>
          <ul class="list-disc list-inside">
            <li><strong>Teacher Portal:</strong> Manage classes, quizzes, lesson plans, view submissions, and reports.</li>
            <li><strong>Student Portal:</strong> View assigned classes, take quizzes, review history, and see earned badges.</li>
            <li><strong>Public Curricula:</strong> Explore publicly available classes and quizzes.</li>
          </ul>
          <p>Use this help center to find answers to specific questions.</p>
        `
      },
      {
        id: 'account-setup-all',
        category: 'Getting Started',
        title: 'Setting Up Your Account',
        preview: 'How to register, log in, and choose your role.',
        content: `
          <p>Follow these steps to get started:</p>
          <ul class="list-disc list-inside">
            <li>Click the <strong>Login / Register</strong> button in the header.</li>
            <li>Select the <strong>Register</strong> option.</li>
            <li>Enter your name, email, and create a password.</li>
            <li>Select your role: <strong>Teacher</strong> or <strong>Student</strong>. This determines which portal you access.</li>
            <li>Click Register. You should be logged in automatically.</li>
            <li>You can log out and log back in using the navigation menu in the header.</li>
          </ul>
        `
      },
      // == For Students ==
      {
        id: 'dashboard-students',
        category: 'For Students',
        title: 'Navigating the Student Portal',
        preview: 'Understand the sections of your student dashboard.',
        content: `
          <p>Your student portal is your main hub. You\'ll find several sections:</p>
          <ul class="list-disc list-inside">
            <li><strong>My Classes:</strong> Shows classes you are enrolled in. Click a class to see assignments.</li>
            <li><strong>Available Classes:</strong> Browse public classes or use a code provided by your teacher to join private ones.</li>
            <li><strong>Quiz History:</strong> Review your past quiz attempts, scores, and answers. Retake a quiz to get 100% and earn your badge!</li>
            <li><strong>Activity Feed:</strong> See recent events like completed quizzes or earned badges.</li>
            <li><strong>Badges:</strong> View and share badges you have earned by achieving perfect scores on quizzes.</li>
          </ul>
        `
      },
      {
        id: 'join-class-students',
        category: 'For Students',
        title: 'Finding & Joining Classes',
        preview: 'How to find public classes or join a private class using a code.',
        content: `
          <p>There are two main ways to join a class:</p>
          <h3>1. Browsing Public Classes</h3>
          <ul class="list-disc list-inside">
            <li>Go to the <strong>Open Curricula Classes</strong> section from the top nav.</li>
            <li>Browse the list of public classes. Login as a student to take a quiz and track your progress.</li>
          </ul>
          <h3>2. Joining a class with your teacher's approval (for Private Classes)</h3>
          <ul class="list-disc list-inside">
            <li>Your teacher will provide you with a code to join a class which you can use to join the class in the Student Portal.</li>
            <li>Click <strong>Request to Join</strong> to join a class. Your teacher will need to approve your request.</li>
          </ul>
        `
      },
      {
        id: 'take-quiz-students',
        category: 'For Students',
        title: 'Taking a Quiz',
        preview: 'Step-by-step guide to taking quizzes assigned by your teacher.',
        content: `
          <p>Once enrolled in a class, you can take assigned quizzes:</p>
          <ul class="list-disc list-inside">
            <li>Go to the <strong>My Classes</strong> section in your Student Portal.</li>
            <li>Select the class containing the quiz.</li>
            <li>Find the quiz listed under the class assignments or lesson plan.</li>
            <li>Click on the quiz title or a "Take Quiz" button.</li>
            <li>Read the instructions and each question carefully.</li>
            <li>Select your answer for each question.</li>
            <li>When finished, click the <strong>Submit</strong> button.</li>
            <li>Your results are shown immediately.</li>
          </ul>
          <p>Some quizzes may have associated lesson plan content visible before or during the quiz.</p>
        `
      },
      {
        id: 'view-results-students',
        category: 'For Students',
        title: 'Viewing Your Results & History',
        preview: 'Learn how to access your quiz scores and review past attempts.',
        content: `
          <p>You can review your performance in the <strong>Quiz History</strong> section of your portal:</p>
          <ul class="list-disc list-inside">
            <li>Find the quiz attempt you want to review.</li>
            <li>You\'ll see your score, the date taken, and the time spent.</li>
            <li>Click on an attempt for more details including helpful hints for any incorrect answers.</li>
          </ul>
        `
      },
      {
        id: 'badges-students',
        category: 'For Students',
        title: 'Understanding Badges',
        preview: 'Learn about achievement badges and how to earn them.',
        content: `
          <p>Earn sharable digital badgesby achieving 100% scores on quizzes</p>
          <ul class="list-disc list-inside">
            <li>When you get a perfect score on a badged quiz, you will see a notification about earning a badge if your teacher has enabled badging.</li>
            <li>You can view all your earned badges in the <strong>Badges</strong> section of your Student Portal.</li>
            <li>Badges are a fun way to showcase your mastery of a topic. Make sure to share them with your friends and on social media.</li>
          </ul>
        `
      },
       {
        id: 'reviewing-retaking-quiz-students',
        category: 'For Students',
        title: 'Reviewing and Retaking a Quiz',
        preview: 'Retake quizzes to earn a higher score.',
        content: `
          <p>If you don't get a perfect score on your first attempt, you can retake the quiz as many times as you want.</p>
          <ul class="list-disc list-inside">
            <li>Use the Review button to review your answers and see a helper box to help you understand any incorrect answers.</li>
            <li>Take the quiz again to earn a higher score and get your badge.</li>
          </ul>
        `
      },
      // == For Teachers ==
      {
        id: 'dashboard-teachers',
        category: 'For Teachers',
        title: 'Navigating the Teacher Portal',
        preview: 'An overview of the tools available in your teacher dashboard.',
        content: `
          <p>The Teacher Portal is your command center. Key sections include:</p>
          <ul class="list-disc list-inside">
            <li><strong>Dashboard/Stats:</strong> Quick overview of your classes, quizzes, and recent submissions.</li>
            <li><strong>Class Manager:</strong> Create new open and privateclasses, edit existing ones, manage student enrollments (roster), and assign quizzes.</li>
            <li><strong>Quiz Manager:</strong> Create new quizzes (manually or generated from content), edit questions and options, and manage quiz settings.</li>
            <li><strong>Lesson Plan Manager:</strong> View and edit the markdown lesson content associated with your quizzes.</li>
            <li><strong>Submissions:</strong> View quiz attempts submitted by students across your classes.</li>
            <li><strong>Reports:</strong> Analyze student performance and class progress (features will vary according to your subscription level).</li>
          </ul>
        `
      },
       {
        id: 'create-class-teachers',
        category: 'For Teachers',
        title: 'Creating & Managing Classes',
        preview: 'How to set up new classes, manage settings, and view rosters.',
        content: `
          <p>Use the <strong>Class Manager</strong> section:</p>
          <h3>Creating a Class</h3>
          <ul class="list-disc list-inside">
            <li>Click the "Create New Class" button or use the form provided.</li>
            <li>Enter a <strong>Class Name</strong>.</li>
            <li>Decide if the class should be <strong>Public</strong> (discoverable by all students) or private (requires code to join).</li>
             <li>For paid subscribers, select a <strong>Skin</strong> (visual theme) for the class, like \'Default\' or \'Playful Cats\'. This affects how students see lessons and quizzes in this class.</li>
            <li>Click Create. A unique <strong>Class Code</strong> will be generated for private classes - share this with your students.</li>
          </ul>
          <h3>Managing Existing Classes</h3>
          <ul class="list-disc list-inside">
            <li><strong>Edit:</strong> Change the class name, public status, or skin.</li>
            <li><strong>Delete:</strong> Permanently remove the class and associated data (use with caution!).</li>
            <li><strong>View Roster:</strong> See enrolled students and manage enrollment requests (Accept/Reject).</li>
            <li><strong>Assign Quizzes:</strong> Add existing quizzes from your library to the class.</li>
          </ul>
        `
      },
      {
        id: 'create-quiz-teachers',
        category: 'For Teachers',
        title: 'Creating & Managing Quizzes',
        preview: 'How to create quizzes manually or generate them from lesson plans.',
        content: `
          <p>Use the <strong>Quiz Manager</strong> section:</p>
          <h3>Creating a New Quiz</h3>
          <ul class="list-disc list-inside">
            <li>Click "Create Quiz".</li>
            <li>Select the <strong>Class</strong> this quiz belongs to.</li>
            <li>Enter a <strong>Title</strong> for the quiz.</li>
            <li>(Optional) Upload a <strong>Badge Image</strong> to be awarded for perfect scores.</li>
            <li>(Optional) Upload a <strong>Lesson Plan</strong> (.txt or .md file). The content will be associated with the quiz and can be used to automatically generate questions.</li>
            <li>Specify the desired <strong>Number of Questions</strong> if generating from a lesson plan.</li>
            <li>Click "Generate Questions" for automatic question generation using AI or add questions manually. You can always edit anything the AI suggests in the quiz generation process.</li>
             <li>Review/edit generated questions and answers.</li>
            <li>Click <strong>Create Quiz</strong> to save.</li>
          </ul>
          <h3>Managing Existing Quizzes</h3>
          <ul class="list-disc list-inside">
            <li><strong>Edit:</strong> Modify the title, badge image, questions, options, and correct answers.</li>
            <li><strong>Delete:</strong> Permanently remove the quiz and its attempts.</li>
          </ul>
        `
      },
       {
        id: 'edit-lesson-plan-teachers',
        category: 'For Teachers',
        title: 'Editing Lesson Plans',
        preview: 'How to modify the lesson plan content associated with a quiz.',
        content: `
          <p>Lesson plans are often associated directly with quizzes in this system.</p>
          <ul class="list-disc list-inside">
            <li>Go to the <strong>Lesson Plan Manager</strong> (or sometimes the Quiz Manager).</li>
            <li>Find the quiz/lesson you want to edit.</li>
            <li>Click the <strong>Edit</strong> icon.</li>
            <li>A modal window will appear showing the current lesson content.</li>
            <li>Click the Edit icon within the modal to enable the text area.</li>
            <li>Make your changes to the markdown content. You can also upload images and copy their markdown links.</li>
            <li>Click <strong>Save Changes</strong>.</li>
          </ul>
           <p>The updated lesson plan content will be shown to students when they view this quiz/assignment.</p>
        `
      },
       {
        id: 'submissions-teachers',
        category: 'For Teachers',
        title: 'Viewing Student Submissions',
        preview: 'How to review quiz attempts submitted by your students.',
        content: `
          <p>You can track student quiz attempts in the <strong>Submissions</strong> section of your Teacher Portal.</p>
          <ul class="list-disc list-inside">
            <li>View a list of recent submissions across all your classes.</li>
            <li>Filter submissions by class or specific quiz.</li>
            <li>See student names, quiz titles, scores, and submission times.</li>
            <li>Click on a submission for more detailed results (if available).</li>
          </ul>
        `
      },
       {
        id: 'badges-teachers',
        category: 'For Teachers',
        title: 'Managing Badges',
        preview: 'How to enable and manage achievement badges for your quizzes.',
        content: `
          <p>Badges can motivate students by rewarding perfect scores.</p>
          <ul class="list-disc list-inside">
            <li>When creating or editing a quiz in the <strong>Quiz Manager</strong>, standard badge images are enabled by default. You can disable this in the quiz if you prefer.</li>
            <li>If badges are enabled, students who score 100% on that quiz will automatically be awarded a badge with a shareable certificate.</li>
            <li>Students can view their earned badges in their portal.</li>
            <li>Badges are highly motivational for studetns. We offer a design consultation service to help you create custom badges.</li>
            <li>Subscribe to a paid plan to enable custom badges for your quizzes.</li>
          </ul>
        `
      },

    ]);

    // --- Computed Properties for Filtering ---
    const gettingStartedArticles = computed(() => 
      allArticles.value.filter(a => a.category === 'Getting Started')
    );
    const studentArticles = computed(() => 
      allArticles.value.filter(a => a.category === 'For Students')
    );
    const teacherArticles = computed(() => 
      allArticles.value.filter(a => a.category === 'For Teachers')
    );

    const filteredArticles = computed(() => {
      if (!searchQuery.value) {
        return []; // Don't show results if search is empty
      }
      const lowerQuery = searchQuery.value.toLowerCase();
      return allArticles.value.filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.preview.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) // Basic content search
      );
    });

    // --- Methods ---
    const selectArticle = (article) => {
       // Convert markdown content to HTML if necessary before displaying
       // Simple check, might need refinement based on actual content source
       if (article.content && !article.content.trim().startsWith('<')) { 
         try {
            // Basic markdown rendering for help content - assumes no complex features needed
           selectedArticle.value = { ...article, content: marked.parse(article.content) };
         } catch (e) {
           console.error("Error parsing markdown for help article:", e);
           selectedArticle.value = { ...article, content: '<p>Error rendering content.</p>' };
         }
       } else {
           selectedArticle.value = article; // Assume it's already HTML
       }
      showArticleModal.value = true;
    };

    const closeArticleModal = () => {
      showArticleModal.value = false;
      selectedArticle.value = null;
    };

    const rateArticle = async (isHelpful) => {
      // Keep existing rating logic
       if (!selectedArticle.value || !selectedArticle.value.id || selectedArticle.value.id.includes('-placeholder')) return; // Prevent rating placeholders

       try {
         // Assuming a simple ID is used, adjust if complex IDs needed
         await FirebaseService.updateArticleRating(selectedArticle.value.id, isHelpful); 
         // Optionally show a success message
         closeArticleModal(); 
       } catch (error) {
         console.error('Error rating article:', error);
         // Optionally show an error message
       }
    };

    return {
      searchQuery,
      allArticles, // Keep for potential filtering logic
      gettingStartedArticles,
      studentArticles,
      teacherArticles,
      filteredArticles,
      selectedArticle,
      showArticleModal,
      selectArticle,
      closeArticleModal,
      rateArticle
    };
  }
};
</script> 

<style scoped>
/* Target elements within the dynamically rendered article content */
.prose h2 {
  margin-bottom: 1rem; /* Adjust as needed */
}

.prose h3 {
  margin-bottom: 0.75rem; /* Adjust as needed */
}


</style> 