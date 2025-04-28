import { describe, it, expect, vi } from 'vitest'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { loginUser } from './firebase'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}))

describe('Firebase Utils', () => {
  it('loginUser calls Firebase auth with correct parameters', async () => {
    const mockSignIn = vi.mocked(signInWithEmailAndPassword)
    mockSignIn.mockResolvedValueOnce({ user: { uid: '123' } } as any)

    await loginUser('test@example.com', 'password123')

    expect(mockSignIn).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    )
  })

  it('handles login errors', async () => {
    const mockSignIn = vi.mocked(signInWithEmailAndPassword)
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'))

    await expect(loginUser('test@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    )
  })
}) 