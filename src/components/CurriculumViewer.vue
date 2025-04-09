<template>
  <div class="curriculum-content">
    
    <div v-if="loading" class="text-center py-10">
      <p>Loading curriculum...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <div v-else class="prose max-w-none bg-white p-6 rounded shadow">
    <!-- back to curriculum home  link -->
    <div class="mb-4">
      <router-link to="/curriculum" class="text-blue-500 hover:text-blue-700">Home</router-link>
    </div>
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
.curriculum-content {
  /* Base styles */
  line-height: 1.6;
  margin: 0 auto;
  padding: 2rem;
}

.curriculum-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  font-size: 0.9rem;
}
  
.curriculum-content th, 
.curriculum-content td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
  
.curriculum-content th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}
  
.curriculum-content tr:nth-child(even) {
  background-color: #f8fafc;
}
  
.curriculum-content tr:hover {
  background-color: #f1f5f9;
}
  
.curriculum-content td:first-child {
  font-weight: 600;
  color: #1e293b;
}
  
.curriculum-content a {
  color: #3b82f6;
  text-decoration: none;
}
  
.curriculum-content a:hover {
  text-decoration: underline;
}

/* Code block styling */
.curriculum-content pre {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.curriculum-content code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  color: #1e293b;
  font-size: 0.9em;
}

.curriculum-content pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* Typography styling */
.curriculum-content h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.curriculum-content ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.curriculum-content li {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #334155;
}

.curriculum-content li::marker {
  color: #3b82f6;
}

.curriculum-content em {
  font-style: italic;
  color: #64748b;
  font-weight: 500;
}

/* Nested list styling */
.curriculum-content ul ul {
  margin: 0.5rem 0;
  list-style-type: circle;
}

.curriculum-content ul ul li::marker {
  color: #94a3b8;
}
</style>