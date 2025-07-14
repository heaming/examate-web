// 오답노트 관련 Native 통신

import { sendMessageToNative } from './common';

export interface WrongAnswerRecord {
  id: string;
  questionId: string;
  userAnswer?: number;
  wrongCount: number;
  lastWrongAt: string;        // ISO string
  firstWrongAt: string;       // ISO string
  note?: string;
  isBookmarked?: boolean;
  attempts: WrongAttempt[];   // 틀린 시도 기록들
}

export interface WrongAttempt {
  id: string;
  userAnswer: number;
  attemptedAt: string;        // ISO string
  studyTime: number;          // 문제 풀이 시간 (초)
}

export interface WrongAnswerStats {
  totalWrongQuestions: number;
  totalAttempts: number;
  mostWrongCategory: string;
  averageWrongCount: number;
  recentWrongTrend: {
    date: string;
    count: number;
  }[];
}

export interface WrongAnswerUpdate {
  questionId: string;
  userAnswer: number;
  studyTime: number;
  attemptedAt: string;        // ISO string
}

export interface WrongAnswerNoteUpdate {
  questionId: string;
  note: string;
}

export interface WrongAnswerBookmarkUpdate {
  questionId: string;
  isBookmarked: boolean;
}

// 오답 기록 저장
export const saveWrongAnswer = (wrongAnswer: WrongAnswerUpdate): void => {
  sendMessageToNative({
    type: 'SAVE_WRONG_ANSWER',
    data: wrongAnswer
  });
};

// 오답 목록 요청
export const requestWrongAnswers = (): void => {
  sendMessageToNative({
    type: 'GET_WRONG_ANSWERS'
  });
};

// 오답 통계 요청
export const requestWrongAnswerStats = (): void => {
  sendMessageToNative({
    type: 'GET_WRONG_ANSWER_STATS'
  });
};

// 오답 노트 업데이트
export const updateWrongAnswerNote = (noteUpdate: WrongAnswerNoteUpdate): void => {
  sendMessageToNative({
    type: 'UPDATE_WRONG_ANSWER_NOTE',
    data: noteUpdate
  });
};

// 오답 북마크 토글
export const toggleWrongAnswerBookmark = (bookmarkUpdate: WrongAnswerBookmarkUpdate): void => {
  sendMessageToNative({
    type: 'TOGGLE_WRONG_ANSWER_BOOKMARK',
    data: bookmarkUpdate
  });
};

// 오답 기록 삭제 (정답으로 풀었을 때)
export const removeWrongAnswer = (questionId: string): void => {
  sendMessageToNative({
    type: 'REMOVE_WRONG_ANSWER',
    data: { questionId }
  });
}; 