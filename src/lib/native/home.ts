import { sendMessageToNative } from './common';
import {StudyHistory} from "@/types/studyHistory";

export interface NativeHomePageData {
  totalQuestions: number | null;
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
  recentQuestions: StudyHistory[];
}

// 홈 페이지 데이터 요청
export const requestHomePageData = (): void => {
  sendMessageToNative({
    type: 'GET_HOME_PAGE_DATA'
  });
}; 