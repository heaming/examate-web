// 웹뷰 ↔ React Native 공통 통신 유틸리티

export interface NativeMessage {
  type:
    // HOME
    | 'GET_HOME_PAGE_DATA'

    // 북마크 관련
    | 'SAVE_BOOKMARK' 
    | 'REMOVE_BOOKMARK' 
    | 'GET_BOOKMARKS' 
    // 학습 통계 관련
    | 'GET_STUDY_STATS'
    | 'UPDATE_STUDY_STATS'
    | 'GET_TODAY_STATS'
    // 최근 문제 관련
    | 'GET_RECENT_QUESTIONS'
    | 'SAVE_QUESTION_RESULT'
    // 오답노트 관련
    | 'SAVE_WRONG_ANSWER'
    | 'GET_WRONG_ANSWERS'
    | 'GET_WRONG_ANSWER_STATS'
    | 'UPDATE_WRONG_ANSWER_NOTE'
    | 'TOGGLE_WRONG_ANSWER_BOOKMARK'
    | 'REMOVE_WRONG_ANSWER'
    // 시험 결과 관련
    | 'GET_EXAM_RESULTS' 
    | 'SAVE_EXAM_RESULT'
    
    // 응답 타입들
    | 'HOME_PAGE_DATA_RESPONSE'
    | 'BOOKMARKS_RESPONSE'
    | 'STUDY_STATS_RESPONSE'
    | 'TODAY_STATS_RESPONSE'
    | 'RECENT_QUESTIONS_RESPONSE'
    | 'WRONG_ANSWERS_RESPONSE'
    | 'WRONG_ANSWER_STATS_RESPONSE'
    | 'EXAM_RESULTS_RESPONSE';
  data?: any;
}

// React Native WebView로 메시지 전송
export const sendMessageToNative = (message: NativeMessage): void => {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn('React Native WebView가 감지되지 않았습니다. 웹 브라우저에서 실행 중입니다.');
  }
};

// TypeScript 타입 확장
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
} 