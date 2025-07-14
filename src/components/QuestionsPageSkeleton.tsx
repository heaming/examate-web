import { Calendar, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuestionsPageSkeleton() {
  return (
    <div className="bg-background">
      {/* 상단 고정 헤더 + 필터 영역 */}
      <div className="bg-background sticky top-0 z-10 pt-4 px-4">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">기출문제</h1>
              <p className="text-muted-foreground">연도별 기출문제를 풀어보세요✒️</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              disabled
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 필터 내용 */}
        <div className="px-4 py-4 border-b border-border bg-muted/20">
          {/* 연도 선택 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">연도 선택</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">카테고리</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="p-4">
        {/* 선택된 연도의 회차별 카드 */}
        <div className="mb-6">
          {/* 연도 헤더 */}
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* 회차별 카드 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardContent className="p-4">
                  {/* 회차 정보 */}
                  <div className="mb-3">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* 진행률 */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                      <div className="h-3 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 학습 통계 */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 