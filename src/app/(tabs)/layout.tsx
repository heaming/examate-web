'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Bookmark, 
  AlertCircle, 
  Settings 
} from 'lucide-react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const tabs = [
    { name: '홈', href: '/home', icon: Home },
    { name: '기출문제', href: '/questions', icon: BookOpen },
    { name: '북마크', href: '/bookmarks', icon: Bookmark },
    { name: '오답노트', href: '/wrong-answers', icon: AlertCircle },
    { name: '설정', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      
      {/* 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-green-600' 
                    : 'text-muted-foreground hover:text-green-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
} 