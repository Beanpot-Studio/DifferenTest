import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginModal from '@/components/LoginModal.vue'
import { ref } from 'vue' // Import ref for mocks

// Define the core mock function first
const mockLogin = vi.fn()

// Mock the module and define the composable structure *inside* the factory
vi.mock('@/stores/auth', () => ({
  useAuth: vi.fn(() => ({ // Define the mock implementation for useAuth here
    login: mockLogin       // Reference the pre-defined mockLogin
  }))
}))

// Helper function to mount the component with props and stubs
const mountComponent = () => {
  return mount(LoginModal, {
    global: {
      stubs: {
        IconService: true, // Stub the IconService component
      }
    }
  })
}

describe('LoginModal.vue', () => {
  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementation details if needed
    mockLogin.mockReset()
  })

  it('renders correctly when mounted', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#login-submit-button').exists()).toBe(true)
  })

  it('allows typing into email and password fields', async () => {
    const wrapper = mountComponent()
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
  })

  it('calls login and emits login-success on successful submission', async () => {
    // Arrange: Mock successful login
    mockLogin.mockResolvedValue({ success: true, error: null })
    const wrapper = mountComponent()
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('password123')

    // Act: Trigger form submission
    await wrapper.find('form').trigger('submit.prevent')
    
    // Assert
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    // Ensure reactivity updates if needed (e.g., waiting for async operations)
    // await wrapper.vm.$nextTick(); 
    const loginSuccessEvent = wrapper.emitted('login-success')
    expect(loginSuccessEvent).toBeTruthy() // Check if event exists
    expect(loginSuccessEvent!.length).toBe(1) // Use non-null assertion
    expect(wrapper.find('[v-if="error"]').exists()).toBe(false) // No error shown
  })

  it('calls login and shows error message on failed submission', async () => {
    // Arrange: Mock failed login
    const errorMessage = 'Invalid credentials'
    mockLogin.mockResolvedValue({ success: false, error: errorMessage })
    const wrapper = mountComponent()
    await wrapper.find('#email').setValue('wrong@example.com')
    await wrapper.find('#password').setValue('wrongpass')

    // Act: Trigger form submission
    await wrapper.find('form').trigger('submit.prevent')
    
    // Wait for DOM updates after async operation
    await wrapper.vm.$nextTick()

    // Assert
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpass')
    expect(wrapper.emitted('login-success')).toBeFalsy()
    
    // Check for error message display
    const errorDiv = wrapper.find('.bg-red-100') // Find based on class or specific selector
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain(errorMessage)
  })

  it('emits close and register events when register link is clicked', async () => {
    const wrapper = mountComponent()
    const registerLink = wrapper.find('p.text-primary-600') // Find the link

    // Act: Click the link
    await registerLink.trigger('click')

    // Assert
    const closeEvent = wrapper.emitted('close')
    expect(closeEvent).toBeTruthy()
    expect(closeEvent!.length).toBe(1) // Use non-null assertion
    
    const registerEvent = wrapper.emitted('register')
    expect(registerEvent).toBeTruthy()
    expect(registerEvent!.length).toBe(1) // Use non-null assertion
  })

}) 