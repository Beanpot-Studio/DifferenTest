import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export async function loginUser(email: string, password: string) {
  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
} 