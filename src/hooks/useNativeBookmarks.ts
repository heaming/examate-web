import { useState, useEffect, useCallback } from 'react';
import { 
  BookmarkData, 
  saveBookmark, 
  removeBookmark, 
  requestBookmarks, 
  setupNativeMessageListener 
} from '@/lib/native';

export const useNativeBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 북마크 목록 새로고침
  const refreshBookmarks = useCallback(() => {
    setLoading(true);
    setError(null);
    requestBookmarks();
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

  // Native 메시지 리스너 설정
  useEffect(() => {
    const cleanup = setupNativeMessageListener({
      onBookmarksReceived: (receivedBookmarks) => {
        setBookmarks(receivedBookmarks);
        setLoading(false);
        setError(null);
      }
    });

    // 컴포넌트 마운트 시 북마크 목록 요청
    refreshBookmarks();

    return cleanup;
  }, [refreshBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    refreshBookmarks,
    addBookmark,
    deleteBookmark,
    isBookmarked
  };
}; 