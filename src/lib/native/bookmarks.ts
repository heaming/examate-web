// 북마크 관련 Native 통신

import { sendMessageToNative } from './common';

export interface BookmarkData {
  id: string;
  questionId: string;
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  answer?: string;
  note?: string;
  tags: string[];
  bookmarkedAt: string; // ISO string
}

// 북마크 저장
export const saveBookmark = (bookmark: BookmarkData): void => {
  sendMessageToNative({
    type: 'SAVE_BOOKMARK',
    data: bookmark
  });
};

// 북마크 삭제
export const removeBookmark = (bookmarkId: string): void => {
  sendMessageToNative({
    type: 'REMOVE_BOOKMARK',
    data: { id: bookmarkId }
  });
};

// 북마크 목록 요청
export const requestBookmarks = (): void => {
  sendMessageToNative({
    type: 'GET_BOOKMARKS'
  });
}; 