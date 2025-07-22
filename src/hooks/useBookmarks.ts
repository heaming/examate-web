import { useState, useEffect, useCallback } from 'react';
import {
  saveBookmark,
  removeBookmark,
  NativeBookmarkData,
  getBookmarkData, updateBookmark, getBookmarksByYearRound
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
  const addBookmark = useCallback(async (bookmark: NativeBookmarkData) => {
    try {
      setBookmarks(prev => [bookmark, ...prev]);
      return await saveBookmark(bookmark);
    } catch (err) {
      setError('북마크 저장 실패');
      console.error('북마크 저장 실패:', err);
    }
  }, []);

  // 북마크 삭제
  const deleteBookmark = useCallback(async (bookmarkId: number) => {
    const originalBookmarks = bookmarks;
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));

    try {
      await removeBookmark(bookmarkId);
    } catch (err) {
      setBookmarks(originalBookmarks);
      setError('북마크 삭제 실패');
      console.error('북마크 삭제 실패:', err);
      throw err;
    }
  }, [bookmarks]);

  // 북마크 존재 확인
  const isBookmarked = useCallback((questionId: string) => {
    return bookmarks.some(bookmark => bookmark.questionId === questionId);
  }, [bookmarks]);

  // 북마크 업데이트
  const editBookmark = useCallback(async (bookmarkId: number, updates: Partial<NativeBookmarkData>) => {
    const originalBookmarks = bookmarks;
    setBookmarks(prev => prev.map(b =>
        b.id === bookmarkId ? { ...b, ...updates } : b
    ));

    try {
      await updateBookmark(bookmarkId, updates);
    } catch (err) {
      setBookmarks(originalBookmarks);
      setError('북마크 수정 실패');
      console.error('북마크 수정 실패:', err);
      throw err;
    }
  }, [bookmarks]);

  // 북마크 된 문제 아이디 리스트
  const findBookmarkByYearRound = useCallback(async (year: number, round: number) => {
    try {
      return await getBookmarksByYearRound(year, round);
    } catch (err) {
      setError('북마크 조회 실패');
      console.error('북마크 조회 실패:', err);
    }
  }, [])

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
    editBookmark,
    isBookmarked,
    findBookmarkByYearRound
  };
}; 