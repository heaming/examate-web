'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, signInAnonymous, onAuthStateChange } from "@/lib/firebase";

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      initializeFirebase();
      console.log('Firebase 전역 초기화 완료');

      // 인증 상태 변경 감지
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        setAuthLoading(false);
        
        if (user) {
          console.log('🔐 사용자 인증됨:', user.uid);
          console.log('🔐 사용자 정보:', { 
            uid: user.uid, 
            isAnonymous: user.isAnonymous,
            createdAt: user.metadata.creationTime 
          });
        } else {
          console.log('🔐 사용자 로그아웃됨');
        }
      });

      // 현재 사용자가 없으면 자동으로 익명 로그인
      const autoSignIn = async () => {
        try {
          await signInAnonymous();
        } catch (error) {
          console.error('자동 익명 로그인 실패:', error);
          setAuthLoading(false);
        }
      };

      // 약간의 지연 후 자동 로그인 (Firebase 초기화 완료 대기)
      setTimeout(autoSignIn, 500);

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
      setAuthLoading(false);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {/* 로딩 스피너 */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 mx-auto mt-2 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          
          {/* 로딩 텍스트 */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">ExaMate</h2>
            <p className="text-gray-600 animate-pulse">Loading...</p>
            <div className="flex justify-center space-x-1 mt-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 