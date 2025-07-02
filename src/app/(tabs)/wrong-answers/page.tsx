'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  Target,
  BookOpen,
  TrendingDown
} from 'lucide-react';

interface WrongAnswer {
  id: string;
  questionId: string;
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  wrongCount: number;
  lastWrongAt: Date;
  note?: string;
}

export default function WrongAnswersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'count'>('date');

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'software', name: '소프트웨어 설계' },
    { id: 'development', name: '소프트웨어 개발' },
    { id: 'testing', name: '소프트웨어 테스트' },
    { id: 'deployment', name: '소프트웨어 배포' },
    { id: 'maintenance', name: '소프트웨어 유지보수' },
  ];

  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([
    {
      id: '1',
      questionId: 'q1',
      title: '객체지향 설계 원칙 중 단일 책임 원칙(SRP)에 대한 설명으로 옳은 것은?',
      category: '소프트웨어 설계',
      year: 2024,
      round: 1,
      number: 1,
      userAnswer: 2,
      correctAnswer: 1,
      explanation: 'SRP는 하나의 클래스는 하나의 책임만 가져야 한다는 원칙입니다. 여러 책임을 가진 클래스는 변경의 이유가 여러 개가 되어 유지보수가 어려워집니다.',
      wrongCount: 3,
      lastWrongAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      note: 'SRP와 OCP를 혼동하지 말자'
    },
    {
      id: '2',
      questionId: 'q2',
      title: '다음 중 RESTful API 설계 원칙이 아닌 것은?',
      category: '소프트웨어 개발',
      year: 2024,
      round: 1,
      number: 2,
      userAnswer: 4,
      correctAnswer: 3,
      explanation: 'RESTful API는 상태가 없는(Stateless) 통신을 사용하며, 각 요청은 독립적으로 처리되어야 합니다.',
      wrongCount: 1,
      lastWrongAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      questionId: 'q3',
      title: '화이트박스 테스트 기법 중 분기 커버리지(Branch Coverage)에 대한 설명으로 옳은 것은?',
      category: '소프트웨어 테스트',
      year: 2023,
      round: 3,
      number: 15,
      userAnswer: 1,
      correctAnswer: 2,
      explanation: '분기 커버리지는 모든 분기문의 true/false 경로를 테스트하는 기법입니다. 문장 커버리지보다 더 엄격한 테스트 기준입니다.',
      wrongCount: 2,
      lastWrongAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      note: '커버리지 종류 정리 필요'
    }
  ]);

  const filteredWrongAnswers = wrongAnswers
    .filter(wrong => {
      const categoryMatch = selectedCategory === 'all' || 
        wrong.category === categories.find(c => c.id === selectedCategory)?.name;
      const searchMatch = wrong.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wrong.note?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
      } else {
        return b.wrongCount - a.wrongCount;
      }
    });

  const handleRetryQuestion = (id: string) => {
    // 문제 다시 풀기 로직
    console.log('Retry question:', id);
  };

  const getWrongCountColor = (count: number) => {
    if (count >= 3) return 'bg-red-100 text-red-700';
    if (count >= 2) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">오답노트</h1>
        <p className="text-gray-600">틀린 문제들을 다시 복습해보세요</p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
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

        {/* 정렬 옵션 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">정렬</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              최근 틀린 순
            </button>
            <button
              onClick={() => setSortBy('count')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortBy === 'count'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              틀린 횟수 순
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="오답 문제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 오답 목록 */}
      <div className="space-y-3">
        {filteredWrongAnswers.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">틀린 문제가 없습니다.</p>
          </div>
        ) : (
          filteredWrongAnswers.map((wrong) => (
            <div
              key={wrong.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              {/* 문제 정보 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    {wrong.year}년 {wrong.round}회차 {wrong.number}번
                  </span>
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getWrongCountColor(wrong.wrongCount)}`}>
                  {wrong.wrongCount}회 틀림
                </span>
              </div>
              
              <p className="text-sm text-gray-900 mb-3">
                {wrong.title}
              </p>
              
              {/* 답안 정보 */}
              <div className="bg-red-50 p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-700">내 답안</span>
                  <span className="text-xs font-medium text-green-700">정답</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-600">{wrong.userAnswer}번</span>
                  <span className="text-sm font-bold text-green-600">{wrong.correctAnswer}번</span>
                </div>
              </div>
              
              {/* 해설 */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">해설</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  {wrong.explanation}
                </p>
              </div>
              
              {/* 노트 */}
              {wrong.note && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">내 노트</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                    {wrong.note}
                  </p>
                </div>
              )}
              
              {/* 하단 정보 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {wrong.category}
                </span>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{wrong.lastWrongAt.toLocaleDateString('ko-KR')}</span>
                  </div>
                  
                  <button
                    onClick={() => handleRetryQuestion(wrong.id)}
                    className="flex items-center space-x-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    <RefreshCw size={14} />
                    <span>다시 풀기</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 정보 */}
      <div className="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">오답 통계</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-600">
              {wrongAnswers.length}
            </div>
            <div className="text-xs text-gray-500">총 오답</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {wrongAnswers.reduce((sum, w) => sum + w.wrongCount, 0)}
            </div>
            <div className="text-xs text-gray-500">총 틀린 횟수</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round((wrongAnswers.length / (wrongAnswers.length + 50)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">오답률</div>
          </div>
        </div>
      </div>
    </div>
  );
} 