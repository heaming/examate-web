'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Calendar,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useQuestionYears, YearData, RoundData } from '@/hooks/useQuestionYears';
import QuestionsPageSkeleton from '@/components/QuestionsPageSkeleton';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export interface Question {
  id: string;
  year: number;
  round: number;
  number: number;
  category: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isSolved: boolean;
  isCorrect?: boolean;
}

export default function QuestionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Firebase에서 연도별 회차 데이터 가져오기
  const { yearsData, loading, error } = useQuestionYears('korean_history');

  // 연도 목록 추출
  const years = yearsData.map(yearData => yearData.year).sort((a, b) => b - a);

  // 첫 번째 연도를 기본 선택으로 설정
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // 선택된 연도의 데이터 가져오기
  const selectedYearData = yearsData.find(yearData => yearData.year === selectedYear);

  const getProgressColor = (solved: number, total: number) => {
    const percentage = (solved / total) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getProgressText = (solved: number, total: number) => {
    const percentage = (solved / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // 로딩 상태 - 스켈레톤 UI
  if (loading) {
    return <QuestionsPageSkeleton />;
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">❌ 데이터를 불러오는데 실패했습니다</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* 헤더 */}
      <div className="mb-6 pl-1">
        <h1 className="text-2xl font-bold text-foreground mb-2">기출문제</h1>
        <p className="text-muted-foreground">연도별 기출문제를 풀어보세요✒️</p>
      </div>

      {/* 필터 섹션 */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="px-4">
          {/* 연도 필터 */}
          <div className="">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">연도 선택</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 pl-1">
              {years.map((year) => (
                <Button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  variant={selectedYear === year ? "default" : "outline"}
                  size="sm"
                  className={`transition-none whitespace-nowrap ${selectedYear === year ? 'text-green-500': 'text-green'}`}
                >
                  {year}년
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 선택된 연도의 회차별 카드 */}
      {selectedYearData && (
        <div className="mb-6">
          {/* 연도 헤더 */}
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{selectedYear}년</h2>
            <span className="ml-1 text-sm text-zinc-700">
              총 {selectedYearData.rounds.reduce((sum, round) => sum + round.totalQuestions, 0)}문제
            </span>
          </div>

          {/* 회차별 카드 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {selectedYearData.rounds.map((round) => (
              <Link 
                key={`${selectedYear}-${round.round}`} 
                href={`/questions/${selectedYear}/${round.round}`}
              >
                <Card className="shadow-lg py-2 transition-shadow cursor-pointer border-2 hover:border-primary/20 h-48">
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* 시험 일자 */}
                    <div className="text-xs text-gray-500 mb-1 pl-0.5">
                      {round.date}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {round.round}회차
                        </span>
                        {/* 정답률/미풀이 태그를 회차 옆에 배치 */}
                        {round.solvedQuestions > 0 ? (
                          <Badge variant="outline" className="text-gray-400 text-xs">
                            {Math.round((round.correctAnswers / round.solvedQuestions) * 100)}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            미풀이
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>진행률</span>
                        <span>{Math.round((round.solvedQuestions / round.totalQuestions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(round.solvedQuestions, round.totalQuestions)}`}
                          style={{ width: `${(round.solvedQuestions / round.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 통계 정보 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className={`font-bold ${getProgressText(round.solvedQuestions, round.totalQuestions)}`}>
                          {round.solvedQuestions}/{round.totalQuestions}
                        </div>
                        <div className="text-muted-foreground">풀이완료</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">
                          {round.correctAnswers}
                        </div>
                        <div className="text-muted-foreground">정답</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      {selectedYearData && (
        <Card className="mt-6 gap-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">현재 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-100 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">
                  {selectedYearData.rounds.reduce((sum, round) => sum + round.totalQuestions, 0)}
                </div>
                <div className="text-xs text-muted-foreground">총 문제</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-600">
                  {selectedYearData.rounds.reduce((sum, round) => sum + round.correctAnswers, 0)}
                </div>
                <div className="text-xs text-muted-foreground">정답</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-lg font-bold text-red-600">
                  {selectedYearData.rounds.reduce((sum, round) => sum + (round.solvedQuestions - round.correctAnswers), 0)}
                </div>
                <div className="text-xs text-muted-foreground">틀린 문제</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 