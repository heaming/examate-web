import { useState, useEffect, useCallback } from 'react';
import { 
  BookmarkData, 
  saveBookmark as nativeSaveBookmark, 
  removeBookmark as nativeRemoveBookmark, 
  requestBookmarks, 
  setupNativeMessageListener 
} from '@/lib/nativeStorage';

export const useNativeBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Native에서 북마크 데이터 받기
  const handleBookmarksReceived = useCallback((receivedBookmarks: BookmarkData[]) => {
    setBookmarks(receivedBookmarks);
    setIsLoading(false);
  }, []);

  // 컴포넌트 마운트 시 리스너 설정 및 북마크 요청
  useEffect(() => {
    // Native 메시지 리스너 설정
    const cleanup = setupNativeMessageListener(handleBookmarksReceived);
    
    // 북마크 목록 요청
    requestBookmarks();
    
    // 클린업
    return cleanup;
  }, [handleBookmarksReceived]);

  // 북마크 저장
  const saveBookmark = useCallback((bookmark: Omit<BookmarkData, 'id' | 'bookmarkedAt'>) => {
    const newBookmark: BookmarkData = {
      ...bookmark,
      id: `${bookmark.year}-${bookmark.round}-${bookmark.number}-${Date.now()}`,
      bookmarkedAt: new Date().toISOString()
    };
    
    nativeSaveBookmark(newBookmark);
    
    // 낙관적 업데이트
    setBookmarks(prev => [...prev, newBookmark]);
  }, []);

  // 북마크 삭제
  const removeBookmark = useCallback((bookmarkId: string) => {
    nativeRemoveBookmark(bookmarkId);
    
    // 낙관적 업데이트
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);

  // 북마크 여부 확인
  const isBookmarked = useCallback((questionId: string) => {
    return bookmarks.some(b => b.questionId === questionId);
  }, [bookmarks]);

  // 북마크 토글
  const toggleBookmark = useCallback((question: {
    questionId: string;
    title: string;
    category: string;
    year: number;
    round: number;
    number: number;
    answer?: string;
    tags?: string[];
  }) => {
    const existingBookmark = bookmarks.find(b => b.questionId === question.questionId);
    
    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      saveBookmark({
        questionId: question.questionId,
        title: question.title,
        category: question.category,
        year: question.year,
        round: question.round,
        number: question.number,
        answer: question.answer,
        tags: question.tags || []
      });
    }
  }, [bookmarks, saveBookmark, removeBookmark]);

  return {
    bookmarks,
    isLoading,
    saveBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark
  };
}; 