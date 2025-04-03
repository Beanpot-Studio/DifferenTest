import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../auth';
import { setupAuthListener, logoutUser } from '../../lib/auth';

// Mock the auth functions
vi.mock('../../lib/auth', () => ({
  setupAuthListener: vi.fn(),
  logoutUser: vi.fn()
}));

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes auth listener correctly', async () => {
    const mockUnsubscribe = vi.fn();
    setupAuthListener.mockImplementation((callback) => {
      callback({ user: { email: 'test@example.com' }, role: 'teacher' });
      return mockUnsubscribe;
    });

    const { initialize, user, role, isLoggedIn } = useAuth();
    await initialize();

    expect(setupAuthListener).toHaveBeenCalled();
    expect(user.value).toEqual({ email: 'test@example.com' });
    expect(role.value).toBe('teacher');
    expect(isLoggedIn.value).toBe(true);
  });

  it('handles logout correctly', async () => {
    logoutUser.mockResolvedValue({ success: true });
    const { logout } = useAuth();

    await logout();

    expect(logoutUser).toHaveBeenCalled();
  });

  it('computes isTeacher correctly', () => {
    const { isTeacher, role } = useAuth();
    
    role.value = 'teacher';
    expect(isTeacher.value).toBe(true);
    
    role.value = 'student';
    expect(isTeacher.value).toBe(false);
  });

  it('computes isStudent correctly', () => {
    const { isStudent, role } = useAuth();
    
    role.value = 'student';
    expect(isStudent.value).toBe(true);
    
    role.value = 'teacher';
    expect(isStudent.value).toBe(false);
  });

  it('cleans up auth listener', () => {
    const mockUnsubscribe = vi.fn();
    setupAuthListener.mockReturnValue(mockUnsubscribe);

    const { initialize, cleanup } = useAuth();
    initialize();
    cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
}); 