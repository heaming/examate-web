// 홈 페이지 데이터 관련 Native 통신

import { sendMessageToNative } from './common';

// 홈 페이지 데이터 요청
export const requestHomePageData = (): void => {
  sendMessageToNative({
    type: 'GET_HOME_PAGE_DATA'
  });
}; 