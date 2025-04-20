<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Student Portal</h1>
        
        <!-- Badge Claiming Section -->
        <div v-if="pendingBadge" class="mb-8 bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Claim Your Badge</h2>
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img :src="pendingBadge.image" :alt="pendingBadge.name" class="w-24 h-24" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium">{{ pendingBadge.name }}</h3>
              <p class="text-gray-600">{{ pendingBadge.description }}</p>
              <button
                @click="claimBadge(pendingBadge)"
                class="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
              >
                Claim Badge
              </button>
            </div>
          </div>
        </div>

        <!-- Rest of the student portal content -->
        <div class="grid grid-cols-1 gap-6">
          <!-- Your existing content here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FirebaseService } from '../lib/firebaseService'
import { useNotification } from '../composables/useNotification'

const router = useRouter()
const route = useRoute()
const pendingBadge = ref(null)
const { showSuccess, showError } = useNotification()

onMounted(async () => {
  // Check if there's a badge to claim from the URL
  const badgeId = route.query.badgeId
  if (badgeId) {
    const badge = await FirebaseService.getBadge(badgeId)
    if (badge) {
      pendingBadge.value = badge
    }
  }
})

const claimBadge = async (badge) => {
  try {
    const result = await FirebaseService.claimBadge(badge.id)
    if (result.success) {
      showSuccess('Badge claimed successfully!')
      pendingBadge.value = null
      // Update the URL to remove the badgeId parameter
      router.replace({ query: {} })
    } else {
      showError(result.error || 'Failed to claim badge')
    }
  } catch (error) {
    showError('An error occurred while claiming the badge')
  }
}


</script> 