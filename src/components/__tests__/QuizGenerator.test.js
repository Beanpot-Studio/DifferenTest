import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizGenerator from '../QuizGenerator.vue';
import { useAuth } from '../../stores/auth';

// Mock the auth store
vi.mock('../../stores/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { uid: 'test-user-id' } },
    isLoggedIn: { value: true }
  }))
}));

// Mock the Gemini API
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            title: "Test Quiz",
            questions: [
              {
                text: "What is 2+2?",
                options: ["3", "4", "5", "6"],
                correctIndex: 1
              }
            ]
          })
        }
      })
    })
  }))
}));

describe('QuizGenerator', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(QuizGenerator);
  });

  it('renders the component correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Generate Quiz');
    expect(wrapper.find('input[type="number"]').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it('updates numQuestions when input changes', async () => {
    const input = wrapper.find('input[type="number"]');
    await input.setValue(5);
    expect(wrapper.vm.numQuestions).toBe(5);
  });

  it('updates quizTitle when input changes', async () => {
    const input = wrapper.find('input[type="text"]');
    await input.setValue('Math Quiz');
    expect(wrapper.vm.quizTitle).toBe('Math Quiz');
  });

  it('handles file upload correctly', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = wrapper.find('input[type="file"]');
    
    Object.defineProperty(input.element, 'files', {
      value: [file]
    });
    
    await input.trigger('change');
    
    expect(wrapper.vm.isLoading).toBe(true);
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.quiz).toBeDefined();
  });

  it('shows error message for invalid file type', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = wrapper.find('input[type="file"]');
    
    Object.defineProperty(input.element, 'files', {
      value: [file]
    });
    
    await input.trigger('change');
    
    expect(wrapper.vm.error).toBe('Please upload a PDF or text file');
  });

  it('generates new quiz when requested', async () => {
    wrapper.vm.quiz = {
      title: "Old Quiz",
      questions: []
    };
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.vm.isLoading).toBe(true);
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.quiz.title).toBe("Test Quiz");
  });
}); 