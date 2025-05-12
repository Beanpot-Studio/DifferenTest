import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Friendly error message mapping
function getFriendlyAuthError(error) {
  if (!error || !error.code) return 'An unknown error occurred. Please try again.';
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'The sign-in popup was closed before completing. Please try again.',
    'auth/popup-blocked': 'The sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    // Add more as needed
  };
  return map[error.code] || error.message || 'An error occurred. Please try again.';
}

// Register a new user with email, password, and role
export const registerUser = async (email, password, role, name) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user role and additional info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name,
      role: role, // 'teacher' or 'student'
      paid: false, // Default paid status to false
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: { message: getFriendlyAuthError(error) } };
  }
};

// Login a user with email and password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login timestamp
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: { message: getFriendlyAuthError(error) } };
  }
};

// Logout the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, error: { message: getFriendlyAuthError(error) } };
  }
};

// Get the current user's role from Firestore
export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null; // Not surfaced to UI, but could be if needed
  }
};

// A custom hook to monitor authentication state
export const setupAuthListener = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const role = await getUserRole(user.uid);
      callback({ user, role });
    } else {
      callback({ user: null, role: null });
    }
  });
};

// Sign in with Google
export const signInWithGoogle = async (role = 'student') => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // New user, create Firestore record
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || '',
        role: role || 'student',
        paid: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      // Existing user, update lastLogin
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }
    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: { message: getFriendlyAuthError(error) } };
  }
};
