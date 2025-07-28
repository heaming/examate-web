import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RoundQuestionsPageSkeletonProps {
  year?: number;
  round?: number;
}

export default function RoundQuestionsPageSkeleton({ year, round }: RoundQuestionsPageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* 저장하기 플로팅 버튼 */}
      <button
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-zinc-200"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
        disabled
      >
        <Save className="h-5 w-5 text-zinc-400" />
      </button>

      {/* 상단 뒤로가기 버튼 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/questions">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {year}년 {round}회차
            </h1>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
        </div>
      </div>

      {/* 문제 목록 스켈레톤 */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="shadow-md py-2">
            <CardContent className="p-6 pb-4">
              {/* 문제 헤더 스켈레톤 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* 문제 제목 스켈레톤 */}
              <div className="mb-6 mx-0.5 space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* 객관식 보기 스켈레톤 */}
              <div className="mb-4 space-y-2">
                {[1, 2, 3, 4].map((optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* 카테고리 및 정답보기 버튼 스켈레톤 */}
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 채점하기 영역 스켈레톤 */}
      <Card className="mt-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
          
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  );
} 