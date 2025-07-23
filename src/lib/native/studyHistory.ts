import { sendMessageToNative } from './common';

export interface ExamResult {
  id: string;
  year: number;
  round: number;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;          // 시험 시간 (분)
  completedAt: string;        // ISO string
  score: number;              // 점수
  passed: boolean;            // 합격 여부
}

// 시험 결과 저장
export const saveStudyHistories = (examData: ExamResult): void => {
  sendMessageToNative({
    type: 'SAVE_EXAM_RESULT',
    data: examData
  });
};

// 시험 결과 목록 요청
export const requestExamResults = (): void => {
  sendMessageToNative({
    type: 'GET_EXAM_RESULTS'
  });
}; 