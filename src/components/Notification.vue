<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      class="w-full p-4"
      :class="{
        'bg-green-100': type === 'success',
        'bg-red-100': type === 'error',
        'bg-blue-100': type === 'info',
        'bg-yellow-100': type === 'warning'
      }"
    >
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <IconService
              v-if="type === 'success'"
              name="check"
              size="6"
              color="text-green-600"
            />
            <IconService
              v-else-if="type === 'error'"
              name="x"
              size="6"
              color="text-red-600"
            />
            <IconService
              v-else-if="type === 'info'"
              name="info"
              size="6"
              color="text-blue-600"
            />
            <IconService
              v-else-if="type === 'warning'"
              name="warning"
              size="6"
              color="text-yellow-600"
            />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium" :class="{
              'text-green-800': type === 'success',
              'text-red-800': type === 'error',
              'text-blue-800': type === 'info',
              'text-yellow-800': type === 'warning'
            }">
              {{ title }}
            </p>
            <p class="mt-1 text-sm" :class="{
              'text-green-700': type === 'success',
              'text-red-700': type === 'error',
              'text-blue-700': type === 'info',
              'text-yellow-700': type === 'warning'
            }">
              {{ message }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="ml-3 flex-shrink-0"
          :class="{
            'text-green-600 hover:text-green-800': type === 'success',
            'text-red-600 hover:text-red-800': type === 'error',
            'text-blue-600 hover:text-blue-800': type === 'info',
            'text-yellow-600 hover:text-yellow-800': type === 'warning'
          }"
        >
          <span class="sr-only">Close</span>
          <IconService name="x" size="6" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>  
import IconService from './IconService.vue';
export default {
  name: 'Notification',
  components: {
    IconService
  },
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  mounted() {
    console.log('Notification mounted with props:', {
      title: this.title,
      message: this.message,
      type: this.type,
      duration: this.duration
    });
  }
};
</script> 