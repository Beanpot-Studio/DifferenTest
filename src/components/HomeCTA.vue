<template>
  <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
    <button
      @click="showRegister"
      class="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition"
    >
      Sign Up Now
    </button>
    <button
      @click="scrollToAbout"
      class="inline-block bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition"
    >
      Learn More
    </button>
  </div>
</template>

<script>
import { useLoginPopup } from './LoginPopupHelper.vue';

export default {
  name: 'HomeCTA',
  setup() {
    const { showRegister } = useLoginPopup();

    const scrollToAbout = () => {
      const aboutSection = document.querySelector('#about');
      if (featuraboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return {
      showRegister,
      scrollToAbout
    };
  }
};
</script> 