import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed, nextTick } from 'vue' 
// DO NOT import RoleBasedContent here initially

// --- Define SHARED refs and mock fn for the mock FIRST ---
const mockInitialize = vi.fn()
const mockLoading = ref(false)
const mockInitialized = ref(false)
const mockUser = ref<any>(null)
const mockRole = ref<string | null>(null)
const mockIsLoggedIn = computed(() => !!mockUser.value)
// -------------------------------------------------------

// --- Use vi.doMock for non-hoisted mocking ---
vi.doMock('@/stores/auth', () => ({
  useAuth: vi.fn(() => ({ 
    // Return shared refs
    user: mockUser,
    role: mockRole,
    loading: mockLoading, 
    initialized: mockInitialized,
    isLoggedIn: mockIsLoggedIn,
    initialize: mockInitialize,
    // Add other properties if needed
    isTeacher: computed(() => mockRole.value === 'teacher'),
    isStudent: computed(() => mockRole.value === 'student'),
  }))
}));
// -------------------------------------------

// Declare variable to hold component type after dynamic import
let RoleBasedContent: any; 
let useAuth: () => any; 

// Helper to mount with stubs and props/slots
const mountComponent = (props = {}, slots = {}) => {
  if (!RoleBasedContent) throw new Error('RoleBasedContent component not loaded');
  return mount(RoleBasedContent, {
    props,
    slots,
    global: {
      stubs: {
        LoginModal: true, 
        RegisterModal: true,
        BaseAnimation: { template: '<div class="stub-base-animation"></div>' } 
      }
    }
  })
}

describe('RoleBasedContent.vue', () => {
  // Reintroduce helper to set SHARED state refs
  const setAuthState = (userState, roleState, loadingState = false, initState = true) => {
    // Need to check if this actually updates the refs used by component
    mockUser.value = userState;
    mockRole.value = roleState; 
    mockLoading.value = loadingState;
    mockInitialized.value = initState;
  }

  beforeEach(async () => {
    // Dynamically import component
    const componentModule = await import('@/components/RoleBasedContent.vue');
    RoleBasedContent = componentModule.default;
    // Dynamically import mocked auth store and get useAuth
    const authModule = await import('@/stores/auth');
    useAuth = authModule.useAuth;

    // Reset mocks
    vi.clearAllMocks();
    // Reset state refs to default using the helper
    setAuthState(null, null, false, false); 
  })

  // --- Tests using setAuthState before mount ---

  it('renders loading animation initially', async () => {
    setAuthState(null, null, true, false); 
    const wrapper = mountComponent();
    await nextTick();
    expect(wrapper.find('.stub-base-animation').exists()).toBe(true); 
  });

  it('renders loading animation when not initialized but not loading', async () => {
    setAuthState(null, null, false, false); 
    const wrapper = mountComponent();
    await nextTick(); 
    expect(wrapper.find('.stub-base-animation').exists()).toBe(true);
  });

  it('renders login message when initialized but not logged in', async () => {
    setAuthState(null, null, false, true); 
    const wrapper = mountComponent(); 
    await nextTick(); 
    const buttons = wrapper.findAll('button');
    const loginButton = buttons.find(btn => btn.text().trim() === 'Log In');
    expect(loginButton?.exists()).toBe(true); 
    expect(wrapper.find('[data-testid="not-logged-in-content"]').exists()).toBe(true);
  });

  it('renders access restricted message when role not allowed', async () => {
    setAuthState({ uid: 's1' }, 'student', false, true);
    const wrapper = mountComponent({ requiredRoles: ['teacher'] });
    await nextTick();
    expect(wrapper.text()).toContain('Access Restricted');
    expect(wrapper.find('slot').exists()).toBe(false); 
  });

  it('renders slot content when role is allowed (default roles)', async () => {
    setAuthState({ uid: 's1' }, 'student', false, true);
    const wrapper = mountComponent({}, { default: '<div data-testid="slot-content">ALLOWED</div>' });
    await nextTick();
    const slotContent = wrapper.find('[data-testid="slot-content"]');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('ALLOWED');
  });

  it('renders slot content when role matches specific requiredRoles prop', async () => {
    setAuthState({ uid: 't1' }, 'teacher', false, true); 
    const wrapper = mountComponent(
      { requiredRoles: ['teacher'] }, 
      { default: '<div data-testid="slot-content">TEACHER ONLY</div>' }
    );
    await nextTick();
    const slotContent = wrapper.find('[data-testid="slot-content"]');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('TEACHER ONLY');
  });

  it('opens login modal when Log In button is clicked', async () => {
    setAuthState(null, null, false, true); 
    const wrapper = mountComponent();
    await nextTick();
    expect(wrapper.findComponent({ name: 'LoginModal' }).exists()).toBe(false);
    const buttons = wrapper.findAll('button');
    const loginButton = buttons.find(btn => btn.text().trim() === 'Log In');
    await loginButton?.trigger('click');
    await nextTick();
    expect(wrapper.findComponent({ name: 'LoginModal' }).exists()).toBe(true);
  });

}); 