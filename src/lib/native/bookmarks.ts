import { NativeAPIBase } from './base';

export interface NativeBookmarkData {
  id?: number;
  questionId: string;
  year: number;
  round: number;
  questionNumber: string;
  questionText: string;
  questionImageUrl?: string;
  correctAnswer: number;
  explanation?: string;
  note?: string;
  tags?: string[];
  bookmarkedAt?: string;
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

  async getBookmarksByYearRound(year: number, round: number): Promise<{bookmarkId: number, questionId: string}[]> {
    return this.sendMessage<{bookmarkId: number, questionId: string}[]>('GET_BOOKMARKS_BY_YEAR_ROUND', {year: year, round: round} );
  }

  async saveBookmark(bookmark: NativeBookmarkData): Promise<NativeBookmarkData> {
    return this.sendMessage<NativeBookmarkData>('SAVE_BOOKMARK', bookmark);
  }

  async removeBookmark(bookmarkId: number): Promise<void> {
    return this.sendMessage<void>('REMOVE_BOOKMARK', { id: bookmarkId });
  }

  async updateBookmark(bookmarkId: number, request: any): Promise<void> {
    return this.sendMessage<void>('UPDATE_BOOKMARK', {id: bookmarkId, ...request});
  }
}

// 편의 함수들
export const getBookmarkData = () => BookmarkAPI.getInstance().getBookmarkData();
export const getBookmarks = () => BookmarkAPI.getInstance().getBookmarks();
export const saveBookmark = (bookmark: NativeBookmarkData) => BookmarkAPI.getInstance().saveBookmark(bookmark);
export const removeBookmark = (bookmarkId: number) => BookmarkAPI.getInstance().removeBookmark(bookmarkId);
export const updateBookmark = (bookmarkId: number, request: any) => BookmarkAPI.getInstance().updateBookmark(bookmarkId, request);
export const getBookmarksByYearRound = (year: number, round: number) => BookmarkAPI.getInstance().getBookmarksByYearRound(year, round);