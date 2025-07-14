import { useState, useEffect, useCallback } from 'react';
import { 
  WrongAnswerRecord, 
  WrongAnswerStats, 
  WrongAnswerUpdate,
  WrongAnswerNoteUpdate,
  WrongAnswerBookmarkUpdate,
  saveWrongAnswer,
  requestWrongAnswers,
  requestWrongAnswerStats,
  updateWrongAnswerNote,
  toggleWrongAnswerBookmark,
  removeWrongAnswer,
  setupNativeMessageListener 
} from '@/lib/native';
import { Question } from '@/types/question';
import { useQuestions } from './useQuestions';

export interface WrongAnswerWithQuestion extends WrongAnswerRecord {
  // Firebase에서 가져온 문제 정보
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  correctAnswer: number;
  choices: string[];
  explanation: string;
  tags: string[];
}

export const useWrongAnswers = () => {
  const [wrongAnswerRecords, setWrongAnswerRecords] = useState<WrongAnswerRecord[]>([]);
  const [wrongAnswerStats, setWrongAnswerStats] = useState<WrongAnswerStats | null>(null);
  const [wrongAnswersWithQuestions, setWrongAnswersWithQuestions] = useState<WrongAnswerWithQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getQuestion } = useQuestions();

  // 오답 기록 새로고침
  const refreshWrongAnswers = useCallback(() => {
    setLoading(true);
    setError(null);
    requestWrongAnswers();
  }, []);

  // 오답 통계 새로고침
  const refreshWrongAnswerStats = useCallback(() => {
    setLoading(true);
    setError(null);
    requestWrongAnswerStats();
  }, []);

  // 모든 오답 데이터 새로고침
  const refreshAllWrongAnswerData = useCallback(() => {
    setLoading(true);
    setError(null);
    requestWrongAnswers();
    requestWrongAnswerStats();
  }, []);

  // 오답 기록 저장
  const saveWrongAnswerRecord = useCallback((wrongAnswerData: WrongAnswerUpdate) => {
    try {
      saveWrongAnswer(wrongAnswerData);
    } catch (err) {
      setError('오답 기록 저장 실패');
      console.error('오답 기록 저장 실패:', err);
    }
  }, []);

  // 오답 노트 업데이트
  const updateNote = useCallback((questionId: string, note: string) => {
    try {
      const noteUpdate: WrongAnswerNoteUpdate = { questionId, note };
      updateWrongAnswerNote(noteUpdate);
      
      // 낙관적 업데이트
      setWrongAnswerRecords(prev => 
        prev.map(record => 
          record.questionId === questionId ? { ...record, note } : record
        )
      );
    } catch (err) {
      setError('노트 업데이트 실패');
      console.error('노트 업데이트 실패:', err);
    }
  }, []);

  // 오답 북마크 토글
  const toggleBookmark = useCallback((questionId: string, isBookmarked: boolean) => {
    try {
      const bookmarkUpdate: WrongAnswerBookmarkUpdate = { questionId, isBookmarked };
      toggleWrongAnswerBookmark(bookmarkUpdate);
      
      // 낙관적 업데이트
      setWrongAnswerRecords(prev => 
        prev.map(record => 
          record.questionId === questionId ? { ...record, isBookmarked } : record
        )
      );
    } catch (err) {
      setError('북마크 토글 실패');
      console.error('북마크 토글 실패:', err);
    }
  }, []);

  // 오답 기록 삭제 (정답으로 풀었을 때)
  const removeWrongAnswerRecord = useCallback((questionId: string) => {
    try {
      removeWrongAnswer(questionId);
      
      // 낙관적 업데이트
      setWrongAnswerRecords(prev => 
        prev.filter(record => record.questionId !== questionId)
      );
    } catch (err) {
      setError('오답 기록 삭제 실패');
      console.error('오답 기록 삭제 실패:', err);
    }
  }, []);

  // Native 기록과 Firebase 문제 정보 결합
  const combineWrongAnswersWithQuestions = useCallback(async (records: WrongAnswerRecord[]) => {
    try {
      const combined: WrongAnswerWithQuestion[] = [];
      
      for (const record of records) {
        const question = await getQuestion(record.questionId);
        if (question) {
          combined.push({
            ...record,
            title: question.questionText,
            category: question.tags?.[0] || question.subject, // tags를 카테고리로 사용
            year: question.year,
            round: question.round,
            number: parseInt(question.questionNumber),
            correctAnswer: question.correctAnswer,
            choices: [
              question.options[1],
              question.options[2],
              question.options[3],
              question.options[4]
            ],
            explanation: question.explanation || '',
            tags: question.tags || []
          });
        }
      }
      
      setWrongAnswersWithQuestions(combined);
    } catch (err) {
      setError('문제 정보 로드 실패');
      console.error('문제 정보 로드 실패:', err);
    }
  }, [getQuestion]);

  // 카테고리별 필터링
  const filterByCategory = useCallback((category: string) => {
    if (category === 'all') return wrongAnswersWithQuestions;
    return wrongAnswersWithQuestions.filter(wrong => wrong.category === category);
  }, [wrongAnswersWithQuestions]);

  // 검색 필터링
  const filterBySearch = useCallback((searchQuery: string) => {
    if (!searchQuery) return wrongAnswersWithQuestions;
    return wrongAnswersWithQuestions.filter(wrong => 
      wrong.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wrong.note?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wrongAnswersWithQuestions]);

  // 정렬
  const sortWrongAnswers = useCallback((
    wrongAnswers: WrongAnswerWithQuestion[], 
    sortBy: 'date' | 'count'
  ) => {
    return [...wrongAnswers].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
      } else {
        return b.wrongCount - a.wrongCount;
      }
    });
  }, []);

  // 오답 횟수별 색상 계산
  const getWrongCountColor = useCallback((count: number) => {
    if (count >= 3) return 'bg-red-100 text-red-700';
    if (count >= 2) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  }, []);

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onWrongAnswersReceived: (receivedWrongAnswers) => {
        setWrongAnswerRecords(receivedWrongAnswers);
        combineWrongAnswersWithQuestions(receivedWrongAnswers);
        setLoading(false);
        setError(null);
      },
      onWrongAnswerStatsReceived: (receivedStats) => {
        setWrongAnswerStats(receivedStats);
        setLoading(false);
        setError(null);
      }
    });

    // 컴포넌트 마운트 시 오답 데이터 요청
    refreshAllWrongAnswerData();

    return cleanup;
  }, [refreshAllWrongAnswerData, combineWrongAnswersWithQuestions]);

  return {
    // 데이터
    wrongAnswerRecords,
    wrongAnswerStats,
    wrongAnswersWithQuestions,
    loading,
    error,
    
    // 함수들
    refreshWrongAnswers,
    refreshWrongAnswerStats,
    refreshAllWrongAnswerData,
    saveWrongAnswerRecord,
    updateNote,
    toggleBookmark,
    removeWrongAnswerRecord,
    
    // 유틸리티 함수들
    filterByCategory,
    filterBySearch,
    sortWrongAnswers,
    getWrongCountColor
  };
}; 