import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getServerFirebase, getCollectionName } from '@/lib/firebase/server';

interface Question {
  id: string;
  year: number;
  round: number;
  subject: string;
  questionNumber: string;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  examType: string;
  tags: string[];
  questionImageUrl?: string;
  testAt: string;
  createdAt: any;
  updatedAt: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; round: string }> }
) {
  try {
    const { db } = await getServerFirebase();
    
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType') || 'korean_history';
    
    // Next.js 15에서는 params를 await해야 함
    const resolvedParams = await params;
    const year = parseInt(resolvedParams.year);
    const round = parseInt(resolvedParams.round);
    
    // 파라미터 유효성 검사
    if (isNaN(year) || isNaN(round)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '유효하지 않은 연도 또는 회차입니다.' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔥 회차별 문제 API 호출 - year:', year, 'round:', round, 'examType:', examType);
    
    // Firebase에서 해당 연도와 회차의 문제들 가져오기
    const collectionName = getCollectionName('questions', examType);
    const q = query(
      collection(db, collectionName),
      where('year', '==', year),
      where('round', '==', round),
      orderBy('questionNumber', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('🔥 Firebase 문서 개수:', querySnapshot.size);
    
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // 필요한 필드 추출 및 변환
      questions.push({
        id: doc.id,
        year: data.year,
        round: data.round,
        subject: data.subject,
        questionNumber: data.questionNumber,
        questionText: data.questionText,
        options: data.options || {},
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || '',
        difficulty: data.difficulty || 'medium',
        examType: data.examType,
        tags: data.tags || [],
        questionImageUrl: data.questionImageUrl || '',
        testAt: data.testAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    
    console.log('🔥 가져온 문제 수:', questions.length);
    
    // 문제가 없는 경우
    if (questions.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: `${year}년 ${round}회차 문제가 없습니다.`
      });
    }
    
    return NextResponse.json({
      success: true,
      data: questions,
      meta: {
        year,
        round,
        examType,
        totalQuestions: questions.length
      }
    });
    
  } catch (error) {
    console.error('🔥 회차별 문제 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '문제를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 