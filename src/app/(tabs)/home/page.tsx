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
  Award,
  AlertCircle
} from 'lucide-react';

// 타입 정의
interface StudyProgress {
  totalProblems: number;
  solvedProblems: number;
  correctAnswers: number;
  studyStreak: number;
}

interface RecentProblem {
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

  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요! 👋</h1>
        <p className="text-gray-600">오늘도 열심히 공부해봐요!</p>
      </div>

      {/* 학습 진도 카드 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">학습 진도</h2>
          <TrendingUp className="text-blue-600" size={20} />
        </div>
        
        <div className="space-y-4">
          {/* 전체 진행률 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">전체 진행률</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.solvedProblems}문제 해결</span>
              <span>{progress.totalProblems}문제 중</span>
            </div>
          </div>

          {/* 정답률 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="text-green-600" size={16} />
              <span className="text-sm text-gray-600">정답률</span>
            </div>
            <span className="font-semibold text-green-600">{accuracy}%</span>
          </div>

          {/* 연속 학습일 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="text-orange-600" size={16} />
              <span className="text-sm text-gray-600">연속 학습일</span>
            </div>
            <span className="font-semibold text-orange-600">{progress.studyStreak}일</span>
          </div>
        </div>
      </div>

      {/* 빠른 시작 버튼들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link 
          href="/questions"
          className="bg-blue-600 text-white p-4 rounded-xl flex flex-col items-center space-y-2 shadow-sm hover:bg-blue-700 transition-colors"
        >
          <BookOpen size={24} />
          <span className="font-medium">문제 풀기</span>
          <span className="text-xs opacity-90">기출문제 학습</span>
        </Link>

        <Link 
          href="/wrong-answers"
          className="bg-orange-600 text-white p-4 rounded-xl flex flex-col items-center space-y-2 shadow-sm hover:bg-orange-700 transition-colors"
        >
          <AlertCircle size={24} />
          <span className="font-medium">오답 복습</span>
          <span className="text-xs opacity-90">틀린 문제 다시</span>
        </Link>
      </div>

      {/* 최근 푼 문제 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">최근 푼 문제</h2>
          <Link href="/questions" className="text-blue-600 text-sm flex items-center">
            전체보기
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentProblems.map((problem) => (
            <div key={problem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {problem.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    problem.isCorrect 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {problem.isCorrect ? '정답' : '오답'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {problem.title}
                </p>
                <p className="text-xs text-gray-500">
                  {problem.solvedAt.toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 학습 통계 */}
      <div className="bg-white rounded-xl p-6 mt-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 학습</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-xs text-gray-600">푼 문제</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">10</div>
            <div className="text-xs text-gray-600">정답</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">45</div>
            <div className="text-xs text-gray-600">학습 시간(분)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">3</div>
            <div className="text-xs text-gray-600">북마크</div>
          </div>
        </div>
      </div>
    </div>
  );
} 