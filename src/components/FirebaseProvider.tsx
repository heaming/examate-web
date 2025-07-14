'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, signInAnonymous, onAuthStateChange } from "@/lib/firebase";

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      initializeFirebase();

      // 인증 상태 변경 감지
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        setAuthLoading(false);
        
        if (user) {
          console.log('🔐 사용자 인증됨:');
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

      setTimeout(autoSignIn, 500);

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
      setAuthLoading(false);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          {/* EXAMATE 로고 */}
          <div className="relative mb-8">
            {/* 로고 배경 원형 */}
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-orange-500 shadow-lg">
              {/* 내부 장식 요소들 */}
              <div className="absolute inset-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                {/* E 모양 디자인 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-4xl">E</div>
                </div>
                {/* 장식 도형들 - 원, 네모, 세모 */}
                {/* 원형 */}
                <div className="absolute top-3 right-3 w-4 h-4 bg-white/25 rounded-full"></div>
                {/* 네모 */}
                <div className="absolute bottom-2 left-2/3 transform -translate-x-1/2 w-4 h-4 bg-white/30 rounded-sm"></div>
                {/* 세모 */}
                <div className="absolute top-1/2 left-2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-white/20 transform -translate-y-1/2"></div>
              </div>
            </div>
            
            {/* 앱 이름 */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                EXAMATE
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full"></div>
            </div>
          </div>
          
          {/* 앱 설명 */}
          <div className="space-y-3">
            <p className="text-lg font-medium text-gray-800">한국사능력검정시험</p>
            <p className="text-sm text-gray-500">기출문제로 완벽 대비</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 