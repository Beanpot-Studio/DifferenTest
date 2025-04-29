import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { loginUser } from '@/utils/firebase'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
}))

describe('Firebase Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully logs in a user', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    const mockSignIn = vi.mocked(signInWithEmailAndPassword)
    mockSignIn.mockResolvedValueOnce({ user: mockUser } as any)

    const user = await loginUser('test@example.com', 'password123')

    expect(mockSignIn).toHaveBeenCalledWith(
      expect.any(Object),
      'test@example.com',
      'password123'
    )
    expect(user).toEqual(mockUser)
  })

  it('handles login errors', async () => {
    const mockSignIn = vi.mocked(signInWithEmailAndPassword)
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValueOnce(error)

    await expect(loginUser('test@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    )
  })
}) 