import { useState, useEffect, useCallback } from 'react';
import {
  getBookmarksByYearRound,
  getStudyHistories,
  saveStudyHistories,
  StudyHistory
} from '@/lib/native';

export interface RoundQuestion {
  id: string;
  year: number;
  round: number;
  subject: string;
  questionNumber: string;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  examType: string;
  tags: string[];
  questionImageUrl?: string;
  testAt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoundQuestionPageData extends RoundQuestion {
  isBookmarked: boolean;
  formattedOptions: string[];
  bookmarkId?: number;
  studyHistory?: StudyHistory;
  userAnswer?: number | null;
  isCorrect?: boolean | null;
  solvedAt?: string;
}

export interface RoundQuestionsResponse {
  success: boolean;
  data: RoundQuestion[];
  meta?: {
    year: number;
    round: number;
    examType: string;
    totalQuestions: number;
  };
  message?: string;
  error?: string;
}

export const useRoundQuestions = (
    year: number,
    round: number,
    examType: string = 'korean_history'
) => {
  const [questions, setQuestions] = useState<RoundQuestionPageData[]>([]);
  const [studyHistories, setStudyHistories] = useState<StudyHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RoundQuestionsResponse['meta'] | null>(null);

  const loadQuestionsData = useCallback(async () => {
    if (!year || !round) return [];

    try {
      const response = await fetch(`/api/questions/${year}/${round}?examType=${examType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RoundQuestionsResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || '문제를 가져오는데 실패했습니다.');
      }

      return data.data;
    } catch (error) {
      console.error('문제 데이터 로드 실패:', error);
      throw error;
    }
  }, [year, round, examType]);

  const loadBookmarkData = useCallback(async () => {
    if (!year || !round) return [];

    try {
      const bookmarkData = await getBookmarksByYearRound(year, round);
      return bookmarkData || [];
    } catch (error) {
      console.error('북마크 데이터 로드 실패:', error);
      return [];
    }
  }, [year, round]);

  const loadStudyHistoryData = useCallback(async () => {
    if (!year || !round) return [];

    try {
      const historyData = await getStudyHistories(year, round);
      setStudyHistories(historyData);
      return historyData;
    } catch (error) {
      console.error('학습 이력 데이터 로드 실패:', error);
      return [];
    }
  }, [year, round]);

  const convertToRoundQuestionPageData = useCallback((
      rawQuestions: RoundQuestion[],
      bookmarkData: {bookmarkId: number, questionId: string}[],
      studyHistoryData: StudyHistory[]
  ): RoundQuestionPageData[] => {
    return rawQuestions.map(question => {
      // 문제 번호 추출
      const numberMatch = question.questionNumber.match(/(\d+)$/);
      const questionNumberInt = numberMatch ? parseInt(numberMatch[1]) : 1;

      // 옵션 포맷팅
      const formattedOptions = Object.entries(question.options)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([num, text]) => `${['①', '②', '③', '④', '⑤'][parseInt(num)-1]} ${text}`);

      // 북마크 정보
      const bookmarkInfo = bookmarkData.find(bookmark => bookmark.questionId === question.id);

      // 학습 이력 정보
      const studyHistory = studyHistoryData.find(history => history.questionId === question.id);

      return {
        ...question,
        isBookmarked: !!bookmarkInfo,
        bookmarkId: bookmarkInfo?.bookmarkId,
        formattedOptions,
        questionNumberInt,
        studyHistory,
        userAnswer: studyHistory?.userAnswer || null,
        isCorrect: studyHistory?.isCorrect || null,
        solvedAt: studyHistory?.solvedAt
      };
    });
  }, []);

  const loadRoundQuestionsData = useCallback(async () => {
    if (!year || !round) return;

    setLoading(true);
    setError(null);

    try {
      const [rawQuestions, bookmarkData, studyHistoryData] = await Promise.all([
        loadQuestionsData(),
        loadBookmarkData(),
        loadStudyHistoryData()
      ]);

      // 데이터 결합
      const convertedQuestions = convertToRoundQuestionPageData(rawQuestions, bookmarkData, studyHistoryData);
      setQuestions(convertedQuestions);

      setMeta({
        year,
        round,
        examType,
        totalQuestions: rawQuestions.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('🔥 회차별 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [year, round, examType, loadQuestionsData, loadBookmarkData, loadStudyHistoryData, convertToRoundQuestionPageData]);

  // 새로고침
  const refreshQuestions = useCallback(() => {
    setLoading(true);
    setError(null);
    loadRoundQuestionsData();
  }, [loadRoundQuestionsData]);

  const saveStudyHistory = useCallback(async (histories: StudyHistory[]) => {
    if (histories.length === 0) return;

    const originalStudyHistories = studyHistories;

    const newStudyHistories = [...studyHistories];
    histories.forEach(history => {
      const existingIndex = newStudyHistories.findIndex(h => h.questionId === history.questionId);
      if (existingIndex >= 0) {
        newStudyHistories[existingIndex] = history;
      } else {
        newStudyHistories.push(history);
      }
    });
    setStudyHistories(newStudyHistories);

    setQuestions(prev => prev.map(question => {
      const updatedHistory = histories.find(h => h.questionId === question.id);
      if (updatedHistory) {
        return {
          ...question,
          studyHistory: updatedHistory,
          userAnswer: updatedHistory.userAnswer,
          isCorrect: updatedHistory.isCorrect,
          solvedAt: updatedHistory.solvedAt
        };
      }
      return question;
    }));

    try {
      const savedHistories = await saveStudyHistories(histories);
      setStudyHistories(prev => {
        const updated = [...prev];
        savedHistories.forEach(saved => {
          const existingIndex = updated.findIndex(h => h.questionId === saved.questionId);
          if (existingIndex >= 0) {
            updated[existingIndex] = saved;
          }
        });
        return updated;
      });

    } catch (err) {
      setStudyHistories(originalStudyHistories);
      setError('학습 이력 저장 실패');
      console.error('학습 이력 저장 실패:', err);
      throw err;
    }
  }, []);

  // 특정 문제의 학습 이력 조회
  const getHistoryByQuestionId = useCallback((questionId: string) => {
    return studyHistories.find(history => history.questionId === questionId);
  }, []);

  // 사용자 답안 추출 (page.tsx에서 사용하기 쉽게)
  const extractUserAnswers = useCallback(() => {
    const userAnswers: { [key: number]: number } = {};
    studyHistories.forEach(history => {
      const questionData = questions.find(q => q.id === history.questionId);
      if (questionData && history.userAnswer !== null) {
        const numberMatch = questionData.questionNumber.match(/(\d+)$/);
        const questionNum = numberMatch ? parseInt(numberMatch[1]) : 1;
        userAnswers[questionNum] = history.userAnswer;
      }
    });
    return userAnswers;
  }, [studyHistories]);

  useEffect(() => {
    loadRoundQuestionsData();
  }, [loadRoundQuestionsData]);

  return {
    questions,
    studyHistories,
    meta,
    loading,
    error,
    refreshQuestions,
    saveStudyHistory,
    getHistoryByQuestionId,
    extractUserAnswers,
    convertToRoundQuestionPageData
  };
};