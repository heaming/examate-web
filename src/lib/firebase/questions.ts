import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Firebase가 초기화되었는지 확인하는 함수
const getFirestore = () => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다. initializeFirebase()를 먼저 호출해주세요.');
  }
  return db;
};


import { Question, QuestionSet, UserProgress, ExamStats } from '@/types/question';

// 문제 컬렉션 참조 (동적으로 가져오기)
const getQuestionsCollection = () => collection(getFirestore(), 'questions');
const getQuestionSetsCollection = () => collection(getFirestore(), 'questionSets');
const getUserProgressCollection = () => collection(getFirestore(), 'userProgress');

// 특정 연도와 회차의 문제 목록 가져오기
export const getQuestionsByYearAndRound = async (
  year: number, 
  round: number, 
  examType: string = 'korean_history'
): Promise<Question[]> => {
  try {
    const collectionName = `questions_${examType}`;
    const q = query(
      collection(getFirestore(), collectionName),
      where('year', '==', year),
      where('round', '==', round),
      orderBy('questionNumber')
    );
    
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Question);
    });
    
    return questions;
  } catch (error) {
    console.error('문제 목록 가져오기 실패:', error);
    throw error;
  }
};

// 특정 문제 가져오기
export const getQuestionById = async (
  questionId: string, 
  examType: string = 'korean_history'
): Promise<Question | null> => {
  try {
    const collectionName = `questions_${examType}`;
    const docRef = doc(getFirestore(), collectionName, questionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Question;
    } else {
      return null;
    }
  } catch (error) {
    console.error('문제 가져오기 실패:', error);
    throw error;
  }
};

// 문제 세트 가져오기
export const getQuestionSet = async (
  year: number, 
  round: number, 
  examType: string = 'korean_history'
): Promise<QuestionSet | null> => {
  try {
    const collectionName = `questionSets_${examType}`;
    const docId = `${year}-${round}`;
    const docRef = doc(getFirestore(), collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        questions: data.questions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as QuestionSet;
    }
    
    return null;
  } catch (error) {
    console.error('문제 세트 가져오기 실패:', error);
    throw error;
  }
};

// 시험 유형별 문제 세트 목록 가져오기
export const getQuestionSetsByExamType = async (
  examType: string = 'korean_history',
  limitCount: number = 10
): Promise<QuestionSet[]> => {
  try {
    const collectionName = `questionSets_${examType}`;
    const q = query(
      collection(getFirestore(), collectionName),
      orderBy('year', 'desc'),
      orderBy('round', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const questionSets: QuestionSet[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questionSets.push({
        id: doc.id,
        ...data,
        questions: data.questions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as QuestionSet);
    });
    
    return questionSets;
  } catch (error) {
    console.error('문제 세트 목록 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 진행 상황 저장
export const saveUserProgress = async (progress: Omit<UserProgress, 'answeredAt'>): Promise<void> => {
  try {
    await addDoc(collection(getFirestore(), 'userProgress'), {
      ...progress,
      answeredAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('진행 상황 저장 실패:', error);
    throw error;
  }
};

// 사용자의 특정 문제 진행 상황 가져오기
export const getUserProgress = async (userId: string, questionId: string): Promise<UserProgress | null> => {
  try {
    const q = query(
      collection(getFirestore(), 'userProgress'),
      where('userId', '==', userId),
      where('questionId', '==', questionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        answeredAt: data.answeredAt?.toDate() || new Date(),
      } as UserProgress;
    }
    
    return null;
  } catch (error) {
    console.error('사용자 진행 상황 가져오기 실패:', error);
    throw error;
  }
};

// 시험 통계 가져오기
export const getExamStats = async (
  userId: string,
  year: number,
  round: number,
  examType: string = 'korean_history'
): Promise<ExamStats | null> => {
  try {
    // 해당 연도/회차의 전체 문제 수 가져오기
    const questions = await getQuestionsByYearAndRound(year, round, examType);
    const totalQuestions = questions.length;
    
    if (totalQuestions === 0) return null;
    
    // 사용자의 진행 상황 가져오기
    const q = query(
      collection(getFirestore(), 'userProgress'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const userProgress: UserProgress[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userProgress.push({
        ...data,
        answeredAt: data.answeredAt?.toDate() || new Date(),
      } as UserProgress);
    });
    
    // 해당 시험의 문제들만 필터링
    const examQuestionIds = questions.map(q => q.id);
    const examProgress = userProgress.filter(p => examQuestionIds.includes(p.questionId));
    
    const solvedQuestions = examProgress.length;
    const correctAnswers = examProgress.filter(p => p.isCorrect).length;
    const accuracy = solvedQuestions > 0 ? (correctAnswers / solvedQuestions) * 100 : 0;
    
    const totalTime = examProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const averageTime = solvedQuestions > 0 ? totalTime / solvedQuestions : 0;
    
    return {
      year,
      round,
      examType,
      totalQuestions,
      solvedQuestions,
      correctAnswers,
      accuracy,
      averageTime
    };
  } catch (error) {
    console.error('시험 통계 가져오기 실패:', error);
    throw error;
  }
};

// 최근 문제 가져오기
export const getRecentQuestions = async (
  examType: string = 'korean_history',
  limitCount: number = 10
): Promise<Question[]> => {
  try {
    const collectionName = `questions_${examType}`;
    const q = query(
      collection(getFirestore(), collectionName),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Question);
    });
    
    return questions;
  } catch (error) {
    console.error('최근 문제 가져오기 실패:', error);
    throw error;
  }
};

// 문제 검색
export const searchQuestions = async (
  keyword: string,
  examType: string = 'korean_history',
  limitCount: number = 20
): Promise<Question[]> => {
  try {
    const collectionName = `questions_${examType}`;
    const q = query(
      collection(getFirestore(), collectionName),
      where('questionText', '>=', keyword),
      where('questionText', '<=', keyword + '\uf8ff'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Question);
    });
    
    return questions;
  } catch (error) {
    console.error('문제 검색 실패:', error);
    throw error;
  }
}; 