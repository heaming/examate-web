// Native 메시지 리스너 관리

import { BookmarkData } from './bookmarks';
import { StudyStats, TodayStats } from './stats';
import { RecentQuestionData } from './questions';
import { ExamResult } from './exams';
import { WrongAnswerRecord, WrongAnswerStats } from './wrongAnswers';
import {NativeHomePageData} from "@/lib/native/home";

export interface MessageHandlers {
  onHomePageDataReceived?: (data: NativeHomePageData) => void;
  onBookmarksReceived?: (bookmarks: BookmarkData[]) => void;
  onStudyStatsReceived?: (stats: StudyStats) => void;
  onTodayStatsReceived?: (stats: TodayStats) => void;
  onRecentQuestionsReceived?: (questions: RecentQuestionData[]) => void;
  onWrongAnswersReceived?: (wrongAnswers: WrongAnswerRecord[]) => void;
  onWrongAnswerStatsReceived?: (stats: WrongAnswerStats) => void;
  onExamResultsReceived?: (results: ExamResult[]) => void;
}

export const setupNativeMessageListener = (handlers: MessageHandlers): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'GET_HOME_PAGE_DATA':
          if (handlers.onHomePageDataReceived) {
            handlers.onHomePageDataReceived(message.data);
          }
          break;
        case 'BOOKMARKS_RESPONSE':
          if (handlers.onBookmarksReceived) {
            handlers.onBookmarksReceived(message.data || []);
          }
          break;
        case 'STUDY_STATS_RESPONSE':
          if (handlers.onStudyStatsReceived) {
            handlers.onStudyStatsReceived(message.data);
          }
          break;
        case 'TODAY_STATS_RESPONSE':
          if (handlers.onTodayStatsReceived) {
            handlers.onTodayStatsReceived(message.data);
          }
          break;
        case 'RECENT_QUESTIONS_RESPONSE':
          if (handlers.onRecentQuestionsReceived) {
            handlers.onRecentQuestionsReceived(message.data || []);
          }
          break;
        case 'WRONG_ANSWERS_RESPONSE':
          if (handlers.onWrongAnswersReceived) {
            handlers.onWrongAnswersReceived(message.data || []);
          }
          break;
        case 'WRONG_ANSWER_STATS_RESPONSE':
          if (handlers.onWrongAnswerStatsReceived) {
            handlers.onWrongAnswerStatsReceived(message.data);
          }
          break;
        case 'EXAM_RESULTS_RESPONSE':
          if (handlers.onExamResultsReceived) {
            handlers.onExamResultsReceived(message.data || []);
          }
          break;
        default:
          console.log('알 수 없는 메시지 타입:', message.type);
      }
    } catch (error) {
      console.error('Native 메시지 파싱 실패:', error);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage);
    
    // 클린업 함수 반환
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }
  
  return () => {};
}; 