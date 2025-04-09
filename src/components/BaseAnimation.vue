<template>
  <div class="flex justify-center items-center">
    <DotLottieVue
      :src="animationSrc"
      :autoplay="true"
      :loop="loop"
      :style="{ height: `${sizeValue}px`, width: `${sizeValue}px` }"
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
      validator: (value) => ['loading', 'lock', 'confetti', 'lost', 'learning'].includes(value)
    },
    loop: {
      type: Boolean,
      default: true
    },
    size: {
      type: [Number, String],
      default: 200,
      validator: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
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

    const sizeValue = computed(() => Number(props.size));

    return {
      animationSrc,
      sizeValue
    };
  }
};
</script> 