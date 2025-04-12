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
    
    // Get all quizzes with their class names
    const quizzes = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const quizData = doc.data();
        
        // Get the class name by finding the class that contains this quiz
        let className = 'Unknown Class';
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherId', '==', teacherId)
        );
        const classesSnapshot = await getDocs(classesQuery);
        
        for (const classDoc of classesSnapshot.docs) {
          const classData = classDoc.data();
          if (classData.quizzes?.some(q => q.id === doc.id)) {
            className = classData.name;
            break;
          }
        }
        
        return {
          id: doc.id,
          ...quizData,
          className,
          questionCount: quizData.questions?.length || 0
        };
      })
    );
    
    return quizzes;
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
          if (!enrollmentData.classId) {
            console.warn('Enrollment missing classId:', enrollmentDoc.id);
            return null;
          }

          const classDoc = await getDoc(doc(db, 'classes', enrollmentData.classId));
          if (!classDoc.exists()) {
            console.warn('Class not found:', enrollmentData.classId);
            return null;
          }

          const classData = classDoc.data();
          // Get teacher information
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
          
          // Get quiz details with question counts
          const quizzesWithDetails = await Promise.all(
            (classData.quizzes || []).map(async (quiz) => {
              if (!quiz.id) {
                console.warn('Quiz missing id in class:', classDoc.id);
                return null;
              }

              const quizDoc = await getDoc(doc(db, 'quizzes', quiz.id));
              if (!quizDoc.exists()) {
                console.warn('Quiz not found:', quiz.id);
                return null;
              }

              const quizData = quizDoc.data();
              const questions = quizData.questions || [];
              const questionCount = questions.length;
              
              return {
                ...quiz,
                questionCount,
                className: classData.name
              };
            })
          );
          
          return {
            id: classDoc.id,
            ...classData,
            quizzes: quizzesWithDetails.filter(Boolean),
            teacherName: teacherData?.name || 'Unknown Teacher',
            enrollmentId: enrollmentDoc.id,
            enrolledAt: enrollmentData.enrolledAt
          };
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

  /**
   * Create a new class
   * @param {Object} classData - The class data to create
   * @returns {Promise<string>} The ID of the created class
   */
  static async createClass(classData) {
    try {
      if (!classData.teacherId) {
        throw new Error('Teacher ID is required to create a class');
      }

      // Get teacher's name
      const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
      const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
      const teacherName = teacherData?.name || 'Unknown Teacher';

      // Generate a unique class code
      const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Check if code already exists
      let classCode;
      let isUnique = false;
      while (!isUnique) {
        classCode = generateClassCode();
        const codeQuery = query(
          collection(db, 'classes'),
          where('code', '==', classCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        isUnique = codeSnapshot.empty;
      }

      const classDoc = {
        name: classData.name,
        description: classData.description || '',
        code: classCode,
        teacherId: classData.teacherId,
        teacherName: teacherName,
        isPublic: classData.isPublic || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        quizzes: [],
        students: []
      };

      const docRef = await addDoc(collection(db, 'classes'), classDoc);
      return docRef.id;
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
  static async getQuizAttemptsByUser(userId, quizId = null) {
    console.log('Getting quiz attempts for user:', userId, quizId);
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch quiz attempts');
      }

      let q;
      if (quizId) {
        q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', userId),
          where('quizId', '==', quizId),
        );
      } else {
        q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', userId),
        );
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      throw error;
    }
  }

  static async createQuizAttempt(data) {
    const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return attemptRef.id;
  }

  static async submitQuizAttempt(attemptData) {
    try {
      if (!attemptData.userId || !attemptData.quizId || !attemptData.classId) {
        throw new Error('Missing required fields for quiz attempt');
      }

      // Create the quiz attempt
      const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
        ...attemptData,
        timestamp: serverTimestamp()
      });

      // Get class and quiz details for activity record
      const [classDoc, quizDoc] = await Promise.all([
        getDoc(doc(db, 'classes', attemptData.classId)),
        getDoc(doc(db, 'quizzes', attemptData.quizId))
      ]);

      const classData = classDoc.exists() ? classDoc.data() : null;
      const quizData = quizDoc.exists() ? quizDoc.data() : null;

      // Get student details
      const studentDoc = await getDoc(doc(db, 'users', attemptData.userId));
      const studentData = studentDoc.exists() ? studentDoc.data() : null;

      // Create activity record with only defined fields
      const activityData = {
        type: 'quiz_completed',
        classId: attemptData.classId,
        className: classData?.name || 'Unknown Class',
        studentId: attemptData.userId,
        studentName: studentData?.name || 'Student',
        teacherId: classData?.teacherId,
        quizId: attemptData.quizId,
        quizTitle: quizData?.title || 'Unknown Quiz',
        score: attemptData.score,
        correctAnswers: attemptData.correctAnswers,
        totalQuestions: attemptData.questionCount,
        timeSpent: attemptData.timeSpent,
        timestamp: serverTimestamp(),
        activityDescription: `Completed "${quizData?.title || 'Unknown Quiz'}" quiz in ${classData?.name || 'Unknown Class'} with ${attemptData.score}% score`
      };

      // Only add improvement if it's defined
      if (attemptData.improvement !== undefined) {
        activityData.improvement = attemptData.improvement;
      }

      await addDoc(collection(db, 'activities'), activityData);

      return attemptRef.id;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
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
    try {
      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);
      
      if (!enrollmentDoc.exists()) {
        throw new Error('Enrollment not found');
      }

      const enrollmentData = enrollmentDoc.data();
      
      // Check if status is changing from pending to accepted
      if (enrollmentData.status === 'pending' && data.status === 'accepted') {
        // Get class and student details
        const [classDoc, studentDoc] = await Promise.all([
          getDoc(doc(db, 'classes', enrollmentData.classId)),
          getDoc(doc(db, 'users', enrollmentData.studentId))
        ]);

        if (!classDoc.exists() || !studentDoc.exists()) {
          throw new Error('Class or student not found');
        }

        const classData = classDoc.data();
        const studentData = studentDoc.data();

        // Create activity record for enrollment acceptance
        await addDoc(collection(db, 'activities'), {
          type: 'enrollment_accepted',
          classId: enrollmentData.classId,
          className: classData.name,
          studentId: enrollmentData.studentId,
          studentName: studentData.name,
          teacherId: classData.teacherId,
          timestamp: serverTimestamp()
        });
      }

      // Update the enrollment
      await updateDoc(enrollmentRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
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

  static async getUserActivities(userId) {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return [];
      }

      // Query for activities where user is either the userId or studentId
      const q = query(
        collection(db, 'activities'),
        where('studentId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const activities = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let className = 'Unknown Class';
        let teacherName = 'Unknown Teacher';
        
        // Get class details if classId exists
        if (data.classId) {
          try {
            const classDoc = await getDoc(doc(db, 'classes', data.classId));
            if (classDoc.exists()) {
              const classData = classDoc.data();
              className = classData.name || 'Unknown Class';
              
              // Get teacher details
              if (classData.teacherId) {
                const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
                if (teacherDoc.exists()) {
                  teacherName = teacherDoc.data().name || 'Unknown Teacher';
                }
              }
            }
          } catch (err) {
            console.error('Error loading class or teacher details:', err);
          }
        }
        
        // Map activity type to display text
        let activityTypeText = 'Unknown Activity';
        switch (data.type) {
          case 'enrollment_request':
            activityTypeText = 'Requested to join class';
            break;
          case 'enrollment_accepted':
            activityTypeText = 'Enrollment accepted';
            break;
          case 'enrollment_rejected':
            activityTypeText = 'Enrollment rejected';
            break;
          case 'quiz_started':
            activityTypeText = 'Started quiz';
            break;
          case 'quiz_completed':
            activityTypeText = 'Completed quiz';
            break;
          case 'quiz_retake':
            activityTypeText = 'Retook quiz';
            break;
          case 'achievement':
            activityTypeText = 'Earned achievement';
            break;
          case 'progress':
            activityTypeText = 'Made progress';
            break;
          case 'class_joined':
            activityTypeText = 'Joined class';
            break;
          case 'class_left':
            activityTypeText = 'Left class';
            break;
        }
        
        activities.push({
          id: docSnap.id,
          classId: data.classId,
          className: className,
          teacherName: teacherName,
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type,
          typeText: activityTypeText,
          userId: data.userId,
          studentId: data.studentId,
          studentName: data.studentName,
          status: data.status,
          quizId: data.quizId,
          quizTitle: data.quizTitle,
          score: data.score,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          timeSpent: data.timeSpent,
          improvement: data.improvement,
          activityDescription: data.activityDescription
        });
      }
      
      return activities;
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }

  static async getUserQuizHistory(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch quiz history');
      }

      const q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const attempts = [];
      
      for (const snapDoc of snapshot.docs) {
        const attemptData = snapDoc.data();
        
        // Get quiz details
        const quizDoc = await getDoc(doc(db, 'quizzes', attemptData.quizId));
        const quizData = quizDoc.data();
        
        // Get class details
        const classDoc = await getDoc(doc(db, 'classes', attemptData.classId));
        const classData = classDoc.data();
        
        attempts.push({
          id: snapDoc.id,
          quizId: attemptData.quizId,
          quizTitle: quizData?.title || 'Unknown Quiz',
          classId: attemptData.classId,
          className: classData?.name || 'Unknown Class',
          score: attemptData.score,
          correctAnswers: attemptData.correctAnswers,
          questionCount: attemptData.questionCount,
          submittedAt: attemptData.timestamp?.toDate(),
          timeSpent: attemptData.timeSpent,
          questionResults: attemptData.questionResults?.map(result => ({
            questionText: result.questionText,
            selectedOption: result.selectedOption,
            isCorrect: result.isCorrect,
            correctIndex: result.correctIndex
          })) || []
        });
      }
      
      return attempts;
    } catch (error) {
      console.error('Error getting user history:', error);
      throw error;
    }
  }

  /**
   * Get user's badges
   * @param {string} userId - The user ID to get badges for
   * @returns {Promise<Array<Object>>} Array of badge objects
   */
  static async getUserBadges(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch badges');
      }

      const badgesQuery = query(
        collection(db, 'badges'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(badgesQuery);
      return querySnapshot.docs.map(doc => ({
        badgeId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      throw error;
    }
  }

  static async getAvailableClasses(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch available classes');
      }

      // Get user's current enrollments
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledClassIds = enrollmentsSnapshot.docs.map(enrollmentDoc => enrollmentDoc.data().classId);

      // Get all non-public classes with teacher details
      const classesQuery = query(
        collection(db, 'classes'),
        where('isPublic', '==', false),
        orderBy('createdAt', 'desc')
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classes = [];
      
      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();
        
        // Get teacher information
        const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
        const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
        
        // Get quizzes for this class
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('classId', '==', classDoc.id)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizCount = quizzesSnapshot.size;
        
        classes.push({
          id: classDoc.id,
          name: classData.name,
          teacherName: teacherData?.name || 'Unknown Teacher',
          isEnrolled: enrolledClassIds.includes(classDoc.id),
          code: classData.code || '',
          description: classData.description || '',
          quizCount: quizCount
        });
      }
      
      return {
        classes,
        enrolledClasses: enrolledClassIds
      };
    } catch (error) {
      console.error('Error getting available classes:', error);
      throw error;
    }
  }

 
  static async enrollInClass(classId, studentId) {
    try {
      if (!classId || !studentId) {
        throw new Error('Class ID and Student ID are required');
      }

      // Check if already enrolled
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('classId', '==', classId),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(enrollmentsQuery);
      
      if (!querySnapshot.empty) {
        return {
          success: false,
          message: 'You are already enrolled in this class',
          status: 'error'
        };
      }

      // Get class and student details for activity
      const [classDoc, studentDoc] = await Promise.all([
        getDoc(doc(db, 'classes', classId)),
        getDoc(doc(db, 'users', studentId))
      ]);

      if (!classDoc.exists() || !studentDoc.exists()) {
        throw new Error('Class or student not found');
      }

      const classData = classDoc.data();
      const studentData = studentDoc.data();

      // Create enrollment
      const enrollmentData = {
        classId: classId,
        studentId: studentId,
        status: 'pending',
        enrolledAt: serverTimestamp()
      };

      const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentData);

      // Create activity record
      await addDoc(collection(db, 'activities'), {
        type: 'enrollment_request',
        classId: classId,
        className: classData.name,
        studentId: studentId,
        studentName: studentData.name,
        teacherId: classData.teacherId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      return {
        success: true,
        message: 'Enrollment request sent successfully',
        status: 'pending'
      };
    } catch (error) {
      console.error('Error enrolling in class:', error);
      return {
        success: false,
        message: 'Failed to enroll in class',
        status: 'error'
      };
    }
  }

  
  static async getEnrollmentStatus(studentId, classId) {
    try {
      if (!studentId || !classId) {
        console.warn('Missing studentId or classId:', { studentId, classId });
        return null;
      }

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('classId', '==', classId)
      );
      
      const querySnapshot = await getDocs(enrollmentsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      // Return the status of the first matching enrollment
      return querySnapshot.docs[0].data().status;
    } catch (error) {
      console.error('Error getting enrollment status:', error);
      return null;
    }
  }

  static async claimBadge(userId, quizId, classId, score) {
    try {
      if (!userId || !quizId || !classId || score !== 100) {
        return {
          success: false,
          message: 'Invalid parameters for badge claim',
          status: 'error'
        };
      }

      // Check if badge already exists for this quiz
      const badgeRef = doc(db, 'badges', `${userId}_${quizId}`);
      const badgeDoc = await getDoc(badgeRef);

      if (badgeDoc.exists()) {
        return {
          success: false,
          message: 'Badge already claimed for this quiz',
          status: 'error'
        };
      }

      // Get quiz details for badge metadata
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        return {
          success: false,
          message: 'Quiz not found',
          status: 'error'
        };
      }

      const quizData = quizDoc.data();
      const badgeMetadata = {
        title: `Perfect Score: ${quizData.title}`,
        description: `Achieved a perfect score on the ${quizData.title} quiz`,
        type: 'quiz_perfect_score',
        icon: '🏆',
        color: 'gold'
      };

      // Create badge
      await setDoc(badgeRef, {
        userId,
        quizId,
        quizTitle: quizData.title,
        classId,
        timestamp: serverTimestamp(),
        metadata: badgeMetadata
      });

      // Create activity record
      await addDoc(collection(db, 'activities'), {
        userId,
        type: 'badge_claimed',
        badgeId: badgeRef.id,
        quizId,
        quizTitle: quizData.title,
        classId,
        timestamp: serverTimestamp(),
        activityDescription: `🏆 Claimed "${badgeMetadata.title}" badge for perfect score on ${quizData.title}!`
      });

      return {
        success: true,
        message: `Achievement Unlocked! You've earned the "${badgeMetadata.title}" badge!`,
        status: 'success',
        badgeId: badgeRef.id
      };
    } catch (error) {
      console.error('Error claiming badge:', error);
      return {
        success: false,
        message: 'Failed to claim badge',
        status: 'error'
      };
    }
  }
}

export default FirebaseService; 