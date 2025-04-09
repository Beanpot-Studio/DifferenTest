<template>
  <div class="flex justify-center items-center">
    <DotLottieVue
      :src="animationSrc"
      :autoplay="true"
      :loop="loop"
      :style="{ height: `${size}px`, width: `${size}px` }"
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
      validator: (value) => ['loading', 'lock'].includes(value)
    },
    loop: {
      type: Boolean,
      default: true
    },
    size: {
      type: Number,
      default: 100
    }
  },
  setup(props) {
    const animationSrc = computed(() => {
      switch (props.type) {
        case 'loading':
          return '/animations/loading.lottie';
        case 'lock':
          return '/animations/lock.lottie';
        case 'confetti':
          return '/animations/confetti.lottie';
        case 'lost':
          return '/animations/lost.lottie';
        case 'learning':
          return '/animations/learning.lottie';
        default:
          return '/animations/loading.lottie';
      }
    });

    return {
      animationSrc
    };
  }
};
</script> 