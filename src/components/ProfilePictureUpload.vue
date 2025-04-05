<!-- Profile Picture Upload Component -->
<template>
  <div class="space-y-4">
    <!-- Profile Picture Display -->
    <div class="flex items-center justify-center">
      <div class="relative group">
        <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Profile picture"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-50">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <!-- Upload Button Overlay -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <label 
            class="w-full h-full flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-full"
            :class="{ 'cursor-not-allowed': isUploading }"
          >
            <span class="sr-only">Upload new picture</span>
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleFileSelect"
              :disabled="isUploading"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="w-full">
      <div class="bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary-600 rounded-full h-2 transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-500 text-center mt-2">Uploading... {{ uploadProgress }}%</p>
    </div>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-sm text-red-600 text-center">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import { ref as vueRef, onMounted } from 'vue';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../stores/auth';
import { db } from '../lib/firebase';

export default {
  name: 'ProfilePictureUpload',
  setup() {
    const { user } = useAuth();
    const imageUrl = vueRef(null);
    const isUploading = vueRef(false);
    const uploadProgress = vueRef(0);
    const errorMessage = vueRef('');
    const storage = getStorage();

    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        errorMessage.value = 'Please select an image file.';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errorMessage.value = 'Image size should be less than 5MB.';
        return;
      }

      try {
        isUploading.value = true;
        errorMessage.value = '';
        
        // Create a storage reference
        const fileName = `profile_pictures/${user.value.uid}_${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, fileName);

        // Upload file with progress tracking
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed',
          (snapshot) => {
            // Track upload progress
            uploadProgress.value = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
          },
          (error) => {
            console.error('Upload error:', error);
            errorMessage.value = 'Failed to upload image. Please try again.';
            isUploading.value = false;
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Update user profile in Firestore
              await updateDoc(doc(db, 'users', user.value.uid), {
                profilePicture: downloadURL,
                updatedAt: new Date()
              });

              // Update local state
              imageUrl.value = downloadURL;
              
              // Emit event for parent components
              window.dispatchEvent(new CustomEvent('profileUpdated'));
            } catch (error) {
              console.error('Error updating profile:', error);
              errorMessage.value = 'Failed to update profile. Please try again.';
            } finally {
              isUploading.value = false;
              uploadProgress.value = 0;
            }
          }
        );
      } catch (error) {
        console.error('File handling error:', error);
        errorMessage.value = 'An error occurred. Please try again.';
        isUploading.value = false;
      }
    };

    // Load existing profile picture on mount
    onMounted(() => {
      if (user.value?.profilePicture) {
        imageUrl.value = user.value.profilePicture;
      }
    });

    return {
      imageUrl,
      isUploading,
      uploadProgress,
      errorMessage,
      handleFileSelect
    };
  }
};
</script> 