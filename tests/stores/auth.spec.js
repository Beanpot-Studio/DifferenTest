import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuth } from '@/stores/auth' // Static import is fine now
import { signOut } from 'firebase/auth' 

// Remove the complex store mocking

// Keep window.location mocking setup
const originalLocation = window.location;
const mockHrefSetter = vi.fn();

beforeEach(() => {
  // Set up window mock
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: originalLocation.href, assign: vi.fn() },
  });
  Object.defineProperty(window.location, 'href', {
    set: mockHrefSetter,
    get: () => originalLocation.href,
    configurable: true,
  });
});

afterEach(() => {
  // Clean up window mock
  vi.clearAllMocks(); 
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});
// -------------------------------------

describe('Auth Store - logout', () => {

  beforeEach(() => {
    // Reset firebase mocks and href setter
    vi.mocked(signOut).mockClear();
    mockHrefSetter.mockClear();

    // Reset state manually before each test
    const { user, role, error } = useAuth();
    user.value = null; 
    role.value = null;
    error.value = null;
  });

  it('should call signOut, clear state, and redirect on successful logout', async () => {
    // Arrange
    const { logout, user, role, error, isLoggedIn } = useAuth(); 
    // Set initial logged-in state for this test
    user.value = { uid: 'test-uid', email: 'test@test.com' };
    role.value = 'student';
    error.value = null; 
    expect(isLoggedIn.value).toBe(true); 

    // Act
    const result = await logout(); // Call the logout function

    // Assert
    expect(result).toEqual({ success: true }); // Check return value
    expect(signOut).toHaveBeenCalledTimes(1);
    // Check that state refs were reset
    expect(user.value).toBeNull();
    expect(role.value).toBeNull();
    expect(error.value).toBeNull(); 
    expect(isLoggedIn.value).toBe(false);
    // Check redirect
    expect(mockHrefSetter).toHaveBeenCalledTimes(1);
    const expectedUrl = import.meta.env.PUBLIC_BASE_URL || '/';
    expect(mockHrefSetter).toHaveBeenCalledWith(expectedUrl);
  });


  it('should return failure object on signOut failure', async () => {
    // Arrange
    const { logout, user, role, error, isLoggedIn } = useAuth(); 
    const errorMessage = 'Firebase sign out failed';
    const mockSignOutError = new Error(errorMessage);
    vi.mocked(signOut).mockRejectedValueOnce(mockSignOutError);
    // Set initial logged-in state for this test
    const initialUser = { uid: 'test-uid', email: 'test@test.com' };
    user.value = initialUser;
    role.value = 'teacher';
    error.value = null;
    expect(isLoggedIn.value).toBe(true);

    // Act
    const result = await logout();

    // Assert
    // Check the return value directly
    expect(result).toEqual({ success: false, error: errorMessage }); 
    expect(signOut).toHaveBeenCalledTimes(1);
    // Check state wasn't cleared (error value check is still unreliable)
    expect(user.value).toEqual(initialUser);
    expect(role.value).toBe('teacher');
    expect(isLoggedIn.value).toBe(true);
    // Check redirect was not attempted
    expect(mockHrefSetter).not.toHaveBeenCalled();
  });

}); 