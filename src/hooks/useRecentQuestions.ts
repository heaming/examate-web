import { useState, useEffect, useCallback } from 'react';
import { 
  RecentQuestionData, 
  QuestionResult, 
  requestRecentQuestions, 
  saveQuestionResult, 
  setupNativeMessageListener 
} from '@/lib/native';

export const useRecentQuestions = () => {
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최근 문제 목록 새로고침
  const refreshRecentQuestions = useCallback((limit: number = 10) => {
    setLoading(true);
    setError(null);
    requestRecentQuestions(limit);
  }, []);

  // 문제 결과 저장
  const saveResult = useCallback((result: QuestionResult) => {
    try {
      saveQuestionResult(result);
      
      // 낙관적 업데이트 - 새로운 문제 결과를 맨 앞에 추가
      const newRecentQuestion: RecentQuestionData = {
        id: `${result.questionId}-${Date.now()}`,
        questionId: result.questionId,
        title: `${result.number}번 문제`, // 실제로는 더 자세한 제목이 필요
        category: result.category,
        year: result.year,
        round: result.round,
        number: result.number,
        userAnswer: result.userAnswer,
        correctAnswer: result.correctAnswer,
        isCorrect: result.isCorrect,
        solvedAt: result.solvedAt,
        studyTime: result.studyTime
      };
      
      setRecentQuestions(prev => [newRecentQuestion, ...prev.slice(0, 9)]); // 최대 10개 유지
    } catch (err) {
      setError('문제 결과 저장 실패');
      console.error('문제 결과 저장 실패:', err);
    }
  }, []);

  // 특정 문제 결과 조회
  const getQuestionResult = useCallback((questionId: string) => {
    return recentQuestions.find(q => q.questionId === questionId);
  }, [recentQuestions]);

  // 정답률 계산
  const getRecentAccuracy = useCallback(() => {
    if (recentQuestions.length === 0) return 0;
    const correctCount = recentQuestions.filter(q => q.isCorrect).length;
    return Math.round((correctCount / recentQuestions.length) * 100);
  }, [recentQuestions]);

  // 카테고리별 통계
  const getCategoryStats = useCallback(() => {
    const categoryStats: { [key: string]: { total: number; correct: number } } = {};
    
    recentQuestions.forEach(question => {
      if (!categoryStats[question.category]) {
        categoryStats[question.category] = { total: 0, correct: 0 };
      }
      categoryStats[question.category].total++;
      if (question.isCorrect) {
        categoryStats[question.category].correct++;
      }
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }));
  }, [recentQuestions]);

  // 평균 문제 풀이 시간 계산
  const getAverageStudyTime = useCallback(() => {
    if (recentQuestions.length === 0) return 0;
    const totalTime = recentQuestions.reduce((sum, q) => sum + q.studyTime, 0);
    return Math.round(totalTime / recentQuestions.length);
  }, [recentQuestions]);

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onRecentQuestionsReceived: (receivedQuestions) => {
        setRecentQuestions(receivedQuestions);
        setLoading(false);
        setError(null);
      }
    });

    // 컴포넌트 마운트 시 최근 문제 목록 요청
    refreshRecentQuestions();

    return cleanup;
  }, [refreshRecentQuestions]);

  return {
    recentQuestions,
    loading,
    error,
    refreshRecentQuestions,
    saveResult,
    getQuestionResult,
    getRecentAccuracy,
    getCategoryStats,
    getAverageStudyTime
  };
}; 