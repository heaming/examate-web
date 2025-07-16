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
import { Question, QuestionSet, UserProgress, ExamStats } from '@/types/question';
import dayjs from "dayjs";

// 허용된 examType 목록
const ALLOWED_EXAM_TYPES = ['korean_history'];

// TODO env 에서 처리
export const EXAM_TYPE = 'korean_history';

// Firebase가 초기화되었는지 확인하는 함수
const getFirestore = () => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다. initializeFirebase()를 먼저 호출해주세요.');
  }
  return db;
};

// examType에 따른 컬렉션 이름 생성 함수 : : questions_korean_history, questionSets_korean_history
const getCollectionName = (baseCollection: string, examType: string) => {
  return `${baseCollection}_${examType}`;
};

// examType 유효성 검사
const validateExamType = (examType: string) => {
  if (!ALLOWED_EXAM_TYPES.includes(examType)) {
    throw new Error(`허용되지 않은 examType입니다: ${examType}. 허용된 타입: ${ALLOWED_EXAM_TYPES.join(', ')}`);
  }
};

// 문제 컬렉션 참조 (동적으로 가져오기)
const getQuestionsCollection = () => collection(getFirestore(), getCollectionName('questions', EXAM_TYPE));
const getQuestionSetsCollection = () => collection(getFirestore(), getCollectionName('questionSets', EXAM_TYPE));

// 전체 문제 수 계산
export const getTotalQuestionsCount = async (): Promise<number> => {
  try {
    const questionSets = await getQuestionSetsByYear();
    let totalCount = 0;

    questionSets.forEach(yearData => {
      yearData.rounds.forEach(round => {
        totalCount += round.totalQuestions;
      });
    });

    return totalCount;
  } catch (error) {
    console.error('전체 문제 개수 계산 실패:', error);
    return 0;
  }
};

// 특정 연도와 회차의 문제 목록 가져오기
export const getQuestionsByYearAndRound = async (
  year: number,
  round: number
): Promise<Question[]> => {
  try {

    const q = query(
      getQuestionsCollection(),
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
    // examType 유효성 검사
    validateExamType(examType);

    const collectionName = getCollectionName('questions', examType);
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

// 여러 문제 ID로 문제들 가져오기
export const getQuestionsByIds = async (
  questionIds: string[],
  examType: string = 'korean_history'
): Promise<Question[]> => {
  try {
    // examType 유효성 검사
    validateExamType(examType);

    if (questionIds.length === 0) {
      return [];
    }

    const collectionName = getCollectionName('questions', examType);
    const questions: Question[] = [];

    // Firebase에서는 한 번에 최대 10개의 문서만 조회할 수 있으므로 배치 처리
    const batchSize = 10;
    for (let i = 0; i < questionIds.length; i += batchSize) {
      const batch = questionIds.slice(i, i + batchSize);
      
      const q = query(
        collection(getFirestore(), collectionName),
        where('__name__', 'in', batch)
      );

      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Question);
      });
    }

    return questions;
  } catch (error) {
    console.error('여러 문제 가져오기 실패:', error);
    return [];
  }
};

// 문제 세트 가져오기
export const getQuestionSet = async (
  year: number,
  round: number,
  examType: string = 'korean_history'
): Promise<QuestionSet | null> => {
  try {
    // examType 유효성 검사
    validateExamType(examType);

    const collectionName = getCollectionName('questionSets', examType);
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
    // examType 유효성 검사
    validateExamType(examType);

    const collectionName = getCollectionName('questionSets', examType);
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
  round: number
): Promise<ExamStats | null> => {
  try {
    // 해당 연도/회차의 전체 문제 수 가져오기
    const questions = await getQuestionsByYearAndRound(year, round);
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
      examType: EXAM_TYPE,
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

// 연도별 회차 데이터를 가져오는 함수
export const getQuestionSetsByYear = async (): Promise<{ year: number; rounds: { round: number; totalQuestions: number; date: string; }[] }[]> => {
  try {
    const collectionName = getCollectionName('questionSets', EXAM_TYPE);
    console.log('🔥 Firebase 컬렉션 이름:', collectionName); // 디버깅용

    const querySnapshot = await getDocs(collection(getFirestore(), collectionName));
    console.log('🔥 Firebase 데이터 개수:', querySnapshot.size); // 디버깅용

    // 연도별 회차 데이터를 저장할 Map
    const yearRoundsMap = new Map<number, { round: number; totalQuestions: number; date: string; }[]>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id; // 예: "2025-74"

      console.log('🔥 문서 ID:', docId, '데이터:', data); // 디버깅용

      // docId에서 연도와 회차 추출
      const [yearStr, roundStr] = docId.split('-');
      const year = parseInt(yearStr);
      const round = parseInt(roundStr);

      console.log('🔥 파싱된 연도:', year, '회차:', round); // 디버깅용

      if (!isNaN(year) && !isNaN(round)) {
        const roundData = {
          round: round,
          totalQuestions: data.totalQuestions || 80, // 기본값 80
          date: data.examDate || `${year}.${String(Math.floor(round/4) + 1).padStart(2, '0')}.${String((round % 4) * 3 + 1).padStart(2, '0')}` // 대략적인 날짜 생성
        };

        console.log('🔥 생성된 회차 데이터:', roundData); // 디버깅용

        if (!yearRoundsMap.has(year)) {
          yearRoundsMap.set(year, []);
        }

        yearRoundsMap.get(year)!.push(roundData);
      }
    });

    // Map을 배열로 변환하고 정렬
    const result = Array.from(yearRoundsMap.entries())
      .map(([year, rounds]) => ({
        year,
        rounds: rounds.sort((a, b) => a.round - b.round) // 회차별 정렬
      }))
      .sort((a, b) => b.year - a.year); // 연도 내림차순 정렬

    console.log('🔥 최종 결과:', result); // 디버깅용

    return result;
  } catch (error) {
    console.error('연도별 회차 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 특정 연도의 회차 목록 가져오기
export const getRoundsByYear = async (
  year: number,
  examType: string = 'korean_history'
): Promise<{ round: number; totalQuestions: number; date: string; }[]> => {
  try {
    // examType 유효성 검사
    validateExamType(examType);

    const collectionName = getCollectionName('questionSets', examType);
    const querySnapshot = await getDocs(collection(getFirestore(), collectionName));
    
    const rounds: { round: number; totalQuestions: number; date: string; }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id; // 예: "2025-74"
      
      // docId에서 연도와 회차 추출
      const [yearStr, roundStr] = docId.split('-');
      const docYear = parseInt(yearStr);
      const round = parseInt(roundStr);
      
      if (docYear === year && !isNaN(round)) {
        rounds.push({
          round: round,
          totalQuestions: data.totalQuestions || 80,
          date: data.examDate || `${year}.${String(Math.floor(round/4) + 1).padStart(2, '0')}.${String((round % 4) * 3 + 1).padStart(2, '0')}`
        });
      }
    });
    
    return rounds.sort((a, b) => a.round - b.round);
  } catch (error) {
    console.error('특정 연도 회차 데이터 가져오기 실패:', error);
    throw error;
  }
}; 