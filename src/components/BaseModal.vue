<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
       <IconService name="x" size="6" />
      </button>

      <h3 v-if="title" class="text-xl font-bold mb-4">{{ title }}</h3>
      
      <slot></slot>
    </div>
  </div>
</template>

<script>
import IconService from './IconService.vue';
export default {
  components: {
    IconService
  },
  name: 'BaseModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['close']
};
</script> 