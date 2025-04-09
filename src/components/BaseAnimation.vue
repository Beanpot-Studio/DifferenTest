<template>
  <div class="w-full flex justify-center items-center">
    <DotLottieVue
      :style="{
        height: `${size}px`,
        width: `${size}px`
      }"
      :autoplay="autoplay"
      :src="animationSrc"
      :loop="loop"
    />
  </div>
</template>

<script>
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import { computed } from 'vue';

export default {
  name: 'BaseAnimation',
  components: {
    DotLottieVue
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['lost', 'loading', 'confetti', 'lock', 'learning'].includes(value)
    },
    size: {
      type: Number,
      default(rawProps) {
        // Default sizes based on animation type
        const defaults = {
          lost: 300,
          loading: 100,
          confetti: 200,
          lock: 200,
          learning: 500
        };
        return defaults[rawProps.type] || 200;
      }
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    loop: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const animationSrc = computed(() => {
      switch (props.type) {
        case 'loading':
          return '/animations/loading.lottie';
        case 'lock':
          return '/animations/lock.lottie';
        default:
          return `/animations/${props.type}.lottie`;
      }
    });

    return {
      animationSrc
    };
  }
};
</script> 