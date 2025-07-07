import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';

interface ServerFirebaseInstance {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

let serverFirebaseInstance: ServerFirebaseInstance | null = null;

// 서버 전용 Firebase 초기화 함수
const initializeServerFirebase = (): FirebaseApp => {
  if (!getApps().length) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    console.log('🔥 서버 Firebase 초기화 중...');
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

// 서버용 Firebase 인스턴스 가져오기 (인증 포함)
export const getServerFirebase = async (): Promise<ServerFirebaseInstance> => {
  if (serverFirebaseInstance) {
    return serverFirebaseInstance;
  }

  try {
    // Firebase 초기화
    const app = initializeServerFirebase();
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    console.log('🔥 서버 Firebase 초기화 완료');
    
    // 익명 인증
    if (!auth.currentUser) {
      const userCredential = await signInAnonymously(auth);
      console.log('🔥 서버 익명 인증 성공:', userCredential.user.uid);
    } else {
      console.log('🔥 서버 이미 인증됨:', auth.currentUser.uid);
    }
    
    // 인스턴스 캐싱
    serverFirebaseInstance = { app, db, auth };
    return serverFirebaseInstance;
    
  } catch (error) {
    console.error('🔥 서버 Firebase 초기화/인증 실패:', error);
    throw new Error(`서버 Firebase 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

// examType 유효성 검사
export const validateExamType = (examType: string): void => {
  const allowedExamTypes = ['korean_history'];
  if (!allowedExamTypes.includes(examType)) {
    throw new Error(`허용되지 않은 examType입니다: ${examType}. 허용된 타입: ${allowedExamTypes.join(', ')}`);
  }
};

// 컬렉션 이름 생성
export const getCollectionName = (baseCollection: string, examType: string): string => {
  validateExamType(examType);
  return `${baseCollection}_${examType}`;
};

// 서버 Firebase 인스턴스 리셋 (테스트용)
export const resetServerFirebase = (): void => {
  serverFirebaseInstance = null;
}; 