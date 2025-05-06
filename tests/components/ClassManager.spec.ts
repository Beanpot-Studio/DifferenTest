import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClassManager from '@/components/ClassManager.vue';
import FirebaseService from '@/lib/firebaseService';
import { useNotification } from '@/composables/useNotification';
import { useSkin } from '@/composables/useSkin';
import { nextTick, ref } from 'vue';

// --- Hoisted Mock for useAuth ---
const teacherId = 'teacher123';
const mockUser = { uid: teacherId, displayName: 'Test Teacher', role: 'teacher' };
const mockUseAuth = vi.hoisted(() => {
  return {
    useAuth: vi.fn(() => ({
      user: ref(mockUser),
      isAuthenticated: ref(true),
    }))
  };
});
vi.mock('../stores/auth', () => mockUseAuth); // Use the hoisted mock
// --------------------------------

// Mock FirebaseService
vi.mock('@/lib/firebaseService', () => ({
  default: {
    createClass: vi.fn(),
    getClassesForTeacher: vi.fn().mockResolvedValue([]), // Start with no classes
    getQuizzesForTeacher: vi.fn().mockResolvedValue([]), // Start with no available quizzes
    getQuizzesForClass: vi.fn().mockResolvedValue([]),
    updateClass: vi.fn(),
    deleteClass: vi.fn(),
    addQuizToClass: vi.fn(),
    removeQuizFromClass: vi.fn(),
  }
}));

// Mock useNotification composable
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Mock useSkin composable
const mockAvailableSkins = [
    { id: 'default', name: 'Default', ageRange: 'All Ages' },
    { id: 'space', name: 'Space Adventure', ageRange: '8-12' },
];
vi.mock('@/composables/useSkin', () => ({
  useSkin: () => ({
    availableSkins: mockAvailableSkins,
  }),
}));

// Mock child components
const IconServiceStub = { template: '<svg class="stub-icon-service"></svg>' };
const ClassRosterStub = { template: '<div class="stub-class-roster"></div>', props: ['classId', 'className'] };


