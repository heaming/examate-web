import { useState, useEffect, useCallback } from 'react';
import {
  saveBookmark,
  removeBookmark,
  NativeBookmarkData,
  getBookmarkData
} from '@/lib/native';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<NativeBookmarkData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarkData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const nativeData = await getBookmarkData();
      setBookmarks(nativeData.bookmarks);
      setTotalCount(nativeData.totalCount);

    } catch (error) {
      console.warn('네이티브 데이터 로드 실패, 기본값 사용:', error);
      setBookmarks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 북마크 목록 새로고침
  const refreshBookmarks = useCallback(() => {
    setLoading(true);
    setError(null);
    loadBookmarkData();
  }, []);

  // 북마크 추가
  const addBookmark = useCallback((bookmark: BookmarkData) => {
    try {
      saveBookmark(bookmark);
      // 낙관적 업데이트
      setBookmarks(prev => [bookmark, ...prev]);
    } catch (err) {
      setError('북마크 저장 실패');
      console.error('북마크 저장 실패:', err);
    }
  }, []);

  // 북마크 삭제
  const deleteBookmark = useCallback((bookmarkId: string) => {
    try {
      removeBookmark(bookmarkId);
      // 낙관적 업데이트
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      setError('북마크 삭제 실패');
      console.error('북마크 삭제 실패:', err);
    }
  }, []);

  // 북마크 존재 확인
  const isBookmarked = useCallback((questionId: string) => {
    return bookmarks.some(bookmark => bookmark.questionId === questionId);
  }, [bookmarks]);

  useEffect(() => {
    loadBookmarkData();
  }, [loadBookmarkData]);

  return {
    bookmarks,
    totalCount,
    loading,
    error,
    refreshBookmarks,
    addBookmark,
    deleteBookmark,
    isBookmarked
  };
}; 