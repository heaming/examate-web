import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getServerFirebase, getCollectionName } from '@/lib/firebase/server';

interface RoundData {
  round: number;
  totalQuestions: number;
  date: string;
}

interface YearData {
  year: number;
  rounds: RoundData[];
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await getServerFirebase();
    
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType') || 'korean_history';
    
    console.log('🔥 API 호출 - examType:', examType);
    
    // Firebase에서 복합 쿼리로 정렬된 데이터 가져오기
    const collectionName = getCollectionName('questionSets', examType);
    const q = query(
      collection(db, collectionName),
      orderBy('year', 'desc'),    // 연도 내림차순 (최신 연도 먼저)
      orderBy('round', 'desc')    // 회차 내림차순 (최신 회차 먼저)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('🔥 Firebase 문서 개수:', querySnapshot.size);
    
    // Firebase 정렬 순서를 유지하면서 연도별 그룹화
    const yearsData: YearData[] = [];
    let currentYear: number | null = null;
    let currentRounds: RoundData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // 필요한 필드만 추출
      const { year, round, totalQuestions, date } = data;
      
      // 유효성 검사
      if (typeof year !== 'number' || typeof round !== 'number') {
        console.warn('🔥 유효하지 않은 데이터:', { year, round, docId: doc.id });
        return;
      }
      
      // 연도가 바뀌면 이전 연도 데이터를 저장하고 새로운 연도 시작
      if (currentYear !== year) {
        if (currentYear !== null) {
          yearsData.push({
            year: currentYear,
            rounds: currentRounds
          });
        }
        currentYear = year;
        currentRounds = [];
      }
      
      // 현재 회차 데이터 추가
      currentRounds.push({
        round,
        totalQuestions: totalQuestions || 50,
        date: date || `${year}-01-01` // 기본 날짜
      });
    });
    
    // 마지막 연도 데이터 저장
    if (currentYear !== null) {
      yearsData.push({
        year: currentYear,
        rounds: currentRounds  // Firebase orderBy로 이미 정렬됨
      });
    }
    
    console.log('🔥 최종 결과:', yearsData);
    
    return NextResponse.json({
      success: true,
      data: yearsData
    });
    
  } catch (error) {
    console.error('🔥 연도별 회차 데이터 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '연도별 회차 데이터를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 