export interface Question {
  id: string;
  year: number;
  round: number;
  examType: string;
  subject: string;
  questionNumber: string;
  questionText: string;
  options: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  correctAnswer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  questionImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionSet {
  id: string;
  year: number;
  round: number;
  examType: string;
  totalQuestions: number;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  questionId: string;
  isCorrect: boolean;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  timeSpent?: number; // 초 단위
  answeredAt: Date;
}

export interface ExamStats {
  year: number;
  round: number;
  examType: string;
  totalQuestions: number;
  solvedQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

export interface RecentQuestion {
  id: number;
  questionId: string;
  solvedAt: string;
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  year: number;
  round: number;
  examType: string;
  subject: string;
  questionNumber: string;
  questionText: string;
  options: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  questionImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}