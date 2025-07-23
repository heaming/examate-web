// 웹뷰 ↔ React Native 공통 통신 유틸리티

export interface NativeMessage {
  type:
    // HOME
    | 'GET_HOME_PAGE_DATA'

    // BOOKMARK
    | 'GET_BOOKMARK_DATA'
    | 'GET_BOOKMARKS'
    | 'SAVE_BOOKMARK'
    | 'REMOVE_BOOKMARK'
    | 'GET_BOOKMARKS_BY_YEAR_ROUND'

    // STUDY HISTORY
    | 'GET_STUDY_HISTORIES'
    | 'SAVE_STUDY_HISTORIES'
    | 'SAVE_STUDY_HISTORY'

    // STUDY STATS
    | 'GET_STUDY_STATS'
    | 'UPDATE_STUDY_STATS'
    | 'GET_TODAY_STATS'

    // 오답노트 관련
    | 'SAVE_WRONG_ANSWER'
    | 'GET_WRONG_ANSWERS'
    | 'GET_WRONG_ANSWER_STATS'
    | 'UPDATE_WRONG_ANSWER_NOTE'
    | 'TOGGLE_WRONG_ANSWER_BOOKMARK'
    | 'REMOVE_WRONG_ANSWER'

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