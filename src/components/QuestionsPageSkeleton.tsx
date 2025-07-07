import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function QuestionsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* 헤더 */}
      <div className="mb-6 pl-1">
        <h1 className="text-2xl font-bold text-foreground mb-2">기출문제</h1>
        <p className="text-muted-foreground">연도별 기출문제를 풀어보세요✒️</p>
      </div>

      {/* 필터 섹션 스켈레톤 */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="px-4">
          <div className="">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">연도 선택</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 pl-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 연도 헤더 스켈레톤 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* 회차별 카드 스켈레톤 */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg h-48 p-4 flex flex-col">
              {/* date, 회차, 미풀이 그룹 */}
              <div className="mb-3">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* 진행률 그룹 */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* 풀이완료, 정답 그룹 */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="text-center">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 현재 상태 스켈레톤 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-100 rounded-lg p-3">
                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 