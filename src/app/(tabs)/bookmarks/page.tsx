'use client';

import { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Tag
} from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">북마크</h1>
        <p className="text-gray-600">저장한 문제들을 관리하세요</p>
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

        {/* 검색 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="북마크 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 북마크 목록 */}
      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">북마크한 문제가 없습니다.</p>
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              {/* 문제 정보 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    {bookmark.year}년 {bookmark.round}회차 {bookmark.number}번
                  </span>
                  <Bookmark size={16} className="text-yellow-500" />
                </div>
                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <p className="text-sm text-gray-900 mb-3">
                {bookmark.title}
              </p>
              
              {/* 태그 */}
              {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {bookmark.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 노트 */}
              <div className="mb-3">
                {editingNote === bookmark.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={bookmark.note || ''}
                      onChange={(e) => {
                        setBookmarks(bookmarks.map(b => 
                          b.id === bookmark.id ? { ...b, note: e.target.value } : b
                        ));
                      }}
                      placeholder="노트를 입력하세요..."
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateNote(bookmark.id, bookmark.note || '')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {bookmark.note ? (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                          {bookmark.note}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">노트가 없습니다.</p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingNote(bookmark.id)}
                      className="ml-2 text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* 하단 정보 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {bookmark.category}
                </span>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{bookmark.bookmarkedAt.toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 정보 */}
      <div className="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">북마크 통계</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {bookmarks.length}
            </div>
            <div className="text-xs text-gray-500">총 북마크</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {bookmarks.filter(b => b.note).length}
            </div>
            <div className="text-xs text-gray-500">노트 작성</div>
          </div>
        </div>
      </div>
    </div>
  );
} 