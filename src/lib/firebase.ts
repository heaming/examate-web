import {initializeApp, getApps, getApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

let app: any;
let db: any;
let auth: any;

export function initializeFirebase() {
  if (typeof window === 'undefined') return;

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  };

  // 환경변수 로드 상태 확인
  console.log('Firebase 환경변수 확인:', {
    apiKey: firebaseConfig.apiKey ? '✓ 로드됨' : '✗ 누락',
    authDomain: firebaseConfig.authDomain ? '✓ 로드됨' : '✗ 누락',
    projectId: firebaseConfig.projectId ? '✓ 로드됨' : '✗ 누락',
    storageBucket: firebaseConfig.storageBucket ? '✓ 로드됨' : '✗ 누락',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓ 로드됨' : '✗ 누락',
    appId: firebaseConfig.appId ? '✓ 로드됨' : '✗ 누락',
    measurementId: firebaseConfig.measurementId ? '✓ 로드됨' : '✗ 누락'
  });

  // 필수 환경변수 확인
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase 필수 환경변수가 누락되었습니다:', missingFields);
    throw new Error(`Firebase 환경변수 누락: ${missingFields.join(', ')}`);
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase 앱 초기화 완료');
    } else {
      app = getApp();
      console.log('✅ 기존 Firebase 앱 사용');
    }
    
    // Firestore 데이터베이스 초기화
    db = getFirestore(app);
    console.log('✅ Firestore 초기화 완료');
    
    // Firebase Auth 초기화
    auth = getAuth(app);
    console.log('✅ Firebase Auth 초기화 완료');
    
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    throw error;
  }
}

export { app, db, auth };

// Analytics는 나중에 필요할 때 추가
// export const analytics = getAnalytics(app); 

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다.');
  }
  return auth.currentUser;
};

// 익명 로그인
export const signInAnonymous = async () => {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다.');
  }
  
  try {
    const result = await signInAnonymously(auth);
    console.log('✅ 익명 로그인 성공:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('❌ 익명 로그인 실패:', error);
    throw error;
  }
};

// 사용자 인증 상태 변경 감지
export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다.');
  }
  
  return onAuthStateChanged(auth, callback);
};

// 사용자 UID 가져오기 (편의 함수)
export const getUserId = (): string | null => {
  const user = getCurrentUser();
  return user ? user.uid : null;
}; 