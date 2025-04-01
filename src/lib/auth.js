import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Register a new user with email, password, and role
export const registerUser = async (email, password, role) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user role and additional info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role, // 'teacher' or 'student'
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error };
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
    return { success: false, error };
  }
};

// Logout the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, error };
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
    return null;
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
