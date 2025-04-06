<template>
  <div class="flex justify-center items-center" :style="{ height: height, width: width }">
    <DotLottieVue
      :options="lottieOptions"
      :height="height"
      :width="width"
    />
  </div>
</template>

<script>
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

export default {
  name: 'ConfettiIcon',
  components: {
    DotLottieVue
  },
  props: {
    height: {
      type: String,
      default: '24px'
    },
    width: {
      type: String,
      default: '24px'
    }
  },
  setup() {
    const lottieOptions = {
      loop: false,
      autoplay: true,
      path: './confetti.lottie'
    };

    return {
      lottieOptions
    };
  }
};
</script> 