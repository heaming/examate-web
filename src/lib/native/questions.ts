import { sendMessageToNative } from './common';

export interface RecentQuestionData {
  id: string;
  questionId: string;
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  solvedAt: string;
  studyTime: number;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  studyTime: number;
  category: string;
  year: number;
  round: number;
  number: number;
  solvedAt: string;
}

// 최근 문제 목록 요청
export const requestRecentQuestions = (limit: number = 10): void => {
  sendMessageToNative({
    type: 'GET_RECENT_QUESTIONS',
    data: { limit }
  });
};

// 문제 결과 저장
export const saveQuestionResult = (result: QuestionResult): void => {
  sendMessageToNative({
    type: 'SAVE_QUESTION_RESULT',
    data: result
  });
}; 