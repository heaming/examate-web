'use client';


import Link from 'next/link';
import {
  TrendingUp,
  Target,
  BookOpen,
  ArrowRight,
  Calendar,
  CircleAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHomeData } from '@/hooks/useHomeData';
import {getUserId} from "@/lib/firebase";
import {useEffect, useState} from "react";

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const currentUserId = getUserId();
    setUserId(currentUserId);
  }, []);

  // Native 홈 데이터 훅 사용
  const { homeData, loading, error, refreshHomeData } = useHomeData();

  return (
    <div className="bg-background">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-50 bg-background pt-4 px-4">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">한국사능력검정시험</h1>
          <p className="text-muted-foreground">D-13 오늘도 열심히 공부해봐요😊</p>
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="p-4">
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
              <span className="font-medium">{homeData?.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                  className={`h-2 rounded-full transition-all duration-300 bg-blue-500`}
                  style={{width: `${homeData?.progressPercentage || 0}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{homeData?.solvedProblems || 0}문제 해결</span>
              <span>{homeData?.totalProblems || 0}문제 중</span>
            </div>
            </div>

            {/* 정답률 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600"/>
                <span className="text-sm font-medium text-muted-foreground">정답률</span>
              </div>
              <span className="font-semibold text-green-600">{homeData?.accuracy || 0}%</span>
            </div>

            {/* 연속 학습일 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">연속 학습일</span>
              </div>
              <span className="font-semibold text-orange-600">{homeData?.studyStreak || 0}일</span>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 시작 버튼들 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/questions">
            <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] h-auto p-6 flex flex-col items-center space-y-2 relative overflow-hidden" size="lg">
              {/* 배경 도형들 */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 큰 삼각형 */}
                <div className="absolute top-1 right-2 w-12 h-12 bg-white/8 transform rotate-45"></div>
                {/* 원형 */}
                <div className="absolute bottom-2 left-1 w-10 h-10 bg-white/6 rounded-full"></div>
                {/* 사각형 */}
                <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/5 transform -translate-y-1/2"></div>
                {/* 작은 삼각형 */}
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-white/10 transform rotate-12"></div>
                {/* 추가 삼각형 */}
                <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/7 transform rotate-45"></div>
              </div>
              
              {/* 버튼 내용 */}
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <BookOpen style={{ width: '80px', height: '80px' }} />
                <span className="font-medium text-lg">문제 풀기</span>
                <span className="text-sm opacity-90">기출문제 학습</span>
              </div>
            </Button>
          </Link>

          <Link href="/wrong-answers">
            <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] h-auto p-6 flex flex-col items-center space-y-2 relative overflow-hidden" size="lg">
              {/* 배경 도형들 */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 큰 삼각형 */}
                <div className="absolute top-2 left-2 w-10 h-10 bg-white/8 transform rotate-45"></div>
                {/* 원형 */}
                <div className="absolute bottom-1 right-3 w-12 h-12 bg-white/6 rounded-full"></div>
                {/* 직사각형 */}
                <div className="absolute top-1/4 right-1/5 w-8 h-5 bg-white/5"></div>
                {/* 다이아몬드 */}
                <div className="absolute bottom-3 left-4 w-7 h-7 bg-white/10 transform rotate-45"></div>
                {/* 작은 원 */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/8 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* 추가 삼각형 */}
                <div className="absolute top-3/4 right-1/4 w-5 h-5 bg-white/7 transform rotate-12"></div>
              </div>
              
              {/* 버튼 내용 */}
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <CircleAlert style={{ width: '80px', height: '80px' }} />
                <span className="font-medium text-lg">오답 복습</span>
                <span className="text-sm opacity-90">틀린 문제 다시</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* 최근 푼 문제 */}
        <Card className="mb-6 gap-2 shadow-md">
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
            {/* 최근 문제 목록 */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-lg p-3 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : homeData?.recentQuestions && homeData.recentQuestions.length > 0 ? (
              homeData.recentQuestions.map((question) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {question.year}년 {question.round}회차 {question.number}번
                      </span>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                      >
                        {question.category}
                      </Badge>
                      <Badge 
                        variant={question.isCorrect ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {question.isCorrect ? "정답" : "오답"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-1">
                    {question.title.substring(0, 60)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(question.solvedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">아직 푼 문제가 없습니다.</p>
                <p className="text-sm text-muted-foreground">기출문제를 풀어보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 오늘의 학습 통계 */}
        <Card className="mb-6 gap-3 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">오늘의 학습</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{homeData?.todaySolved || 0}</div>
                <div className="text-xs text-muted-foreground">푼 문제</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{homeData?.todayCorrect || 0}</div>
                <div className="text-xs text-muted-foreground">정답</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">{homeData?.todayStudyTime || 0}</div>
                <div className="text-xs text-muted-foreground">학습 시간(분)</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{homeData?.todayBookmarks || 0}</div>
                <div className="text-xs text-muted-foreground">북마크</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 