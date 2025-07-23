import { useState, useEffect, useCallback } from 'react';
import {Question, RecentQuestion} from "@/types/question";
import {getQuestionsByIds, getTotalQuestionsCount} from "@/lib/firebase/questions";
import {StudyHistory} from '@/lib/native'
import {getHomeData, NativeHomePageData} from "@/lib/native";

export interface HomePageData {
  totalQuestions: number | null;
  totalSolved: number;
  totalCorrect: number;
  studyStreak: number;
  accuracy: number;
  progressPercentage: number;
  todaySolved: number;
  todayCorrect: number;
  todayBookmarks: number;
  recentQuestions: RecentQuestion[];
}

const createQuestionMap = (questions: Question[]): Map<string, Question> => {
  const questionMap = new Map<string, Question>();
  questions.forEach(question => {
    questionMap.set(question.id, question);
  });
  return questionMap;
};

const convertToRecentQuestions = (
    studyHistories: StudyHistory[],
    questionMap: Map<string, Question>
): RecentQuestion[] => {
  return studyHistories
      .map(history => {
        const question = questionMap.get(history.questionId);
        if (!question) {
          console.warn(`Question not found for ID: ${history.questionId}`);
          return null;
        }

        return {
          id: history.id,
          questionId: history.questionId,
          solvedAt: history.solvedAt,
          isCorrect: history.isCorrect,
          userAnswer: history.userAnswer,
          correctAnswer: history.correctAnswer,
          year: question.year,
          round: question.round,
          examType: question.examType,
          subject: question.subject,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          options: question.options,
          explanation: question.explanation,
          difficulty: question.difficulty,
          tags: question.tags,
          questionImageUrl: question.questionImageUrl,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        } as RecentQuestion;
      })
      .filter((item): item is RecentQuestion => item !== null);
};

const calculateProgressPercentage = (totalSolved: number, totalQuestions: number): number => {
  if (totalQuestions <= 0) return 0;
  return Math.round((totalSolved / totalQuestions) * 100 * 100) / 100;
};

const createHomePageData = (
    nativeData: NativeHomePageData,
    totalQuestions: number,
    recentQuestions: RecentQuestion[]
): HomePageData => {
  const progressPercentage = calculateProgressPercentage(nativeData.totalSolved, totalQuestions);

  return {
    ...nativeData,
    totalQuestions,
    progressPercentage,
    recentQuestions
  };
};

const createDefaultHomeData = async (): Promise<HomePageData> => {
  try {
    const totalQuestions = await getTotalQuestionsCount();

    return {
      totalQuestions,
      totalSolved: 0,
      totalCorrect: 0,
      studyStreak: 0,
      accuracy: 0,
      progressPercentage: 0,
      todaySolved: 0,
      todayCorrect: 0,
      todayBookmarks: 0,
      recentQuestions: []
    };
  } catch (error) {
    console.error('기본 홈 데이터 생성 실패:', error);

    return {
      totalQuestions: 0,
      totalSolved: 0,
      totalCorrect: 0,
      studyStreak: 0,
      accuracy: 0,
      progressPercentage: 0,
      todaySolved: 0,
      todayCorrect: 0,
      todayBookmarks: 0,
      recentQuestions: []
    };
  }
};

const processNativeData = async (nativeData: NativeHomePageData): Promise<HomePageData> => {
  const questionIds = nativeData.recentQuestions.map(history => history.questionId);

  const [totalQuestions, questions] = await Promise.all([
    await getTotalQuestionsCount(),
    await getQuestionsByIds(questionIds)
  ]);

  const questionMap = createQuestionMap(questions);
  const recentQuestions = convertToRecentQuestions(nativeData.recentQuestions, questionMap);

  return createHomePageData(nativeData, totalQuestions, recentQuestions);
};

export const useHomeData = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const nativeData = await getHomeData();
      const processedData = await processNativeData(nativeData);

      setHomeData(processedData);

    } catch (error) {
      console.warn('네이티브 데이터 로드 실패, 기본값 사용:', error);

      const defaultData = await createDefaultHomeData();
      setHomeData(defaultData);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return {
    homeData,
    loading,
    error,
    refreshHomeData: loadHomeData
  };
};