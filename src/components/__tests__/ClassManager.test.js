import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClassManager from '../ClassManager.vue';
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

describe('ClassManager', () => {
  let wrapper;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Firestore response
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'class1',
          data: () => ({
            name: 'Test Class 1',
            code: 'ABC123',
            students: [],
            createdAt: new Date()
          })
        },
        {
          id: 'class2',
          data: () => ({
            name: 'Test Class 2',
            code: 'DEF456',
            students: [],
            createdAt: new Date()
          })
        }
      ]
    });

    wrapper = mount(ClassManager);
  });

  it('renders the component correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Manage Classes');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Create Class');
  });

  it('fetches classes on mount', async () => {
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(getDocs).toHaveBeenCalled();
    expect(wrapper.vm.classes.length).toBe(2);
  });

  it('creates a new class', async () => {
    const className = 'New Test Class';
    const input = wrapper.find('input[type="text"]');
    await input.setValue(className);
    
    const createButton = wrapper.find('button');
    await createButton.trigger('click');
    
    expect(addDoc).toHaveBeenCalled();
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.newClassName).toBe('');
  });

  it('deletes a class', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const deleteButton = wrapper.find('.delete-class');
    await deleteButton.trigger('click');
    
    expect(deleteDoc).toHaveBeenCalled();
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.classes.length).toBe(1);
  });

  it('opens edit modal when edit button is clicked', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const editButton = wrapper.find('.edit-class');
    await editButton.trigger('click');
    
    expect(wrapper.vm.editingClass).toBeDefined();
    expect(wrapper.vm.showEditModal).toBe(true);
  });

  it('updates class when edited', async () => {
    // Wait for classes to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    const editButton = wrapper.find('.edit-class');
    await editButton.trigger('click');
    
    const nameInput = wrapper.find('input[type="text"]');
    await nameInput.setValue('Updated Class Name');
    
    const saveButton = wrapper.find('.save-class');
    await saveButton.trigger('click');
    
    expect(updateDoc).toHaveBeenCalled();
    expect(wrapper.vm.showEditModal).toBe(false);
    expect(wrapper.vm.editingClass).toBeNull();
  });

  it('handles empty class list', async () => {
    // Mock empty response
    getDocs.mockResolvedValueOnce({
      docs: []
    });

    wrapper = mount(ClassManager);
    
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.no-classes').exists()).toBe(true);
  });
}); 