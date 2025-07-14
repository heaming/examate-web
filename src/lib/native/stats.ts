// 학습 통계 관련 Native 통신

import { sendMessageToNative } from './common';

export interface StudyStats {
  totalSolved: number;        // 총 푼 문제 수
  totalCorrect: number;       // 총 정답 수
  totalStudyTime: number;     // 총 학습 시간 (분)
  studyStreak: number;        // 연속 학습일
  lastStudyDate: string;      // 마지막 학습 날짜 (ISO string)
}

export interface TodayStats {
  solvedToday: number;        // 오늘 푼 문제 수
  correctToday: number;       // 오늘 정답 수
  studyTimeToday: number;     // 오늘 학습 시간 (분)
  bookmarksToday: number;     // 오늘 북마크한 문제 수
}

// 전체 학습 통계 요청
export const requestStudyStats = (): void => {
  sendMessageToNative({
    type: 'GET_STUDY_STATS'
  });
};

// 오늘의 학습 통계 요청
export const requestTodayStats = (): void => {
  sendMessageToNative({
    type: 'GET_TODAY_STATS'
  });
};

// 학습 통계 업데이트
export const updateStudyStats = (stats: Partial<StudyStats>): void => {
  sendMessageToNative({
    type: 'UPDATE_STUDY_STATS',
    data: stats
  });
}; 