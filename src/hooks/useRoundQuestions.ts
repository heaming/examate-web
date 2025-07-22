import { useState, useEffect, useCallback } from 'react';
import { useBookmarks } from './useBookmarks';
import { NativeBookmarkData } from '@/lib/native';

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
  createdAt: any;
  updatedAt: any;
}

// 북마크 정보가 포함된 확장된 Question 인터페이스
export interface EnhancedRoundQuestion extends RoundQuestion {
  isBookmarked: boolean;
  formattedOptions: string[]; // 포맷팅된 옵션 배열
  questionNumberInt: number; // 숫자형 문제 번호
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
    year: number | string,
    round: number | string,
    examType: string = 'korean_history'
) => {
  const [questions, setQuestions] = useState<EnhancedRoundQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RoundQuestionsResponse['meta'] | null>(null);

  // 북마크 훅 사용
  const { isBookmarked, addBookmark, deleteBookmark, loading: bookmarkLoading } = useBookmarks();

  // 문제 데이터 가공 함수
  const enhanceQuestions = useCallback((rawQuestions: RoundQuestion[]): EnhancedRoundQuestion[] => {
    return rawQuestions.map(question => {
      // 문제 번호를 숫자로 변환
      const numberMatch = question.questionNumber.match(/(\d+)$/);
      const questionNumberInt = numberMatch ? parseInt(numberMatch[1]) : 1;

      // 옵션을 포맷팅
      const formattedOptions = Object.entries(question.options)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([num, text]) => `${['①', '②', '③', '④', '⑤'][parseInt(num)-1]} ${text}`);

      return {
        ...question,
        isBookmarked: isBookmarked(question.id),
        formattedOptions,
        questionNumberInt
      };
    });
  }, [isBookmarked]);

  // 문제 데이터 fetch
  const fetchQuestions = async () => {
    if (!year || !round) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
          `/api/questions/${year}/${round}?examType=${examType}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RoundQuestionsResponse = await response.json();

      if (data.success) {
        const enhancedData = enhanceQuestions(data.data);
        setQuestions(enhancedData);
        setMeta(data.meta || null);
      } else {
        throw new Error(data.error || '문제를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제를 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('🔥 회차별 문제 가져오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 북마크 추가 함수
  const handleAddBookmark = async (question: EnhancedRoundQuestion) => {
    try {
      const bookmarkData: NativeBookmarkData = {
        id: `${year}-${round}-${question.questionNumberInt}`,
        questionId: question.id,
        year: typeof year === 'string' ? parseInt(year) : year,
        round: typeof round === 'string' ? parseInt(round) : round,
        questionNumber: question.questionNumberInt,
        questionText: question.questionText,
        questionImageUrl: question.questionImageUrl || '',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        tags: question.tags || [],
        createdAt: new Date().toISOString()
      };

      await addBookmark(bookmarkData);

      // 로컬 상태 업데이트
      setQuestions(prev =>
          prev.map(q =>
              q.id === question.id
                  ? { ...q, isBookmarked: true }
                  : q
          )
      );
    } catch (error) {
      throw error;
    }
  };

  // 북마크 제거 함수
  const handleRemoveBookmark = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      await deleteBookmark(`${year}-${round}-${question.questionNumberInt}`);

      // 로컬 상태 업데이트
      setQuestions(prev =>
          prev.map(q =>
              q.id === questionId
                  ? { ...q, isBookmarked: false }
                  : q
          )
      );
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [year, round, examType]);

  // 북마크 상태가 변경될 때마다 문제 데이터 업데이트
  useEffect(() => {
    if (questions.length > 0) {
      const updatedQuestions = enhanceQuestions(questions);
      setQuestions(updatedQuestions);
    }
  }, [isBookmarked]);

  return {
    questions,
    loading: loading || bookmarkLoading,
    error,
    meta,
    refetch: fetchQuestions,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark
  };
};