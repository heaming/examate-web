'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Target,
  BookOpen,
  TrendingDown,
  Edit3,
  Check,
  XIcon, CircleX, CheckCircle,
  Bookmark, ArrowUpDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WrongAnswer {
  id: string;
  questionId: string;
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  userAnswer?: number;
  correctAnswer: number;
  choices: string[];
  explanation: string;
  wrongCount: number;
  lastWrongAt: Date;
  note?: string;
  isBookmarked?: boolean;
}

export default function WrongAnswersPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'count'>('date');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      choices: ['SRP는 하나의 클래스는 하나의 책임만 가져야 한다는 원칙입니다.', '여러 책임을 가진 클래스는 변경의 이유가 여러 개가 되어 유지보수가 어려워집니다.'],
      explanation: 'SRP는 하나의 클래스는 하나의 책임만 가져야 한다는 원칙입니다. 여러 책임을 가진 클래스는 변경의 이유가 여러 개가 되어 유지보수가 어려워집니다.',
      wrongCount: 3,
      lastWrongAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      note: 'SRP와 OCP를 혼동하지 말자',
      isBookmarked: true
    },
    {
      id: '2',
      questionId: 'q2',
      title: '다음 중 RESTful API 설계 원칙이 아닌 것은?',
      category: '소프트웨어 개발',
      year: 2024,
      round: 1,
      number: 2,
      correctAnswer: 3,
      choices: ['RESTful API는 상태가 없는(Stateless) 통신을 사용하며, 각 요청은 독립적으로 처리되어야 합니다.', 'RESTful API는 상태가 있는(Stateful) 통신을 사용하며, 각 요청은 독립적으로 처리되어야 합니다.'],
      explanation: 'RESTful API는 상태가 없는(Stateless) 통신을 사용하며, 각 요청은 독립적으로 처리되어야 합니다.',
      wrongCount: 1,
      lastWrongAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isBookmarked: false
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
      choices: ['분기 커버리지는 모든 분기문의 true/false 경로를 테스트하는 기법입니다.', '분기 커버리지는 모든 분기문의 true/false 경로를 테스트하는 기법입니다. 문장 커버리지보다 더 엄격한 테스트 기준입니다.'],
      explanation: '분기 커버리지는 모든 분기문의 true/false 경로를 테스트하는 기법입니다. 문장 커버리지보다 더 엄격한 테스트 기준입니다.',
      wrongCount: 2,
      lastWrongAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      note: '커버리지 종류 정리 필요',
      isBookmarked: false
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

  const handleRetryQuestion = (year: number, round: number) => {
    // 해당 기출문제 회차로 이동
    router.push(`/questions/${year}/${round}`);
  };

  const handleUpdateNote = (id: string, note: string) => {
    setWrongAnswers(wrongAnswers.map(w => 
      w.id === id ? { ...w, note } : w
    ));
    setEditingNote(null);
  };

  const getWrongCountColor = (count: number) => {
    if (count >= 3) return 'bg-red-100 text-red-700';
    if (count >= 2) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleToggleBookmark = (id: string) => {
    setWrongAnswers(wrongAnswers.map(w => 
      w.id === id ? { ...w, isBookmarked: !w.isBookmarked } : w
    ));
  };

  return (
    <div className="bg-background">
      {/* 상단 고정 헤더 + 필터 영역 */}
      <div className="bg-background sticky top-0 z-10 pt-4 px-4">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">오답노트</h1>
              <p className="text-muted-foreground">틀린 문제를 다시 풀어보세요📝</p>
            </div>
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 필터 내용 */}
        {isFilterOpen && (
          <div className="px-4 py-4 border-b border-border bg-muted/20">
            {/* 카테고리 필터 */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-foreground">카테고리</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${selectedCategory === category.id ? 'text-green-500' : 'text-green'}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground"/>
                  <span className="text-sm font-medium text-foreground">정렬</span>
                </div>
                <div className="flex bg-muted/50 rounded-md p-0.5">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium ${
                      sortBy === 'date'
                        ? 'bg-black text-green-500 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortBy('count')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium ${
                      sortBy === 'count'
                        ? 'bg-black text-green-500 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    오답횟수
                  </button>
                </div>
              </div>
            </div>

            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input
                type="text"
                placeholder="문제 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="p-4">
        {/* 오답 목록 */}
        <div className="space-y-3">
          {filteredWrongAnswers.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">틀린 문제가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredWrongAnswers.map((wrong) => (
              <Card className="shadow-lg" key={wrong.id}>
                <CardContent className="px-5">
                  {/* 문제 정보 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-0">
                      <span className="text-sm font-medium text-primary">
                        {wrong.year}년 {wrong.round}회차 {wrong.number}번
                      </span>
                      <Button
                        onClick={() => handleToggleBookmark(wrong.id)}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-4 mx-1 pt-0.5"
                      >
                        <Bookmark 
                          className={`${
                            wrong.isBookmarked 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                        />
                      </Button>
                    </div>
                    <Badge variant="default" className={getWrongCountColor(wrong.wrongCount)}>
                      {wrong.wrongCount}회 틀림
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground mb-3">
                    {wrong.title}
                  </p>

                  {/* 답안 정보 */}
                  <div className="bg-white border border-zinc-200 p-3 rounded-lg mb-3">
                    <div className="flex items-center justify-start mb-3 ml-1">
                      <div className="flex space-x-1 items-center text-sm font-medium text-green-700 mr-2">
                        <CheckCircle size={18} className="pt-0.5 mr-1"/>
                        <span className="text-sm font-bold text-green-600">  {wrong.correctAnswer}번</span>
                      </div>
                      { wrong.userAnswer && (
                      <div className="flex space-x-1 items-center text-sm font-medium text-destructive mr-2">
                        <CircleX size={18} className="pt-0.5 mr-1"/>
                        <span className="text-sm font-bold text-destructive"> {wrong.userAnswer}번</span>
                      </div>
                      )}
                    </div>

                    {/* 선지들 */}
                    <div className="space-y-2">
                      {wrong.choices.map((choice, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-xs ${
                            index + 1 === wrong.correctAnswer 
                              ? 'bg-green-50 text-green-800' 
                              : index + 1 === wrong.userAnswer 
                                ? 'bg-red-50 text-red-800'
                                : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className="font-medium mr-2">{index + 1}.</span>
                          {choice}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 해설 */}
                  <div className="mb-3 px-1">
                    <h4 className="text-xs font-medium text-foreground mb-2">해설</h4>
                    <p className="text-sm text-muted-foreground rounded-lg">
                      {wrong.explanation}
                    </p>
                  </div>

                  {/* 노트 편집 */}
                  <div className="mb-3 p-1">
                    {editingNote === wrong.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={wrong.note || ''}
                          onChange={(e) => {
                            setWrongAnswers(wrongAnswers.map(w =>
                              w.id === wrong.id ? {...w, note: e.target.value} : w
                            ));
                          }}
                          placeholder="노트를 입력하세요"
                          className="resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex space-x-2 justify-end">
                          <Button
                            onClick={() => setEditingNote(null)}
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                          >
                            <XIcon className="h-4 w-4"/>
                          </Button>
                          <Button
                            onClick={() => handleUpdateNote(wrong.id, wrong.note || '')}
                            size="icon"
                            className="w-8 h-8 text-green-500"
                          >
                            <Check className="h-4 w-4"/>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {wrong.note ? (
                            <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded-lg">
                              {wrong.note}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">노트가 없습니다.</p>
                          )}
                        </div>
                        <Button
                          onClick={() => setEditingNote(wrong.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-zinc-500 hover:text-primary p-1"
                        >
                          <Edit3 className="h-4 w-4"/>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge variant="outline" className="text-xs">
                      {wrong.category}
                    </Badge>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3"/>
                        <span>{wrong.lastWrongAt.toLocaleDateString('ko-KR')}</span>
                      </div>

                      <Button
                        onClick={() => handleRetryQuestion(wrong.year, wrong.round)}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                      >
                        <RefreshCw className="h-4 w-4 mr-1"/>
                        다시 풀기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 