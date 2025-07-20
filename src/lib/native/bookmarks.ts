import { NativeAPIBase } from './base';

export interface NativeBookmarkData {
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
  bookmarkedAt: string;
}

export class BookmarkAPI extends NativeAPIBase {
  private static instance: BookmarkAPI;

  static getInstance() {
    if (!this.instance) {
      this.instance = new BookmarkAPI();
    }
    return this.instance;
  }

  async getBookmarkData() {
    return this.sendMessage<{bookmarks: NativeBookmarkData[], totalCount: number}>('GET_BOOKMARK_DATA', { limit: 10, offset: 0 });
  }

  async getBookmarks(): Promise<NativeBookmarkData[]> {
    return this.sendMessage<NativeBookmarkData[]>('GET_BOOKMARKS');
  }

  async saveBookmark(bookmark: NativeBookmarkData): Promise<void> {
    return this.sendMessage<void>('SAVE_BOOKMARK', bookmark);
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    return this.sendMessage<void>('REMOVE_BOOKMARK', { id: bookmarkId });
  }
}

// 편의 함수들
export const getBookmarkData = () => BookmarkAPI.getInstance().getBookmarkData();
export const getBookmarks = () => BookmarkAPI.getInstance().getBookmarks();
export const saveBookmark = (bookmark: NativeBookmarkData) => BookmarkAPI.getInstance().saveBookmark(bookmark);
export const removeBookmark = (bookmarkId: string) => BookmarkAPI.getInstance().removeBookmark(bookmarkId);