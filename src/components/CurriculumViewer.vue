<template>
  <div class="container mx-auto p-6">
    
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

export default {
  name: 'CurriculumViewer',
  props: {
    markdownContent: {
      type: String,
      required: true,
      default: '# No Curriculum Content Provided\n\nPlease ensure the content is passed correctly.'
    }
  },
  setup(props) {
    const loading = ref(false); // Content is passed via prop, no loading needed here
    const error = ref(null);

    const renderedCurriculum = computed(() => {
      try {
        // Ensure marked is called with a string
        return marked(props.markdownContent || '');
      } catch (err) {
        console.error('Error parsing Markdown:', err);
        error.value = 'Failed to render curriculum content.';
        return '<p>Error rendering content.</p>';
      }
    });

    // Removed loadCurriculum function as content is now passed via prop
    // Removed onMounted hook related to loadCurriculum

    return {
      loading, // Keep for consistency, though not strictly needed for rendering
      error,
      renderedCurriculum,
    };
  },
};
</script>


<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1e293b;
  }
  
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  tr:hover {
    background-color: #f1f5f9;
  }
  
  td:first-child {
    font-weight: 600;
    color: #1e293b;
  }
  
  a {
    color: #3b82f6;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>