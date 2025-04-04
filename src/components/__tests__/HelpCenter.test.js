import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HelpCenter from '../HelpCenter.vue';
import { doc, updateDoc, increment } from 'firebase/firestore';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn()
}));

describe('HelpCenter', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HelpCenter, {
      global: {
        mocks: {
          $route: {
            path: '/help'
          }
        }
      }
    });
  });

  it('renders all sections correctly', () => {
    const sectionTitles = wrapper.findAll('h2').map(h2 => h2.text());
    expect(sectionTitles).toEqual([
      'Getting Started',
      'For Students',
      'For Teachers'
    ]);
  });

  it('displays search input', () => {
    const searchInput = wrapper.find('input[type="text"]');
    expect(searchInput.exists()).toBe(true);
    expect(searchInput.attributes('placeholder')).toBe('Search help articles...');
  });

  it('shows article modal when article is clicked', async () => {
    const article = wrapper.findAll('.border.rounded-lg').at(0);
    await article.trigger('click');
    
    expect(wrapper.vm.showArticleModal).toBe(true);
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true);
  });

  it('closes article modal when close button is clicked', async () => {
    // First open the modal
    const article = wrapper.findAll('.border.rounded-lg').at(0);
    await article.trigger('click');
    
    // Then close it
    const closeButton = wrapper.find('button[class*="text-gray-500"]');
    await closeButton.trigger('click');
    
    expect(wrapper.vm.showArticleModal).toBe(false);
  });

  it('rates article when feedback buttons are clicked', async () => {
    // Mock the Firestore functions
    const mockDoc = { id: 'test-article' };
    doc.mockReturnValue(mockDoc);
    updateDoc.mockResolvedValue();
    increment.mockImplementation((value) => value);

    // Open an article
    const article = wrapper.findAll('.border.rounded-lg').at(0);
    await article.trigger('click');

    // Click the "Yes" button
    const yesButton = wrapper.findAll('button').filter(button => button.text() === 'Yes').at(0);
    await yesButton.trigger('click');

    expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
      helpful: 1,
      notHelpful: 0
    });

    // Click the "No" button
    const noButton = wrapper.findAll('button').filter(button => button.text() === 'No').at(0);
    await noButton.trigger('click');

    expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
      helpful: 0,
      notHelpful: 1
    });
  });

  it('displays correct article content in modal', async () => {
    const article = wrapper.findAll('.border.rounded-lg').at(0);
    await article.trigger('click');

    const modalTitle = wrapper.find('.text-xl.font-bold');
    expect(modalTitle.text()).toBe('Welcome to DifferenTest');

    const modalContent = wrapper.find('.prose');
    expect(modalContent.exists()).toBe(true);
  });

  it('handles search functionality', async () => {
    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('quiz');

    // The search functionality is currently not implemented in the component
    // This test is a placeholder for when search is implemented
    expect(wrapper.vm.searchQuery).toBe('quiz');
  });
}); 