<template>
  <div class="space-y-8">
    <!-- Remove Class Search Section --> 
    <!-- 
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Find Classes</h2>
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for classes..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          @click="searchClasses"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Search
        </button>
      </div>
      
      <div v-if="searchResults.length > 0" class="mt-4 space-y-4">
        <div 
          v-for="classItem in searchResults" 
          :key="classItem.id" 
          class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ classItem.name }}</h3>
              <p class="text-sm text-gray-700">Teacher: {{ classItem.teacherName }}</p>
              <p class="text-sm text-gray-700">Class Code: {{ classItem.code }}</p>
            </div>
            <button
              v-if="!isEnrolled(classItem.id)"
              @click="requestToJoin(classItem)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Request to Join
            </button>
            <span
              v-else
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              Enrolled
            </span>
          </div>
        </div>
      </div>
    </div>
    --> 

   
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Join a Class</h2>
      <p class="text-sm text-gray-600 mb-4">
        Enter the class code provided by your teacher to join or request access.
      </p>
      <div class="flex gap-4">
        <input
          v-model.trim="joinClassCode"
          type="text"
          placeholder="Enter class code..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keyup.enter="joinClassWithCode" 
        />
        <button
          @click="joinClassWithCode"
          :disabled="!joinClassCode || loading"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          Join Class
        </button>
      </div>
    </div>

    <!-- Pending Classes -->
    <div v-if="pendingClasses.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Pending Classes</h2>
      <template v-if="hasMounted">
        <div class="space-y-4">
          <div 
            v-for="classItem in pendingClasses" 
            :key="classItem.id" 
            class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">{{ classItem.name }}</h3>
                <p class="text-sm text-gray-600">Teacher: {{ classItem.teacherName }}</p>
                <p class="text-sm text-gray-600">Class Code: {{ classItem.code }}</p>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Pending Approval
              </span>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-4 text-gray-400 italic">Loading pending requests...</div>
    </div>

    <!-- My Classes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Enrolled Classes</h2>
      <template v-if="hasMounted">
        <div v-if="loading" class="text-center py-4">
          <BaseAnimation type="loading" :loop="true" />
        </div>    
        <div v-else-if="error" class="text-red-600">
          {{ error }}
        </div>
        <div v-else-if="enrolledClasses.length === 0" class="text-gray-500 text-center py-4">
          You are not enrolled in any classes yet.
        </div>
        <div v-else class="space-y-6">
          <div 
            v-for="classItem in enrolledClasses" 
            :key="classItem.id" 
            class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center ">
                  <h3 class="text-xl font-bold text-gray-900">{{ classItem.name || 'Unnamed Class' }}</h3>
                  <span :class="{
                    'bg-yellow-100 text-yellow-800': classItem.enrollmentStatus === 'pending',
                    'bg-green-100 text-green-800': classItem.enrollmentStatus === 'accepted',
                    'bg-red-100 text-red-800': classItem.enrollmentStatus === 'rejected',
                    'bg-gray-100 text-gray-800': !classItem.enrollmentStatus
                  }" class="px-3 ml-5 py-1 rounded-full text-sm font-medium">
                    {{ 
                      classItem.enrollmentStatus === 'accepted' ? 'Enrolled' : 
                      classItem.enrollmentStatus === 'pending' ? 'Pending Approval' :
                      classItem.enrollmentStatus === 'rejected' ? 'Rejected' :
                      'Not Enrolled' 
                    }}
                  </span>
                </div>
                <div class="flex items-center space-x-4 mt-2">
                  <div class="flex items-center space-x-2">
                    <IconService name="user" size="4" />
                    <p class="text-sm font-medium text-gray-700 pt-4">
                      Teacher: <span class="text-primary-600">{{ classItem.teacherName || 'Unknown Teacher' }}</span>
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <IconService name="key" size="4" />
                    <p class="text-sm font-medium text-gray-700 pt-4">
                      Class Code: <span class="font-mono text-primary-600">{{ classItem.code || 'N/A' }}</span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Certificate Button Area -->
              <div class="mt-3 flex-shrink-0 ml-4">
                <!-- Show View Button if certificate HAS been claimed -->
                <a 
                    v-if="classItem.hasClaimedCertificate && user" 
                    :href="`/certificates/${user.uid}_${classItem.id}`" 
                    :key="`view-cert-${classItem.id}`" 
                    class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 flex items-center space-x-2"
                >
                    <IconService name="star" size="5" /> 
                    <span>View Certificate</span>
                </a>

                <!-- Show Claim Button if eligible AND certificate has NOT been claimed -->
                <button 
                    v-else-if="classItem.isComplete && hasMetQuizRequirements(classItem) && user"
                    @click="claimCertificate(classItem)" 
                    :disabled="isMintingBadge" 
                    :key="`claim-cert-${classItem.id}`"
                    class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-yellow-500 hover:to-orange-600 transition duration-300 flex items-center space-x-2 disabled:opacity-60"
                >
                    <IconService name="award" size="5" />
                    <span>{{ isMintingBadge ? 'Claiming...' : 'Claim Certificate' }}</span>
                </button>
              </div>
            </div>

            <!-- Class Progress -->
            <div v-if="classItem.enrollmentStatus === 'accepted'" class="mt-4">
              <h4 class="font-lg font-bold mb-2">Quizzes</h4>
            
              <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
                No quizzes available yet.
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="quiz in classItem.quizzes" 
                  :key="quiz.id"
                  class="rounded-lg shadow p-3 bg-gradient-to-br from-green-50 to-teal-100 hover:shadow-md transition-shadow duration-200 flex justify-between items-start"
                >
                  <!-- Always show quiz title and details -->
                  <div>
                    <h4 class="font-medium text-gray-800">{{ quiz.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Questions: {{ quiz.questionCount || quiz.questions?.length || 0 }}
                    </p>
                  </div>

                  <!-- Conditionally show attempt details OR Take Quiz button -->
                  <div v-if="getQuizAttempt(classItem.id, quiz.id)" class="flex items-center space-x-2">
                    <!-- Attempt Details -->
                    <span class="text-sm text-gray-500">
                      Score: {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                    </span>
                    <div class="flex space-x-2">
                      <!-- Original Review Button - Conditionally change color if badge exists -->
                      <button
                        v-if="!(getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge)"
                        @click="reviewQuiz(classItem.id, quiz.id)"
                        class="text-sm font-medium rounded p-2 text-white flex items-center space-x-1" 
                        :class="{
                          'bg-amber-500 hover:bg-amber-600': getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge,
                          'bg-green-500 hover:bg-green-600': !(getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge)
                        }"
                      >
                        <span>Review Quiz</span>
                        <span v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge" class="ml-1">🏆</span>
                      </button>
                      <!-- New Review & Claim Button -->
                      <button
                        v-if="getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge"
                        @click="reviewQuiz(classItem.id, quiz.id)"
                        class="text-sm font-medium rounded bg-amber-500 p-2 text-white hover:bg-amber-600 flex items-center space-x-1"
                      >
                         <span>🏆 Review & Claim Badge</span>
                      </button>
                      <!-- Verify Badge Link -->
                      <a 
                        v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge"
                        :href="`/badges/${getQuizAttempt(classItem.id, quiz.id)?.badgeId}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm font-medium rounded bg-purple-500 p-2 text-white hover:bg-purple-600 flex items-center space-x-1"
                      >
                        <span>View Badge</span> 
                      </a>
                      <!-- Retake Button -->
                      <button
                        v-if="getQuizAttempt(classItem.id, quiz.id).score < 100"
                        @click="startQuiz(classItem.id, quiz)"
                        class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <!-- Take Quiz Button for unattempted quizzes -->
                    <button 
                      @click="startQuiz(classItem.id, quiz)"
                      class="text-sm px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 font-medium"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="classItem.enrollmentStatus === 'pending'" class="mt-4 text-yellow-600">
              <p class="text-sm">Your enrollment request is pending approval. You will be able to access quizzes once approved.</p>
            </div>
            <div v-else-if="classItem.enrollmentStatus === 'rejected'" class="mt-4 text-red-600">
              <p class="text-sm">Your enrollment request was rejected. Please contact the teacher if you believe this is an error.</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Open Classes -->
    <div v-if="openClasses?.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Open Classes</h2>
      <template v-if="hasMounted">
        <div v-if="loading" class="text-center py-4">
          <BaseAnimation type="loading" :loop="true" />
        </div>    
        <div v-else-if="error" class="text-red-600">
          {{ error }}
        </div>
        <div v-else class="space-y-6">
          <div 
            v-for="classItem in openClasses" 
            :key="classItem.id" 
            class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center">
                  <h3 class="text-xl font-bold text-gray-900">{{ classItem.name || 'Unnamed Class' }}</h3>
                  <span class="px-3 ml-5 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Open Class
                  </span>
                </div>
                <div class="flex items-center space-x-4 mt-2">
                  <div class="flex items-center space-x-2">
                    <IconService name="user" size="4" />
                    <p class="text-sm font-medium text-gray-700 pt-4">
                      Teacher: <span class="text-primary-600">{{ classItem.teacherName || 'Unknown Teacher' }}</span>
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <IconService name="key" size="4" />
                    <p class="text-sm font-medium text-gray-700 pt-4">
                      Class Code: <span class="font-mono text-primary-600">{{ classItem.code || 'N/A' }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Class Progress -->
            <div class="mt-4">
              <h4 class="font-lg font-bold mb-2">Quizzes</h4>
              
            
              <div v-if="!classItem.quizzes?.length" class="text-gray-500 text-sm">
                No quizzes available yet.
              </div>
              <div v-else class="space-y-2">
                 <!-- Remove template wrapper and v-if from the quiz div -->
                 <div 
                    v-for="quiz in classItem.quizzes" 
                    :key="quiz.id"
                    class="rounded-lg shadow p-3 bg-gradient-to-br from-green-50 to-teal-100 hover:shadow-md transition-shadow duration-200 flex justify-between items-start"
                  >
                    <!-- Always show quiz title and details -->
                     <div>
                        <h4 class="font-medium text-gray-800">{{ quiz.title }}</h4>
                        <p class="text-sm text-gray-600 mt-1">
                           Questions: {{ quiz.questionCount || quiz.questions?.length || 0 }}
                        </p>
                      </div>

                    <!-- Conditionally show attempt details OR Take Quiz button -->
                    <div v-if="getQuizAttempt(classItem.id, quiz.id)" class="flex items-center space-x-2">
                        <!-- Attempt Details -->
                        <span class="text-sm text-gray-500">
                          Score: {{ getQuizAttempt(classItem.id, quiz.id).score }}%
                        </span>
                        <div class="flex space-x-2">
                           <!-- Original Review Button - Conditionally change color if badge exists -->
                          <button
                            v-if="!(getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge)"
                            @click="reviewQuiz(classItem.id, quiz.id)"
                            class="text-sm font-medium rounded p-2 text-white flex items-center space-x-1" 
                            :class="{
                              'bg-amber-500 hover:bg-amber-600': getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge,
                              'bg-green-500 hover:bg-green-600': !(getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge)
                            }"
                          >
                            <span>Review Quiz</span>
                            <span v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge" class="ml-1">🏆</span>
                          </button>
                          <!-- New Review & Claim Button -->
                          <button
                            v-if="getQuizAttempt(classItem.id, quiz.id).score === 100 && !getQuizAttempt(classItem.id, quiz.id).hasBadge"
                            @click="reviewQuiz(classItem.id, quiz.id)"
                            class="text-sm font-medium rounded bg-amber-400 p-2 text-white hover:bg-amber-600 flex items-center space-x-1"
                          >
                             <span>Review & Claim Badge 🏆</span>
                          </button>
                           <!-- Verify Badge Link -->
                          <a
                            v-if="getQuizAttempt(classItem.id, quiz.id)?.score === 100 && getQuizAttempt(classItem.id, quiz.id)?.hasBadge"
                            :href="`/badges/${getQuizAttempt(classItem.id, quiz.id)?.badgeId}`"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-sm font-medium rounded bg-purple-500 p-2 text-white hover:bg-purple-600 flex items-center space-x-1"
                          >
                             <span>View Badge</span> 
                          </a>
                          <!-- Retake Button -->
                          <button
                            v-if="getQuizAttempt(classItem.id, quiz.id).score < 100"
                            @click="startQuiz(classItem.id, quiz)"
                            class="text-sm font-medium rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          >
                            Retake Quiz
                          </button>
                        </div>
                    </div>
                     <div v-else>
                        <!-- Take Quiz Button for unattempted quizzes -->
                        <button 
                          @click="startQuiz(classItem.id, quiz)"
                          class="text-sm px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 font-medium"
                        >
                          Take Quiz
                        </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-4 text-gray-400 italic">Loading open classes...</div>
    </div>

    <!-- Quiz Modal -->
    <div v-if="showQuizModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <button @click="closeQuizModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="close" size="6" />
          </button>
        </div>
        <QuizInterface 
          v-if="selectedQuiz && selectedQuiz.id && selectedClassId"
          :quiz-id="selectedQuiz.id"
          :class-id="selectedClassId"
          @quiz-completed="handleQuizCompleted"
        />
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="closeReviewModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconService name="x" size="4" />
        </button>

        <div v-if="loading" class="text-center py-4">
          <BaseAnimation type="loading" :loop="true" />
          <span>Loading review data...</span>
        </div>

        <div v-else-if="reviewData?.quiz" class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-green-50 to-teal-100">
          <h3 class="text-xl font-bold mb-4 text-gray-900">Review: {{ reviewData.quiz.title }}</h3>
          <div class="mb-6 p-4 bg-white/80 rounded-lg shadow-inner">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Score</p>
                <p class="text-2xl font-bold text-teal-700">{{ reviewData.attempt.score }}%</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Time Spent</p>
                <p class="text-2xl font-bold text-teal-700">{{ Math.floor(reviewData.attempt.timeSpent / 1000) }}s</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-8">
            <div 
              v-for="(question, index) in reviewData.quiz.questions" 
              :key="index"
              class="border-b pb-6"
            >
              <div class="mb-4">
                <p class="font-medium">{{ index + 1 }}. {{ question.text }}</p>
                <div class="mt-2 space-y-2">
                  <div 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    class="flex items-center space-x-2 p-2 rounded"
                    :class="{
                      'bg-green-100 text-green-700 font-semibold': optionIndex === question.correctIndex,
                      'bg-red-100 text-red-700 font-semibold': optionIndex === question.userAnswer && question.isCorrect === false
                    }"
                  >
                    <!-- Refined Symbol Logic -->
                    <span 
                      v-if="optionIndex === question.correctIndex"
                      class="w-4 inline-block text-center font-bold"
                    >✓</span> 
                    <span 
                      v-else-if="optionIndex === question.userAnswer && question.isCorrect === false"
                      class="w-4 inline-block text-center font-bold"
                    >✗</span>
                    <span 
                      v-else
                      class="w-4 inline-block"
                    >&nbsp;</span>
                    <!-- End Refined Symbol Logic -->
                    <span>{{ option.text }}</span>
                  </div>
                </div>
              </div>

              <!-- Explanation Button/Display -->
              <div v-if="question.isCorrect === false && typeof question.userAnswer === 'number'" class="mt-4">
                <button
                  @click="toggleExplanation(index)" 
                  class="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                >
                  <span>{{ expandedExplanations[index] ? 'Hide' : 'Show' }} explanation</span>
                  <!-- Replace IconService with SVG -->
                  <svg 
                    class="w-4 h-4 transform transition-transform" 
                    :class="{ 'rotate-180': expandedExplanations[index] }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <!-- Display area, shown only when expanded -->
                <div v-if="expandedExplanations[index]" class="mt-2 p-3 bg-primary-50 rounded">
                  <!-- Loading Indicator -->
                  <div v-if="explanations[index] === 'loading'" class="flex space-x-2 text-sm text-gray-600">
                     <BaseAnimation type="loading" :size="16" /> 
                     <span>Generating explanation...</span>
                  </div>
                  <!-- Explanation Text or Error -->
                  <p v-else class="text-sm text-gray-700">
                    {{ explanations[index] || 'Could not load explanation.' }} 
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              v-if="reviewData.attempt.score === 100 && !reviewData.hasBadge"
              @click="claimBadge"
              :disabled="isMintingBadge"
              class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isMintingBadge" class="animate-spin">⏳</span>
              <span v-else>🏆</span>
              <span>{{ isMintingBadge ? 'Claiming Badge...' : 'Claim Badge' }}</span>
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          No review data available
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
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';

const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);

