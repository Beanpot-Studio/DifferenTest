<template>
  <div class="flex items-center justify-center" :style="{ width: sizeValue + 'px', height: sizeValue + 'px' }">
    <DotLottieVue
      :src="animationSrc"
      :autoplay="true"
      :loop="loop === 'true' || loop === true"
      class="w-full h-full"
    />
  </div>
</template>

<script>
import { computed } from 'vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

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
    size: {
      type: [Number, String],
      default: 100,
      validator: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
    },
    loop: {
      type: [Boolean, String],
      default: true
    }
  },
  setup(props) {
    const sizeValue = computed(() => Number(props.size));
    
    
    
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
      sizeValue,
      animationSrc
    };
  }
};
</script> 