<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Curriculum Viewer</h1>
    
    <div v-if="loading" class="text-center py-10">
      <p>Loading curriculum...</p>
      </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <div v-else class="prose max-w-none bg-white p-6 rounded shadow">
      <div v-html="renderedCurriculum"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';

// Sample Markdown Content (Replace with actual fetching logic later)
const sampleMarkdown = `
# Sample Curriculum: Introduction to Vue.js

## Module 1: Getting Started

- What is Vue.js?
- Setting up your development environment
- Your first Vue application

## Module 2: Core Concepts

- Template Syntax
- Data Binding
- Computed Properties and Watchers

## Module 3: Components

- Introduction to Components
- Props and Events
- Slots

---

*This is a sample curriculum.*
`;

export default {
  name: 'CurriculumViewer',
  setup() {
    const curriculumContent = ref('');
    const loading = ref(true);
    const error = ref(null);

    const renderedCurriculum = computed(() => {
      try {
        return marked(curriculumContent.value || '');
      } catch (err) {
        console.error('Error parsing Markdown:', err);
        error.value = 'Failed to render curriculum content.';
        return '<p>Error rendering content.</p>';
      }
    });

    const loadCurriculum = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Simulate fetching content
        await new Promise(resolve => setTimeout(resolve, 500)); 
        curriculumContent.value = sampleMarkdown;
      } catch (err) {
        console.error('Error loading curriculum:', err);
        error.value = 'Could not load curriculum content.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadCurriculum();
    });

    return {
      loading,
      error,
      renderedCurriculum,
    };
  },
};
</script>

<style>
/* Add any specific styles for the curriculum viewer if needed */
.prose {
  /* Tailwind's prose class provides default styling for markdown */
}
</style> 