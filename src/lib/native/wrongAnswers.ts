import {NativeAPIBase} from "@/lib/native/base";

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


export class WrongAnswerAPI extends NativeAPIBase {
  private static instance: WrongAnswerAPI;

  static getInstance() {
    if (!this.instance) {
      this.instance = new WrongAnswerAPI();
    }
    return this.instance;
  }

  async getWrongAnswers(): Promise<WrongAnswerRecord[]> {
    return this.sendMessage<WrongAnswerRecord[]>('GET_WRONG_ANSWERS');
  }

  async saveWrongAnswer(wrongAnswer: any): Promise<void> {
    return this.sendMessage<void>('SAVE_WRONG_ANSWER', wrongAnswer);
  }

  async updateNote(questionId: string, note: string): Promise<void> {
    return this.sendMessage<void>('UPDATE_WRONG_ANSWER_NOTE', { questionId, note });
  }
}

// 편의 함수들
export const getWrongAnswers = () => WrongAnswerAPI.getInstance().getWrongAnswers();
export const saveWrongAnswer = (wrongAnswer: any) => WrongAnswerAPI.getInstance().saveWrongAnswer(wrongAnswer);
export const updateWrongAnswerNote = (questionId: string, note: string) => WrongAnswerAPI.getInstance().updateNote(questionId, note);