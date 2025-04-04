import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuth } from '../auth';
import { auth } from '../../lib/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Mock Firebase auth
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {}
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  signOut: vi.fn().mockResolvedValue(),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: {
      uid: '123',
      email: 'test@example.com'
    }
  }),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: {
      uid: '123',
      email: 'new@example.com'
    }
  }),
  onAuthStateChanged: vi.fn()
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ role: 'teacher' })
  }),
  setDoc: vi.fn().mockResolvedValue()
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock window.location
    global.window = {
      location: {
        href: '/'
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const store = useAuth();
    expect(store.user).toBeNull();
    expect(store.role).toBeNull();
  });

  it('handles login correctly', async () => {
    const store = useAuth();
    const result = await store.login('test@example.com', 'password');
    
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
    expect(store.user).toEqual({
      uid: '123',
      email: 'test@example.com'
    });
    expect(result.success).toBe(true);
  });

  it('handles logout correctly', async () => {
    const store = useAuth();
    store.user = { uid: '123' };
    store.role = 'teacher';
    
    await store.logout();
    
    expect(signOut).toHaveBeenCalledWith(auth);
    expect(store.user).toBeNull();
    expect(store.role).toBeNull();
    expect(window.location.href).toBe('/');
  });

  it('handles registration correctly', async () => {
    const store = useAuth();
    const result = await store.register('new@example.com', 'password', 'teacher');
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'new@example.com', 'password');
    expect(store.user).toEqual({
      uid: '123',
      email: 'new@example.com'
    });
    expect(store.role).toBe('teacher');
    expect(result.success).toBe(true);
  });

  it('updates user role correctly', async () => {
    const store = useAuth();
    store.user = { uid: '123' };
    
    const result = await store.updateUserRole('student');
    
    expect(store.role).toBe('student');
    expect(result.success).toBe(true);
  });

  it('handles auth state changes correctly', async () => {
    const store = useAuth();
    const mockUser = {
      uid: '123',
      email: 'test@example.com'
    };
    
    await store.handleAuthStateChanged(mockUser);
    
    expect(store.user).toEqual(mockUser);
    expect(getDoc).toHaveBeenCalled();
  });

  it('clears auth state correctly', () => {
    const store = useAuth();
    store.user = { uid: '123' };
    store.role = 'teacher';
    
    store.clearAuthState();
    
    expect(store.user).toBeNull();
    expect(store.role).toBeNull();
  });

  it('computes isLoggedIn correctly', () => {
    const store = useAuth();
    expect(store.isLoggedIn).toBe(false);
    
    store.user = { uid: '123' };
    expect(store.isLoggedIn).toBe(true);
  });

  it('computes isTeacher correctly', () => {
    const store = useAuth();
    expect(store.isTeacher).toBe(false);
    
    store.role = 'teacher';
    expect(store.isTeacher).toBe(true);
  });

  it('computes isStudent correctly', () => {
    const store = useAuth();
    expect(store.isStudent).toBe(false);
    
    store.role = 'student';
    expect(store.isStudent).toBe(true);
  });
}); 