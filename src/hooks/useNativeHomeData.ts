import { useState, useEffect, useCallback } from 'react';
import { requestHomePageData, setupNativeMessageListener, HomePageData } from '@/lib/native';

export const useNativeHomeData = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 홈 페이지 데이터 요청
  const requestHomeData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    requestHomePageData();
  }, []);

  // 홈 페이지 데이터 새로고침
  const refreshHomeData = useCallback(() => {
    requestHomeData();
  }, [requestHomeData]);

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onHomePageDataReceived: (data: HomePageData) => {
        setHomeData(data);
        setLoading(false);
        setError(null);
      }
    });

    // 컴포넌트 마운트 시 데이터 요청
    requestHomeData();

    return cleanup;
  }, [requestHomeData]);

  return {
    homeData,
    loading,
    error,
    refreshHomeData
  };
}; 