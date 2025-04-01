<template>
  <footer class="bg-gray-800 text-white py-8">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">EduPortal</h3>
          <p class="text-gray-300">
            A modern learning platform connecting teachers and students for better education.
          </p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><a href="/" class="text-gray-300 hover:text-white transition">Home</a></li>
            <li><a href="/dashboard" class="text-gray-300 hover:text-white transition">Dashboard</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition">About Us</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold mb-4">Contact Us</h3>
          <address class="not-italic text-gray-300">
            <p>EduPortal Inc.</p>
            <p>123 Learning Lane</p>
            <p>Education City, EC 12345</p>
            <p class="mt-2">Email: support@eduportal.example</p>
          </address>
        </div>
      </div>
      
      <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
        <p>&copy; {{ currentYear }} EduPortal. All rights reserved.</p>
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
