<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">Class Manager</h2>
    <h3 class="text-gray-500 text-sm">Create a class and manage a student roster. You can create private classes by invitation only for enrolled students, or host an open class where you don't have to manage enrollment. Custom skins for classes are available for premium users.</h3>
    <!-- Create New Class -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Create New Class</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Class Name
          </label>
          <input
            v-model="newClass.name"
            type="text"
            class="w-full p-2 border rounded-lg"
            placeholder="Enter class name"
            data-testid="class-name-input"
          />
        </div>
        <div class="mb-4 rounded bg-gray-50 p-4">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="newClass.isPublic"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              data-testid="class-public-checkbox"
            />
            <span class="text-sm font-medium text-gray-700">Make this class public</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Public classes can be discovered and joined by any student.
          </p>
        </div>
        <!-- Wrap skin selector in v-if="hasMounted" -->
        <template v-if="hasMounted">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Skin
            </label>
            <select
              v-model="newClass.skinId"
              class="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              data-testid="class-skin-select"
              :disabled="!isPaidUser"
            >
              <option v-for="skin in availableSkins" :key="skin.id" :value="skin.id">
                {{ skin.name }} ({{ skin.ageRange }})
              </option>
            </select>
            <p v-if="!isPaidUser" class="mt-1 text-sm text-gray-500">Default skin will be used. Upgrade to Premium to choose custom skins.</p>
          </div>
        </template>
        <button
          @click="createClass"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          data-testid="create-class-button"
        >
          Create Class
        </button>
      </div>
    </div>

    <!-- Class List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Tab Navigation -->
      <div class="mb-4 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'active'"
            :class="[
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            aria-current="page"
            data-testid="active-classes-tab"
          >
            Your Classes ({{ activeClasses.length }})
          </button>
          <button
            @click="activeTab = 'completed'"
            :class="[
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            data-testid="completed-classes-tab"
          >
            Completed Classes ({{ completedClasses.length }})
          </button>
        </nav>
      </div>

      <!-- Active Classes Tab Content -->
      <div v-if="activeTab === 'active'">
        <h2 class="text-2xl font-bold mb-4">Your Classes</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">Loading classes...</div>
        <div v-else-if="activeClasses.length === 0" class="text-gray-500 text-center py-4">
          No active classes created yet.
        </div>
        <div v-else class="space-y-4">
          <!-- Class Item Loop (Active) -->
          <div
            v-for="classItem in activeClasses"
            :key="classItem.id"
            class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300"
          >
            <!-- Class Header & Actions -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2">
                  <IconService v-if="!classItem.isPublic" name="lock" color="text-red-600" size="4" tooltip="This class is private, open only to enrolled students" />
                  <IconService v-if="classItem.isPublic" name="open-lock" color="text-green-600" size="4" tooltip="This class is public, open to all students" />
                  <h3 class="text-xl font-bold text-gray-800">{{ classItem.name }}</h3>
                  <label :for="`complete-toggle-${classItem.id}`" class="flex items-center cursor-pointer ml-4" title="Mark as Complete">
                    <div class="relative">
                      <input 
                        type="checkbox" 
                        :id="`complete-toggle-${classItem.id}`" 
                        class="sr-only peer" 
                        :checked="classItem.isComplete" 
                        @change="toggleClassComplete(classItem)"
                      >
                      <div class="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-green-500 transition"></div>
                      <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-full"></div>
                    </div>
                    <span class="ml-2 text-sm font-medium text-gray-700">Mark as complete</span>
                  </label>
                </div>
                <!-- Explanatory text for active class toggle -->
                <p class="text-xs text-gray-500 mt-1">
                  Marking a class as complete prevents an instructor from adding new quizzes and allows students to claim certificates upon completion of all quizzes..
                </p>
                <p class="text-sm text-gray-600 mt-1">Code: 
                    <code class="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{{ classItem.code }}</code>
                    <button 
                        @click="openInviteModal(classItem)"
                        class="ml-2 text-primary-600 hover:text-primary-800 hover:underline text-xs font-medium"
                        title="Generate Invitation Text"
                    >
                        (Invite Students)
                    </button>
                </p>
                <p class="text-sm text-gray-500">
                  Created: {{ formatDate(classItem.createdAt) }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editClass(classItem)"
                  class="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Class"
                >
                  <IconService name="edit" size="6" />
                </button>
                <button
                  @click="deleteClass(classItem.id)"
                  class="text-red-500 hover:text-red-700 p-1"
                  title="Delete Class"
                >
                  <IconService name="trash" size="6" />
                </button>
              </div>
            </div>
            <!-- Class Roster -->
            <div class="mt-6">
              <ClassRoster :classId="classItem.id" :className="classItem.name" />
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Classes Tab Content -->
      <div v-if="activeTab === 'completed'">
        <h2 class="text-2xl font-bold mb-4">Completed Classes</h2>
         <div v-if="loading" class="text-center py-4 text-gray-500">Loading classes...</div>
        <div v-else-if="completedClasses.length === 0" class="text-gray-500 text-center py-4">
          No classes marked as complete yet.
        </div>
        <div v-else class="space-y-4">
          <!-- Class Item Loop (Completed) -->
           <div
            v-for="classItem in completedClasses"
            :key="classItem.id"
            class="rounded-lg shadow-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-shadow duration-300 opacity-80"
          >
            <!-- Class Header & Actions -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold text-gray-600">{{ classItem.name }}</h3>
                  <label :for="`reopen-toggle-${classItem.id}`" class="flex items-center cursor-pointer ml-4" title="Reopen Class">
                    <div class="relative">
                      <input 
                        type="checkbox" 
                        :id="`reopen-toggle-${classItem.id}`" 
                        class="sr-only peer" 
                        :checked="classItem.isComplete" 
                        @change="toggleClassComplete(classItem)"
                      >
                      <div class="block bg-green-500 w-10 h-6 rounded-full peer-checked:bg-gray-300 transition"></div>
                      <div class="absolute left-auto right-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-[-100%]"></div>
                    </div>
                    <span class="ml-2 text-sm font-medium text-gray-700">Reopen class</span>
                  </label>
                </div>
                <p class="text-sm text-gray-500 mt-1">Code: 
                    <code class="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{{ classItem.code }}</code>
                    <button 
                        @click="openInviteModal(classItem)"
                        class="ml-2 text-primary-600 hover:text-primary-800 hover:underline text-xs font-medium"
                        title="Generate Invitation Text"
                    >
                        (Invite Students)
                    </button>
                </p>
                <p class="text-sm text-gray-400">
                  Created: {{ formatDate(classItem.createdAt) }}
                </p>
                
              </div>
              <div class="flex items-center space-x-4">
                <button
                  @click="editClass(classItem)"
                  class="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Class"
                >
                  <IconService name="edit" size="6" />
                </button>
                <button
                  @click="deleteClass(classItem.id)"
                  class="text-red-500 hover:text-red-700 p-1"
                  title="Delete Class"
                >
                  <IconService name="trash" size="6" />
                </button>
              </div>
            </div>

             <!-- Class Quizzes (Read-only for Completed Classes) -->
             <div class="mt-4">
               <h4 class="font-medium mb-2 text-gray-600">Quizzes</h4>
               <div v-if="classItem.quizzes?.length === 0" class="text-gray-500 text-sm">
                 No quizzes were assigned to this class.
               </div>
               <div v-else class="space-y-2" :data-testid="`assigned-quiz-list-${classItem.id}`">
                 <div
                   v-for="quiz in classItem.quizzes"
                   :key="quiz.id"
                   class="rounded-lg shadow p-3 bg-gradient-to-br from-gray-100 to-gray-200"
                 >
                   <div class="text-lg font-medium text-gray-700 text-left">
                     {{ quiz.title }}
                   </div>
                 </div>
               </div>
             </div>


            <!-- Class Roster -->
            <div class="mt-6">
              <ClassRoster :classId="classItem.id" :className="classItem.name" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Class Modal -->
    <div v-if="editingClass" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Edit Class</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <input
              v-model="editingClass.name"
              type="text"
              class="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Class Code (for students to join)
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-model="editingClass.code"
                type="text"
                class="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
                readonly
              />
              <button
                @click="copyClassCode"
                class="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 w-24 text-center"
                :class="{ 'bg-green-600': editModalCopyButtonText === 'Copied!', 'bg-red-600': editModalCopyButtonText === 'Failed' || editModalCopyButtonText === 'Error' }"
                :disabled="editModalCopyButtonText !== 'Copy'"
              >
                {{ editModalCopyButtonText }}
              </button>
            </div>
          </div>
          <!-- Wrap skin selector in v-if="hasMounted" -->
          <template v-if="hasMounted">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Skin
              </label>
              <select
                v-model="editingClass.skinId"
                class="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                :disabled="!isPaidUser"
              >
                <option v-for="skin in availableSkins" :key="skin.id" :value="skin.id">
                  {{ skin.name }} ({{ skin.ageRange }})
                </option>
              </select>
              <p v-if="!isPaidUser" class="mt-1 text-sm text-gray-500">Default skin will be used. Upgrade to Premium to choose custom skins.</p>
            </div>
          </template>

          <!-- Custom Certificate Badge Upload (Paid Users Only) -->
          <div v-if="isPaidUser">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Custom Certificate Badge (Optional)
            </label>
            <div class="mt-1 flex items-center space-x-4">
              <!-- Preview -->
              <img
                v-if="editingBadgeImagePreview"
                :src="editingBadgeImagePreview"
                alt="Badge Preview"
                class="h-16 w-16 rounded-md object-cover border"
              />
               <img
                v-else-if="editingClass.customCertificateBadgeUrl"
                :src="editingClass.customCertificateBadgeUrl"
                alt="Current Badge"
                class="h-16 w-16 rounded-md object-cover border"
              />
              <span v-else class="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs border">
                Default
              </span>
              <!-- Upload Button -->
              <label class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span>{{ editingBadgeImageName ? 'Change Image' : 'Upload New Image' }}</span>
                <input
                  ref="editBadgeInputRef"
                  type="file"
                  @change="handleEditBadgeImageUpload"
                  accept="image/*"
                  class="sr-only"
                >
              </label>
              <span v-if="editingBadgeImageName" class="text-sm text-gray-500 truncate max-w-[150px]">{{ editingBadgeImageName }}</span>
               <!-- Remove Button -->
               <button
                  v-if="editingClass.customCertificateBadgeUrl || editingBadgeImagePreview"
                  @click="removeCustomCertificateBadge"
                  class="text-red-600 hover:text-red-800 text-sm"
                  title="Remove custom badge and use default"
                >
                  Remove
                </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Upload an image to replace the default badge on completion certificates for this class.</p>
          </div>
           <div v-else class="text-sm text-gray-500 p-3 border rounded-md bg-gray-50 italic">
              Upgrade to Premium to upload custom certificate badges.
            </div>

        </div>
        <div class="flex justify-end space-x-4 mt-6">
          <!-- Cancel Button -->
           <button
             @click="editingClass = null"
             class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
           >
             Cancel
           </button>
          <!-- Save Changes Button -->
           <button
             @click="saveClass"
             class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
           >
             Save Changes
           </button>
        </div>
      </div>
    </div>

    <!-- NEW: Invite Student Modal -->
    <InviteStudentModal 
      :show="showInviteModal" 
      :classData="selectedClassForInvite" 
      @close="showInviteModal = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useAuth } from '../stores/auth';
import ClassRoster from './ClassRoster.vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';
import FirebaseService from '../lib/firebaseService';
import { useSkin } from '../composables/useSkin';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import InviteStudentModal from './InviteStudentModal.vue';

export default {
  name: 'ClassManager',
  components: {
    ClassRoster, IconService, InviteStudentModal
  },
  setup() {
    const { user } = useAuth();
    const { availableSkins } = useSkin();
    const classes = ref([]);
    const availableQuizzes = ref([]);
    const classesWithQuizzes = ref([]);
    const newClass = ref({
      name: '',
      code: '',
      isPublic: false,
      skinId: 'default'
    });
    const editingClass = ref(null);
    const selectedQuiz = ref('');
    const { showSuccess, showError } = useNotification();
    const loading = ref(false);
    const showCreateClassModal = ref(true);
    const hasMounted = ref(false);
    const activeTab = ref('active'); // 'active' or 'completed'
    const editBadgeInputRef = ref(null);
    const editingBadgeImageFile = ref(null);
    const editingBadgeImagePreview = ref(null);
    const editingBadgeImageName = ref('');
    const showInviteModal = ref(false);
    const selectedClassForInvite = ref(null);
    const editModalCopyButtonText = ref('Copy');
    let editModalCopyTimeout = null;

    // Computed property for paid status
    const isPaidUser = computed(() => user.value?.paid === true);

    // Computed properties for filtering classes
    const activeClasses = computed(() => classes.value.filter(c => !c.isComplete));
    const completedClasses = computed(() => classes.value.filter(c => c.isComplete));

    const createClass = async () => {
      if (!user.value) {
          return;
      }
      
      if (!newClass.value.name.trim()) {
        showError('Please enter a class name');
        return;
      }
      
      try {
        loading.value = true;
        const classData = {
          name: newClass.value.name.trim(),
          code: newClass.value.code, // Server generates this anyway
          isPublic: newClass.value.isPublic,
          skinId: isPaidUser.value ? newClass.value.skinId : 'default',
          teacherId: user.value.uid,
          teacherName: user.value.displayName || 'Unknown Teacher',
          createdAt: new Date(), // Replaced by serverTimestamp in service
          updatedAt: new Date(), // Replaced by serverTimestamp in service
        };
        
        const newClassId = await FirebaseService.createClass(classData);
        
        // Reset form
        newClass.value = {
          name: '',
          code: '',
          isPublic: false,
          skinId: 'default'
        };
        
        showCreateClassModal.value = false;
        showSuccess('Class created successfully');
        await fetchClasses();
        // Emit event to refresh stats
        window.dispatchEvent(new CustomEvent('refreshStats'));
      } catch (error) {
        showError('Failed to create class');
      } finally {
        loading.value = false;
      }
    };

    const fetchClasses = async () => {
      if (!user.value) return;

      try {
        const response = await FirebaseService.getClasses({
          teacherId: user.value.uid,
          includeQuizzes: true,
          includeTeacherInfo: true,
          includeEnrollmentInfo: true
        });
        
        if (response && response.classes) {
          classes.value = response.classes.map(classItem => ({
            ...classItem,
            totalSubmissions: response.totalSubmissions || 0
          }));
        } else {
          classes.value = [];
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        showError('Error fetching classes. Please try again.');
      }
    };

   
    const editClass = (classItem) => {
      editingBadgeImageFile.value = null;
      editingBadgeImageName.value = '';
      editingBadgeImagePreview.value = null;
      editingClass.value = { ...classItem };
      if (!editingClass.value.skinId) {
        editingClass.value.skinId = 'default';
      }
      editModalCopyButtonText.value = 'Copy';
      if (editModalCopyTimeout) {
        clearTimeout(editModalCopyTimeout);
        editModalCopyTimeout = null;
      }
    };

    const saveClass = async () => {
      if (!editingClass.value) return;

      if (!editingClass.value.name.trim()) {
        showError('Class name cannot be empty');
        return;
      }

      loading.value = true;

      try {
        let customBadgeUrl = editingClass.value.customCertificateBadgeUrl;

        if (editingBadgeImageFile.value) {
          customBadgeUrl = await uploadToCloudinary(editingBadgeImageFile.value);
          if (!customBadgeUrl) {
            throw new Error('Failed to upload new badge image.');
          }
        } else if (editingClass.value.customCertificateBadgeUrl === null) {
          customBadgeUrl = null;
        }

        const updateData = {
          name: editingClass.value.name.trim(),
          isPublic: editingClass.value.isPublic || false,
          skinId: isPaidUser.value ? (editingClass.value.skinId || 'default') : 'default',
          customCertificateBadgeUrl: customBadgeUrl,
          updatedAt: new Date()
        };

        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            if (key !== 'customCertificateBadgeUrl') {
              delete updateData[key];
            }
          }
        });

        if (updateData.customCertificateBadgeUrl === undefined) {
          delete updateData.customCertificateBadgeUrl;
        }

        await FirebaseService.updateClass(editingClass.value.id, updateData);

        editingClass.value = null;
        showSuccess('Class updated successfully');
        await fetchClasses();
        window.dispatchEvent(new CustomEvent('refreshStats'));
      } catch (error) {
        showError(`Error saving class: ${error.message || 'Please try again.'}`);
      } finally {
        loading.value = false;
        editingBadgeImageFile.value = null;
        editingBadgeImageName.value = '';
        editingBadgeImagePreview.value = null;
      }
    };

    const deleteClass = async (classId) => {
      if (!confirm('Are you sure you want to delete this class?')) return;

      try {
        await FirebaseService.deleteClass(classId);
        classes.value = classes.value.filter(c => c.id !== classId);
        showSuccess('Class deleted successfully');
        // Emit event to refresh stats
        window.dispatchEvent(new CustomEvent('refreshStats'));
      } catch (error) {
        console.error('Error deleting class:', error);
        showError('Error deleting class. Please try again.');
      }
    };

    

    const copyClassCode = async () => {
      if (!editingClass.value?.code) return;
      if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        editModalCopyButtonText.value = 'Error';
        if (editModalCopyTimeout) clearTimeout(editModalCopyTimeout);
        editModalCopyTimeout = setTimeout(() => { editModalCopyButtonText.value = 'Copy'; }, 2500);
        return;
      }
      try {
        await navigator.clipboard.writeText(editingClass.value.code);
        editModalCopyButtonText.value = 'Copied!';
        if (editModalCopyTimeout) clearTimeout(editModalCopyTimeout);
        editModalCopyTimeout = setTimeout(() => { editModalCopyButtonText.value = 'Copy'; }, 2500);
      } catch (err) {
        console.error('Failed to copy class code: ', err);
        editModalCopyButtonText.value = 'Failed';
        if (editModalCopyTimeout) clearTimeout(editModalCopyTimeout);
        editModalCopyTimeout = setTimeout(() => { editModalCopyButtonText.value = 'Copy'; }, 2500);
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const toggleClassComplete = async (classItem) => {
      const newState = !classItem.isComplete;
      const actionText = newState ? 'mark as complete' : 'reopen';
      const confirmationMessage = `Are you sure you want to ${actionText} the class "${classItem.name}"?`;

      if (!confirm(confirmationMessage)) return;

      try {
        loading.value = true;
        await FirebaseService.updateClass(classItem.id, { isComplete: newState });

        const index = classes.value.findIndex(c => c.id === classItem.id);
        if (index !== -1) {
          classes.value[index].isComplete = newState;
          classes.value[index].updatedAt = new Date(); // Simulate update timestamp
        }
        
        showSuccess(`Class successfully ${newState ? 'marked as complete' : 'reopened'}.`);
      } catch (error) {
        console.error(`Error updating class completion status for ${classItem.id}:`, error);
        showError(`Failed to ${actionText} class. Please try again.`);
      } finally {
        loading.value = false;
      }
    };

    const handleEditBadgeImageUpload = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      editingBadgeImageFile.value = file;
      editingBadgeImageName.value = file.name;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        editingBadgeImagePreview.value = e.target?.result;
      };
      reader.readAsDataURL(file);
    };

    const removeCustomCertificateBadge = () => {
      editingBadgeImageFile.value = null;
      editingBadgeImageName.value = '';
      editingBadgeImagePreview.value = null;
      if (editingClass.value) {
        editingClass.value.customCertificateBadgeUrl = null;
      }
    };

    const openInviteModal = (classItem) => {
      console.log("Opening invite modal for:", classItem);
      selectedClassForInvite.value = { 
        id: classItem.id, 
        name: classItem.name, 
        code: classItem.code 
      }; // Pass only necessary data
      showInviteModal.value = true;
    };

    onMounted(() => {
      hasMounted.value = true;
      fetchClasses();
    });

    // NEW: Cleanup timeout on unmount
    onUnmounted(() => {
      if (editModalCopyTimeout) {
        clearTimeout(editModalCopyTimeout);
      }
    });

    // Optional: Watcher for debugging state changes
    watch(user, (newUser) => {
    }, { deep: true });


    return {
      user,
      classes,
      newClass,
      editingClass,
      createClass,
      editClass,
      saveClass,
      deleteClass,
      copyClassCode,
      formatDate,
      classesWithQuizzes,
      showCreateClassModal,
      loading,
      hasMounted,
      availableSkins,
      isPaidUser,
      activeTab,
      activeClasses,
      completedClasses,
      toggleClassComplete,
      editBadgeInputRef,
      editingBadgeImagePreview,
      editingBadgeImageName,
      handleEditBadgeImageUpload,
      removeCustomCertificateBadge,
      showInviteModal,
      selectedClassForInvite,
      openInviteModal,
      editModalCopyButtonText
    };
  }
};
</script> 