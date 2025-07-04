'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  RotateCcw,
  Eye,
  X, ArrowRight, CircleX, Save, Bookmark, Bookmark as BookmarkFilled
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface Question {
  id: string;
  number: number;
  category: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3 (4지선다)
  isSolved: boolean;
  isCorrect?: boolean;
  userAnswer?: number;
  timeSpent?: number; // 분 단위
}

export default function RoundQuestionsPage() {
  const params = useParams();
  const year = params.year as string;
  const round = params.round as string;
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isGraded, setIsGraded] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState<{ [key: number]: boolean }>({});

  // 모의 문제 데이터 생성 (10개)
  const generateMockQuestions = (): Question[] => {
    const questions: Question[] = [];
    const categories = [
      '소프트웨어 설계',
      '소프트웨어 개발', 
      '소프트웨어 테스트',
      '소프트웨어 배포',
      '소프트웨어 유지보수'
    ];
    
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (let i = 1; i <= 10; i++) {
      const isSolved = Math.random() > 0.7; // 30% 확률로 풀이완료
      const correctAnswer = Math.floor(Math.random() * 4);
      
      questions.push({
        id: `${year}-${round}-${i}`,
        number: i,
        category: categories[Math.floor(Math.random() * categories.length)],
        title: `${year}년 ${round}회차 ${i}번 문제입니다. 이는 ${categories[Math.floor(Math.random() * categories.length)]} 영역의 문제로, 실제 시험에서는 다양한 주제가 출제됩니다.`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        options: [
          `① ${year}년 ${round}회차 ${i}번 문제의 첫 번째 보기입니다.`,
          `② ${year}년 ${round}회차 ${i}번 문제의 두 번째 보기입니다.`,
          `③ ${year}년 ${round}회차 ${i}번 문제의 세 번째 보기입니다.`,
          `④ ${year}년 ${round}회차 ${i}번 문제의 네 번째 보기입니다.`
        ],
        correctAnswer,
        isSolved,
        isCorrect: isSolved ? Math.random() > 0.2 : undefined, // 80% 확률로 정답
        userAnswer: isSolved ? Math.floor(Math.random() * 4) : undefined,
        timeSpent: isSolved ? Math.floor(Math.random() * 5) + 1 : undefined
      });
    }
    
    return questions;
  };

  useEffect(() => {
    if (year && round) {
      setQuestions(generateMockQuestions());
      setIsLoading(false);
      // 저장된 답안 불러오기
      const saved = localStorage.getItem(`answers-${year}-${round}`);
      if (saved) {
        setUserAnswers(JSON.parse(saved));
      }
      // 저장된 북마크 불러오기
      const bm = localStorage.getItem(`bookmarks-${year}-${round}`);
      if (bm) {
        setBookmarked(JSON.parse(bm));
      }
    }
  }, [year, round]);
  
  const solvedQuestions = questions.filter(q => q.isSolved);
  const correctAnswers = questions.filter(q => q.isSolved && q.isCorrect);
  const accuracy = solvedQuestions.length > 0 ? (correctAnswers.length / solvedQuestions.length) * 100 : 0;

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

  const getStatusIcon = (question: Question) => {
    if (!question.isSolved) {
      return <CircleX className="h-4 w-4 text-rose-500" />;
    }
    return question.isCorrect ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold">×</span>
      </div>;
  };

  const handleAnswerSelect = (questionNumber: number, answer: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleGrade = () => {
    setIsGraded(true);
    // 실제로는 여기서 서버에 답안을 제출하고 결과를 받아옵니다
  };

  const handleRetry = (questionNumber: number) => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionNumber];
      return newAnswers;
    });
    setIsGraded(false);
  };

  const toggleAnswer = (questionNumber: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionNumber]: !prev[questionNumber]
    }));
  };

  const getOptionStyle = (question: Question, optionIndex: number) => {
    if (!isGraded) return '';
    
    if (optionIndex === question.correctAnswer) {
      return 'bg-green-50 border-green-200';
    }
    if (userAnswers[question.number] === optionIndex && optionIndex !== question.correctAnswer) {
      return 'bg-red-50 border-red-200';
    }
    return '';
  };

  const handleSave = () => {
    localStorage.setItem(`answers-${year}-${round}` , JSON.stringify(userAnswers));
    toast.success('저장되었습니다. 다음에 이어서 풀 수 있어요!');
  };

  const handleBookmark = (questionNumber: number) => {
    setBookmarked(prev => {
      const newState = { ...prev, [questionNumber]: !prev[questionNumber] };
      localStorage.setItem(`bookmarks-${year}-${round}`, JSON.stringify(newState));
      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Toaster position="bottom-center" toastOptions={{
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          fontSize: '13px',
          padding: '12px 18px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          marginBottom: '60px',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#fff',
        },
      }} />
      {/* 저장하기 플로팅 버튼 */}
      <button
        onClick={handleSave}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-zinc-200 hover:bg-green-50 transition-colors group"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
        aria-label="풀이 저장"
      >
        <Save className="h-5 w-5 text-zinc-400 group-hover:text-green-500 transition-colors" />
      </button>

      {/* 상단 뒤로가기 버튼 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/questions">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {year}년 {round}회차
            </h1>
            <p className="text-muted-foreground">총 {questions.length}문제</p>
          </div>
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-6">
        {questions.map((question) => (
          <Card 
            key={question.id} 
            className={`shadow-md hover:shadow-lg transition-shadow py-2 ${
              selectedQuestion === question.number ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-6 pb-4">
              {/* 문제 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(question)}
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-md font-medium text-gray-500">
                      {question.number}번
                    </span>
                    <Badge className={`${question.isCorrect ? "text-green-500" : "text-rose-400"} text-xs`}>
                      {question.isCorrect ? '정답' : '오답'}
                    </Badge>
                  </div>
                </div>
                {/* 북마크 버튼 */}
                <button
                  onClick={() => handleBookmark(question.number)}
                  className="ml-2 rounded-full hover:bg-yellow-100 transition-colors"
                  aria-label="북마크"
                >
                  {bookmarked[question.number] ? (
                    <BookmarkFilled className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-zinc-300" />
                  )}
                </button>
              </div>

              {/* 문제 제목 */}
              <p className="text-sm text-foreground mb-6 mx-0.5">
                {question.title}
              </p>

              {/* 객관식 보기 */}
              <div className="mb-4">
                <RadioGroup
                    value={userAnswers[question.number]?.toString() || ''}
                    onValueChange={(value: string) => handleAnswerSelect(question.number, parseInt(value))}
                    disabled={isGraded}
                >
                  {question.options.map((option, index) => (
                      <div
                          key={index}
                          className={`flex items-center space-x-2 p-3 border rounded-lg mb-2 ${getOptionStyle(question, index)}`}
                      >
                        <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`}/>
                        <Label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                          {option}
                        </Label>
                      </div>
                  ))}
                </RadioGroup>
              </div>

              {/* 카테고리 및 정답보기 버튼 */}
              <div className="flex items-center justify-between">
                <Badge className="text-xs bg-zinc-200 text-zinc-800">
                  {question.category}
                </Badge>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAnswer(question.number)}
                    className="text-blue-600 hover:text-blue-700 bg-white"
                >
                  {showAnswers[question.number] ? (
                      <>
                        <X className="h-3 w-3 mr-1"/>
                        닫기
                      </>
                  ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1"/>
                        정답보기
                      </>
                  )}
                </Button>
              </div>

              {/* 정답 및 해설 */}
              {showAnswers[question.number] && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">정답</h4>
                      <div className="text-sm text-blue-900">
                        {question.options[question.correctAnswer]}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">해설</h4>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {year}년 {round}회차 {question.number}번 문제의 해설입니다.
                        이 문제는 {question.category} 영역에서 출제되었으며,
                        {question.difficulty === 'easy' ? '기본적인 개념을 묻는 쉬운 문제' :
                            question.difficulty === 'medium' ? '적용 능력을 묻는 보통 난이도의 문제' :
                                '종합적인 이해를 묻는 어려운 문제'}입니다.
                        정답을 선택한 이유와 각 보기가 틀린 이유에 대해 자세히 설명드립니다.
                      </p>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 채점하기 영역 */}
      <Card className="mt-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">문제 현황</CardTitle>
          {isGraded ? (
              <Button
                  variant="outline"
                  size={"sm"}
                  onClick={() => {
                    setUserAnswers({});
                    setIsGraded(false);
                    setShowAnswers({});
                  }}
                  className="bg-zinc-600 text-sm font-medium text-white hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4 mr-2"/>
                전체 다시 풀기
              </Button>
          ) : (
              <Button
                  size={"sm"}
                  className="bg-primary text-sm font-medium text-green-400 hover:bg-primary/90 disabled:bg-zinc-600 disabled:text-white"
                  onClick={handleGrade}
                  disabled={isGraded || Object.keys(userAnswers).length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2"/>
                채점하기
              </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-100 rounded-lg p-3">
              <div className="text-lg font-bold text-primary">{questions.length}</div>
              <div className="text-xs text-muted-foreground">총 문제</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">{correctAnswers.length}</div>
              <div className="text-xs text-muted-foreground">정답</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-lg font-bold text-orange-600">
                {solvedQuestions.length > 0 ? Math.round(accuracy) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">정답률</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 