import { useState, useEffect } from 'react';

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
  const [questions, setQuestions] = useState<RoundQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RoundQuestionsResponse['meta'] | null>(null);

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
        setQuestions(data.data);
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

  useEffect(() => {
    fetchQuestions();
  }, [year, round, examType]);

  const refetch = () => {
    fetchQuestions();
  };

  return {
    questions,
    loading,
    error,
    meta,
    refetch
  };
}; 