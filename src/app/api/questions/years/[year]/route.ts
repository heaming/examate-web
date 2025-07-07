import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { getServerFirebase, getCollectionName } from '@/lib/firebase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    // 통합 서버 Firebase 초기화 및 인증
    const { db } = await getServerFirebase();
    
    const year = parseInt(params.year);
    if (isNaN(year)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 연도입니다.' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType') || 'korean_history';
    
    // 특정 연도의 회차 데이터 가져오기
    const collectionName = getCollectionName('questionSets', examType);
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    const rounds: { round: number; totalQuestions: number; date: string; }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id; // 예: "2025-74"
      
      // docId에서 연도와 회차 추출
      const [yearStr, roundStr] = docId.split('-');
      const docYear = parseInt(yearStr);
      const round = parseInt(roundStr);
      
      if (docYear === year && !isNaN(round)) {
        rounds.push({
          round: round,
          totalQuestions: data.totalQuestions || 80,
          date: data.examDate || `${year}.${String(Math.floor(round/4) + 1).padStart(2, '0')}.${String((round % 4) * 3 + 1).padStart(2, '0')}`
        });
      }
    });
    
    const sortedRounds = rounds.sort((a, b) => a.round - b.round);
    
    return NextResponse.json({
      success: true,
      data: {
        year,
        rounds: sortedRounds
      }
    });
  } catch (error) {
    console.error('🔥 특정 연도 회차 데이터 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '회차 데이터를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 