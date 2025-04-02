<template>
  <footer class="bg-primary-900 text-white py-8">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">DifferenTest</h3>
          <p class="text-secondary-300">
            Testing and Credentialing can be different!
          </p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><a href="/" class="text-secondary-300 hover:text-white transition">Home</a></li>
            <li><a href="/dashboard" class="text-secondary-300 hover:text-white transition">Dashboard</a></li>
            <li><a href="#" class="text-secondary-300 hover:text-white transition">About Us</a></li>
            <li><a href="#" class="text-secondary-300 hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold mb-4">Contact Us</h3>
          <address class="not-italic text-secondary-300">
            <p>DifferenTest</p>
            <p>a solution by Beanpot Studio</p>
            <p>Proudly built in Boston</p>
            <p class="mt-2">Email: support@beanpotstudio.com</p>
          </address>
        </div>
      </div>
      
      <div class="border-t border-gray-700 mt-8 pt-6 text-center text-secondary-400">
        <p>&copy; {{ currentYear }} DifferenTest. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>
