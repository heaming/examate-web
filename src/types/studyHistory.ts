export interface StudyHistory {
    id: number;
    questionId: string;
    solvedAt: string;
    isCorrect: boolean;
    userAnswer: number;
    correctAnswer: number;
    createdAt: string;
}