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

// Actions
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    user.value = userCredential.user;
    await fetchUserRole(userCredential.user.uid);
    error.value = null;
    return { success: true };
  } catch (error) {
    error.value = error.message;
    return { success: false, error: error.message };
  }
}

async function logout() {
  try {
    await signOut(auth);
    clearAuthState();
    window.location.href = import.meta.env.PUBLIC_BASE_URL || '/';
    return { success: true };
  } catch (err) {
    error.value = err.message;
    return { success: false, error: err.message };
  }
}

async function register(email, password, userRole) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user.value = userCredential.user;
    role.value = userRole;
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      role: userRole,
      email,
      createdAt: new Date()
    });
    
    error.value = null;
    return { success: true };
  } catch (error) {
    error.value = error.message;
    return { success: false, error: error.message };
  }
}

async function updateUserRole(newRole) {
  if (!user.value) {
    error.value = 'No user logged in';
    return { success: false, error: 'No user logged in' };
  }
  
  try {
    role.value = newRole;
    await setDoc(doc(db, 'users', user.value.uid), {
      role: newRole
    }, { merge: true });
    error.value = null;
    return { success: true };
  } catch (error) {
    error.value = error.message;
    return { success: false, error: error.message };
  }
}

async function handleAuthStateChanged(newUser) {
  if (newUser) {
    // Create a new user object with the auth data
    user.value = {
      uid: newUser.uid,
      email: newUser.email,
      // Other auth properties will be added by fetchUserRole
    };
    await fetchUserRole(newUser.uid);
    // Update user object with role after fetching it
    if (user.value) {
      user.value = {
        ...user.value,
        role: role.value
      };
    }
  } else {
    clearAuthState();
  }
}

async function fetchUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      role.value = userData.role;
      // Update the user object with the name, role, and paid status from Firestore
      if (user.value) {
        user.value = {
          ...user.value,
          name: userData.name,
          role: userData.role,
          paid: userData.paid || false // Include paid status, default to false if undefined
        };
      }
    }
    error.value = null;
  } catch (error) {
    error.value = error.message;
  }
}

function clearAuthState() {
  user.value = null;
  role.value = null;
  error.value = null;
}

async function initialize() {
  if (initialized.value) return;
  
  loading.value = true;
  try {
    onAuthStateChanged(auth, handleAuthStateChanged);
    initialized.value = true;
  } catch (error) {
    error.value = error.message;
  } finally {
    loading.value = false;
  }
}

function cleanup() {
  // Cleanup any listeners or subscriptions if needed
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
    
    // Actions
    login,
    logout,
    register,
    updateUserRole,
    handleAuthStateChanged,
    fetchUserRole,
    clearAuthState,
    initialize,
    cleanup
  };
} 