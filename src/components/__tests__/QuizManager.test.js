import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizManager from '../QuizManager.vue';
import { useAuth } from '../../stores/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Mock the auth store
vi.mock('../../stores/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { uid: 'test-user-id' } },
    isLoggedIn: { value: true }
  }))
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn()
}));

describe('QuizManager', () => {
  let wrapper;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Firestore response
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'quiz1',
          data: () => ({
            title: 'Test Quiz 1',
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        },
        {
          id: 'quiz2',
          data: () => ({
            title: 'Test Quiz 2',
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      ]
    });

    wrapper = mount(QuizManager);
  });

  it('renders the component correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Manage Quizzes');
  });

  it('fetches quizzes on mount', async () => {
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(getDocs).toHaveBeenCalled();
    expect(wrapper.vm.quizzes.length).toBe(2);
  });

  it('opens edit modal when quiz title is clicked', async () => {
    // Wait for quizzes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const quizTitle = wrapper.find('.quiz-title');
    await quizTitle.trigger('click');
    
    expect(wrapper.vm.editingQuiz).toBeDefined();
    expect(wrapper.vm.showEditModal).toBe(true);
  });

  it('deletes quiz when delete button is clicked', async () => {
    // Wait for quizzes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const deleteButton = wrapper.find('.delete-quiz');
    await deleteButton.trigger('click');
    
    expect(deleteDoc).toHaveBeenCalled();
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.quizzes.length).toBe(1);
  });

  it('handles empty quiz list', async () => {
    // Mock empty response
    getDocs.mockResolvedValueOnce({
      docs: []
    });

    wrapper = mount(QuizManager);
    
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.no-quizzes').exists()).toBe(true);
  });

  it('updates quiz when edited', async () => {
    // Wait for quizzes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const quizTitle = wrapper.find('.quiz-title');
    await quizTitle.trigger('click');
    
    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue('Updated Quiz Title');
    
    const saveButton = wrapper.find('.save-quiz');
    await saveButton.trigger('click');
    
    expect(wrapper.vm.showEditModal).toBe(false);
    expect(wrapper.vm.editingQuiz).toBeNull();
  });
}); 