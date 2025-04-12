import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp,
  increment,
  limit,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

class FirebaseService {
  // User Operations
  static async getUserProfile(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  static async updateUserProfile(userId, data) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  }

  // Class Operations
  static async getClass(classId) {
    const classDoc = await getDoc(doc(db, 'classes', classId));
    return classDoc.exists() ? { id: classDoc.id, ...classDoc.data() } : null;
  }

  static async getTeacherClasses(teacherId) {
    // Get teacher's classes
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const classesSnapshot = await getDocs(classesQuery);
    const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get total submissions for all classes
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('type', '==', 'quiz_completed'),
      where('teacherId', '==', teacherId)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const totalSubmissions = activitiesSnapshot.size;

    return { classes, totalSubmissions };
  }

  static async getTeacherQuizzes(teacherId) {
    const q = query(
      collection(db, 'quizzes'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getClassesByTeacher(teacherId) {
    const q = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getClassesByStudent(studentId) {
    try {
      if (!studentId) {
        console.error('No student ID provided');
        return [];
      }
      
      console.log('Getting classes for student:', studentId);
      
      // Get all enrollments for the student
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      console.log('Enrollments found:', enrollmentsSnapshot.docs.length);
      
      // Get class details for each enrollment
      const classes = await Promise.all(
        enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const classDoc = await getDoc(doc(db, 'classes', enrollmentData.classId));
          if (classDoc.exists()) {
            const classData = classDoc.data();
            // Get teacher information
            const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
            const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
            
            // Get quiz details with question counts
            const quizzesWithDetails = await Promise.all(
              (classData.quizzes || []).map(async (quiz) => {
                const quizDoc = await getDoc(doc(db, 'quizzes', quiz.id));
                if (quizDoc.exists()) {
                  const quizData = quizDoc.data();
                  console.log('Quiz data for', quiz.title, ':', quizData);
                  const questions = quizData.questions || [];
                  console.log('Questions array:', questions);
                  const questionCount = questions.length;
                  console.log('Question count for', quiz.title, ':', questionCount);
                  return {
                    ...quiz,
                    questionCount
                  };
                }
                return quiz;
              })
            );
            
            return {
              id: classDoc.id,
              ...classData,
              quizzes: quizzesWithDetails,
              teacherName: teacherData?.name || 'Unknown Teacher',
              enrollmentId: enrollmentDoc.id,
              enrolledAt: enrollmentData.enrolledAt
            };
          }
          return null;
        })
      );
      
      // Filter out any null results and sort by enrollment date
      return classes
        .filter(Boolean)
        .sort((a, b) => b.enrolledAt?.toDate() - a.enrolledAt?.toDate());
    } catch (error) {
      console.error('Error getting classes by student:', error);
      throw error;
    }
  }

  static async createClass(classData) {
    try {
      const classRef = doc(collection(db, 'classes'));
      const classId = classRef.id;
      
      const newClass = {
        id: classId,
        ...classData,
        isPublic: classData.isPublic || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(classRef, newClass);
      return classId;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  static async updateClass(classId, data) {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, { ...data, updatedAt: serverTimestamp() });
  }

  // Quiz Operations
  static async getQuiz(quizId) {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    return quizDoc.exists() ? { id: quizDoc.id, ...quizDoc.data() } : null;
  }

  static async getQuizzesByClass(classId) {
    const q = query(
      collection(db, 'quizzes'),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createQuiz(quizData) {
    try {
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        ...quizData,
        teacherId: quizData.teacherId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return quizRef.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  static async updateQuiz(quizId, data) {
    const quizRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizRef, { ...data, updatedAt: serverTimestamp() });
  }

  static async deleteQuiz(quizId) {
    try {
      // Delete the quiz document
      await deleteDoc(doc(db, 'quizzes', quizId));
      
      // Delete any associated quiz attempts
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('quizId', '==', quizId)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      const deletePromises = attemptsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  // Quiz Attempt Operations
  static async getQuizAttemptsByUser(userId, quizId) {
    const q = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', userId),
      where('quizId', '==', quizId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createQuizAttempt(data) {
    const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return attemptRef.id;
  }

  // Enrollment Operations
  static async getEnrollmentsByClass(classId) {
    const q = query(
      collection(db, 'enrollments'),
      where('classId', '==', classId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createEnrollment(data) {
    const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
      ...data,
      enrolledAt: serverTimestamp()
    });
    return enrollmentRef.id;
  }

  static async updateEnrollment(enrollmentId, data) {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, data);
  }

  // Activity Operations
  static async getActivitiesByUser(userId, limitCount = 10) {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createActivity(data) {
    const activityRef = await addDoc(collection(db, 'activities'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return activityRef.id;
  }

  // Search Operations
  static async searchClasses(query) {
    try {
      const searchQuery = query.toLowerCase().trim();
      
      // Search by name
      const nameQuery = query(
        collection(db, 'classes'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
      );
      
      // Search by teacher name
      const teacherQuery = query(
        collection(db, 'classes'),
        where('teacherName', '>=', searchQuery),
        where('teacherName', '<=', searchQuery + '\uf8ff')
      );
      
      // Search by code
      const codeQuery = query(
        collection(db, 'classes'),
        where('code', '>=', searchQuery),
        where('code', '<=', searchQuery + '\uf8ff')
      );
      
      const [nameResults, teacherResults, codeResults] = await Promise.all([
        getDocs(nameQuery),
        getDocs(teacherQuery),
        getDocs(codeQuery)
      ]);
      
      // Combine and deduplicate results
      const results = new Map();
      
      [...nameResults.docs, ...teacherResults.docs, ...codeResults.docs].forEach(doc => {
        if (!results.has(doc.id)) {
          results.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      });
      
      return Array.from(results.values());
    } catch (error) {
      console.error('Error searching classes:', error);
      throw error;
    }
  }

  // Article Operations
  static async updateArticleRating(articleId, isHelpful) {
    const articleRef = doc(db, 'help_articles', articleId);
    await updateDoc(articleRef, {
      helpful: increment(isHelpful ? 1 : 0),
      notHelpful: increment(isHelpful ? 0 : 1)
    });
  }

  // Message Operations
  static async getUserMessages(userId) {
    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createMessage(data) {
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return messageRef.id;
  }

  // User Operations
  static async getAllUsers() {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Authentication Operations
  static async checkAuth() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });
  }

  static async requireAuth() {
    const user = await this.checkAuth();
    if (!user) {
      window.location.href = "/?auth=required";
    }
    return user;
  }

  // Teacher Dashboard Stats
  static async getTeacherDashboardStats(teacherId) {
    try {
      const stats = {
        totalClasses: 0,
        totalQuizzes: 0,
        totalSubmissions: 0
      };

      // Get all classes for the teacher
      const classesQuery = query(
        collection(db, 'classes'),
        where('teacherId', '==', teacherId)
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      if (classesSnapshot.empty) {
        return stats;
      }
      
      // Get all quizzes for the teacher at once
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('teacherId', '==', teacherId)
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);
      stats.totalQuizzes = quizzesSnapshot.size;
      
      // Get all quiz attempts for the teacher's quizzes
      const quizIds = quizzesSnapshot.docs.map(doc => doc.id);
      if (quizIds.length > 0) {
        const submissionsQuery = query(
          collection(db, 'quizAttempts'),
          where('quizId', 'in', quizIds)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        stats.totalSubmissions = submissionsSnapshot.size;
      }
      
      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();
        stats.totalClasses++;        
        
      }


      return stats;
    } catch (error) {
      console.error('Error getting teacher dashboard stats:', error);
      throw error;
    }
  }

  // Teacher Submissions
  static async getTeacherSubmissions(teacherId) {
    try {
      // Get all quiz attempts for the teacher's classes
      const submissionsQuery = query(
        collection(db, 'quizAttempts'),
        where('teacherId', '==', teacherId),
        orderBy('timestamp', 'desc')
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      const submissions = [];
      for (const doc of submissionsSnapshot.docs) {
        const submission = doc.data();
        submission.id = doc.id;

        // Get student details
        const studentDoc = await getDoc(doc(db, 'users', submission.studentId));
        if (studentDoc.exists()) {
          submission.studentName = studentDoc.data().name;
        }

        // Get quiz details
        const quizDoc = await getDoc(doc(db, 'quizzes', submission.quizId));
        if (quizDoc.exists()) {
          submission.quizTitle = quizDoc.data().title;
        }

        // Get class details
        const classDoc = await getDoc(doc(db, 'classes', submission.classId));
        if (classDoc.exists()) {
          submission.className = classDoc.data().name;
        }

        submissions.push(submission);
      }

      return submissions;
    } catch (error) {
      console.error('Error getting teacher submissions:', error);
      throw error;
    }
  }

  static async addQuizToClass(classId, quizId) {
    try {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data();
      const quizzes = classData.quizzes || [];
      
      // Add quiz ID to quizzes array if not already present
      if (!quizzes.includes(quizId)) {
        quizzes.push(quizId);
        await updateDoc(classRef, {
          quizzes,
          updatedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding quiz to class:', error);
      throw error;
    }
  }

  static async removeQuizFromClass(classId, quizId) {
    try {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data();
      const quizzes = classData.quizzes || [];
      
      // Filter out the quiz object with matching id
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      
      // Update the class document with the new quizzes array
      await updateDoc(classRef, {
        quizzes: updatedQuizzes,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error removing quiz from class:', error);
      throw error;
    }
  }

  static async getPublicClasses() {
    try {
      const classesQuery = query(
        collection(db, 'classes'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classes = await Promise.all(
        classesSnapshot.docs.map(async (classDoc) => {
          const classData = classDoc.data();
          
          // Get teacher information
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
          
          // Get quiz details
          const quizzesWithDetails = await Promise.all(
            (classData.quizzes || []).map(async (quiz) => {
              const quizDoc = await getDoc(doc(db, 'quizzes', quiz.id));
              if (quizDoc.exists()) {
                const quizData = quizDoc.data();
                return {
                  ...quiz,
                  questionCount: quizData.questions?.length || 0
                };
              }
              return quiz;
            })
          );
          
          return {
            id: classDoc.id,
            ...classData,
            quizzes: quizzesWithDetails,
            teacherName: teacherData?.name || 'Unknown Teacher'
          };
        })
      );
      
      return classes;
    } catch (error) {
      console.error('Error getting public classes:', error);
      throw error;
    }
  }
}

export default FirebaseService; 