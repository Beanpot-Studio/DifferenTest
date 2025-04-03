import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserInfo from '../UserInfo.vue';
import { useAuth } from '../../stores/auth';

// Mock the auth store
vi.mock('../../stores/auth', () => ({
  useAuth: vi.fn()
}));

describe('UserInfo', () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.clearAllMocks();
  });

  it('renders nothing when user is not logged in', () => {
    useAuth.mockReturnValue({
      user: { value: null },
      role: { value: null },
      isLoggedIn: { value: false },
      initialize: vi.fn()
    });

    const wrapper = mount(UserInfo);
    expect(wrapper.find('.user-info').exists()).toBe(false);
  });

  it('displays user email and role when logged in', async () => {
    useAuth.mockReturnValue({
      user: { value: { email: 'test@example.com' } },
      role: { value: 'teacher' },
      isLoggedIn: { value: true },
      initialize: vi.fn()
    });

    const wrapper = mount(UserInfo);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.user-info').exists()).toBe(true);
    expect(wrapper.text()).toContain('test@example.com');
    expect(wrapper.text()).toContain('teacher');
  });

  it('shows default values when user data is incomplete', async () => {
    useAuth.mockReturnValue({
      user: { value: { email: null } },
      role: { value: null },
      isLoggedIn: { value: true },
      initialize: vi.fn()
    });

    const wrapper = mount(UserInfo);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.user-info').exists()).toBe(true);
    expect(wrapper.text()).toContain('User');
    expect(wrapper.text()).toContain('student');
  });

  it('calls initialize on mount', async () => {
    const initialize = vi.fn();
    useAuth.mockReturnValue({
      user: { value: null },
      role: { value: null },
      isLoggedIn: { value: false },
      initialize
    });

    mount(UserInfo);
    expect(initialize).toHaveBeenCalled();
  });
}); 