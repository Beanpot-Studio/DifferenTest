<template>
  <footer class="bg-primary-900 text-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-lg font-bold mb-4">DifferenTest</h3>
          <p>Differentiated assessments and micro-credentials, transformed.</p>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4">Quick Links</h3>
          <ul class="flex flex-wrap gap-4">
            <li><a href="/" class="text-secondary-300 hover:text-white transition">Home</a></li>
            <li><a href="/pricing" class="text-secondary-300 hover:text-white transition">Pricing</a></li>
            <li><a href="/contact" class="text-secondary-300 hover:text-white transition">Contact</a></li>
            <li><a href="/help" class="text-secondary-300 hover:text-white transition">Support</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4">Resources</h3>
          <ul class="flex flex-wrap gap-4">
            <li><a href="/blog" class="text-secondary-300 hover:text-white transition">Blog</a></li>
            <li><a href="/docs" class="text-secondary-300 hover:text-white transition">Documentation</a></li>
            <li><a href="/tutorials" class="text-secondary-300 hover:text-white transition">Tutorials</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4">Legal</h3>
          <ul class="flex flex-wrap gap-4">
            <li><a href="/privacy" class="text-secondary-300 hover:text-white transition">Privacy Policy</a></li>
            <li><a href="/terms" class="text-secondary-300 hover:text-white transition">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-primary-800 text-center text-secondary-300">
        <p>&copy; {{ currentYear }} DifferenTest. A solution by Beanpot Studio. Proudly built in Boston. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>
