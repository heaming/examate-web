import { useState, useEffect, useCallback } from 'react';
import { 
  StudyStats, 
  TodayStats, 
  requestStudyStats, 
  requestTodayStats, 
  updateStudyStats, 
  setupNativeMessageListener 
} from '@/lib/native';

export const useStudyStats = () => {
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전체 학습 통계 새로고침
  const refreshStudyStats = useCallback(() => {
    setLoading(true);
    setError(null);
    requestStudyStats();
  }, []);

  // 오늘의 학습 통계 새로고침
  const refreshTodayStats = useCallback(() => {
    setLoading(true);
    setError(null);
    requestTodayStats();
  }, []);

  // 모든 통계 새로고침
  const refreshAllStats = useCallback(() => {
    setLoading(true);
    setError(null);
    requestStudyStats();
    requestTodayStats();
  }, []);

  // 학습 통계 업데이트
  const updateStats = useCallback((stats: Partial<StudyStats>) => {
    try {
      updateStudyStats(stats);
      // 낙관적 업데이트
      setStudyStats(prev => prev ? { ...prev, ...stats } : null);
    } catch (err) {
      setError('학습 통계 업데이트 실패');
      console.error('학습 통계 업데이트 실패:', err);
    }
  }, []);

  // 정답률 계산
  const getAccuracy = useCallback(() => {
    if (!studyStats || studyStats.totalSolved === 0) return 0;
    return Math.round((studyStats.totalCorrect / studyStats.totalSolved) * 100);
  }, [studyStats]);

  // 오늘의 정답률 계산
  const getTodayAccuracy = useCallback(() => {
    if (!todayStats || todayStats.solvedToday === 0) return 0;
    return Math.round((todayStats.correctToday / todayStats.solvedToday) * 100);
  }, [todayStats]);

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onStudyStatsReceived: (receivedStudyStats) => {
        setStudyStats(receivedStudyStats);
        setLoading(false);
        setError(null);
      },
      onTodayStatsReceived: (receivedTodayStats) => {
        setTodayStats(receivedTodayStats);
        setLoading(false);
        setError(null);
      }
    });

    // 컴포넌트 마운트 시 통계 요청
    refreshAllStats();

    return cleanup;
  }, [refreshAllStats]);

  return {
    studyStats,
    todayStats,
    loading,
    error,
    refreshStudyStats,
    refreshTodayStats,
    refreshAllStats,
    updateStats,
    getAccuracy,
    getTodayAccuracy
  };
}; 