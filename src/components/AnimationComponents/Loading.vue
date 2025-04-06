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
  name: 'LoadingSpinner',
  components: {
    DotLottieVue
  },
  props: {
    height: {
      type: String,
      default: '100px'
    },
    width: {
      type: String,
      default: '100px'
    }
  },
  setup() {
    const lottieOptions = {
      loop: true,
      autoplay: true,
      path: './loading.lottie'
    };

    return {
      lottieOptions
    };
  }
};
</script> 