import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
// DO NOT import RegisterModal here initially

// Define the core mock function first
const mockRegisterUser = vi.fn()

// Mock the module using vi.doMock with @ alias
vi.doMock('@/lib/auth', () => ({ 
  registerUser: mockRegisterUser
}))

// Declare variable to hold component type after dynamic import
let RegisterModal: any;

// Helper function to mount the component
const mountComponent = () => {
  // Ensure component is imported before mounting
  if (!RegisterModal) throw new Error('RegisterModal component not loaded');
  return mount(RegisterModal, {
    global: {
      stubs: {
        IconService: true // Stub child component
      }
    }
  })
}

describe('RegisterModal.vue', () => {
  // Use an async beforeEach to handle dynamic import
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()
    mockRegisterUser.mockReset()
    
    // Dynamically import the component using @ alias
    const module = await import('@/components/ui/modals/RegisterModal.vue');
    RegisterModal = module.default;
  })

  it('renders correctly when mounted', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('input[type="radio"][value="student"]').exists()).toBe(true)
    expect(wrapper.find('input[type="radio"][value="teacher"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('allows typing into name, email, password fields and selecting role', async () => {
    const wrapper = mountComponent()
    const nameInput = wrapper.find('#name')
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const studentRadio = wrapper.find('input[type="radio"][value="student"]')
    const teacherRadio = wrapper.find('input[type="radio"][value="teacher"]')

    await nameInput.setValue('Test User')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await teacherRadio.setValue(true) // Select teacher role

    expect((nameInput.element as HTMLInputElement).value).toBe('Test User')
    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
    expect((teacherRadio.element as HTMLInputElement).checked).toBe(true)
    expect((studentRadio.element as HTMLInputElement).checked).toBe(false)
  })

  it('calls registerUser with \'student\' role on successful submission', async () => {
    // Arrange
    mockRegisterUser.mockResolvedValue({ success: true, error: null })
    const wrapper = mountComponent()
    const name = 'Test Student'
    const email = 'student@example.com'
    const password = 'password123'
    const role = 'student' // Explicitly testing student role
    await wrapper.find('#name').setValue(name)
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    // Student role is selected by default, but we can explicitly set it if needed
    await wrapper.find('input[type="radio"][value="student"]').setValue(true)

    // Act
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick() 

    // Assert
    expect(mockRegisterUser).toHaveBeenCalledTimes(1)
    expect(mockRegisterUser).toHaveBeenCalledWith(email, password, role, name)
    const successEvent = wrapper.emitted('register-success')
    expect(successEvent).toBeTruthy()
    expect(successEvent!.length).toBe(1)
  })

  it('calls registerUser with \'teacher\' role on successful submission', async () => {
    // Renamed original success test slightly for clarity
    // Arrange
    mockRegisterUser.mockResolvedValue({ success: true, error: null })
    const wrapper = mountComponent()
    const name = 'Test Teacher'
    const email = 'teacher@example.com'
    const password = 'password123'
    const role = 'teacher' // Explicitly testing teacher role
    await wrapper.find('#name').setValue(name)
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    await wrapper.find('input[type="radio"][value="teacher"]').setValue(true)

    // Act
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick() 

    // Assert
    expect(mockRegisterUser).toHaveBeenCalledTimes(1)
    expect(mockRegisterUser).toHaveBeenCalledWith(email, password, role, name)
    const successEvent = wrapper.emitted('register-success')
    expect(successEvent).toBeTruthy()
    expect(successEvent!.length).toBe(1)
    expect(wrapper.find('.bg-red-100').exists()).toBe(false) // No error shown
  })

  it('calls registerUser and shows error message on failed submission', async () => {
    // Arrange
    const errorMessage = 'Email already exists'
    mockRegisterUser.mockResolvedValue({ success: false, error: { message: errorMessage } })
    const wrapper = mountComponent()
    await wrapper.find('#name').setValue('Fail User')
    await wrapper.find('#email').setValue('fail@example.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('input[type="radio"][value="student"]').setValue(true)

    // Act
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    // Assert
    expect(mockRegisterUser).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('register-success')).toBeFalsy()
    const errorDiv = wrapper.find('.bg-red-100') 
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain(errorMessage)
  })

  it('emits close and login events when login link is clicked', async () => {
    const wrapper = mountComponent()
    const loginLink = wrapper.find('p.text-primary-600')

    // Act
    await loginLink.trigger('click')

    // Assert
    const closeEvent = wrapper.emitted('close')
    expect(closeEvent).toBeTruthy()
    expect(closeEvent!.length).toBe(1)
    const loginEvent = wrapper.emitted('login')
    expect(loginEvent).toBeTruthy()
    expect(loginEvent!.length).toBe(1)
  })
}) 