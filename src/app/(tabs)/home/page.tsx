'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Star,
  ArrowRight,
  Calendar,
  Award, CircleAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// 타입 정의
interface StudyProgress {
  totalProblems: number;
  solvedProblems: number;
  correctAnswers: number;
  studyStreak: number;
}

interface RecentQuestion {
  id: string;
  title: string;
  category: string;
  isCorrect: boolean;
  solvedAt: Date;
}

export default function HomePage() {
  const [progress, setProgress] = useState<StudyProgress>({
    totalProblems: 1250,
    solvedProblems: 342,
    correctAnswers: 298,
    studyStreak: 7
  });

  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([
    {
      id: '1',
      title: '정보처리기사 2024년 1회차 1번',
      category: '정보처리기사',
      isCorrect: true,
      solvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
    },
    {
      id: '2',
      title: '정보처리기사 2024년 1회차 15번',
      category: '정보처리기사',
      isCorrect: false,
      solvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4시간 전
    },
    {
      id: '3',
      title: '정보처리기사 2023년 3회차 8번',
      category: '정보처리기사',
      isCorrect: true,
      solvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1일 전
    }
  ]);

  const accuracy = Math.round((progress.correctAnswers / progress.solvedProblems) * 100);
  const progressPercentage = Math.round((progress.solvedProblems / progress.totalProblems) * 100);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* 헤더 */}
      <div className="mb-6 pl-1">
        <h1 className="text-2xl font-bold text-foreground mb-2">한국사능력검정시험</h1>
        <p className="text-muted-foreground"><span className="text-green-600 font-bold">D-13</span> 오늘도 열심히 공부해봐요😊</p>
      </div>

      {/* 학습 진도 카드 */}
      <Card className="mb-6 gap-2 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-lg font-bold">학습 진도</CardTitle>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 전체 진행률 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">전체 진행률</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                  className={`h-2 rounded-full transition-all duration-300 bg-blue-500`}
                  style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{progress.solvedProblems}문제 해결</span>
              <span>{progress.totalProblems}문제 중</span>
            </div>
          </div>

          {/* 정답률 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600"/>
              <span className="text-sm font-medium text-muted-foreground">정답률</span>
            </div>
            <span className="font-semibold text-green-600">{accuracy}%</span>
          </div>

          {/* 연속 학습일 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">연속 학습일</span>
            </div>
            <span className="font-semibold text-orange-600">{progress.studyStreak}일</span>
          </div>
        </CardContent>
      </Card>

      {/* 빠른 시작 버튼들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/questions">
          <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]  h-auto p-4 flex flex-col items-center space-y-1" size="lg">
            <BookOpen className="h-10 w-10" />
            <span className="font-medium">문제 풀기</span>
            <span className="text-xs opacity-90">기출문제 학습</span>
          </Button>
        </Link>

        <Link href="/wrong-answers">
          <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] h-auto p-4 flex flex-col items-center space-y-1" size="lg">
            <CircleAlert className="h-10 w-10" />
            <span className="font-medium">오답 복습</span>
            <span className="text-xs opacity-90">틀린 문제 다시</span>
          </Button>
        </Link>
      </div>

      {/* 최근 푼 문제 */}
      <Card className="gap-2 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">최근 푼 문제</CardTitle>
          <Link href="/questions">
            <Button variant="ghost" size="sm" className="h-auto py-1 hover:text-blue-500 hover:bg-white">
              전체보기
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentQuestions.map((question) => (
            <div key={question.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className="text-xs bg-zinc-200 text-zinc-800">
                    2024년 1회차
                  </Badge>
                  <Badge className={`${question.isCorrect ? "text-green-500" : "text-rose-400"} text-xs`}>
                    {question.isCorrect ? '정답' : '오답'}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {question.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {question.solvedAt.toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 학습 통계 */}
      <Card className="mt-6 gap-3 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">오늘의 학습</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-xs text-muted-foreground">푼 문제</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">10</div>
              <div className="text-xs text-muted-foreground">정답</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">45</div>
              <div className="text-xs text-muted-foreground">학습 시간(분)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">3</div>
              <div className="text-xs text-muted-foreground">북마크</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 