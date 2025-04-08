<template>
  <div
    v-if="show"
    class="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out"
    :class="{
      'translate-x-0 opacity-100': show,
      'translate-x-full opacity-0': !show
    }"
  >
    <div
      class="p-4 rounded-lg shadow-lg max-w-sm"
      :class="{
        'bg-green-50 border border-green-200': type === 'success',
        'bg-red-50 border border-red-200': type === 'error',
        'bg-blue-50 border border-blue-200': type === 'info'
      }"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <BaseAnimation
            :type="type"
            class="w-6 h-6"
          />
        </div>
        <div class="ml-3 w-0 flex-1">
          <p
            class="text-sm font-medium"
            :class="{
              'text-green-800': type === 'success',
              'text-red-800': type === 'error',
              'text-blue-800': type === 'info'
            }"
          >
            {{ title }}
          </p>
          <p
            class="mt-1 text-sm"
            :class="{
              'text-green-700': type === 'success',
              'text-red-700': type === 'error',
              'text-blue-700': type === 'info'
            }"
          >
            {{ message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="close"
            class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="{
              'text-green-400 hover:text-green-500 focus:ring-green-500': type === 'success',
              'text-red-400 hover:text-red-500 focus:ring-red-500': type === 'error',
              'text-blue-400 hover:text-blue-500 focus:ring-blue-500': type === 'info'
            }"
          >
            <span class="sr-only">Close</span>
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import BaseAnimation from './BaseAnimation.vue';

export default {
  name: 'Notification',
  components: {
    BaseAnimation
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['success', 'error', 'info'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  setup(props) {
    const show = ref(true);

    const close = () => {
      show.value = false;
    };

    // Auto-close after duration
    watch(show, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          close();
        }, props.duration);
      }
    }, { immediate: true });

    return {
      show,
      close
    };
  }
};
</script> 