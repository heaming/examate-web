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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">🔄 인증 중...</div>
      </div>
    );
  }

  return <>{children}</>;
} 