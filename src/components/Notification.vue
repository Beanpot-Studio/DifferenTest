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
      v-if="show"
      class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      :class="{
        'bg-green-50': type === 'success',
        'bg-red-50': type === 'error',
        'bg-blue-50': type === 'info',
        'bg-yellow-50': type === 'warning'
      }"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <IconService
              v-if="type === 'success'"
              name="check"
              size="6"
              color="text-green-400"
            />
            <IconService
              v-else-if="type === 'error'"
              name="x"
              size="6"
              color="text-red-400"
            />
            <IconService
              v-else-if="type === 'info'"
              name="info"
              size="6"
              color="text-blue-400"
            />
            <IconService
              v-else-if="type === 'warning'"
              name="warning"
              size="6"
              color="text-yellow-400"
            />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
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
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="$emit('close')"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Close</span>
              <IconService name="x" size="6" />
            </button>
          </div>
        </div>
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
    },
    show: {
      type: Boolean,
      default: true
    }
  }
};
</script> 