'use client';

import { useState } from 'react';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Tag, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {Question} from "@/app/(tabs)/questions/page";

interface BookmarkedQuestion {
  id: string;
  questionId: string;
  title: string;
  category: string;
  year: number;
  round: number;
  number: number;
  note?: string;
  tags: string[];
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'software', name: '소프트웨어 설계' },
    { id: 'development', name: '소프트웨어 개발' },
    { id: 'testing', name: '소프트웨어 테스트' },
    { id: 'deployment', name: '소프트웨어 배포' },
    { id: 'maintenance', name: '소프트웨어 유지보수' },
  ];

  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([
    {
      id: '1',
      questionId: 'q1',
      title: '객체지향 설계 원칙 중 단일 책임 원칙(SRP)에 대한 설명으로 옳은 것은?',
      category: '소프트웨어 설계',
      year: 2024,
      round: 1,
      number: 1,
      note: 'SRP는 하나의 클래스는 하나의 책임만 가져야 한다는 원칙이다.',
      tags: ['객체지향', '설계원칙', '중요'],
      bookmarkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      questionId: 'q2',
      title: '다음 중 RESTful API 설계 원칙이 아닌 것은?',
      category: '소프트웨어 개발',
      year: 2024,
      round: 1,
      number: 2,
      tags: ['API', 'REST'],
      bookmarkedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      questionId: 'q3',
      title: '화이트박스 테스트 기법 중 분기 커버리지(Branch Coverage)에 대한 설명으로 옳은 것은?',
      category: '소프트웨어 테스트',
      year: 2023,
      round: 3,
      number: 15,
      note: '분기 커버리지는 모든 분기문의 true/false 경로를 테스트하는 기법이다.',
      tags: ['테스트', '화이트박스', '커버리지'],
      bookmarkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]);

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

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const categoryMatch = selectedCategory === 'all' || 
      bookmark.category === categories.find(c => c.id === selectedCategory)?.name;
    const searchMatch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.note?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const handleUpdateNote = (id: string, note: string) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, note } : b
    ));
    setEditingNote(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">북마크</h1>
        <p className="text-muted-foreground">저장한 문제들을 관리하세요</p>
      </div>

      {/* 필터 섹션 */}
      <Card className="mb-6 shadow-md">
        <CardContent className="px-4">
          {/* 카테고리 필터 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">카테고리</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={`transition-none whitespace-nowrap ${selectedCategory === category.id ? 'text-green-500': 'text-green'}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="문제 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 북마크 목록 */}
      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">북마크한 문제가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardContent className="p-4">
                {/* 문제 정보 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-primary">
                      {bookmark.year}년 {bookmark.round}회차 {bookmark.number}번
                    </span>
                    <Bookmark className="h-4 w-4 text-yellow-500" />
                  </div>
                  <Button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-foreground mb-3">
                  {bookmark.title}
                </p>
                
                {/* 태그 */}
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {bookmark.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* 노트 */}
                <div className="mb-3">
                  {editingNote === bookmark.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={bookmark.note || ''}
                        onChange={(e) => {
                          setBookmarks(bookmarks.map(b => 
                            b.id === bookmark.id ? { ...b, note: e.target.value } : b
                          ));
                        }}
                        placeholder="노트를 입력하세요..."
                        className="resize-none"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleUpdateNote(bookmark.id, bookmark.note || '')}
                          size="sm"
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => setEditingNote(null)}
                          variant="outline"
                          size="sm"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {bookmark.note ? (
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                            {bookmark.note}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">노트가 없습니다.</p>
                        )}
                      </div>
                      <Button
                        onClick={() => setEditingNote(bookmark.id)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-primary hover:text-primary p-1"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* 하단 정보 */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Badge variant="outline" className="text-xs">
                    {bookmark.category}
                  </Badge>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{bookmark.bookmarkedAt.toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 문제 목록 */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">해당 조건의 문제가 없습니다.</p>
              </CardContent>
            </Card>
        ) : (
            filteredQuestions.map((question) => (
                <Card className="shadow-lg" key={question.id}>
                  <CardContent className="px-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          {question.year}년 {question.round}회차 {question.number}번
                        </span>
                        <Badge className={`${question.isCorrect ? "text-green-500" : "text-rose-400"} text-xs`}>
                          {question.isCorrect ? '정답' : '오답'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-3 line-clamp-2">
                      {question.title}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge className="text-xs bg-zinc-200 text-zinc-800">
                        {question.category}
                      </Badge>

                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-500 hover:bg-white">
                        문제 풀기 →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            ))
        )}
      </div>

      {/* 통계 정보 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">북마크 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {bookmarks.length}
              </div>
              <div className="text-xs text-muted-foreground">총 북마크</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {bookmarks.filter(b => b.note).length}
              </div>
              <div className="text-xs text-muted-foreground">노트 작성</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 