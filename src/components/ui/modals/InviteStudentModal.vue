<template>
  <div v-if="show" 
       class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
       @click.self="closeModal" 
       aria-modal="true"
       role="dialog"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 relative">
      <button 
        @click="closeModal"
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Close modal"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <h3 class="text-xl font-semibold mb-4 text-gray-800">Invite Students to {{ classData?.name }}</h3>
      
      <p class="text-sm text-gray-600 mb-2">Copy the text below and share it with your students via email, message, or your usual communication channel:</p>
      
      <div class="relative mb-4">
        <textarea 
          ref="invitationTextarea"
          readonly 
          class="w-full h-48 p-3 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
          v-model="invitationText"
          aria-label="Invitation text"
        ></textarea>
      </div>
      
      <div class="flex justify-end space-x-3 mt-5">
        <button 
          @click="closeModal" 
          class="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 text-sm font-medium"
        >
          Close
        </button>
        <button 
          @click="copyToClipboard" 
          class="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition duration-150 text-sm font-medium flex items-center"
          :class="{ 'bg-green-600': copyButtonText === 'Copied!' }"
        >
         <svg v-if="copyButtonText === 'Copy Text'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else-if="copyButtonText === 'Copied!'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
           <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
          {{ copyButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '../../../stores/auth'; 

const props = defineProps({
  show: { type: Boolean, default: false },
  classData: { type: Object, default: null } // Expects { id, name, code }
});

const emit = defineEmits(['close']);

const { user } = useAuth();
const teacherName = computed(() => user.value?.name || 'Your Teacher');
const platformName = 'https://differentest.club'; // Hardcoded platform name for now
const invitationTextarea = ref(null);

const invitationText = computed(() => {
  if (!props.classData?.code) return 'Loading invitation...';
  // Basic template - can be customized further
  return `Hello, everyone,\n\nPlease join our class "${props.classData.name}" on ${platformName}.\n\nMake sure to sign into ${platformName} with your email and password as a student.\n\nUse this code to enroll: ${props.classData.code}\n\nLooking forward to seeing you there!\n\nBest,\n${teacherName.value}`;
});

const copyButtonText = ref('Copy Text');
let copyTimeout = null;

async function copyToClipboard() {
  if (!navigator.clipboard) {
    console.error('Clipboard API not available');
    copyButtonText.value = 'Not Supported';
    return;
  }
  try {
    await navigator.clipboard.writeText(invitationText.value);
    copyButtonText.value = 'Copied!';
    if (copyTimeout) clearTimeout(copyTimeout); // Clear previous timeout if any
    copyTimeout = setTimeout(() => { copyButtonText.value = 'Copy Text'; }, 2500); // Reset after 2.5s
  } catch (err) {
    console.error('Failed to copy text: ', err);
    copyButtonText.value = 'Copy Failed';
     if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => { copyButtonText.value = 'Copy Text'; }, 2500);
  }
}

function closeModal() {
  emit('close');
}

// Reset button text if modal is reopened
watch(() => props.show, (newValue) => {
    if(newValue) {
        copyButtonText.value = 'Copy Text';
        if (copyTimeout) clearTimeout(copyTimeout);
    }
}, { immediate: true }); // Immediate check in case shown initially

// Select text in textarea when modal opens for potential manual copy
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Use nextTick to ensure the element is in the DOM
    nextTick(() => {
      invitationTextarea.value?.select();
    });
  }
});

// Cleanup timeout on unmount
import { onUnmounted, nextTick } from 'vue';
onUnmounted(() => {
  if (copyTimeout) clearTimeout(copyTimeout);
});

</script>

<style scoped>
/* Add basic transition for modal appearance if needed */
.fixed {
  transition: opacity 0.3s ease;
}
</style> 