export default {
  name: 'StudentClasses',
  components: {
    ClassSearch, BaseAnimation, QuizHistory, RecentActivity, QuizInterface, BaseModal, BadgeDisplay, IconService
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
    const selectedClassId = ref(null);
    const isQuizModalOpen = ref(false);
    const answers = ref([]);
    const quizCompleted = ref(false);
    const quizScore = ref(0);
    const quizAttempts = ref({});
    const quizAttemptsWithBadges = ref({});
    const explanations = ref({});
    const expandedExplanations = ref({});
    const quizStartTime = ref(0);
    const error = ref(null);
    const { showSuccess, showError } = useNotification();
    const activeTab = ref('activities');
    const enrolledClasses = ref([]);
    const pendingClasses = ref([]);
    const openClasses = ref([]);
    const reviewData = ref(null);
    const isMintingBadge = ref(false);
    const tabs = [
      { id: 'activities', name: 'Activities' },
      { id: 'history', name: 'Quiz History' },
      { id: 'achievements', name: 'Achievements' }
    ];

    // Add ref for join code
    const joinClassCode = ref('');
    const joiningClass = ref(false);
    const attemptToReview = ref(null);
    const hasMounted = ref(false);

    // Filter classes to only show enrolled ones
    const filteredClasses = computed(() => {
      return enrolledClasses.value;
    });

    const isEnrolled = (classId) => {
      return enrolledClasses.value.some(c => c.id === classId);
    };

    const loadClasses = async () => {
      if (!user.value?.uid) {
        console.error('No user ID available');
        return;
      }
      
      try {
        loading.value = true;
        error.value = null;
        
        // Get enrolled classes (includes isComplete)
        const { classes: loadedClasses = [] } = await FirebaseService.getClasses({
          studentId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true,
          includeEnrollmentInfo: true
        });

        // Filter accepted enrollments
        const acceptedClasses = (loadedClasses || [])
          .filter(classItem => classItem?.enrollment?.status === 'accepted')
          .map(classItem => ({
            ...classItem,
            enrollmentStatus: classItem.enrollment?.status,
            hasClaimedCertificate: false // Initialize flag
          }));

        // Check for existing certificates for completed classes
        const certificateChecks = acceptedClasses.map(async (classItem) => {
            if (classItem.isComplete) { // Only check if class is marked complete by teacher
                 const certificateId = `${user.value.uid}_${classItem.id}`;
                try {
                    const existingCertificate = await FirebaseService.getCertificate(certificateId);
                    if (existingCertificate) {
                        classItem.hasClaimedCertificate = true;
                    }
                } catch (certError) {
                     console.warn(`Error checking for certificate ${certificateId}:`, certError);
                     // Assume not claimed if error occurs during check
                }
            }
            return classItem;
        });

        enrolledClasses.value = (await Promise.all(certificateChecks))
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        // --- Keep the rest of the logic for pending/open classes ---
        pendingClasses.value = (loadedClasses || [])
              .filter(classItem => classItem?.enrollment?.status === 'pending')
              .map(classItem => ({
                ...classItem,
                enrollmentStatus: classItem.enrollment?.status
              }))
              .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
    
        const { classes: openClassesList = [] } = await FirebaseService.getClasses({
              isPublic: true,
              includeQuizzes: true,
              includeTeacherInfo: true
        });
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
        const attemptedClassIds = new Set((attempts || []).map(attempt => attempt.classId));
        openClasses.value = (openClassesList || [])
              .filter(classItem => 
                classItem?.id && 
                attemptedClassIds.has(classItem.id) && 
                !enrolledClasses.value.some(c => c.id === classItem.id) &&
                !pendingClasses.value.some(c => c.id === classItem.id)
              )
              .map(classItem => ({
                ...classItem,
                enrollmentStatus: 'open'
              }))
              .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        // ------------------------------------------------------------

        await loadQuizAttempts(); // Load attempts after class processing
          
      } catch (err) {
        console.error('Error loading classes:', err);
        error.value = 'Failed to load classes';
        showError('Failed to load classes');
      } finally {
        loading.value = false;
        hasMounted.value = true;
      }
    };

    const loadQuizAttempts = async () => {
      if (!user.value?.uid) return;
      
      try {
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
        
        // Initialize the attempts structure
        quizAttempts.value = {};
        quizAttemptsWithBadges.value = {};
        
        // Get all badges for this user
        const badges = await FirebaseService.getUserBadges(user.value.uid);
        
        const badgeMap = new Map(badges.map(badge => [badge.metadata.quizId, {
          hasBadge: true,
          badgeId: badge.id,
          verificationUrl: badge.metadata.verificationUrl,
          metadata: badge.metadata
        }]));

        // Group attempts by classId and quizId
        attempts.forEach(attempt => {
          // Initialize classId object if it doesn't exist
          if (!quizAttempts.value[attempt.classId]) {
            quizAttempts.value[attempt.classId] = {};
          }
          
          // Initialize quizId array if it doesn't exist
          if (!quizAttempts.value[attempt.classId][attempt.quizId]) {
            quizAttempts.value[attempt.classId][attempt.quizId] = [];
          }
          
          // Add the attempt to the array
          quizAttempts.value[attempt.classId][attempt.quizId].push(attempt);
          
          // If score is 100, check if badge exists
          if (attempt.score === 100) {
            if (!quizAttemptsWithBadges.value[attempt.classId]) {
              quizAttemptsWithBadges.value[attempt.classId] = {};
            }
            const badgeData = badgeMap.get(attempt.quizId);
            quizAttemptsWithBadges.value[attempt.classId][attempt.quizId] = {
              ...attempt,
              ...(badgeData || { hasBadge: false })
            };
          }
        });

      } catch (error) {
        console.error('Error loading quiz attempts:', error);
      }
    };

    const getQuizAttempt = (classId, quizId) => {
      
      const attempts = quizAttempts.value[classId]?.[quizId];

      if (!attempts || attempts.length === 0) {
        return null;
      }

      // Sort attempts by timestamp to get the most recent one
      const sortedAttempts = [...attempts].sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB - timeA; // Sort in descending order (most recent first)
      });


      // Get the most recent attempt
      const mostRecentAttempt = sortedAttempts[0];

      // Check if there's a badge for this quiz
      const attemptWithBadge = quizAttemptsWithBadges.value[classId]?.[quizId];
      if (attemptWithBadge) {
        return {
          ...mostRecentAttempt,
          hasBadge: attemptWithBadge.hasBadge,
          badgeId: attemptWithBadge.badgeId
        };
      }

      return mostRecentAttempt;
    };

    // Watch for both user and initialization changes
    watch([() => user.value, () => initialized.value], ([newUser, isInitialized]) => {
      
      if (isInitialized) {
        if (newUser?.uid) {
          loadClasses();
        } else {
          classes.value = [];
          enrolledClasses.value = [];
          loading.value = false;
        }
      }
    }, { immediate: true });

    const leaveClass = async (classId) => {
      if (!user.value) return;
      
      try {
        await FirebaseService.leaveClass(user.value.uid, classId);
        
        // Remove the class from the local state
        classes.value = classes.value.filter(c => c.id !== classId);

        // Dispatch event to update dashboard
        window.dispatchEvent(new CustomEvent('classLeft'));

        showSuccess('Successfully left the class');
      } catch (err) {
        console.error('Error leaving class:', err);
        showError('Failed to leave the class. Please try again.');
      }
    };

    const startQuiz = async (classId, quiz) => {
      try {
        loading.value = true;
        
        // If quiz is just an ID, fetch the full quiz data
        if (typeof quiz === 'string') {
          quiz = await FirebaseService.getQuiz(quiz);
        }
        
        if (!quiz) {
          showError('Quiz not found');
          loading.value = false;
          return;
        }
        
        selectedClassId.value = classId;
        selectedQuiz.value = quiz;
        showQuizModal.value = true;
        
      } catch (error) {
        console.error('Error starting quiz:', error);
        showError('Failed to start quiz');
      } finally {
        loading.value = false;
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
      
      return Math.round((correctAnswers / totalQuestions) * 100);
    };

    const submitQuiz = async () => {
      if (!currentQuiz.value || !user.value) return;
      
      const unansweredQuestions = answers.value.filter(answer => answer === null).length;
      if (unansweredQuestions > 0) {
        showError(`Please answer all questions before submitting. You have ${unansweredQuestions} unanswered questions.`);
        return;
      }
      
      const score = calculateQuizScore();
      quizScore.value = score;
      quizCompleted.value = true;
      
      try {
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
        
        await FirebaseService.createQuizAttempt(attemptData);
        
        // Log detailed activity
        await FirebaseService.createActivity({
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
          await FirebaseService.createActivity({
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
          await FirebaseService.createActivity({
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
        showError('There was an error saving your quiz results. Please try again.');
      }
    };

    const calculateProgress = (classItem) => {
      if (!classItem.quizzes || !classItem.quizzes.length) return 0;
      
      const attempts = quizAttempts.value[classItem.id] || {};
      const totalQuizzes = classItem.quizzes.length;
      const completedQuizzes = Object.values(attempts).filter(attempt => attempt.score >= 80).length;
      
      return Math.round((completedQuizzes / totalQuizzes) * 100);
    };

    const toggleExplanation = (index) => {
      expandedExplanations.value[index] = !expandedExplanations.value[index];
      // Fetch explanation only if expanding and not already fetched
      if (expandedExplanations.value[index] && !explanations.value[index]) {
        getExplanation(index);
      }
    };

    const reviewQuiz = async (classId, quizId) => {
      try {
        loading.value = true;
        showReviewModal.value = true;
        explanations.value = {}; // Clear previous explanations
        expandedExplanations.value = {}; // Clear expanded state
        reviewData.value = null; // Clear previous review data
        
        // Get the most recent quiz attempt
        const attempt = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        
        if (!attempt) {
          showError('No quiz attempt found to review');
          loading.value = false;
          return;
        }
        
        // Get quiz details (contains the canonical questions and correct answers)
        const quizData = await FirebaseService.getQuiz(quizId);
        
        if (!quizData) {
          showError('Quiz not found');
          loading.value = false;
          return;
        }
        
        // Get class details
        let classData = enrolledClasses.value.find(c => c.id === classId);
        if (!classData) {
          classData = openClasses.value.find(c => c.id === classId);
        }
        
        if (!classData) {
          showError('Class not found');
          loading.value = false;
          return;
        }

        // Check for badge
        const badges = await FirebaseService.getUserBadges(user.value.uid);
        const hasBadge = badges.some(badge => 
          badge.metadata.quizId === quizId && 
          badge.metadata.userId === user.value.uid
        );
        
        // Construct reviewData
        reviewData.value = {
          quiz: {
            ...quizData,
            questions: quizData.questions.map((canonicalQuestion, index) => {
              // Find the corresponding question result within the `attempt.questions` array
              // Let's assume it can be matched by index or a `questionIndex` property
              const attemptQuestionData = attempt.questions?.find(q => q.questionIndex === index) || attempt.questions?.[index];

              // Extract the user's selected answer index from the `selectedAnswer` property WITHIN the attempt's question data
              const userAnswer = attemptQuestionData ? attemptQuestionData.selectedAnswer : undefined;
              const correctIndex = canonicalQuestion.correctIndex; // Use correct index from the canonical quiz data
              
              // Re-calculate isCorrect based on the comparison
              const isCorrect = (typeof userAnswer === 'number' && userAnswer === correctIndex);

               // Debug log to verify calculation
               console.log(`   Idx ${index}: User answered ${userAnswer} (from attempt.questions[${index}].selectedAnswer), Correct is ${correctIndex}, Calculated Correct: ${isCorrect}`);
               // -------------------------------------

              return {
                ...canonicalQuestion, 
                userAnswer: userAnswer, // Assign the extracted userAnswer to the reviewData question object
                isCorrect: isCorrect,   // Newly calculated correctness
              };
            })
          },
          attempt: {
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.questionCount,
            timeSpent: attempt.timeSpent,
            submittedAt: attempt.timestamp // Use the attempt's timestamp
          },
          class: {
            id: classId,
            name: classData.name
          },
          hasBadge
        };

      } catch (error) {
        console.error('Error loading quiz review:', error);
        showError('Failed to load quiz review');
      } finally {
        loading.value = false;
      }
    };

    const getExplanation = async (questionIndex) => {
      // Add loading state immediately for feedback
      explanations.value[questionIndex] = 'loading'; 
      // Ensure reviewData and the specific question exist
      if (!reviewData.value?.quiz?.questions?.[questionIndex]) {
        explanations.value[questionIndex] = "Error: Question data is missing.";
        console.error("Missing question data for explanation at index:", questionIndex);
        return;
      }

      try {
        const question = reviewData.value.quiz.questions[questionIndex];
        const userAnswerIndex = question.userAnswer; // May be undefined
        const correctIndex = question.correctIndex;

        // --- Enhanced Validation --- 
        // 1. Check if userAnswerIndex is a valid number first
        if (typeof userAnswerIndex !== 'number') {
            explanations.value[questionIndex] = "Error: User answer not recorded for this question in the attempt.";
            console.error("Invalid user answer index for explanation:", { question, userAnswerIndex, correctIndex });
            return; // Exit early
        }

        // 2. Check other indices and options array existence
        if (typeof correctIndex !== 'number' ||
            !question.options || 
            !question.options[correctIndex] ||
            !question.options[userAnswerIndex]) { // Now userAnswerIndex is guaranteed to be a number
            
            explanations.value[questionIndex] = "Error: Could not retrieve valid answer/option details for explanation.";
            console.error("Invalid correctIndex or options data for explanation:", { question, userAnswerIndex, correctIndex });
            return;
        }
        // --- End Enhanced Validation ---

        // Safe to access .text now
        const correctAnswerText = question.options[correctIndex].text;
        const userAnswerText = question.options[userAnswerIndex].text;

        const prompt = `Explain in simple, concise language why \"${correctAnswerText}\" is the correct answer \
        to the question: \"${question.text}\". Only address how the correct answer is different from the student's chosen answer:\
         \"${userAnswerText}\". Use simple, professional language and no formatting. Don't give more than 4-5 sentences.`;
        
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

    const closeQuizModal = async () => {
      showQuizModal.value = false;
      selectedQuiz.value = null;
      selectedClassId.value = null;
      
      // Refresh both quiz attempts and classes
      await Promise.all([
        loadQuizAttempts(),
        loadClasses()
      ]);
    };

    const closeReviewModal = () => {
      showReviewModal.value = false;
      explanations.value = {};
      expandedExplanations.value = {}; // Clear expanded state on close
    };

    const calculateImprovement = async (classId, quizId, currentScore) => {
      try {
        const previousAttempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        
        if (previousAttempts.length === 0) return null;
        
        const scores = previousAttempts.map(attempt => attempt.score);
        const previousBest = Math.max(...scores);
        return currentScore > previousBest ? currentScore - previousBest : 0;
      } catch (error) {
        console.error('Error calculating improvement:', error);
        return null;
      }
    };

    const handleQuizCompleted = async (results) => {
      closeQuizModal();
      // Refresh quiz attempts
      const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid);
      quizAttempts.value = {};
      attempts.forEach(attempt => {
        if (!quizAttempts.value[attempt.classId]) {
          quizAttempts.value[attempt.classId] = {};
        }
        if (!quizAttempts.value[attempt.classId][attempt.quizId]) {
          quizAttempts.value[attempt.classId][attempt.quizId] = [];
        }
        quizAttempts.value[attempt.classId][attempt.quizId].push(attempt);
      });
      await loadClasses(); // Refresh the classes list to show updated quiz status
    };

    const showQuizReview = async (classId, quizId) => {
      try {
        loading.value = true;
        
        // Get the quiz attempt
        const attempts = await FirebaseService.getQuizAttemptsByUser(user.value.uid, quizId);
        
        if (!attempts || attempts.length === 0) {
          showError('No quiz attempt found to review');
          return;
        }
        
        // Get the most recent attempt
        const attempt = attempts[0];
        
        // Get quiz details
        const quiz = await FirebaseService.getQuiz(quizId);
        if (!quiz) {
          showError('Quiz not found');
          return;
        }
        
        // Get class details
        const classData = classes.value.find(c => c.id === classId);
        if (!classData) {
          showError('Class not found');
          return;
        }
        
        // Set the review data
        reviewData.value = {
          quiz: {
            ...quiz,
            questions: quiz.questions.map((q, index) => ({
              ...q,
              userAnswer: attempt.answers?.[index],
              isCorrect: attempt.questionResults?.[index]?.isCorrect,
              selectedOption: attempt.questionResults?.[index]?.selectedOption,
              correctIndex: q.correctIndex
            }))
          },
          attempt: {
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.questionCount,
            timeSpent: attempt.timeSpent,
            submittedAt: attempt.timestamp?.toDate()
          },
          class: {
            id: classId,
            name: classData.name
          }
        };
        
        showReviewModal.value = true;
      } catch (error) {
        console.error('Error loading quiz review:', error);
        showError('Failed to load quiz review');
      } finally {
        loading.value = false;
      }
    };

    const claimBadge = async () => {
      try {
        if (!reviewData.value) return;
        isMintingBadge.value = true;

        // Check if badge already exists in Firebase
        const hasBadge = await FirebaseService.checkBadgeExists(user.value.uid, reviewData.value.quiz.id);
        if (hasBadge) {
          showError('You already have this badge!');
          isMintingBadge.value = false;
          return;
        }

        // Show initial loading state
        showSuccess('Issuing your badge...');
        
        // Claim the badge using FirebaseService.claimBadge
        const result = await FirebaseService.claimBadge(
          user.value.uid,
          reviewData.value.quiz.id,
          reviewData.value.class.id,
          reviewData.value.attempt.score
        );
        
        if (result.success) {
          showSuccess('Badge claimed successfully!');
          await loadClasses(); // Refresh classes, activities, achievements
          activeTab.value = 'achievements'; // Switch to achievements tab
          showReviewModal.value = false; // Close the modal
        } else {
          showError(result.message || 'Failed to claim badge');
        }
      } catch (error) {
        console.error('Error claiming badge:', error);
        showError('Failed to claim badge. Please try again.');
      } finally {
        isMintingBadge.value = false;
      }
    };

    const loadQuizzes = async () => {
      if (!user.value) return;
      
      try {
        loading.value = true;
        const fetchedQuizzes = await FirebaseService.getTeacherQuizzes(user.value.uid);
        
        // Fetch class names for each quiz
        const quizzesWithClassNames = await Promise.all(
          fetchedQuizzes.map(async (quiz) => {
            const classData = await FirebaseService.getClass(quiz.classId);
            return {
              ...quiz,
              className: classData?.name || 'Unknown Class'
            };
          })
        );
        
        // Sort quizzes by creation time in ascending order (oldest first)
        classes.value = quizzesWithClassNames.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeA - timeB;
        });
      } catch (error) {
        console.error('Error loading quizzes:', error);
        showError('Failed to load quizzes');
      } finally {
        loading.value = false;
      }
    };

    const joinClassWithCode = async () => {
      const code = joinClassCode.value.trim();
      if (!code || !user.value?.uid) {
        showError('Please enter a valid class code.');
        return;
      }

      try {
        loading.value = true;
        joiningClass.value = true;
        // Assuming enrollInClass can handle a class code OR class ID
        const result = await FirebaseService.enrollInClass(code, user.value.uid); 
        
        if (result.success) {
          showSuccess(result.message || 'Successfully joined/requested class!');
          joinClassCode.value = ''; // Clear input on success
          await loadClasses(); // Refresh class lists
        } else {
          showError(result.message || 'Failed to join class. Invalid code or already enrolled?');
        }
      } catch (err) {
        console.error('Error joining class with code:', err);
        showError('An error occurred while trying to join the class.');
      } finally {
        loading.value = false;
        joiningClass.value = false;
      }
    };

    // --- Certificate Claim Logic ---
    const hasMetQuizRequirements = (classItem) => {
      if (!classItem || !classItem.quizzes || classItem.quizzes.length === 0) {
        return false; // No quizzes assigned
      }

      const requiredQuizIds = classItem.quizzes.map(q => q.id);
      
      // Check if the student has a 100% attempt for EACH required quiz
      for (const quizId of requiredQuizIds) {
        // Ensure quizAttempts for the class exists before accessing by quizId
        const attemptsForClass = quizAttempts.value[classItem.id];
        if (!attemptsForClass) return false; // No attempts recorded for this class yet

        const attemptsForQuiz = (attemptsForClass[quizId] || []).filter(attempt => attempt.quizId === quizId); 
        const hasPerfectAttempt = attemptsForQuiz.some(attempt => 
          attempt.score === 100 || 
          (attempt.correctAnswers && attempt.questionCount && attempt.correctAnswers === attempt.questionCount)
        );
        
        if (!hasPerfectAttempt) {
          return false; // Missing a 100% score for at least one quiz
        }
      }

      return true; // All quiz requirements met
    };

    const claimCertificate = async (classItem) => {
      if (!user.value || !classItem) {
        showError("Cannot claim certificate. User or class data missing.");
        return;
      }

      // Double-check eligibility just before claiming
      if (!hasMetQuizRequirements(classItem)) {
          showError("Eligibility requirements not met.");
          return;
      }

      isMintingBadge.value = true; 
      showSuccess(`Generating certificate for ${classItem.name}...`);

      try {
          // Fetch user profile to get the full name
          const userProfile = await FirebaseService.getUserProfile(user.value.uid);
          const studentFullName = userProfile?.name || user.value.displayName || 'Student'; // Fallback logic

          const certificateData = {
              userId: user.value.uid,
              studentName: studentFullName, // Use fetched full name
              classId: classItem.id,
              className: classItem.name,
              teacherId: classItem.teacherId,
              teacherName: classItem.teacherName,
              // Add any other relevant details, e.g., list of quiz IDs passed
              quizIds: classItem.quizzes.map(q => q.id),
          };

          const result = await FirebaseService.createCertificate(certificateData);

          if (result.alreadyExists) {
              showSuccess('Certificate already claimed!');
              // Redirect to the existing certificate page
              window.location.href = `/certificates/${result.id}`;
          } else {
              showSuccess('Certificate successfully claimed!');
              // Refresh data to potentially hide the button
              await loadClasses();
              // Optionally redirect to the new certificate page
               window.location.href = `/certificates/${result.id}`;
          }

      } catch (error) {
          console.error("Error claiming certificate:", error);
          showError("Failed to claim certificate. Please try again.");
      } finally {
          isMintingBadge.value = false; // Turn off loading state
      }
    };
    // --- End Certificate Claim Logic ---

    onMounted(async () => {
      if (user.value?.uid && initialized.value) {
        await loadClasses();
      }
      
      // Listen for class joined event
      window.addEventListener('classJoined', async () => {
        await loadClasses();
      });

      // Listen for custom refresh event
      const component = document.querySelector('student-classes');
      if (component) {
        component.addEventListener('refreshClasses', async () => {
          await loadClasses();
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
      expandedExplanations,
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
      showSuccess,
      showError,
      activeTab,
      tabs,
      filteredClasses,
      enrolledClasses,
      pendingClasses,
      openClasses,
      handleQuizCompleted,
      showQuizReview,
      reviewData,
      claimBadge,
      isMintingBadge,
      isEnrolled,
      loadQuizzes,
      selectedClassId,
      currentClassId,
      joinClassCode,
      joinClassWithCode,
      joiningClass,
      attemptToReview,
      hasMounted,
      toggleExplanation,
      hasMetQuizRequirements,
      claimCertificate,
      user
    };
  }
};
</script> 