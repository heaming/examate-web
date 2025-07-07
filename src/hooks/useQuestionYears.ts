import { useState, useEffect } from 'react';

// 연도별 회차 데이터 타입
export interface RoundData {
  round: number;
  totalQuestions: number;
  solvedQuestions: number;
  correctAnswers: number;
  date: string;
}

export interface YearData {
  year: number;
  rounds: RoundData[];
}

export const useQuestionYears = (examType: string = 'korean_history') => {
  const [yearsData, setYearsData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchYearsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔥 [Hook] API 호출 시작 - examType:', examType);
        
        const response = await fetch(`/api/questions/years?examType=${examType}`);
        const result = await response.json();
        
        if (isCancelled) {
          console.log('🔥 [Hook] API 호출 취소됨');
          return;
        }
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || '데이터를 가져오는데 실패했습니다.');
        }

        const transformedData: YearData[] = result.data.map((yearData: any) => ({
          year: yearData.year,
          rounds: yearData.rounds.map((round: any) => ({
            ...round,
            solvedQuestions: 0, // 초기값 - 나중에 사용자 진행 상황에서 가져와야 함
            correctAnswers: 0,  // 초기값 - 나중에 사용자 진행 상황에서 가져와야 함
          }))
        }));

        setYearsData(transformedData);
        console.log('🔥 [Hook] 데이터 설정 완료');
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
          console.error('연도별 회차 데이터 가져오기 오류:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchYearsData();
    
    return () => {
      isCancelled = true;
    };
  }, [examType]);

  return { yearsData, loading, error, refetch: () => window.location.reload() };
};

export const useRoundsByYear = (year: number, examType: string = 'korean_history') => {
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/questions/years/${year}?examType=${examType}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || '데이터를 가져오는데 실패했습니다.');
        }
        
        // Firebase에서 가져온 데이터를 프론트엔드 구조에 맞게 변환
        const transformedRounds: RoundData[] = result.data.rounds.map((round: any) => ({
          ...round,
          solvedQuestions: 0, // 초기값 - 나중에 사용자 진행 상황에서 가져와야 함
          correctAnswers: 0,  // 초기값 - 나중에 사용자 진행 상황에서 가져와야 함
        }));
        
        setRounds(transformedRounds);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('회차 데이터 가져오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchRounds();
    }
  }, [year, examType]);

  return { rounds, loading, error };
}; 