import { useState, useEffect } from 'react';
import { 
  getQuestionsByYearAndRound, 
  getQuestionById, 
  getQuestionSet,
  getQuestionSetsByExamType,
  getRecentQuestions,
  searchQuestions,
  getExamStats
} from '@/lib/firebase/questions';
import { Question, QuestionSet, ExamStats } from '@/types/question';

export const useQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 특정 연도/회차 문제 목록 가져오기
  const getQuestions = async (
    year: number, 
    round: number, 
    examType: string = 'korean_history'
  ): Promise<Question[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const questions = await getQuestionsByYearAndRound(year, round, examType);
      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 특정 문제 가져오기
  const getQuestion = async (
    questionId: string, 
    examType: string = 'korean_history'
  ): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const question = await getQuestionById(questionId, examType);
      return question;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제를 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 문제 세트 가져오기
  const getQuestionSet = async (
    year: number, 
    round: number, 
    examType: string = 'korean_history'
  ): Promise<QuestionSet | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const questionSet = await getQuestionSet(year, round, examType);
      return questionSet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제 세트를 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 시험 유형별 문제 세트 목록 가져오기
  const getQuestionSets = async (
    examType: string = 'korean_history',
    limitCount: number = 10
  ): Promise<QuestionSet[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const questionSets = await getQuestionSetsByExamType(examType, limitCount);
      return questionSets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제 세트 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 최근 문제 가져오기
  const getRecentQuestions = async (
    examType: string = 'korean_history',
    limitCount: number = 10
  ): Promise<Question[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const questions = await getRecentQuestions(examType, limitCount);
      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '최근 문제를 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 문제 검색
  const searchQuestions = async (
    keyword: string,
    examType: string = 'korean_history',
    limitCount: number = 20
  ): Promise<Question[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const questions = await searchQuestions(keyword, examType, limitCount);
      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문제 검색에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 시험 통계 가져오기
  const getExamStats = async (
    userId: string,
    year: number,
    round: number,
    examType: string = 'korean_history'
  ): Promise<ExamStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await getExamStats(userId, year, round, examType);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '시험 통계를 가져오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getQuestions,
    getQuestion,
    getQuestionSet,
    getQuestionSets,
    getRecentQuestions,
    searchQuestions,
    getExamStats
  };
}; 