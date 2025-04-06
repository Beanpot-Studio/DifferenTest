<template>
  <div class="w-full flex justify-center items-center">
      <DotLottieVue style="height: 100px; width: 100px" autoplay src="../loading.lottie" />
  </div>
</template>

<script>
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

export default {
components: {
  DotLottieVue
}
}
</script>   