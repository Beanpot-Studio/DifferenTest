import { defineStore } from 'pinia';
import { auth, db } from '../lib/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuth = defineStore('auth', {
  state: () => ({
    user: null,
    role: null
  }),

  actions: {
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        await this.fetchUserRole(userCredential.user.uid);
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.clearAuthState();
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    async register(email, password, role) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        this.role = role;
        
        // Store user role in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          role,
          email,
          createdAt: new Date()
        });
        
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }
    },

    async updateUserRole(newRole) {
      if (!this.user) return { success: false, error: 'No user logged in' };
      
      try {
        this.role = newRole;
        await setDoc(doc(db, 'users', this.user.uid), {
          role: newRole
        }, { merge: true });
        return { success: true };
      } catch (error) {
        console.error('Role update error:', error);
        return { success: false, error: error.message };
      }
    },

    async handleAuthStateChanged(user) {
      this.user = user;
      if (user) {
        await this.fetchUserRole(user.uid);
      } else {
        this.clearAuthState();
      }
    },

    async fetchUserRole(uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          this.role = userDoc.data().role;
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    },

    clearAuthState() {
      this.user = null;
      this.role = null;
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    isTeacher: (state) => state.role === 'teacher',
    isStudent: (state) => state.role === 'student'
  }
}); 