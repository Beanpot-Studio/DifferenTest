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
  getFirestore,
  writeBatch,
  FieldValue,
  arrayUnion,
  arrayRemove,
  deleteField,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Get API key from environment variable
const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key not found in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);

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

  
  static async getClasses(options = {}) {
    const { 
      teacherId, 
      studentId, 
      isPublic = null,
      includeQuizzes = false,
      includeTeacherInfo = false,
      includeEnrollmentInfo = false
    } = options;

    try {
      // Build base query
      let queryConstraints = [];
      
      if (teacherId) {
        queryConstraints.push(where('teacherId', '==', teacherId));
      }
      if (isPublic !== null) {
        queryConstraints.push(where('isPublic', '==', isPublic));
      }
      
      const q = query(
        collection(db, 'classes'),
        ...queryConstraints,
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If no additional data needed, return early
      if (!includeQuizzes && !includeTeacherInfo && !includeEnrollmentInfo) {
        return { classes, totalSubmissions: 0 };
      }

      // Get additional data if requested
      const enhancedClasses = await Promise.all(classes.map(async (classData) => {
        const enhancedClass = { ...classData };

        // Get teacher info if requested
        if (includeTeacherInfo) {
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          enhancedClass.teacher = teacherDoc.exists() ? teacherDoc.data() : null;
        }

        // Get enrollment info if requested
        if (includeEnrollmentInfo && studentId) {
          const enrollmentQuery = query(
            collection(db, 'enrollments'),
            where('classId', '==', classData.id),
            where('studentId', '==', studentId)
          );
          const enrollmentSnapshot = await getDocs(enrollmentQuery);
          enhancedClass.enrollment = !enrollmentSnapshot.empty ? enrollmentSnapshot.docs[0].data() : null;
        }

        // Get quizzes if requested
        if (includeQuizzes) {
          const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('classId', '==', classData.id),
            orderBy('createdAt', 'asc')
          );
          const quizzesSnapshot = await getDocs(quizzesQuery);
          enhancedClass.quizzes = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        return enhancedClass;
      }));

      // Get total submissions if quizzes are included
      let totalSubmissions = 0;
      if (includeQuizzes) {
        const allQuizIds = enhancedClasses.flatMap(c => c.quizzes?.map(q => q.id).filter(id => id) || []);
        
        if (allQuizIds.length > 0) {
          const CHUNK_SIZE = 30; // Firestore limit for 'in' queries
          let submissionCountPromises = [];

          for (let i = 0; i < allQuizIds.length; i += CHUNK_SIZE) {
            const chunk = allQuizIds.slice(i, i + CHUNK_SIZE);
            if (chunk.length > 0) {
              const submissionsQuery = query(
                collection(db, 'quizAttempts'),
                where('quizId', 'in', chunk)
                // We only need the count, so we could potentially optimize further 
                // if Firestore allowed count directly without fetching docs, but it doesn't.
                // However, fetching with limit(1) and checking size is not what we want here, we want total size.
              );
              submissionCountPromises.push(getDocs(submissionsQuery).then(snapshot => snapshot.size));
            }
          }
          
          const counts = await Promise.all(submissionCountPromises);
          totalSubmissions = counts.reduce((acc, currentSize) => acc + currentSize, 0);
        }
      }

      return { 
        classes: enhancedClasses,
        totalSubmissions 
      };
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  }

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
        code: classCode,
        teacherId: classData.teacherId,
        teacherName: teacherName,
        isPublic: classData.isPublic || false,
        isComplete: classData.isComplete || false,
        skinId: classData.skinId || 'default',
        ageGroup: classData.ageGroup || 'college',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'classes'), classDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  static async updateClass(classId, data) {
    try {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      
      // Explicitly merge fields, prioritizing incoming 'data' if defined
      const updateData = {
        name: data.name !== undefined ? data.name : classData.name,
        isPublic: data.isPublic !== undefined ? data.isPublic : classData.isPublic,
        isComplete: data.isComplete !== undefined ? data.isComplete : classData.isComplete,
        skinId: data.skinId !== undefined ? data.skinId : classData.skinId,
        ageGroup: data.ageGroup !== undefined ? data.ageGroup : classData.ageGroup,
        adminApproved: data.adminApproved !== undefined ? data.adminApproved : classData.adminApproved,
        // customCertificateBadgeUrl handled below
        updatedAt: serverTimestamp(),
      };

       // Explicitly handle customCertificateBadgeUrl based on incoming 'data'
       if (data.customCertificateBadgeUrl === null) {
         // If null was passed, set it to null for deletion/reset in Firestore
         updateData.customCertificateBadgeUrl = null;
       } else if (data.customCertificateBadgeUrl !== undefined) {
         // If a new URL was passed, use it
         updateData.customCertificateBadgeUrl = data.customCertificateBadgeUrl;
       } 
       // If data.customCertificateBadgeUrl was undefined (not passed), 
       // we don't add it to updateData, preserving the existing Firestore value.

      // Remove undefined fields (but keep explicit null for badge URL)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
           delete updateData[key];
        }
      });

      await updateDoc(classRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  static async deleteClass(classId) {
    try {
      // Delete the class document
      await deleteDoc(doc(db, 'classes', classId));
      
      // Delete associated enrollments
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('classId', '==', classId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      const deleteEnrollmentPromises = enrollmentsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // Delete associated activities
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('classId', '==', classId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      const deleteActivityPromises = activitiesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // Wait for all deletions to complete
      await Promise.all([
        ...deleteEnrollmentPromises,
        ...deleteActivityPromises
      ]);
      
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Quiz Operations
  static async getQuiz(quizId) {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      return null;
    }
    // Ensure classId is included if it exists
    return { id: quizDoc.id, ...quizDoc.data() }; 
  }
  
  static async getAllQuizzes() {
      try {
          const q = query(
              collection(db, 'quizzes'),
              orderBy('createdAt', 'desc') // Optional: order by date or title
          );
          const snapshot = await getDocs(q);
          // Ensure classId is included when mapping
          return snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
          }));
      } catch (error) {
          console.error('Error getting all quizzes:', error);
          throw error;
      }
  }

  static async getQuizzesByClass(classId) {
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting quizzes by class:', error);
      throw error;
    }
  }

  static async createQuiz(quizData) {
    try {
      
      // Create a clean quiz object with only defined fields
      const cleanQuizData = {
        ...quizData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Remove any undefined fields
      Object.keys(cleanQuizData).forEach(key => {
        if (cleanQuizData[key] === undefined) {
          delete cleanQuizData[key];
        }
      });

      const quizRef = await addDoc(collection(db, 'quizzes'), cleanQuizData);
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
          orderBy('timestamp', 'desc'),
          limit(1)
        );
      } else {
        q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const attempts = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        };
      });

      // If quizId is provided, return the most recent attempt
      if (quizId) {
        return attempts[0] || null;
      }

      return attempts;
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
      if (!attemptData.userId || !attemptData.quizId) {
        throw new Error('Missing required fields for quiz attempt');
      }

      // Get quiz details first to ensure we have the classId
      const quizDoc = await getDoc(doc(db, 'quizzes', attemptData.quizId));
      if (!quizDoc.exists()) {
        throw new Error('Quiz not found');
      }
      const quizData = quizDoc.data();
      
      // Get classId from quiz data
      const classId = quizData.classId;
      if (!classId) {
        throw new Error('Quiz has no associated class');
      }

      // Create the quiz attempt with all required fields
      const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
        userId: attemptData.userId,
        quizId: attemptData.quizId,
        classId: classId,
        score: attemptData.score || 0,
        correctAnswers: attemptData.correctAnswers || 0,
        questionCount: attemptData.questionCount || 0,
        timeSpent: attemptData.timeSpent || 0,
        questions: attemptData.questions || [],
        quizTitle: quizData.title || 'Unknown Quiz',
        timestamp: serverTimestamp()
      });

      // Get class and student details for activity record
      const [classDoc, studentDoc] = await Promise.all([
        getDoc(doc(db, 'classes', classId)),
        getDoc(doc(db, 'users', attemptData.userId))
      ]);

      const classData = classDoc.exists() ? classDoc.data() : null;
      const studentData = studentDoc.exists() ? studentDoc.data() : null;

      // Create activity record with only defined fields
      const activityData = {
        type: 'quiz_completed',
        classId: classId,
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
    // Remove undefined fields from data
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    const activityRef = await addDoc(collection(db, 'activities'), {
      ...cleanData,
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
    if (!articleId) {
      console.error("updateArticleRating called with invalid articleId:", articleId);
      throw new Error("Invalid article ID provided.");
    }
    const articleRef = doc(db, 'help_articles', articleId);
    const ratingField = isHelpful ? 'helpful' : 'notHelpful';

    try {
      // Use setDoc with merge: true to create or update
      await setDoc(articleRef, {
        [ratingField]: increment(1)
      }, { merge: true });
    } catch (error) {
      throw error; // Re-throw the error to be caught by the caller if needed
    }
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
  static async getTeacherSubmissions(teacherId, classId = null, quizId = null) {
    try {
      // First get all classes for this teacher
      const classesQuery = query(
        collection(db, 'classes'),
        where('teacherId', '==', teacherId)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classIds = classesSnapshot.docs.map(doc => doc.id);

      if (classIds.length === 0) {
        return [];
      }

      // Build the quiz attempts query
      let attemptsQuery;
      if (classId && quizId) {
        // Filter by specific class and quiz
        attemptsQuery = query(
          collection(db, 'quizAttempts'),
          where('classId', '==', classId),
          where('quizId', '==', quizId),
          orderBy('timestamp', 'desc')
        );
      } else if (classId) {
        // Filter by specific class
        attemptsQuery = query(
          collection(db, 'quizAttempts'),
          where('classId', '==', classId),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Get all attempts for teacher's classes
        attemptsQuery = query(
          collection(db, 'quizAttempts'),
          where('classId', 'in', classIds),
          orderBy('timestamp', 'desc')
        );
      }

      const attemptsSnapshot = await getDocs(attemptsQuery);
      const submissions = [];

      for (const snapDoc of attemptsSnapshot.docs) {
        const attempt = snapDoc.data();
        attempt.id = snapDoc.id;

        if (attempt.timestamp) {
          attempt.timestamp = attempt.timestamp.toDate ? attempt.timestamp.toDate() : new Date(attempt.timestamp);
        }

        // Get student details
        const studentDoc = await getDoc(doc(db, 'users', attempt.userId));
        if (studentDoc.exists()) {
          attempt.studentName = studentDoc.data().name;
        }

        // Get quiz details
        const quizDoc = await getDoc(doc(db, 'quizzes', attempt.quizId));
        if (quizDoc.exists()) {
          attempt.quizTitle = quizDoc.data().title;
        }

        // Get class details
        const classDoc = await getDoc(doc(db, 'classes', attempt.classId));
        if (classDoc.exists()) {
          attempt.className = classDoc.data().name;
        }

        // Get enrollment status
        const enrollmentQuery = query(
          collection(db, 'enrollments'),
          where('classId', '==', attempt.classId),
          where('studentId', '==', attempt.userId)
        );
        const enrollmentSnapshot = await getDocs(enrollmentQuery);
        if (!enrollmentSnapshot.empty) {
          attempt.enrollmentStatus = enrollmentSnapshot.docs[0].data().status;
        } else {
          attempt.enrollmentStatus = 'not_enrolled';
        }

        submissions.push(attempt);
      }

      return submissions;
    } catch (error) {
      console.error('Error getting teacher submissions:', error);
      throw error;
    }
  }

  async getLessonPlan(lessonPlanId) {
    try {
      const lessonPlanRef = doc(db, 'lessonPlans', lessonPlanId);
      const lessonPlanSnap = await getDoc(lessonPlanRef);
      
      if (!lessonPlanSnap.exists()) {
        return null;
      }

      const lessonPlan = lessonPlanSnap.data();
      lessonPlan.id = lessonPlanSnap.id;

      // Fetch associated quizzes
      if (lessonPlan.quizIds && lessonPlan.quizIds.length > 0) {
        const quizzes = await Promise.all(
          lessonPlan.quizIds.map(async (quizId) => {
            const quizRef = doc(db, 'quizzes', quizId);
            const quizSnap = await getDoc(quizRef);
            if (quizSnap.exists()) {
              const quiz = quizSnap.data();
              quiz.id = quizSnap.id;
              return quiz;
            }
            return null;
          })
        );
        lessonPlan.quizzes = quizzes.filter(quiz => quiz !== null);
      }

      return lessonPlan;
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      throw error;
    }
  }

 

  static async createBadge(badgeData) {
    try {
      // Validate required fields
      if (!badgeData.userId) {
        throw new Error('User ID is required to create a badge');
      }

      if (!badgeData.quizId) {
        throw new Error('Quiz ID is required to create a badge');
      }

      if (!badgeData.classId) {
        throw new Error('Class ID is required to create a badge');
      }

      // Handle badge image upload if provided
      let badgeImageUrl = badgeData.image;
      if (badgeData.imageFile) {
        try {
          badgeImageUrl = await uploadToCloudinary(badgeData.imageFile);
        } catch (error) {
          console.error('Error uploading badge image:', error);
          throw new Error('Failed to upload badge image');
        }
      }

      // Generate a secure badge ID using a combination of timestamp, user ID, quiz ID, and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const badgeId = `${timestamp}_${randomString}_${badgeData.userId}_${badgeData.quizId}`;
      const issuerId = `did:web:${window.location.hostname}:issuers:${badgeData.teacherId}`;

      // Create Open Badge 3.0 compliant data
      const badge = {
        "@context": [
          "https://www.w3.org/ns/did/v1",
          "https://www.w3.org/ns/credentials/v2",
          "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
        ],
        "id": badgeId,
        "type": ["VerifiableCredential", "OpenBadgeCredential"],
        "issuer": {
          "id": issuerId,
          "type": "Profile",
          "name": badgeData.teacherName || "Instructor",
          "url": window.location.origin,
          "email": badgeData.teacherEmail || "badgeguru@beanpotstudio.com",
          "description": "Issuer of educational badges for quiz achievements",
          "verificationMethod": [{
            "id": `${issuerId}#key-0`,
            "type": "DataIntegrityProof",
            "cryptosuite": "eddsa-rdf-2022",
            "controller": `${window.location.origin}/issuers/${badgeData.teacherId}`,
            "publicKeyMultibase": "z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP" // This should be your actual public key
          }]
        },
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          "id": `did:web:${window.location.hostname}:users:${badgeData.userId}`,
          "type": "AchievementSubject",
          "achievement": {
            "type": "Achievement",
            "name": badgeData.name,
            "description": badgeData.description || "Awarded for completing a quiz with perfect score",
            "criteria": {
              "narrative": "Completed a quiz with a perfect score"
            },
            "image": badgeImageUrl
          },
          "evidence": {
            "id": `${window.location.origin}/student`,
            "type": "Evidence",
            "narrative": `Completed quiz "${badgeData.quizTitle}" with a perfect score`
          }
        },
        // Store additional metadata in Firebase
        metadata: {
          userId: badgeData.userId,
          quizId: badgeData.quizId,
          classId: badgeData.classId,
          teacherId: badgeData.teacherId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          quizTitle: badgeData.quizTitle || 'Unknown Quiz',
          className: badgeData.className || 'Unknown Class',
          studentName: badgeData.studentName || 'Student',
          teacherName: badgeData.teacherName || 'Teacher',
          score: badgeData.score || 100,
          completionDate: new Date().toISOString(),
          badgeImage: badgeImageUrl,
          badgeName: badgeData.name || "Badge",
          badgeDescription: badgeData.description || "Awarded for completing a quiz with perfect score",
          verificationUrl: `${window.location.origin}/badges/${badgeId}`,
          issuerUrl: `${window.location.origin}/issuers/${badgeData.teacherId}`,
          evidenceUrl: `${window.location.origin}/quizzes/${badgeData.quizId}`,
          recipientName: badgeData.studentName || 'Student'
        }
      };

      // Use setDoc instead of addDoc to ensure consistent ID format
      const badgeRef = doc(db, 'badges', badgeId);
      await setDoc(badgeRef, badge);
      return badgeId;
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  }

  static async verifyBadge(badgeId) {
    try {
      const badgeRef = doc(db, 'badges', badgeId);
      const badgeDoc = await getDoc(badgeRef);
      
      if (!badgeDoc.exists()) {
        throw new Error('Badge not found');
      }

      const badge = badgeDoc.data();
      
      // Verify the badge data against Open Badges specification
      if (!badge['@context'] || !badge.type || !badge.id || !badge.issuer) {
        throw new Error('Invalid badge format');
      }

      return {
        valid: true,
        badge: badge
      };
    } catch (error) {
      console.error('Error verifying badge:', error);
      throw error;
    }
  }

  static async getBadge(badgeId) {
    try {
      const badgeRef = doc(db, 'badges', badgeId);
      const badgeDoc = await getDoc(badgeRef);
      
      if (!badgeDoc.exists()) {
        return null;
      }

      return badgeDoc.data();
    } catch (error) {
      console.error('Error getting badge:', error);
      throw error;
    }
  }

  static async generateQuiz(content, numQuestions = 5, ageGroup = 'college') {
    try {
      // Generate quiz using Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      
      const ageGroupPrompts = {
        elementary: "Use simple language and concepts suitable for ages 5-10. Include fun, engaging questions that use concrete examples and avoid abstract concepts. Use shorter sentences and familiar vocabulary. Include visual or real-world examples when possible.",
        middle: "Use clear language suitable for ages 11-13. Include questions that build on basic concepts and introduce some more complex ideas. Use age-appropriate examples and scenarios. Balance between concrete and abstract thinking.",
        high: "Use more sophisticated language suitable for ages 14-18. Include questions that explore deeper concepts and require more critical thinking. Use real-world applications and current examples. Include some challenging questions that require analysis.",
        college: "Use advanced language and concepts suitable for college students and adults. Include questions that require deep understanding and analysis. Use professional terminology and complex scenarios. Include questions that test higher-order thinking skills."
      };

      const prompt = `Generate a ${numQuestions}-question multiple choice quiz based on this lesson plan. 
      ${ageGroupPrompts[ageGroup] || ageGroupPrompts.college}
      
      Format the response as a JSON object with this structure:
      {
        "title": "quiz title",
        "questions": [
          {
            "text": "question text",
            "options": [
              {"text": "option text"},
              {"text": "option text"},
              {"text": "option text"},
              {"text": "option text"}
            ],
            "correctIndex": 0
          }
        ]
      }
      
      Make sure to generate exactly ${numQuestions} questions.
      Lesson plan:
      ${content}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const quizData = JSON.parse(text);
      
      // Validate that we got the requested number of questions
      if (quizData.questions.length !== numQuestions) {
        throw new Error(`Generated ${quizData.questions.length} questions instead of requested ${numQuestions}`);
      }
      
      return quizData;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  static async getAllBadges() {
    try {
      const badgesRef = collection(db, 'badges');
      const badgesSnapshot = await getDocs(badgesRef);
      
      return badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all badges:', error);
      throw error;
    }
  }

  static async enrollInClass(classIdentifier, studentId) {
    try {
      if (!classIdentifier || !studentId) {
        throw new Error('Class Identifier and Student ID are required');
      }

      let classId = null;
      let classData = null;
      let classDoc = null;

      // Check if identifier looks like a code (e.g., 6 uppercase alphanumeric) - adjust regex if needed
      const isCodeFormat = /^[A-Z0-9]{6}$/.test(classIdentifier);

      if (isCodeFormat) {
        // Find class by code
        const codeQuery = query(
          collection(db, 'classes'),
          where('code', '==', classIdentifier)
        );
        const codeSnapshot = await getDocs(codeQuery);
        if (codeSnapshot.empty) {
          return {
            success: false,
            message: 'Invalid class code',
            status: 'error'
          };
        }
        classDoc = codeSnapshot.docs[0];
        classId = classDoc.id;
        classData = classDoc.data();
      } else {
        // Assume it's a class ID
        classId = classIdentifier;
        const classRef = doc(db, 'classes', classId);
        classDoc = await getDoc(classRef);
        if (!classDoc.exists()) {
          return {
            success: false,
            message: 'Class not found with the provided ID',
            status: 'error'
          };
        }
        classData = classDoc.data();
      }

      // Check if already enrolled or pending
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('classId', '==', classId),
        where('studentId', '==', studentId)
      );
      const enrollmentSnapshot = await getDocs(enrollmentsQuery);
      
      if (!enrollmentSnapshot.empty) {
        const currentStatus = enrollmentSnapshot.docs[0].data().status;
        if (currentStatus === 'accepted') {
          return {
            success: false,
            message: 'You are already enrolled in this class',
            status: 'enrolled'
          };
        } else if (currentStatus === 'pending') {
           return {
            success: false,
            message: 'Your request to join this class is already pending approval',
            status: 'pending'
          };
        } else if (currentStatus === 'rejected') {
           return {
            success: false,
            message: 'Your previous request to join this class was rejected. Please contact the teacher.',
            status: 'rejected'
          };
        }
      }

      // Get student details for activity log
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (!studentDoc.exists()) {
        return { success: false, message: 'Student profile not found', status: 'error' };
      }
      const studentData = studentDoc.data();

      // Determine enrollment status based on class publicity
      const enrollmentStatus = classData.isPublic ? 'accepted' : 'pending';
      const activityType = classData.isPublic ? 'class_joined' : 'enrollment_request';
      const successMessage = classData.isPublic ? 'Successfully joined public class!' : 'Enrollment request sent successfully';

      // Create enrollment document
      const enrollmentData = {
        classId: classId,
        studentId: studentId,
        status: enrollmentStatus,
        enrolledAt: serverTimestamp() // Use enrolledAt consistently
      };
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentData);

      // Create activity record
      await addDoc(collection(db, 'activities'), {
        type: activityType,
        classId: classId,
        className: classData.name,
        studentId: studentId,
        studentName: studentData.name,
        teacherId: classData.teacherId,
        status: enrollmentStatus,
        timestamp: serverTimestamp()
      });

      return {
        success: true,
        message: successMessage,
        status: enrollmentStatus
      };
    } catch (error) {
      console.error('Error enrolling in class:', error);
      return {
        success: false,
        message: 'Failed to enroll in class. Please check the code/ID and try again.', // More generic error
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

  static async checkBadgeExists(userId, quizId) {
    try {
      const badgeRef = doc(db, 'badges', `${userId}_${quizId}`);
      const badgeDoc = await getDoc(badgeRef);
      return badgeDoc.exists();
    } catch (error) {
      console.error('Error checking badge existence:', error);
      return false;
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

      // Get quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        return {
          success: false,
          message: 'Quiz not found',
          status: 'error'
        };
      }
      const quizData = quizDoc.data();
      // Use the quiz's badgeImage, or the default if not present
      const badgeImageUrl = quizData.badgeImage || 'https://res.cloudinary.com/front-end-foxes/image/upload/v1745952718/differentest-lesson-images/grlih7sjws2vfu5as7dx.png';

      // Get class details
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (!classDoc.exists()) {
        return {
          success: false,
          message: 'Class not found',
          status: 'error'
        };
      }
      const classData = classDoc.data();

      // Get user details
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'User not found',
          status: 'error'
        };
      }
      const userData = userDoc.data();

      // Get teacher details
      const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
      const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;

      // Prepare badge data with all required fields
      const badgeData = {
        userId: userId,
        userEmail: userData.email,
        quizId: quizId,
        quizTitle: quizData.title,
        classId: classId,
        className: classData.name,
        teacherId: classData.teacherId,
        teacherName: teacherData?.name || 'Teacher',
        teacherEmail: teacherData?.email || 'teacher@example.com',
        studentName: userData.name || 'Student',
        name: `${quizData.title} Badge`,
        description: `Awarded for completing ${quizData.title} with a perfect score`,
        image: badgeImageUrl, // Use the fetched or default image URL
        score: score
      };

      // Create the badge
      const badgeId = await this.createBadge(badgeData);

      // Create activity record
      const activityData = {
        userId,
        type: 'badge_claimed',
        badgeId: badgeId,
        quizId,
        quizTitle: quizData.title,
        classId,
        timestamp: serverTimestamp(),
        activityDescription: `🏆 Claimed "${badgeData.name}" badge for perfect score on ${quizData.title}!`
      };
      await addDoc(collection(db, 'activities'), activityData);

      return {
        success: true,
        message: `Achievement Unlocked! You've earned the "${badgeData.name}" badge!`,
        status: 'success',
        badgeId: badgeId
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
        throw new Error('User ID is required');
      }

      // Get all quiz attempts for the user
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (attemptsSnapshot.empty) {
        return [];
      }

      const attempts = attemptsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.timestamp?.toDate?.() || new Date(),
          questions: data.questions || [],
          score: data.score || 0,
          quizTitle: data.quizTitle || 'Unknown Quiz',
          className: data.className || 'Unknown Class'
        };
      });

      // Get class names for each attempt
      const attemptsWithClassNames = await Promise.all(
        attempts.map(async (attempt) => {
          try {
            if (!attempt.classId) {
              return attempt;
            }
            const classDoc = await getDoc(doc(db, 'classes', attempt.classId));
            return {
              ...attempt,
              className: classDoc.exists() ? classDoc.data().name : 'Unknown Class'
            };
          } catch (error) {
            console.error('Error getting class name:', error);
            return attempt;
          }
        })
      );

      return attemptsWithClassNames;
    } catch (error) {
      console.error('Error getting user quiz history:', error);
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
      const badgesRef = collection(db, 'badges');
      const q = query(badgesRef, where('metadata.userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw error;
    }
  }

  async createLessonPlan(lessonPlanData) {
    try {
      const lessonPlanRef = await addDoc(collection(db, 'lessonPlans'), lessonPlanData);
      return { id: lessonPlanRef.id, ...lessonPlanData };
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      throw error;
    }
  }

  async updateLessonPlan(lessonPlanId, lessonPlanData) {
    try {
      const lessonPlanRef = doc(db, 'lessonPlans', lessonPlanId);
      await updateDoc(lessonPlanRef, lessonPlanData);
      return { id: lessonPlanId, ...lessonPlanData };
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      throw error;
    }
  }

  async deleteLessonPlan(lessonPlanId) {
    try {
      const lessonPlanRef = doc(db, 'lessonPlans', lessonPlanId);
      await deleteDoc(lessonPlanRef);
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      throw error;
    }
  }

  async getAllLessonPlans(teacherId) {
    try {
      const lessonPlansRef = collection(db, 'lessonPlans');
      const q = query(lessonPlansRef, where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      throw error;
    }
  }

  static async getPublicClasses(userId = null) {
    try {
      const q = query(
        collection(db, 'classes'),
        where('isPublic', '==', true),
        where('adminApproved', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get quizzes for each class
      const classesWithQuizzes = await Promise.all(
        classes.map(async (classData) => {
          const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('classId', '==', classData.id),
            orderBy('createdAt', 'asc')
          );
          const quizzesSnapshot = await getDocs(quizzesQuery);
          return {
            ...classData,
            quizzes: quizzesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          };
        })
      );

      return classesWithQuizzes;
    } catch (error) {
      console.error('Error getting public classes:', error);
      throw error;
    }
  }

  static async getPublicClass(classId) {
    try {
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (!classDoc.exists() || !classDoc.data().isPublic || !classDoc.data().adminApproved) {
        return null;
      }

      const classData = { id: classDoc.id, ...classDoc.data() };

      // Get quizzes for the class
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('classId', '==', classId),
        orderBy('createdAt', 'asc')
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);
      classData.quizzes = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return classData;
    } catch (error) {
      console.error('Error getting public class:', error);
      throw error;
    }
  }

  static async getAllClasses(userId = null) {
    try {
      // Get all classes
      const classesQuery = query(
        collection(db, 'classes'),
        orderBy('createdAt', 'asc')
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classIds = classesSnapshot.docs.map(doc => doc.id);

      // Get all quizzes for public classes
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('classId', 'in', classIds),
        orderBy('createdAt', 'asc')
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);

      return await this._formatClassesWithQuizzes(classIds, quizzesSnapshot);
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  }

  // Helper method to format classes with their quizzes
  static async _formatClassesWithQuizzes(classIds, quizzesSnapshot) {
    if (classIds.length === 0) {
      return [];
    }

    const classes = await Promise.all(
      classIds.map(async (classId) => {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        const classData = classDoc.data();
        
        // Get teacher information
        const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
        const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;
        
        // Get quizzes for this class
        const classQuizzes = quizzesSnapshot.docs
          .filter(doc => doc.data().classId === classId)
          .map(doc => {
            const quizData = doc.data();
            return {
              id: doc.id,
              title: quizData.title,
              badgeImage: quizData.badgeImage,
              questionCount: quizData.questions?.length || 0,
              lessonPlan: quizData.lessonPlan || '',
              classId: classId
            };
          });
        
        return {
          id: classId,
          name: classData.name,
          description: classData.description || '',
          skinId: classData.skinId || 'default',
          quizzes: classQuizzes,
          teacherName: teacherData?.name || 'Unknown Teacher',
          code: classData.code,
          lessonPlan: classQuizzes[0]?.lessonPlan || '',
          isPublic: classData.isPublic
        };
      })
    );
    
    return classes;
  }

  static async createCertificate(certificateData) {
    try {
      if (!certificateData.userId || !certificateData.classId) {
        throw new Error("User ID and Class ID are required.");
      }
      // Use a consistent ID, e.g., userId_classId
      const certificateId = `${certificateData.userId}_${certificateData.classId}`;
      const certificateRef = doc(db, 'certificates', certificateId);

      // Check if certificate already exists
      const docSnap = await getDoc(certificateRef);
      if (docSnap.exists()) {
        // Return existing certificate data or just the ID
        return { id: certificateId, ...docSnap.data(), alreadyExists: true };
      }

      // --- Fetch Class Data ---
      let badgeImageUrl = '/certification-badge.png'; // Default badge
      try {
          const classDoc = await getDoc(doc(db, 'classes', certificateData.classId));
          if (classDoc.exists()) {
              const classData = classDoc.data();
              // Use custom badge URL from class if it exists
              if (classData.customCertificateBadgeUrl) {
                  badgeImageUrl = classData.customCertificateBadgeUrl;
              }
          }
      } catch(err) {
          console.warn(`Could not fetch class data (${certificateData.classId}) to check for custom badge:`, err);
          // Proceed with default badge
      }
      // --- End Fetch Class Data ---

      const dataToSave = {
        ...certificateData,
        badgeImageUrl: badgeImageUrl, // Store the determined badge URL
        claimedAt: serverTimestamp() // Add a timestamp
      };

      await setDoc(certificateRef, dataToSave);
      return { id: certificateId, ...dataToSave, alreadyExists: false };

    } catch (error) {
      console.error("Error creating certificate:", error);
      throw error;
    }
  }

  static async getCertificate(certificateId) {
    try {
      const certificateRef = doc(db, 'certificates', certificateId);
      const certificateDoc = await getDoc(certificateRef);

      if (!certificateDoc.exists()) {
        return null;
      }
      const data = certificateDoc.data();
      // Convert timestamp if needed
      const claimedAt = data.claimedAt?.toDate ? data.claimedAt.toDate() : null;
      return {
        id: certificateDoc.id,
        ...data,
        claimedAt: claimedAt // Include the converted Date object
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }

  static async getAllCertificates() {
    try {
      const certificatesRef = collection(db, 'certificates');
      const certificatesSnapshot = await getDocs(certificatesRef);
      
      return certificatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all certificates:', error);
      throw error;
    }
  }
}

export default FirebaseService; 