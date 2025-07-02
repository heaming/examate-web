'use client';

import { useState } from 'react';
import { 
  Filter, 
  Search, 
  Calendar,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';

interface Question {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">기출문제</h1>
        <p className="text-gray-600">년도별 기출문제를 풀어보세요</p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        {/* 년도 필터 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">년도 선택</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">카테고리</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="문제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">해당 조건의 문제가 없습니다.</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    {question.year}년 {question.round}회차 {question.number}번
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyText(question.difficulty)}
                  </span>
                </div>
                {question.isSolved && (
                  <div className={`w-3 h-3 rounded-full ${
                    question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                )}
              </div>
              
              <p className="text-sm text-gray-900 mb-3 line-clamp-2">
                {question.title}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {question.category}
                </span>
                
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  문제 풀기 →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 정보 */}
      <div className="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">현재 상태</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {filteredQuestions.length}
            </div>
            <div className="text-xs text-gray-500">총 문제</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {filteredQuestions.filter(q => q.isSolved && q.isCorrect).length}
            </div>
            <div className="text-xs text-gray-500">정답</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {filteredQuestions.filter(q => q.isSolved).length}
            </div>
            <div className="text-xs text-gray-500">푼 문제</div>
          </div>
        </div>
      </div>
    </div>
  );
} 