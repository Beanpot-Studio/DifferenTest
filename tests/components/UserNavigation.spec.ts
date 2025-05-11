import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue' // Import Vue reactivity helpers
// DO NOT import UserNavigation here initially

// --- Define refs for the mock FIRST ---
const mockLogout = vi.fn()
const mockUser = ref<any>(null) // Use <any> or define a user type
const mockRole = ref<string | null>(null)
const mockIsLoggedIn = computed(() => !!mockUser.value)
// --------------------------------------

// --- Use vi.doMock for non-hoisted mocking ---
vi.doMock('@/stores/auth', () => ({
  useAuth: vi.fn(() => ({ // Define mock implementation inline
    user: mockUser,
    role: mockRole,
    isLoggedIn: mockIsLoggedIn,
    logout: mockLogout,
    isTeacher: computed(() => mockRole.value === 'teacher'),
    isStudent: computed(() => mockRole.value === 'student')
  }))
}));
// -------------------------------------------

// Declare variable to hold component type after dynamic import
let UserNavigation: any; 

// Helper to mount with stubs
const mountComponent = () => {
  if (!UserNavigation) throw new Error('UserNavigation component not loaded');
  return mount(UserNavigation, {
    global: {
      stubs: {
        IconService: true // Stub IconService
      }
    }
  })
}

describe('UserNavigation.vue', () => {

  // Function to set mock state
  const setAuthState = (userState, roleState) => {
    mockUser.value = userState
    mockRole.value = roleState
  }

  // Use async beforeEach for dynamic import
  beforeEach(async () => {
    // Dynamically import the component *after* mocks are set up
    const module = await import('@/components/ui/UserNavigation.vue');
    UserNavigation = module.default;

    // Reset mocks and state before each test
    vi.clearAllMocks();
    // No need to mockImplementation again, vi.doMock handles it
    setAuthState(null, null); // Default to logged out
  })

  it('renders login/signup button when logged out', () => {
    setAuthState(null, null)
    const wrapper = mountComponent()
    expect(wrapper.find('button').text()).toContain('Sign Up / Login')
    expect(wrapper.find('a[href="/profile"]').exists()).toBe(false)
    expect(wrapper.find('button:contains("Log Out")').exists()).toBe(false) // More specific logout check
  })

  it('emits register event when login/signup button is clicked', async () => {
    setAuthState(null, null)
    const wrapper = mountComponent()
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('register')).toBeTruthy()
    expect(wrapper.emitted('register').length).toBe(1)
  })

  it('renders user info and logout button when logged in (student)', async () => {
    const wrapper = mountComponent() 
    setAuthState({ uid: 's1', email: 'student@test.com', name: 'Test Student' }, 'student')
    await wrapper.vm.$nextTick() 

    // Assert profile link
    const profileLink = wrapper.find('a[href="/profile"]')
    expect(profileLink.exists()).toBe(true)
    expect(profileLink.text()).toContain('Test Student')

    // Find logout button using filter
    const buttons = wrapper.findAll('button');
    const logoutButton = buttons.find(btn => btn.text() === 'Log Out');
    expect(logoutButton).toBeDefined();
    expect(logoutButton?.exists()).toBe(true); // Assert logout button exists

    // Assert login button does NOT exist
    expect(wrapper.find('button:contains("Sign Up / Login")').exists()).toBe(false)
  })
  
  it('renders user email if name is missing when logged in', async () => {
    const wrapper = mountComponent() // Mount first
    setAuthState({ uid: 's2', email: 'no-name@test.com' /* no name property */ }, 'student') // THEN set state
    await wrapper.vm.$nextTick() // Wait for reactivity

    const profileLink = wrapper.find('a[href="/profile"]')
    expect(profileLink.exists()).toBe(true)
    expect(profileLink.text()).toContain('no-name@test.com') 
  })

  it('calls store logout when logout button is clicked', async () => {
    const wrapper = mountComponent() 
    setAuthState({ uid: 't1', email: 'teacher@test.com', name: 'Test Teacher' }, 'teacher')
    await wrapper.vm.$nextTick() 
    
    // Find the logout button by filtering based on text content
    const buttons = wrapper.findAll('button');
    const logoutButton = buttons.find(btn => btn.text() === 'Log Out');

    // Assert that the button was found
    expect(logoutButton).toBeDefined(); 
    expect(logoutButton?.exists()).toBe(true);

    // Trigger click on the found button
    await logoutButton?.trigger('click')
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

}) 