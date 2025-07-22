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
  createdAt: Date;
  updatedAt: Date;
}

// 북마크 정보가 포함된 확장된 Question 인터페이스
export interface RoundQuestionPageData extends RoundQuestion {
  isBookmarked: boolean;
  formattedOptions: string[]; // 포맷팅된 옵션
  bookmarkId?: number;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RoundQuestionsResponse['meta'] | null>(null);
  const [bookmarkedData, setBookmarkedData] = useState<{bookmarkId: number, questionId: string}[]>([]);

  const { addBookmark, deleteBookmark, findBookmarkByYearRound, loading: bookmarkLoading } = useBookmarks();

  const loadRoundQuestionsData = useCallback((
      rawQuestions: RoundQuestion[],
      bookmarkData: {bookmarkId: number, questionId: string}[]
  ): RoundQuestionPageData[] => {
    return rawQuestions.map(question => {
      // 문제 번호를 숫자로 변환
      const numberMatch = question.questionNumber.match(/(\d+)$/);
      const questionNumberInt = numberMatch ? parseInt(numberMatch[1]) : 1;

      // 옵션을 포맷팅
      const formattedOptions = Object.entries(question.options)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([num, text]) => `${['①', '②', '③', '④', '⑤'][parseInt(num)-1]} ${text}`);

      // 해당 문제의 북마크 정보 찾기
      const bookmarkInfo = bookmarkData.find(bookmark => bookmark.questionId === question.id);

      return {
        ...question,
        isBookmarked: !!bookmarkInfo,
        bookmarkId: bookmarkInfo?.bookmarkId,
        formattedOptions,
        questionNumberInt
      };
    });
  }, []);

  const loadBookmarkData = useCallback(async () => {
    if (!year || !round) return [];

    try {
      const bookmarkData = await findBookmarkByYearRound(year, round);
      return bookmarkData || [];
    } catch (error) {
      console.error('북마크 데이터 로드 실패:', error);
      return [];
    }
  }, [year, round, findBookmarkByYearRound]);

  // 문제 데이터 fetch
  const fetchQuestions = async () => {
    if (!year || !round) return;

    setLoading(true);
    setError(null);

    try {
      // 병렬로 문제 데이터와 북마크 데이터를 가져오기
      const [questionsResponse, bookmarkData] = await Promise.all([
        fetch(`/api/questions/${year}/${round}?examType=${examType}`),
        loadBookmarkData()
      ]);

      if (!questionsResponse.ok) {
        throw new Error(`HTTP error! status: ${questionsResponse.status}`);
      }

      const data: RoundQuestionsResponse = await questionsResponse.json();

      if (data.success) {
        setBookmarkedData(bookmarkData);
        const roundQuestionPageData = loadRoundQuestionsData(data.data, bookmarkData);
        setQuestions(roundQuestionPageData);
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
  const handleAddBookmark = async (question: RoundQuestionPageData) => {
    try {
      const bookmarkData: NativeBookmarkData = {
        questionId: question.id,
        year,
        round,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionImageUrl: question.questionImageUrl || '',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        tags: question.tags || []
      };

      const savedBookmark = await addBookmark(bookmarkData);
      const newBookmarkInfo = {
        bookmarkId: savedBookmark?.id || Date.now(), // fallback ID
        questionId: question.id
      };
      const newBookmarkedData = [...bookmarkedData, newBookmarkInfo];
      setBookmarkedData(newBookmarkedData);

      setQuestions(prev =>
          prev.map(q =>
              q.id === question.id
                  ? { ...q, isBookmarked: true, bookmarkId: newBookmarkInfo.bookmarkId }
                  : q
          )
      );
    } catch (error) {
      throw error;
    }
  };

  const handleRemoveBookmark = async (bookmarkId: number) => {
    try {
      await deleteBookmark(bookmarkId);

      const newBookmarkedData = bookmarkedData.filter(bookmark => bookmark.bookmarkId !== bookmarkId);
      setBookmarkedData(newBookmarkedData);

      setQuestions(prev =>
          prev.map(q =>
              q.bookmarkId === bookmarkId
                  ? { ...q, isBookmarked: false, bookmarkId: undefined }
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

  return {
    questions,
    loading: loading || bookmarkLoading,
    error,
    meta,
    refetch: fetchQuestions,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    loadRoundQuestionsData // 외부에서 사용할 수 있도록 export
  };
};