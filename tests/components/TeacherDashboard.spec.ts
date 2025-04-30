import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
// DO NOT import TeacherDashboard here initially

// --- Mock Dependencies --- 

// useAuth
const mockUser = ref<any>(null)
vi.doMock('@/stores/auth', () => ({
  useAuth: vi.fn(() => ({ user: mockUser }))
}));

// useNotification
const mockShowError = vi.fn()
vi.doMock('@/composables/useNotification', () => ({
  useNotification: vi.fn(() => ({ showError: mockShowError }))
}));

// FirebaseService
const mockGetTeacherDashboardStats = vi.fn()
vi.doMock('@/lib/firebaseService', () => ({
  // Need 'default' because FirebaseService is likely exported as default
  default: {
    getTeacherDashboardStats: mockGetTeacherDashboardStats
  }
}));

// window event listener
const mockAddEventListener = vi.spyOn(window, 'addEventListener');
const mockRemoveEventListener = vi.spyOn(window, 'removeEventListener');

// -------------------------

// Declare variable to hold component type after dynamic import
let TeacherDashboard: any;

// Helper to mount with stubs
const mountComponent = () => {
  if (!TeacherDashboard) throw new Error('TeacherDashboard component not loaded');
  return mount(TeacherDashboard, {
    global: {
      stubs: {
        // Stub all child components with identifiable test IDs
        QuizManager: { template: '<div data-testid="quiz-manager-stub"></div>' },
        ClassManager: { template: '<div data-testid="class-manager-stub"></div>' },
        TeacherSubmissions: { template: '<div data-testid="submissions-stub"></div>' },
        TeacherReports: { template: '<div data-testid="reports-stub"></div>' },
        LessonPlanManager: { template: '<div data-testid="lesson-plan-stub"></div>' },
        IconService: true, // Simple stub
        BaseAnimation: { template: '<div class="stub-base-animation">LOADING...</div>' } // Loading stub
      }
    }
  })
}