describe('ClassManager.vue', () => {
  let wrapper;

  const createWrapper = () => {
    return mount(ClassManager, {
      global: {
        stubs: {
          IconService: IconServiceStub,
          ClassRoster: ClassRosterStub,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
    // Mock successful fetches by default in beforeEach
    vi.mocked(FirebaseService.getClassesForTeacher).mockResolvedValue([]);
    vi.mocked(FirebaseService.getQuizzesForTeacher).mockResolvedValue([]);
    wrapper = createWrapper();
  });

  it('renders the create class form', () => {
    // Find the h2 element and check its text
    const heading = wrapper.findAll('h2').find(h => h.text() === 'Create New Class');
    expect(heading?.exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Enter class name"]').exists()).toBe(true);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.find('select').exists()).toBe(true); // Skin dropdown
    // Find the button and check its text
    const button = wrapper.findAll('button').find(b => b.text() === 'Create Class');
    expect(button?.exists()).toBe(true);
  });

  it('populates the skin dropdown from useSkin', () => {
    const options = wrapper.findAll('select option');
    expect(options).toHaveLength(mockAvailableSkins.length);
    expect(options[0].text()).toBe('Default (All Ages)');
    expect(options[0].element.value).toBe('default');
    expect(options[1].text()).toBe('Space Adventure (8-12)');
    expect(options[1].element.value).toBe('space');
  });

  // Add tests for class creation success/failure here

  it('successfully creates a new class', async () => {
    const classNameInput = wrapper.find('input[placeholder="Enter class name"]');
    const publicCheckbox = wrapper.find('input[type="checkbox"]');
    const skinSelect = wrapper.find('select');
    // Find the button by text
    const createButton = wrapper.findAll('button').find(b => b.text() === 'Create Class');
    expect(createButton?.exists()).toBe(true); // Add assertion to ensure button is found

    const newClassName = 'Test Class Alpha';
    const isPublic = true;
    const selectedSkinId = 'space';

    // Simulate user input
    await classNameInput.setValue(newClassName);
    await publicCheckbox.setValue(isPublic);
    await skinSelect.setValue(selectedSkinId);
    await nextTick(); // Add nextTick after setting values

    // Mock successful creation
    const newClassId = 'newClass123';
    // Adjust mock to expect a single object argument
    vi.mocked(FirebaseService.createClass).mockResolvedValue(newClassId);
    // Mock getClasses to return the new class after creation
    // Note: The actual component fetches all classes, not just the new one
    vi.mocked(FirebaseService.getClassesForTeacher).mockResolvedValueOnce([]); // Initial load
    vi.mocked(FirebaseService.getClassesForTeacher).mockResolvedValueOnce([
      { id: newClassId, name: newClassName, isPublic, skinId: selectedSkinId, teacherId }
    ]);

    // Trigger the creation
    await createButton.trigger('click');
    await nextTick(); // Wait for promises/updates

    // Assert FirebaseService call with the expected object structure
    expect(FirebaseService.createClass).toHaveBeenCalledTimes(1);
    expect(FirebaseService.createClass).toHaveBeenCalledWith(expect.objectContaining({
      name: newClassName,
      isPublic: isPublic,
      skinId: selectedSkinId,
      teacherId: teacherId,
      teacherName: 'Test Teacher' // Comes from mockUser.displayName
      // code, createdAt, updatedAt are also sent but harder to match exactly
    }));

    // Assert notification - Use the message from the component
    expect(mockShowSuccess).toHaveBeenCalledTimes(1);
    expect(mockShowSuccess).toHaveBeenCalledWith('Class created successfully');
    expect(mockShowError).not.toHaveBeenCalled();

    // Assert form reset
    expect(classNameInput.element.value).toBe('');
    expect((publicCheckbox.element as HTMLInputElement).checked).toBe(false); // Checkbox should reset to default (false)
    expect(skinSelect.element.value).toBe('default'); // Should reset to the first option

    // Assert class list refresh
    // getClassesForTeacher is called once on mount, and again after creation
    expect(FirebaseService.getClassesForTeacher).toHaveBeenCalledTimes(2);
    expect(FirebaseService.getClassesForTeacher).toHaveBeenLastCalledWith(teacherId);
  });

  it('shows an error if class name is empty', async () => {
    // Find the button by text
    const createButton = wrapper.findAll('button').find(b => b.text() === 'Create Class');
    expect(createButton?.exists()).toBe(true); // Add assertion

    await createButton.trigger('click');
    await nextTick();

    expect(FirebaseService.createClass).not.toHaveBeenCalled();
    expect(mockShowError).toHaveBeenCalledTimes(1);
    // Use the validation error message from the component
    expect(mockShowError).toHaveBeenCalledWith('Please enter a class name');
    expect(mockShowSuccess).not.toHaveBeenCalled();
  });

  it('shows an error if FirebaseService.createClass fails', async () => {
    const classNameInput = wrapper.find('input[placeholder="Enter class name"]');
    const publicCheckbox = wrapper.find('input[type="checkbox"]');
    const skinSelect = wrapper.find('select');
    // Find the button by text
    const createButton = wrapper.findAll('button').find(b => b.text() === 'Create Class');
    expect(createButton?.exists()).toBe(true); // Add assertion

    const newClassName = 'Test Class Beta';
    await classNameInput.setValue(newClassName);
    await publicCheckbox.setValue(false);
    await skinSelect.setValue('default');
    await nextTick(); // Add nextTick after setting values

    // Mock FirebaseService failure
    const error = new Error('Firebase error');
    vi.mocked(FirebaseService.createClass).mockRejectedValue(error);

    await createButton.trigger('click');
    await nextTick();

    expect(FirebaseService.createClass).toHaveBeenCalledTimes(1);
    expect(mockShowError).toHaveBeenCalledTimes(1);
    // Use the generic error message from the component
    expect(mockShowError).toHaveBeenCalledWith('Failed to create class');
    expect(mockShowSuccess).not.toHaveBeenCalled();

    // Assert form is NOT reset
    expect(classNameInput.element.value).toBe(newClassName);
  });
}); 