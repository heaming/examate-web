import { useState, useEffect, useCallback } from 'react';
import { requestHomePageData, setupNativeMessageListener, NativeHomePageData } from '@/lib/native';
import {Question, RecentQuestion} from "@/types/question";
import {getQuestionsByIds, getTotalQuestionsCount} from "@/lib/firebase/questions";
import {StudyHistory} from "@/types/studyHistory";

export interface HomePageData {
  totalQuestions: number | null;
  solvedCount: number;
  correctCount: number;
  studyStreak: number;
  accuracy: number;
  progressPercentage: number;
  todaySolved: number;
  todayCorrect: number;
  todayStudyTime: number;
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

const calculateProgressPercentage = (solvedCount: number, totalQuestions: number): number => {
  if (totalQuestions <= 0) return 0;
  return Math.round((solvedCount / totalQuestions) * 100 * 100) / 100;
};

const createHomePageData = (
    nativeData: NativeHomePageData,
    totalQuestions: number,
    recentQuestions: RecentQuestion[]
): HomePageData => {
  const progressPercentage = calculateProgressPercentage(nativeData.solvedCount, totalQuestions);

  return {
    ...nativeData,
    totalQuestions,
    progressPercentage,
    recentQuestions
  };
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

  const handleNativeHomePageData = useCallback(async (nativeData: NativeHomePageData) => {
    try {
      setLoading(true);
      setError(null);

      const processedData = await processNativeData(nativeData);
      
      setHomeData(processedData);
      setLoading(false);
      setError(null);

    } catch (error) {
      console.error('Native 데이터 처리 실패:', error);
      setError('데이터 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, []);

  const refreshHomeData = () => {
    setLoading(true);
    setError(null);
    requestHomePageData();
  };

  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onHomePageDataReceived: handleNativeHomePageData
    });

    return cleanup;
  }, [handleNativeHomePageData]);

  useEffect(() => {
    refreshHomeData();
  }, []);

  return {
    homeData,
    loading,
    error,
    refreshHomeData
  };
};