describe('TeacherDashboard.vue', () => {

  // Enable Fake Timers
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  // -----------------

  beforeEach(async () => {
    // Dynamically import component AFTER mocks are set up
    const componentModule = await import('@/components/TeacherDashboard.vue');
    TeacherDashboard = componentModule.default;

    // Reset mocks before each test
    vi.clearAllMocks();
    // Reset mock return values/implementations
    mockUser.value = null; // Default to no user
    mockGetTeacherDashboardStats.mockResolvedValue({ // Default success response
        totalClasses: 0,
        totalQuizzes: 0,
        totalSubmissions: 0,
        classes: []
    });
  })

  it('should show loading state initially and call loadStats on mount if user exists', async () => {
    // Arrange
    mockUser.value = { uid: 'teacher1' };
    mockGetTeacherDashboardStats.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ totalClasses: 1, totalQuizzes: 2, totalSubmissions: 3, classes: [{id: 'c1'}] }), 10))
    );
    
    const wrapper = mountComponent();
    await nextTick(); // Wait for mount and initial isLoading=true update

    // Assert Initial State
    expect(wrapper.find('.stub-base-animation').exists()).toBe(true);
    expect(mockGetTeacherDashboardStats).toHaveBeenCalledTimes(1);

    // Act: Run all timers and wait for microtasks (promises)
    await vi.runAllTimersAsync();
    await nextTick(); // Wait for Vue's subsequent DOM update

    // Assert: Loading state is gone after data loads
    expect(wrapper.find('.stub-base-animation').exists()).toBe(false);
  });
  
  it('should display fetched stats and default tab after successful load', async () => {
    // Arrange
    mockUser.value = { uid: 'teacher1' };
    const mockStats = { totalClasses: 5, totalQuizzes: 10, totalSubmissions: 25, classes: [{id: 'c1'}] };
    mockGetTeacherDashboardStats.mockResolvedValue(mockStats);
    
    const wrapper = mountComponent();
    await nextTick(); // Wait for mount and initial isLoading=true update

    // Act: Wait for data loading to complete
    await vi.runAllTimersAsync(); // Run timers if any were used by mocks
    await nextTick(); // Wait for DOM updates

    // Assert Stats
    const statElements = wrapper.findAll('.text-3xl.font-bold'); // Find stat elements
    expect(statElements).toHaveLength(3);
    expect(statElements[0].text()).toBe(mockStats.totalClasses.toString());
    expect(statElements[1].text()).toBe(mockStats.totalQuizzes.toString());
    expect(statElements[2].text()).toBe(mockStats.totalSubmissions.toString());

    // Assert Default Tab and Content
    expect(wrapper.find('[data-testid="class-manager-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="quiz-manager-stub"]').exists()).toBe(false);
    // Check active tab button style (FIXED SELECTOR)
    const buttons = wrapper.findAll('nav button'); // Find buttons within nav
    const classesTabButton = buttons.find(btn => btn.text().trim() === 'Classes');
    expect(classesTabButton?.exists()).toBe(true);
    expect(classesTabButton?.classes()).toContain('border-primary-500');
  });
  
  it('should call showError and display default stats on load failure', async () => {
    // Arrange
    mockUser.value = { uid: 'teacher1' };
    const errorMessage = 'Failed to fetch stats';
    mockGetTeacherDashboardStats.mockRejectedValueOnce(new Error(errorMessage));
    
    const wrapper = mountComponent();
    await nextTick(); // Wait for mount and initial isLoading=true update

    // Act: Wait for potentially failed load
    await vi.runAllTimersAsync(); 
    await nextTick(); 

    // Assert Error Notification
    expect(mockShowError).toHaveBeenCalledTimes(1);
    expect(mockShowError).toHaveBeenCalledWith('Failed to load dashboard statistics');

    // Assert Default Stats (0)
    const statElements = wrapper.findAll('.text-3xl.font-bold');
    expect(statElements).toHaveLength(3);
    expect(statElements[0].text()).toBe('0');
    expect(statElements[1].text()).toBe('0');
    expect(statElements[2].text()).toBe('0');

    // Assert Loading is finished
    expect(wrapper.find('.stub-base-animation').exists()).toBe(false);
  });

  it('should switch tabs and render correct component on tab click', async () => {
    // Arrange
    mockUser.value = { uid: 'teacher1' }; // User needed to render tabs
    const wrapper = mountComponent();
    await vi.runAllTimersAsync(); // Ensure initial load completes if any
    await nextTick();

    // Assert initial tab
    expect(wrapper.find('[data-testid="class-manager-stub"]').exists()).toBe(true);

    // Act: Click Quizzes tab (FIXED SELECTOR)
    let buttons = wrapper.findAll('nav button');
    let quizzesTabButton = buttons.find(btn => btn.text().trim() === 'Quizzes');
    expect(quizzesTabButton?.exists()).toBe(true);
    await quizzesTabButton?.trigger('click');
    await nextTick();

    // Assert Quizzes tab is active and content shown
    expect(quizzesTabButton?.classes()).toContain('border-primary-500');
    expect(wrapper.find('[data-testid="class-manager-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="quiz-manager-stub"]').exists()).toBe(true);

    // Act: Click Reports tab (FIXED SELECTOR)
    buttons = wrapper.findAll('nav button'); // Re-find buttons
    let reportsTabButton = buttons.find(btn => btn.text().trim() === 'Reports');
    expect(reportsTabButton?.exists()).toBe(true);
    await reportsTabButton?.trigger('click');
    await nextTick();

    // Assert Reports tab is active and content shown
    expect(reportsTabButton?.classes()).toContain('border-primary-500');
    expect(wrapper.find('[data-testid="quiz-manager-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="reports-stub"]').exists()).toBe(true);
  });

  it('should switch to quizzes tab when ClassManager emits select-quiz', async () => {
    // Arrange
    mockUser.value = { uid: 'teacher1' }; 
    const wrapper = mountComponent();
    await vi.runAllTimersAsync();
    await nextTick();

    // Find the ClassManager stub
    const classManagerStub = wrapper.findComponent('[data-testid="class-manager-stub"]');
    expect(classManagerStub.exists()).toBe(true); // Make sure it exists

    // Act: Emit the event from the stub
    const testQuizId = 'quiz123';
    classManagerStub.vm.$emit('select-quiz', testQuizId);
    await nextTick();

    // Assert: Switched to Quizzes tab and QuizManager is rendered (FIXED SELECTOR)
    const buttons = wrapper.findAll('nav button');
    const quizzesTabButton = buttons.find(btn => btn.text().trim() === 'Quizzes');
    expect(quizzesTabButton?.exists()).toBe(true);
    expect(quizzesTabButton?.classes()).toContain('border-primary-500');
    expect(wrapper.find('[data-testid="class-manager-stub"]').exists()).toBe(false);
    const quizManagerStub = wrapper.findComponent('[data-testid="quiz-manager-stub"]');
    expect(quizManagerStub.exists()).toBe(true);
  });

}); 