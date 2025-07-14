import { useState, useEffect, useCallback } from 'react';
import { 
  BookmarkData, 
  StudyStats, 
  TodayStats, 
  RecentQuestionData, 
  QuestionResult
} from '@/lib/native';
import { useNativeBookmarks } from './useNativeBookmarks';
import { useStudyStats } from './useStudyStats';
import { useRecentQuestions } from './useRecentQuestions';

export interface HomePageData {
  // 학습 진도
  totalProblems: number;
  solvedProblems: number;
  correctAnswers: number;
  studyStreak: number;
  accuracy: number;
  progressPercentage: number;
  
  // 오늘의 학습
  todaySolved: number;
  todayCorrect: number;
  todayStudyTime: number;
  todayBookmarks: number;
  todayAccuracy: number;
  
  // 최근 문제
  recentQuestions: RecentQuestionData[];
  
  // 북마크
  bookmarks: BookmarkData[];
}

export const useNativeData = () => {
  const bookmarkHook = useNativeBookmarks();
  const statsHook = useStudyStats();
  const recentHook = useRecentQuestions();
  
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase에서 총 문제 수를 가져오기 위한 상태 (예시)
  const [totalProblemsFromFirebase, setTotalProblemsFromFirebase] = useState(1250);

  // 홈 페이지 데이터 계산
  const calculateHomeData = useCallback((): HomePageData => {
    const studyStats = statsHook.studyStats;
    const todayStats = statsHook.todayStats;
    const recentQuestions = recentHook.recentQuestions;
    const bookmarks = bookmarkHook.bookmarks;

    const solvedProblems = studyStats?.totalSolved || 0;
    const correctAnswers = studyStats?.totalCorrect || 0;
    const accuracy = solvedProblems > 0 ? Math.round((correctAnswers / solvedProblems) * 100) : 0;
    const progressPercentage = totalProblemsFromFirebase > 0 ? 
      Math.round((solvedProblems / totalProblemsFromFirebase) * 100) : 0;

    const todaySolved = todayStats?.solvedToday || 0;
    const todayCorrect = todayStats?.correctToday || 0;
    const todayAccuracy = todaySolved > 0 ? Math.round((todayCorrect / todaySolved) * 100) : 0;

    return {
      // 학습 진도
      totalProblems: totalProblemsFromFirebase,
      solvedProblems,
      correctAnswers,
      studyStreak: studyStats?.studyStreak || 0,
      accuracy,
      progressPercentage,
      
      // 오늘의 학습
      todaySolved,
      todayCorrect,
      todayStudyTime: todayStats?.studyTimeToday || 0,
      todayBookmarks: todayStats?.bookmarksToday || 0,
      todayAccuracy,
      
      // 최근 문제
      recentQuestions,
      
      // 북마크
      bookmarks
    };
  }, [
    statsHook.studyStats,
    statsHook.todayStats,
    recentHook.recentQuestions,
    bookmarkHook.bookmarks,
    totalProblemsFromFirebase
  ]);

  // 모든 데이터 새로고침
  const refreshAllData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    bookmarkHook.refreshBookmarks();
    statsHook.refreshAllStats();
    recentHook.refreshRecentQuestions();
  }, [bookmarkHook, statsHook, recentHook]);

  // 문제 결과 저장 (통합 함수)
  const saveQuestionResult = useCallback((result: QuestionResult) => {
    recentHook.saveResult(result);
    
    // 통계 업데이트
    const currentStats = statsHook.studyStats;
    if (currentStats) {
      const newStats = {
        totalSolved: currentStats.totalSolved + 1,
        totalCorrect: currentStats.totalCorrect + (result.isCorrect ? 1 : 0),
        totalStudyTime: currentStats.totalStudyTime + Math.round(result.studyTime / 60), // 초를 분으로 변환
        lastStudyDate: result.solvedAt
      };
      statsHook.updateStats(newStats);
    }
  }, [recentHook, statsHook]);

  // 북마크 토글 (통합 함수)
  const toggleBookmark = useCallback((questionData: {
    questionId: string;
    title: string;
    category: string;
    year: number;
    round: number;
    number: number;
    answer?: string;
    note?: string;
    tags?: string[];
  }) => {
    const existingBookmark = bookmarkHook.bookmarks.find(b => b.questionId === questionData.questionId);
    
    if (existingBookmark) {
      bookmarkHook.deleteBookmark(existingBookmark.id);
    } else {
      const newBookmark: BookmarkData = {
        id: `${questionData.year}-${questionData.round}-${questionData.number}-${Date.now()}`,
        questionId: questionData.questionId,
        title: questionData.title,
        category: questionData.category,
        year: questionData.year,
        round: questionData.round,
        number: questionData.number,
        answer: questionData.answer,
        note: questionData.note,
        tags: questionData.tags || [],
        bookmarkedAt: new Date().toISOString()
      };
      bookmarkHook.addBookmark(newBookmark);
    }
  }, [bookmarkHook]);

  // 데이터 변경 시 홈 데이터 업데이트
  useEffect(() => {
    const newHomeData = calculateHomeData();
    setHomeData(newHomeData);
    
    // 모든 개별 훅의 로딩 상태 확인
    const isLoading = bookmarkHook.loading || statsHook.loading || recentHook.loading;
    setLoading(isLoading);
    
    // 에러 상태 통합
    const errors = [bookmarkHook.error, statsHook.error, recentHook.error].filter(Boolean);
    setError(errors.length > 0 ? errors.join(', ') : null);
  }, [
    calculateHomeData,
    bookmarkHook.loading,
    bookmarkHook.error,
    statsHook.loading,
    statsHook.error,
    recentHook.loading,
    recentHook.error
  ]);

  return {
    // 통합 데이터
    homeData,
    loading,
    error,
    
    // 개별 데이터 접근
    bookmarks: bookmarkHook.bookmarks,
    studyStats: statsHook.studyStats,
    todayStats: statsHook.todayStats,
    recentQuestions: recentHook.recentQuestions,
    
    // 통합 함수들
    refreshAllData,
    saveQuestionResult,
    toggleBookmark,
    
    // 개별 북마크 함수들
    refreshBookmarks: bookmarkHook.refreshBookmarks,
    addBookmark: bookmarkHook.addBookmark,
    deleteBookmark: bookmarkHook.deleteBookmark,
    isBookmarked: bookmarkHook.isBookmarked,
    
    // 개별 통계 함수들
    refreshStudyStats: statsHook.refreshStudyStats,
    refreshTodayStats: statsHook.refreshTodayStats,
    refreshAllStats: statsHook.refreshAllStats,
    updateStats: statsHook.updateStats,
    getAccuracy: statsHook.getAccuracy,
    getTodayAccuracy: statsHook.getTodayAccuracy,
    
    // 개별 최근 문제 함수들
    refreshRecentQuestions: recentHook.refreshRecentQuestions,
    saveResult: recentHook.saveResult,
    getQuestionResult: recentHook.getQuestionResult,
    getRecentAccuracy: recentHook.getRecentAccuracy,
    getCategoryStats: recentHook.getCategoryStats,
    getAverageStudyTime: recentHook.getAverageStudyTime,
    
    // Firebase 총 문제 수 설정 (외부에서 설정할 수 있도록)
    setTotalProblemsFromFirebase
  };
}; 