'use client';

import {useMemo, useState} from 'react';
import {
  Bookmark,
  Search,
  Filter,
  Edit3,
  Calendar,
  XIcon,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {useBookmarks} from "@/hooks/useBookmarks";
import {showToast} from "@/components/ui/CustomToaster";

export default function BookmarksPage() {
  const {
    bookmarks,
    totalCount,
    loading,
    error,
    refreshBookmarks,
    addBookmark,
    deleteBookmark,
    editBookmark,
    isBookmarked
  } = useBookmarks();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingNoteValue, setEditingNoteValue] = useState<string>('');

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [bookmarks]);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const tagMatch = selectedTags.length === 0 ||
        selectedTags.some(tag => bookmark.tags?.includes(tag));

    const searchMatch = bookmark.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.note?.toLowerCase().includes(searchQuery.toLowerCase());

    return tagMatch && searchMatch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
        prev.includes(tag)
            ? prev.filter(t => t !== tag)
            : [...prev, tag]
    );
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
    } catch (e) {
      showToast.error("삭제에 실패했습니다 😥");
    }
  };

  const handleUpdateNote = async (id: string, note: string) => {
    setEditingNote(null);
    try {
      await editBookmark(id, { note });
    } catch (e) {
      showToast.error("저장에 실패했습니다 😥");
      setEditingNote(id); // 편집 모드 다시 활성화
    }
  };

  return (
    <div className="bg-background">
      {/* 상단 고정 헤더 + 필터 영역 */}
      <div className="bg-background sticky top-0 z-10 pt-4 px-4">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">북마크</h1>
              <p className="text-muted-foreground">저장한 문제를 다시 확인해보세요⭐</p>
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
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">카테고리</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {tags.map((tag) => (
                    <Button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        className={`transition-none whitespace-nowrap ${
                            selectedTags.includes(tag) ? 'text-green-500' : 'text-green'
                        }`}
                    >
                      {tag}
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
          </div>
        )}
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="p-4">
        {/* 북마크 목록 */}
        <div className="space-y-3">
          {filteredBookmarks.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">북마크한 문제가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <Card className="shadow-lg" key={bookmark.id}>
                <CardContent className="px-5">
                  {/* 문제 정보 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary">
                        {bookmark.year}년 {bookmark.round}회차 {bookmark.questionNumber}번
                      </span>
                      <Bookmark className="h-5 w-4 text-yellow-400 pt-0.5 fill-yellow-400"/>
                    </div>
                    <Button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive items-start mt-1"
                    >
                      <XIcon className="h-4 w-4"/>
                    </Button>
                  </div>

                  <p className="text-sm text-foreground mb-3">
                    Q. {bookmark.questionText}
                  </p>
                  {bookmark.explanation && (
                    <p className="text-sm text-zinc-600 mb-3">
                    A. {bookmark.explanation}
                    </p>
                  )}

                  {/* 노트 */}
                  <div className="mb-3">
                    {editingNote === bookmark.id ? (
                        <div className="space-y-2">
                          <Textarea
                              value={editingNoteValue}
                              onChange={(e) => setEditingNoteValue(e.target.value)}
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
                              <XIcon/>
                            </Button>
                            <Button
                                onClick={() => handleUpdateNote(bookmark.id, editingNoteValue)}
                                size="icon"
                                className="w-8 h-8 text-green-500"
                            >
                              <Check/>
                            </Button>
                          </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {bookmark.note ? (
                                <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                                  {bookmark.note}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">노트가 없습니다.</p>
                            )}
                          </div>
                          <Button
                              onClick={() => setEditingNote(bookmark.id)}
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
                    { bookmark.tags && bookmark.tags.length > 0 &&
                        bookmark.tags.map(tag => (
                            <Badge
                                key={`${bookmark}-${tag}`}
                                variant="outline"
                                className="text-xs"
                            >
                              {tag}
                            </Badge>
                        ))

                    }

                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3"/>
                      <span>{bookmark.bookmarkedAt}</span>
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