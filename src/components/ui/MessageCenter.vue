<template>
  <div class="space-y-6">
    <!-- Message List -->
    <div class="border rounded-lg divide-y">
      <div v-for="message in messages" :key="message.id" 
           class="p-4 hover:bg-gray-50 cursor-pointer"
           @click="openMessage(message)">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium">{{ message.senderName }}</h3>
            <p class="text-sm text-gray-500">{{ message.subject }}</p>
          </div>
          <div class="text-sm text-gray-500">
            {{ formatDate(message.createdAt) }}
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ message.preview }}</p>
      </div>
      <div v-if="messages.length === 0" class="p-4 text-center text-gray-500">
        No messages yet.
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ currentMessage?.subject }}</h3>
          <button @click="closeMessageModal" class="text-gray-500 hover:text-gray-700">
           <IconService name="x" size="6" />
          </button>
        </div>

        <div v-if="currentMessage" class="space-y-4">
          <div class="flex justify-between items-center text-sm text-gray-500">
            <div>
              From: {{ currentMessage.senderName }}
              <span class="text-gray-400">&lt;{{ currentMessage.senderEmail }}&gt;</span>
            </div>
            <div>{{ formatDate(currentMessage.createdAt) }}</div>
          </div>

          <div class="border-t pt-4">
            <p class="whitespace-pre-wrap">{{ currentMessage.content }}</p>
          </div>

          <div class="flex justify-end space-x-4 mt-6">
            <button
              @click="closeMessageModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              @click="replyToMessage"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">New Message</h3>
          <button @click="closeNewMessageModal" class="text-gray-500 hover:text-gray-700">
            <IconService name="x" size="6" />
          </button>
        </div>

        <form @submit.prevent="sendMessage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              v-model="newMessage.recipientId"
              class="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select recipient</option>
              <option v-for="recipient in recipients" :key="recipient.id" :value="recipient.id">
                {{ recipient.name }} ({{ recipient.role }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              v-model="newMessage.subject"
              type="text"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              v-model="newMessage.content"
              rows="6"
              class="w-full p-2 border rounded-lg"
              required
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeNewMessageModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button
      @click="openNewMessageModal"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 flex items-center justify-center"
    >
      <IconService name="plus" size="6" />
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../../stores/auth';
import IconService from '../services/IconService.vue';
import FirebaseService from '../../lib/firebaseService';

export default {
  components: {
    IconService
  },
  name: 'MessageCenter',
  setup() {
    const { user } = useAuth();
    const messages = ref([]);
    const recipients = ref([]);
    const showMessageModal = ref(false);
    const showNewMessageModal = ref(false);
    const currentMessage = ref(null);
    const newMessage = ref({
      recipientId: '',
      subject: '',
      content: ''
    });

    const fetchMessages = async () => {
      if (!user.value) return;

      try {
        const messages = await FirebaseService.getUserMessages(user.value.uid);
        
        const messagePromises = messages.map(async message => {
          const senderData = await FirebaseService.getUserProfile(message.senderId);
          return {
            ...message,
            senderName: senderData?.name || 'Unknown User',
            senderEmail: senderData?.email || 'unknown@email.com',
            preview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
          };
        });

        messages.value = await Promise.all(messagePromises);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchRecipients = async () => {
      if (!user.value) return;

      try {
        const users = await FirebaseService.getAllUsers();
        recipients.value = users.filter(u => u.id !== user.value.uid); // Exclude current user
      } catch (error) {
        console.error('Error fetching recipients:', error);
      }
    };

    const openMessage = (message) => {
      currentMessage.value = message;
      showMessageModal.value = true;
    };

    const closeMessageModal = () => {
      showMessageModal.value = false;
      currentMessage.value = null;
    };

    const openNewMessageModal = () => {
      showNewMessageModal.value = true;
    };

    const closeNewMessageModal = () => {
      showNewMessageModal.value = false;
      newMessage.value = {
        recipientId: '',
        subject: '',
        content: ''
      };
    };

    const sendMessage = async () => {
      if (!user.value) return;

      try {
        await FirebaseService.createMessage({
          senderId: user.value.uid,
          recipientId: newMessage.value.recipientId,
          subject: newMessage.value.subject,
          content: newMessage.value.content,
          createdAt: new Date()
        });

        closeNewMessageModal();
        fetchMessages(); // Refresh messages list
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    const replyToMessage = () => {
      if (!currentMessage.value) return;

      newMessage.value = {
        recipientId: currentMessage.value.senderId,
        subject: `Re: ${currentMessage.value.subject}`,
        content: `\n\n---\nOn ${formatDate(currentMessage.value.createdAt)}, ${currentMessage.value.senderName} wrote:\n${currentMessage.value.content}`
      };

      closeMessageModal();
      openNewMessageModal();
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    onMounted(() => {
      fetchMessages();
      fetchRecipients();
    });

    return {
      messages,
      recipients,
      showMessageModal,
      showNewMessageModal,
      currentMessage,
      newMessage,
      openMessage,
      closeMessageModal,
      openNewMessageModal,
      closeNewMessageModal,
      sendMessage,
      replyToMessage,
      formatDate
    };
  }
};
</script> 