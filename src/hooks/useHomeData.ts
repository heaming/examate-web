import { useState, useEffect, useCallback } from 'react';
import { requestHomePageData, setupNativeMessageListener } from '@/lib/native';
import { getTotalQuestionsCount } from '@/lib/firebase/questions';
import {Question} from "@/types/question";

export interface HomePageData {
  totalQuestions: number;
  solvedCount: number;
  correctCount: number;
  studyStreak: number;
  accuracy: number;
  progressPercentage: number;
  todaySolved: number;
  todayCorrect: number;
  todayStudyTime: number;
  todayBookmarks: number;
  todayAccuracy: number;
  recentQuestions: Question[];
}

export const useHomeData = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase와 Native 데이터를 저장할 상태
  const [firebaseData, setFirebaseData] = useState<{ totalProblems: number } | null>(null);
  const [nativeData, setNativeData] = useState<HomePageData | null>(null);

  // Firebase에서 전체 문제 개수 가져오기
  const fetchFirebaseData = useCallback(async () => {
    try {
      const totalProblems = await getTotalQuestionsCount();
      setFirebaseData({ totalProblems });
    } catch (error) {
      console.error('Firebase 데이터 가져오기 실패:', error);
      setFirebaseData({ totalProblems: 0 });
    }
  }, []);

  // Native 앱에 홈 데이터 요청
  const fetchNativeData = useCallback(() => {
    requestHomePageData();
  }, []);

  // Firebase와 Native 데이터를 병합
  const mergeData = useCallback(() => {
    if (!firebaseData || !nativeData) return;

    const { totalProblems } = firebaseData;
    const { solvedProblems } = nativeData;

    // 진행률 재계산
    const progressPercentage = totalProblems > 0
        ? (solvedProblems / totalProblems) * 100
        : 0;

    const mergedData: HomePageData = {
      ...nativeData,
      totalProblems,
      progressPercentage: Math.round(progressPercentage * 100) / 100
    };

    setHomeData(mergedData);
    setLoading(false);
    setError(null);
  }, [firebaseData, nativeData]);

  // 홈 데이터 로드 (Firebase와 Native 병렬 처리)
  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Firebase와 Native 데이터를 병렬로 요청
    await Promise.all([
      fetchFirebaseData(),
      fetchNativeData()
    ]);
  }, [fetchFirebaseData, fetchNativeData]);

  // 홈 페이지 데이터 새로고침
  const refreshHomeData = useCallback(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onHomePageDataReceived: (data: HomePageData) => {
        setNativeData(data);
      }
    });

    return cleanup;
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Firebase와 Native 데이터가 모두 준비되면 병합
  useEffect(() => {
    mergeData();
  }, [mergeData]);

  return {
    homeData,
    loading,
    error,
    refreshHomeData
  };
};