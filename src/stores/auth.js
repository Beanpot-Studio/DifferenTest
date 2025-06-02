import { ref, computed } from 'vue';
import { auth, db } from '../lib/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create reactive state
const user = ref(null);
const role = ref(null);
const error = ref(null);
const loading = ref(false);
const initialized = ref(false);

// Computed properties
const isLoggedIn = computed(() => !!user.value);
const isTeacher = computed(() => role.value === 'teacher');
const isStudent = computed(() => role.value === 'student');
const isAdmin = computed(() => role.value === 'admin');

// Actions
async function login(email, password) {
  loading.value = true;
  error.value = null;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // user.value will be set by onAuthStateChanged listener
    // await fetchUserRole(userCredential.user.uid); // This will also be handled by onAuthStateChanged
    return { success: true };
  } catch (err) {
    error.value = err.message;
    return { success: false, error: err.message };
  } finally {
    loading.value = false;
  }
}

async function logout() {
  loading.value = true;
  error.value = null;
  try {
    await signOut(auth);
    // user.value and role.value will be cleared by onAuthStateChanged
    window.location.href = import.meta.env.PUBLIC_BASE_URL || '/';
    return { success: true };
  } catch (err) {
    error.value = err.message;
    return { success: false, error: err.message };
  } finally {
    loading.value = false;
  }
}

async function register(email, password, userRole) {
  loading.value = true;
  error.value = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // user.value will be set by onAuthStateChanged
    // Set the role in Firestore immediately
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      role: userRole,
      email,
      createdAt: new Date()
    });
    // role.value will be updated by onAuthStateChanged after fetching
    return { success: true };
  } catch (err) {
    error.value = err.message;
    return { success: false, error: err.message };
  } finally {
    loading.value = false;
  }
}

async function updateUserRole(newRole) {
  if (!user.value) {
    error.value = 'No user logged in';
    return { success: false, error: 'No user logged in' };
  }
  loading.value = true;
  error.value = null;
  try {
    await setDoc(doc(db, 'users', user.value.uid), {
      role: newRole
    }, { merge: true });
    role.value = newRole; // Optimistic update, will be confirmed by onAuthStateChanged if it re-fetches role
    if(user.value) user.value.role = newRole; // Optimistic update for user object
    return { success: true };
  } catch (err) {
    error.value = err.message;
    return { success: false, error: err.message };
  } finally {
    loading.value = false;
  }
}

async function fetchUserRole(uid) {
  // This function is now primarily internal to handleAuthStateChanged
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      role.value = userData.role;
      // Update the user object with details from Firestore
      if (user.value) { // Ensure user.value still exists (might have logged out during async op)
        user.value = {
          ...user.value, // Keep existing auth properties like email, uid
          name: userData.name,
          role: userData.role,
          paid: userData.paid || false 
        };
      }
    } else {
      // User document doesn't exist in Firestore, might be an issue or new registration
      role.value = null; // Or a default role
      if(user.value) user.value.role = null; // Or default
    }
  } catch (err) {
    console.error("Error fetching user role:", err);
    error.value = "Error fetching user details.";
    // Potentially clear role or set to a default if fetch fails
    role.value = null;
    if(user.value) user.value.role = null;
  }
}

function clearAuthState() {
  user.value = null;
  role.value = null;
  // error.value = null; // Decide if errors should be cleared on logout
}

// This is the core listener function for Firebase Auth state changes
async function handleAuthStateChangedCallback(firebaseUser) {
  loading.value = true; // Indicate auth processing has started
  try {
    if (firebaseUser) {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        // Other initial auth data from firebaseUser if needed
      };
      await fetchUserRole(firebaseUser.uid); // Fetch role and other details from Firestore
    } else {
      clearAuthState();
    }
  } catch (e) {
    console.error("Error in handleAuthStateChangedCallback:", e);
    error.value = "Error processing authentication state.";
    clearAuthState(); // Ensure a clean state on error
  } finally {
    initialized.value = true; // Crucial: mark auth as initialized AFTER processing
    loading.value = false; // Auth processing finished
  }
}

// Set up the Firebase onAuthStateChanged listener when the store is initialized.
// This is self-invoking and ensures it runs once.
const unsubscribeAuthStateListener = onAuthStateChanged(auth, handleAuthStateChangedCallback);

// Optional: A cleanup function if you need to manually stop listening (e.g., for HMR in Vite or specific test scenarios)
function cleanupAuthListener() {
  if (unsubscribeAuthStateListener) {
    unsubscribeAuthStateListener();
  }
}

// Export the store
export function useAuth() {
  return {
    // State
    user,
    role,
    error,
    loading,
    initialized,
    
    // Computed
    isLoggedIn,
    isTeacher,
    isStudent,
    isAdmin,
    
    // Actions
    login,
    logout,
    register,
    updateUserRole,
    fetchUserRole,
    clearAuthState,
    cleanupAuthListener
  };
} 