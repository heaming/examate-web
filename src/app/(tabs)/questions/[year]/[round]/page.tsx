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
import {useRoundQuestions, RoundQuestion, RoundQuestionPageData} from '@/hooks/useRoundQuestions';
import RoundQuestionsPageSkeleton from '@/components/RoundQuestionsPageSkeleton';
import {useBookmarks} from "@/hooks/useBookmarks";
import {removeBookmark, StudyHistory} from "@/lib/native";

interface Question {
  id: string;
  number: number;
  category: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: number;
  isSolved: boolean;
  isCorrect?: boolean;
  userAnswer?: number;
  timeSpent?: number; // 분 단위
}

export default function RoundQuestionsPage() {
  const params = useParams();
  const year = Number(params.year);
  const round = Number(params.round);

  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isGraded, setIsGraded] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  const { addBookmark, deleteBookmark } = useBookmarks();
  const {
    questions: roundQuestions,
    loading: isLoading,
    error: loadingError,
    meta,
    saveStudyHistory
  } = useRoundQuestions(year, round, 'korean_history');

  useEffect(() => {
    if (roundQuestions.length > 0) {
      const savedAnswers: { [key: number]: number } = {};

      roundQuestions.forEach(question => {
        if (question.userAnswer !== null && question.userAnswer !== undefined) {
          const numberMatch = question.questionNumber.match(/(\d+)$/);
          const questionNum = numberMatch ? parseInt(numberMatch[1]) : 1;
          savedAnswers[questionNum] = question.userAnswer;
        }
      });

      if (Object.keys(savedAnswers).length > 0) {
        setUserAnswers(savedAnswers);
      }
    }
  }, [roundQuestions.length]);

  const getQuestionNumber = (questionNumber: string): number => {
    const numberMatch = questionNumber.match(/(\d+)$/);
    return numberMatch ? parseInt(numberMatch[1]) : 1;
  };

  const convertToUIQuestion = (roundQuestion: RoundQuestion): Question => {
    const optionsArray = [
      `① ${roundQuestion.options['1'] || ''}`,
      `② ${roundQuestion.options['2'] || ''}`,
      `③ ${roundQuestion.options['3'] || ''}`,
      `④ ${roundQuestion.options['4'] || ''}`,
      `⑤ ${roundQuestion.options['5'] || ''}`,
    ];

    const numberMatch = roundQuestion.questionNumber.match(/(\d+)$/);
    const questionNum = numberMatch ? parseInt(numberMatch[1]) : 1;

    return {
      id: roundQuestion.id,
      number: questionNum,
      category: roundQuestion.subject,
      title: roundQuestion.questionText,
      difficulty: roundQuestion.difficulty as 'easy' | 'medium' | 'hard',
      options: optionsArray,
      correctAnswer: roundQuestion.correctAnswer,
      isSolved: false,
      isCorrect: undefined,
      userAnswer: undefined,
      timeSpent: undefined
    };
  };

  useEffect(() => {
    if (roundQuestions.length > 0) {
      const convertedQuestions = roundQuestions.map(convertToUIQuestion);
      setQuestions(convertedQuestions);
    }
  }, [roundQuestions]);

  useEffect(() => {
    if (year && round) {
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
  const correctAnswers = questions.filter(q => q.isCorrect);
  const accuracy = isGraded && questions.length > 0 ? (correctAnswers.length / questions.length) * 100 : 0;

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
    if (!isGraded) {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
    
    if (!question.isSolved) {
      return <Circle className="h-4 w-4 text-gray-400" />;
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

  const handleGrade = async () => {
    setIsGraded(true);

    // StudyHistory 생성
    const histories: StudyHistory[] = [];

    roundQuestions.forEach(question => {
      const questionNum = getQuestionNumber(question.questionNumber);
      const userAnswer = userAnswers[questionNum];

      if (userAnswer !== undefined) {
        histories.push({
          questionId: question.id,
          year: question.year,
          round: question.round,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer,
          solvedAt: new Date().toISOString()
        });
      }
    });

    // 학습 이력 저장
    if (histories.length > 0) {
      try {
        await saveStudyHistory(histories);
        toast.success('채점 결과가 저장되었습니다');
      } catch (error) {
        toast.error('채점 결과 저장에 실패했습니다');
      }
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setIsGraded(false);
    setShowAnswers({});
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

  const handleSave = async () => {
    // StudyHistory 생성 (임시 저장용)
    const histories: StudyHistory[] = [];

    roundQuestions.forEach(question => {
      const questionNum = getQuestionNumber(question.questionNumber);
      const userAnswer = userAnswers[questionNum];

      if (userAnswer !== undefined) {
        histories.push({
          questionId: question.id,
          year: question.year,
          round: question.round,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: null, // 아직 채점하지 않음
          solvedAt: new Date().toISOString()
        });
      }
    });

    if (histories.length > 0) {
      try {
        await saveStudyHistory(histories);
        toast.success('저장되었습니다. 다음에 이어서 풀 수 있어요!');
      } catch (error) {
        toast.error('저장에 실패했습니다');
      }
    }
  };

  const handleBookmark = async (question: RoundQuestionPageData) => {
    try {
      if (question.isBookmarked) {
        if (question.bookmarkId) {
          await deleteBookmark(question.bookmarkId);
          toast.success('북마크가 삭제되었습니다');
        }
      } else {
        const request = {
          questionId: question.id,
          year: question.year,
          round: question.round,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          questionImageUrl: question.questionImageUrl || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          tags: question.tags || []
        };
        await addBookmark(request);
        toast.success('북마크가 추가되었습니다');
      }
    } catch (error) {
      toast.error('북마크 처리 중 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return <RoundQuestionsPageSkeleton year={year} round={round} />;
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-foreground mb-2">문제를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">{loadingError}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              다시 시도
            </Button>
            <Link href="/questions">
              <Button variant="default">
                문제 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (roundQuestions.length === 0 && !isLoading) {
    return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-foreground mb-2">문제가 없습니다</h2>
            <p className="text-muted-foreground mb-4">
              {year}년 {round}회차 문제를 찾을 수 없습니다.
            </p>
            <Link href="/questions">
              <Button variant="default">
                문제 목록으로 돌아가기
              </Button>
            </Link>
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
            <p className="text-muted-foreground">총 {roundQuestions.length}문제</p>
          </div>
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-6">
        {roundQuestions.map((question) => (
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
                    {isGraded && (
                        <Badge className={`${
                            !question.isSolved
                                ? "bg-black text-white"
                                : question.isCorrect
                                    ? "text-green-500"
                                    : "text-rose-400"
                        } text-xs`}>
                          {!question.isSolved ? '미풀이' : question.isCorrect ? '정답' : '오답'}
                        </Badge>
                    )}
                  </div>
                </div>
                {/* 북마크 버튼 */}
                <button
                    onClick={() => handleBookmark(question.questionNumber)}
                    className="ml-2 rounded-full hover:bg-yellow-100 transition-colors"
                    aria-label="북마크"
                >
                  {isBookmarked(question.id) ? (
                      <BookmarkFilled className="h-5 w-5 text-yellow-400 fill-yellow-400"/>
                  ) : (
                      <Bookmark className="h-5 w-5 text-zinc-300"/>
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
                      <div className="text-sm text-blue-900 font-semibold">
                        {['①', '②', '③', '④', '⑤'][question.correctAnswer]}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">해설</h4>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {roundQuestions.find(rq => rq.id === question.id)?.explanation ||
                         `${year}년 ${round}회차 ${question.number}번 문제의 해설입니다.`}
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
                    setQuestions(prev => prev.map(question => ({
                      ...question,
                      isSolved: false,
                      isCorrect: undefined,
                      userAnswer: undefined
                    })));
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

/*
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  RotateCcw,
  Eye,
  X,
  Save,
  Bookmark,
  Bookmark as BookmarkFilled
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useRoundQuestions, RoundQuestionPageData } from '@/hooks/useRoundQuestions';
import RoundQuestionsPageSkeleton from '@/components/RoundQuestionsPageSkeleton';
import { useBookmarks } from "@/hooks/useBookmarks";
import { StudyHistory } from '@/lib/native';

export default function RoundQuestionsPage() {
  const params = useParams();
  const year = Number(params.year);
  const round = Number(params.round);

  // 로컬 상태
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isGraded, setIsGraded] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  // 훅 사용
  const { addBookmark, deleteBookmark } = useBookmarks();
  const {
    questions: roundQuestions,
    loading: isLoading,
    error: loadingError,
    meta,
    saveStudyHistory
  } = useRoundQuestions(year, round, 'korean_history');

  // 저장된 답안을 userAnswers 상태로 동기화 (무한 루프 방지)
  useEffect(() => {
    if (roundQuestions.length > 0) {
      const savedAnswers: { [key: number]: number } = {};

      roundQuestions.forEach(question => {
        if (question.userAnswer !== null && question.userAnswer !== undefined) {
          const numberMatch = question.questionNumber.match(/(\d+)$/);
          const questionNum = numberMatch ? parseInt(numberMatch[1]) : 1;
          savedAnswers[questionNum] = question.userAnswer;
        }
      });

      if (Object.keys(savedAnswers).length > 0) {
        setUserAnswers(savedAnswers);
      }
    }
  }, [roundQuestions.length]); // 길이로만 의존성 체크하여 무한 루프 방지

  // 문제 번호 추출 함수
  const getQuestionNumber = (questionNumber: string): number => {
    const numberMatch = questionNumber.match(/(\d+)$/);
    return numberMatch ? parseInt(numberMatch[1]) : 1;
  };

  // 통계 계산
  const solvedQuestions = roundQuestions.filter(q => q.isCorrect !== null);
  const correctAnswers = roundQuestions.filter(q => q.isCorrect === true);
  const accuracy = isGraded && roundQuestions.length > 0 ?
    (correctAnswers.length / roundQuestions.length) * 100 : 0;

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

  const getStatusIcon = (question: RoundQuestionPageData) => {
    if (!isGraded) {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }

    if (question.isCorrect === null) {
      return <Circle className="h-4 w-4 text-gray-400" />;
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

  const handleGrade = async () => {
    setIsGraded(true);

    // StudyHistory 생성
    const histories: StudyHistory[] = [];

    roundQuestions.forEach(question => {
      const questionNum = getQuestionNumber(question.questionNumber);
      const userAnswer = userAnswers[questionNum];

      if (userAnswer !== undefined) {
        histories.push({
          questionId: question.id,
          year: question.year,
          round: question.round,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer,
          solvedAt: new Date().toISOString()
        });
      }
    });

    // 학습 이력 저장
    if (histories.length > 0) {
      try {
        await saveStudyHistory(histories);
        toast.success('채점 결과가 저장되었습니다');
      } catch (error) {
        toast.error('채점 결과 저장에 실패했습니다');
      }
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setIsGraded(false);
    setShowAnswers({});
  };

  const toggleAnswer = (questionNumber: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionNumber]: !prev[questionNumber]
    }));
  };

  const getOptionStyle = (question: RoundQuestionPageData, optionIndex: number) => {
    if (!isGraded) return '';

    const questionNum = getQuestionNumber(question.questionNumber);

    if (optionIndex === question.correctAnswer) {
      return 'bg-green-50 border-green-200';
    }
    if (userAnswers[questionNum] === optionIndex && optionIndex !== question.correctAnswer) {
      return 'bg-red-50 border-red-200';
    }
    return '';
  };

  const handleSave = async () => {
    // StudyHistory 생성 (임시 저장용)
    const histories: StudyHistory[] = [];

    roundQuestions.forEach(question => {
      const questionNum = getQuestionNumber(question.questionNumber);
      const userAnswer = userAnswers[questionNum];

      if (userAnswer !== undefined) {
        histories.push({
          questionId: question.id,
          year: question.year,
          round: question.round,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: null, // 아직 채점하지 않음
          solvedAt: new Date().toISOString()
        });
      }
    });

    if (histories.length > 0) {
      try {
        await saveStudyHistory(histories);
        toast.success('저장되었습니다. 다음에 이어서 풀 수 있어요!');
      } catch (error) {
        toast.error('저장에 실패했습니다');
      }
    }
  };

  const handleBookmark = async (question: RoundQuestionPageData) => {
    try {
      if (question.isBookmarked) {
        if (question.bookmarkId) {
          await deleteBookmark(question.bookmarkId);
          toast.success('북마크가 삭제되었습니다');
        }
      } else {
        const request = {
          questionId: question.id,
          year: question.year,
          round: question.round,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          questionImageUrl: question.questionImageUrl || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          tags: question.tags || []
        };
        await addBookmark(request);
        toast.success('북마크가 추가되었습니다');
      }
    } catch (error) {
      toast.error('북마크 처리 중 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return <RoundQuestionsPageSkeleton year={year} round={round} />;
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-foreground mb-2">문제를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">{loadingError}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              다시 시도
            </Button>
            <Link href="/questions">
              <Button variant="default">
                문제 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (roundQuestions.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-foreground mb-2">문제가 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            {year}년 {round}회차 문제를 찾을 수 없습니다.
          </p>
          <Link href="/questions">
            <Button variant="default">
              문제 목록으로 돌아가기
            </Button>
          </Link>
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
      <p className="text-muted-foreground">총 {roundQuestions.length}문제</p>
    </div>
  </div>
</div>

{/* 문제 목록 */}
<div className="space-y-6">
  {roundQuestions.map((question) => {
    const questionNum = getQuestionNumber(question.questionNumber);

    return (
        <Card
            key={question.id}
            className={`shadow-md hover:shadow-lg transition-shadow py-2 ${
                selectedQuestion === questionNum ? 'ring-2 ring-primary' : ''
            }`}
        >
          <CardContent className="p-6 pb-4">
            {/* 문제 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(question)}
                <div className="flex items-center justify-between space-x-2">
                      <span className="text-md font-medium text-gray-500">
                        {questionNum}번
                      </span>
                  {isGraded && (
                      <Badge className={`${
                          question.isCorrect === null
                              ? "bg-black text-white"
                              : question.isCorrect
                                  ? "text-green-500"
                                  : "text-rose-400"
                      } text-xs`}>
                        {question.isCorrect === null ? '미풀이' : question.isCorrect ? '정답' : '오답'}
                      </Badge>
                  )}
                </div>
              </div>

              {/* 북마크 버튼 */}
              <button
                  onClick={() => handleBookmark(question)}
                  className="ml-2 rounded-full hover:bg-yellow-100 transition-colors"
                  aria-label="북마크"
              >
                {question.isBookmarked ? (
                    <BookmarkFilled className="h-5 w-5 text-yellow-400 fill-yellow-400"/>
                ) : (
                    <Bookmark className="h-5 w-5 text-zinc-300"/>
                )}
              </button>
            </div>

            {/* 문제 제목 */}
            <p className="text-sm text-foreground mb-6 mx-0.5">
              {question.questionText}
            </p>

            {/* 객관식 보기 */}
            <div className="mb-4">
              <RadioGroup
                  value={userAnswers[questionNum]?.toString() || ''}
                  onValueChange={(value: string) => handleAnswerSelect(questionNum, parseInt(value))}
                  disabled={isGraded}
              >
                {question.formattedOptions.map((option, index) => (
                    <div
                        key={index}
                        className={`flex items-center space-x-2 p-3 border rounded-lg mb-2 ${getOptionStyle(question, index + 1)}`}
                    >
                      <RadioGroupItem value={(index + 1).toString()} id={`${question.id}-${index}`}/>
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
                {question.subject}
              </Badge>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAnswer(questionNum)}
                  className="text-blue-600 hover:text-blue-700 bg-white"
              >
                {showAnswers[questionNum] ? (
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
            {showAnswers[questionNum] && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">정답</h4>
                    <div className="text-sm text-blue-900 font-semibold">
                      {['①', '②', '③', '④', '⑤'][question.correctAnswer - 1]}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">해설</h4>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {question.explanation || `${year}년 ${round}회차 ${questionNum}번 문제의 해설입니다.`}
                    </p>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
    );
  })}
</div>

{/* 채점하기 영역 */}
<Card className="mt-6 shadow-lg">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-lg font-semibold">문제 현황</CardTitle>
    {isGraded ? (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="bg-zinc-600 text-sm font-medium text-white hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4 mr-2"/>
          전체 다시 풀기
        </Button>
    ) : (
        <Button
            size="sm"
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
        <div className="text-lg font-bold text-primary">{roundQuestions.length}</div>
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
 */