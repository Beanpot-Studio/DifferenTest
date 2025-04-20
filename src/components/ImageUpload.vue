<template>
  <div class="space-y-4">
    <div class="flex items-center justify-center w-full">
      <label
        class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <IconService name="upload" size="8" class="text-gray-400 mb-3" />
          <p class="mb-2 text-sm text-gray-500">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
        </div>
        <input
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileSelect"
          ref="fileInput"
        />
      </label>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl" class="relative">
      <img :src="previewUrl" class="w-full h-64 object-cover rounded-lg" />
      <button
        @click="removeImage"
        class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        <IconService name="x" size="4" />
      </button>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        class="bg-primary-600 h-2.5 rounded-full"
        :style="{ width: `${uploadProgress}%` }"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useNotification } from '../composables/useNotification';
import IconService from './IconService.vue';

export default {
  name: 'ImageUpload',
  components: {
    IconService
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { showError } = useNotification();
    const fileInput = ref(null);
    const previewUrl = ref(props.modelValue);
    const uploading = ref(false);
    const uploadProgress = ref(0);

    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      // Create preview
      previewUrl.value = URL.createObjectURL(file);

      try {
        uploading.value = true;
        uploadProgress.value = 0;

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
            onUploadProgress: (progressEvent) => {
              uploadProgress.value = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            }
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        emit('update:modelValue', data.secure_url);
        showSuccess('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        showError('Failed to upload image');
        previewUrl.value = null;
      } finally {
        uploading.value = false;
        uploadProgress.value = 0;
      }
    };

    const removeImage = () => {
      previewUrl.value = null;
      emit('update:modelValue', '');
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    return {
      fileInput,
      previewUrl,
      uploading,
      uploadProgress,
      handleFileSelect,
      removeImage
    };
  }
};
</script> 