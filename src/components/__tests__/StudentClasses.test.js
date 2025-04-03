import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import StudentClasses from '../StudentClasses.vue';
import { useAuth } from '../../stores/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn()
}));

describe('StudentClasses', () => {
  let wrapper;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Firestore response for classes
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'class1',
          data: () => ({
            name: 'Test Class 1',
            code: 'ABC123',
            teacherId: 'teacher1',
            quizzes: ['quiz1', 'quiz2'],
            createdAt: new Date()
          })
        }
      ]
    });

    // Mock Firestore response for quizzes
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'quiz1',
          data: () => ({
            title: 'Test Quiz 1',
            questions: [
              {
                text: 'What is 2+2?',
                options: ['3', '4', '5', '6'],
                correctIndex: 1
              }
            ],
            createdAt: new Date()
          })
        },
        {
          id: 'quiz2',
          data: () => ({
            title: 'Test Quiz 2',
            questions: [
              {
                text: 'What is 3+3?',
                options: ['5', '6', '7', '8'],
                correctIndex: 1
              }
            ],
            createdAt: new Date()
          })
        }
      ]
    });

    wrapper = mount(StudentClasses);
  });

  it('renders the component correctly', () => {
    expect(wrapper.find('h2').text()).toBe('My Classes');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Join Class');
  });

  it('fetches classes on mount', async () => {
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(getDocs).toHaveBeenCalled();
    expect(wrapper.vm.classes.length).toBe(1);
  });

  it('joins a class with valid code', async () => {
    const classCode = 'ABC123';
    const input = wrapper.find('input[type="text"]');
    await input.setValue(classCode);
    
    const joinButton = wrapper.find('button');
    await joinButton.trigger('click');
    
    expect(updateDoc).toHaveBeenCalled();
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.classCode).toBe('');
  });

  it('shows error for invalid class code', async () => {
    const classCode = 'INVALID';
    const input = wrapper.find('input[type="text"]');
    await input.setValue(classCode);
    
    const joinButton = wrapper.find('button');
    await joinButton.trigger('click');
    
    expect(wrapper.vm.error).toBe('Class not found');
  });

  it('starts a quiz when clicked', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const startQuizButton = wrapper.find('.start-quiz');
    await startQuizButton.trigger('click');
    
    expect(wrapper.vm.currentQuiz).toBeDefined();
    expect(wrapper.vm.showQuizModal).toBe(true);
  });

  it('submits quiz answers', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const startQuizButton = wrapper.find('.start-quiz');
    await startQuizButton.trigger('click');
    
    // Select an answer
    const radioInput = wrapper.find('input[type="radio"]');
    await radioInput.setChecked();
    
    const submitButton = wrapper.find('.submit-quiz');
    await submitButton.trigger('click');
    
    expect(addDoc).toHaveBeenCalled();
    expect(wrapper.vm.showQuizModal).toBe(false);
    expect(wrapper.vm.currentQuiz).toBeNull();
  });

  it('leaves a class', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const leaveButton = wrapper.find('.leave-class');
    await leaveButton.trigger('click');
    
    expect(updateDoc).toHaveBeenCalled();
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.classes.length).toBe(0);
  });

  it('handles empty class list', async () => {
    // Mock empty response
    getDocs.mockResolvedValueOnce({
      docs: []
    });

    wrapper = mount(StudentClasses);
    
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.no-classes').exists()).toBe(true);
  });
}); 