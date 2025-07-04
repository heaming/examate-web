'use client';

import { useState } from 'react';
import { 
  Filter, 
  Search, 
  Calendar,
  BookOpen,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export interface Question {
  id: string;
  year: number;
  round: number;
  number: number;
  category: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isSolved: boolean;
  isCorrect?: boolean;
}

interface RoundData {
  round: number;
  totalQuestions: number;
  solvedQuestions: number;
  correctAnswers: number;
  date: string;
}

interface YearData {
  year: number;
  rounds: RoundData[];
}

export default function QuestionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const years = [2024, 2023, 2022, 2021, 2020];
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'software', name: '소프트웨어 설계' },
    { id: 'development', name: '소프트웨어 개발' },
    { id: 'testing', name: '소프트웨어 테스트' },
    { id: 'deployment', name: '소프트웨어 배포' },
    { id: 'maintenance', name: '소프트웨어 유지보수' },
  ];

  const mockQuestions: Question[] = [
    {
      id: '1',
      year: 2024,
      round: 1,
      number: 1,
      category: '소프트웨어 설계',
      title: '객체지향 설계 원칙 중 단일 책임 원칙(SRP)에 대한 설명으로 옳은 것은?',
      difficulty: 'medium',
      isSolved: true,
      isCorrect: true
    },
    {
      id: '2',
      year: 2024,
      round: 1,
      number: 2,
      category: '소프트웨어 개발',
      title: '다음 중 RESTful API 설계 원칙이 아닌 것은?',
      difficulty: 'easy',
      isSolved: false
    },
    {
      id: '3',
      year: 2023,
      round: 3,
      number: 15,
      category: '소프트웨어 테스트',
      title: '화이트박스 테스트 기법 중 분기 커버리지(Branch Coverage)에 대한 설명으로 옳은 것은?',
      difficulty: 'hard',
      isSolved: true,
      isCorrect: false
    }
  ];

  const filteredQuestions = mockQuestions.filter(question => {
    const yearMatch = question.year === selectedYear;
    const categoryMatch = selectedCategory === 'all' || question.category === categories.find(c => c.id === selectedCategory)?.name;
    const searchMatch = question.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return yearMatch && categoryMatch && searchMatch;
  });

  // 연도별 회차 데이터
  const yearsData: YearData[] = [
    {
      year: 2024,
      rounds: [
        { round: 1, totalQuestions: 80, solvedQuestions: 45, correctAnswers: 38, date: '2024.03.09' },
        { round: 2, totalQuestions: 80, solvedQuestions: 32, correctAnswers: 28, date: '2024.06.15' },
        { round: 3, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2024.09.14' },
        { round: 4, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2024.12.07' },
      ]
    },
    {
      year: 2023,
      rounds: [
        { round: 1, totalQuestions: 80, solvedQuestions: 67, correctAnswers: 58, date: '2023.03.11' },
        { round: 2, totalQuestions: 80, solvedQuestions: 54, correctAnswers: 47, date: '2023.06.17' },
        { round: 3, totalQuestions: 80, solvedQuestions: 23, correctAnswers: 19, date: '2023.09.16' },
        { round: 4, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2023.12.09' },
      ]
    },
    {
      year: 2022,
      rounds: [
        { round: 1, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 72, date: '2022.03.12' },
        { round: 2, totalQuestions: 80, solvedQuestions: 76, correctAnswers: 68, date: '2022.06.18' },
        { round: 3, totalQuestions: 80, solvedQuestions: 45, correctAnswers: 39, date: '2022.09.17' },
        { round: 4, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2022.12.10' },
      ]
    },
    {
      year: 2021,
      rounds: [
        { round: 1, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 75, date: '2021.03.13' },
        { round: 2, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 71, date: '2021.06.19' },
        { round: 3, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 73, date: '2021.09.18' },
        { round: 4, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2021.12.11' },
      ]
    },
    {
      year: 2020,
      rounds: [
        { round: 1, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 76, date: '2020.03.14' },
        { round: 2, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 74, date: '2020.06.20' },
        { round: 3, totalQuestions: 80, solvedQuestions: 80, correctAnswers: 72, date: '2020.09.19' },
        { round: 4, totalQuestions: 80, solvedQuestions: 0, correctAnswers: 0, date: '2020.12.12' },
      ]
    }
  ];

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
            <Badge variant="secondary" className="ml-2">
              총 {selectedYearData.rounds.reduce((sum, round) => sum + round.totalQuestions, 0)}문제
            </Badge>
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
                          {round.round}11회차
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
      <Card className="mt-6 gap-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">현재 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-100 rounded-lg p-3">
              <div className="text-lg font-bold text-primary">
                {filteredQuestions.length}
              </div>
              <div className="text-xs text-muted-foreground">총 문제</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">
                {filteredQuestions.filter(q => q.isSolved && q.isCorrect).length}
              </div>
              <div className="text-xs text-muted-foreground">정답</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-lg font-bold text-orange-600">
                {filteredQuestions.filter(q => q.isSolved).length}
              </div>
              <div className="text-xs text-muted-foreground">틀린 문제</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 