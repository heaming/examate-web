'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Target,
  Bell,
  Moon,
  Download,
  Upload,
  Trash2,
  Info,
  Shield,
  HelpCircle,
  Wifi,
  WifiOff, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface UserProfile {
  targetYear: string;
  targetExam: string;
  targetRound: string;
}

interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  notificationTime: string; // 알림 시간 (HH:MM 형식)
  notificationDays: string[]; // 알림 요일
}

type ExamType = '정보처리기사' | '정보처리산업기사' | '컴퓨터활용능력' | '사무자동화산업기사';
type RoundType = '1회차' | '2회차' | '3회차' | '4회차';

// 시험별 회차 정보
const examRounds: Record<ExamType, RoundType[]> = {
  '정보처리기사': ['1회차', '2회차', '3회차', '4회차'],
  '정보처리산업기사': ['1회차', '2회차', '3회차', '4회차'],
  '컴퓨터활용능력': ['1회차', '2회차', '3회차', '4회차'],
  '사무자동화산업기사': ['1회차', '2회차', '3회차', '4회차']
};

// 시험별 목표 날짜 (2024년 기준)
const examDates: Record<ExamType, Record<RoundType, string>> = {
  '정보처리기사': {
    '1회차': '2024-03-09',
    '2회차': '2024-06-15',
    '3회차': '2024-09-07',
    '4회차': '2024-12-14'
  },
  '정보처리산업기사': {
    '1회차': '2024-03-09',
    '2회차': '2024-06-15',
    '3회차': '2024-09-07',
    '4회차': '2024-12-14'
  },
  '컴퓨터활용능력': {
    '1회차': '2024-03-09',
    '2회차': '2024-06-15',
    '3회차': '2024-09-07',
    '4회차': '2024-12-14'
  },
  '사무자동화산업기사': {
    '1회차': '2024-03-09',
    '2회차': '2024-06-15',
    '3회차': '2024-09-07',
    '4회차': '2024-12-14'
  }
};

export default function SettingsPage() {
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y <= currentYear + 5; y++) yearOptions.push(String(y));

  const [profile, setProfile] = useState<UserProfile>({
    targetYear: String(currentYear),
    targetExam: '정보처리기사',
    targetRound: '1회차'
  });

  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: false,
    notificationTime: '09:00',
    notificationDays: ['mon', 'tue', 'wed', 'thu', 'fri']
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseUid, setFirebaseUid] = useState<string>(''); // Firebase UID 상태

  // 알림 시간 상태 분리
  const [customHour, setCustomHour] = useState(settings.notificationTime.split(':')[0]);
  const [customMinute, setCustomMinute] = useState(settings.notificationTime.split(':')[1]);

  const [openResetDialog, setOpenResetDialog] = useState(false);

  // localStorage에서 설정 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem('examate-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('examate-settings', JSON.stringify(settings));
  }, [settings]);

  // 임시 Firebase UID 설정 (실제로는 Firebase Auth에서 가져올 예정)
  useEffect(() => {
    // 임시로 랜덤 UID 생성 (실제 구현 시 제거)
    const tempUid = 'temp_' + Math.random().toString(36).substr(2, 9);
    setFirebaseUid(tempUid);
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleProfileUpdate = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleExamChange = (exam: string) => {
    const examType = exam as ExamType;
    const round = examRounds[examType]?.[0] || '1회차';
    
    setProfile(prev => ({
      ...prev,
      targetExam: exam,
      targetRound: round
    }));
  };

  const handleRoundChange = (round: string) => {
    setProfile(prev => ({
      ...prev,
      targetRound: round
    }));
  };

  const handleYearChange = (year: string) => {
    setProfile(prev => ({ ...prev, targetYear: year, targetRound: '1회차' }));
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // 알림 보내기
  const sendNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('ExaMate 학습 알림', {
        body: '오늘도 열심히 공부해보세요!',
        icon: '/next.svg', // 앱 아이콘 경로
        badge: '/next.svg',
        tag: 'daily-study-reminder'
      });
    }
  };

  // 알림 스케줄링
  const scheduleNotification = () => {
    if (!settings.notifications) return;

    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // 오늘 해당 시간이 지났으면 내일로 설정
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const dayKey = today === 'mon' ? 'mon' : 
                    today === 'tue' ? 'tue' : 
                    today === 'wed' ? 'wed' : 
                    today === 'thu' ? 'thu' : 
                    today === 'fri' ? 'fri' : 
                    today === 'sat' ? 'sat' : 'sun';

      if (settings.notificationDays.includes(dayKey)) {
        sendNotification();
      }

      // 다음 날 알림 스케줄링
      scheduleNotification();
    }, timeUntilNotification);
  };

  // 알림 설정 변경 시 스케줄링 재시작
  useEffect(() => {
    if (settings.notifications) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          scheduleNotification();
        }
      });
    }
  }, [settings.notifications, settings.notificationTime, settings.notificationDays]);

  // 알림 시간 select 변경 핸들러
  const handleCustomHourChange = (h: string) => {
    setCustomHour(h);
    setSettings(prev => ({ ...prev, notificationTime: `${h}:${customMinute}` }));
  };
  const handleCustomMinuteChange = (m: string) => {
    setCustomMinute(m);
    setSettings(prev => ({ ...prev, notificationTime: `${customHour}:${m}` }));
  };

  // notificationTime이 외부에서 바뀔 때 select 값 동기화
  useEffect(() => {
    const [h, m] = settings.notificationTime.split(':');
    setCustomHour(h);
    setCustomMinute(m);
  }, [settings.notificationTime]);

  const handleSettingToggle = (field: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNotificationDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      notificationDays: prev.notificationDays.includes(day)
        ? prev.notificationDays.filter(d => d !== day)
        : [...prev.notificationDays, day]
    }));
  };

  const handleDataExport = () => {
    const data = {
      profile,
      settings,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDataImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.profile) setProfile(data.profile);
          if (data.settings) setSettings(data.settings);
        } catch (error) {
          console.error('Failed to parse backup file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDataReset = () => {
    setOpenResetDialog(true);
  };

  const confirmDataReset = () => {
    localStorage.clear();
    setOpenResetDialog(false);
    window.location.reload();
  };

  // 회차별 날짜 템플릿 (월/일만 고정)
  const roundDateTemplate = {
    '1회차': '-03-09',
    '2회차': '-06-15',
    '3회차': '-09-07',
    '4회차': '-12-14',
  };

  return (
      <div className="min-h-screen bg-background p-4">
        {/* 헤더 */}
        <div className="mb-6 pl-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">앱 설정을 관리하세요⚙️</p>
        </div>

        {/* 프로필 섹션 */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="space-y-4">
            {/* 온라인/오프라인 상태 표시 */}
            <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="flex items-center space-x-2 mb-2">
                {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-600"/>
                ) : (
                    <WifiOff className="h-4 w-4 text-muted-foreground"/>
                )}
                <span className="text-sm font-medium text-foreground">연결 상태</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isOnline ? '온라인 상태' : '오프라인 상태'}
                </span>
              </div>
              {isOnline && firebaseUid && (
                  <div
                      className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Firebase UID:</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-mono">{firebaseUid}</span>
                    </div>
                  </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {isOnline
                    ? ''
                    : '오프라인 상태입니다. 인터넷 연결을 확인해주세요.'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">연도 / 회차</label>
              <div className="flex gap-2">
                <Select
                    value={profile.targetYear}
                    onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                    value={profile.targetRound}
                    onValueChange={handleRoundChange}
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {examRounds[profile.targetExam as keyof typeof examRounds]?.map((round) => {
                      const year = profile.targetYear;
                      const date = year + (roundDateTemplate[round as keyof typeof roundDateTemplate] || '');
                      return (
                          <SelectItem key={round} value={round}>
                            {round} ({date})
                          </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 앱 설정 섹션 */}
        <Card className="mb-6 gap-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-lg font-bold">앱 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-muted-foreground"/>
                  <span className="text-sm font-medium text-foreground">알림</span>
                </div>
                <Switch
                    checked={settings.notifications}
                    onCheckedChange={() => handleSettingToggle('notifications')}
                />
              </div>

              {settings.notifications && (
                  <>
                    <div className="ml-7 space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">알림 시간</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                              type="number"
                              min={0}
                              max={23}
                              value={customHour}
                              onChange={e => {
                                let v = e.target.value.replace(/[^0-9]/g, '');
                                let num = Math.max(0, Math.min(23, Number(v)));
                                let str = isNaN(num) ? '00' : String(num).padStart(2, '0');
                                setCustomHour(str);
                                setSettings(prev => ({...prev, notificationTime: `${str}:${customMinute}`}));
                              }}
                              className="w-10 px-1 py-1 border rounded text-center text-sm bg-background"
                              inputMode="numeric"
                              pattern="[0-9]*"
                          />
                          <span className="text-lg font-bold text-muted-foreground">:</span>
                          <input
                              type="number"
                              min={0}
                              max={59}
                              value={customMinute}
                              onChange={e => {
                                let v = e.target.value.replace(/[^0-9]/g, '');
                                let num = Math.max(0, Math.min(59, Number(v)));
                                let str = isNaN(num) ? '00' : String(num).padStart(2, '0');
                                setCustomMinute(str);
                                setSettings(prev => ({...prev, notificationTime: `${customHour}:${str}`}));
                              }}
                              className="w-10 px-1 py-1 border rounded text-center text-sm bg-background"
                              inputMode="numeric"
                              pattern="[0-9]*"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">알림 요일</span>
                        </div>
                        <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide">
                          {[
                            {key: 'mon', label: '월'},
                            {key: 'tue', label: '화'},
                            {key: 'wed', label: '수'},
                            {key: 'thu', label: '목'},
                            {key: 'fri', label: '금'},
                            {key: 'sat', label: '토'},
                            {key: 'sun', label: '일'}
                          ].map(({key, label}) => (
                              <button
                                  key={key}
                                  onClick={() => handleNotificationDayToggle(key)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                      settings.notificationDays.includes(key)
                                          ? 'bg-primary text-primary-foreground shadow-sm'
                                          : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-muted'
                                  }`}
                                  style={{minWidth: 36}}
                              >
                                {label}
                              </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-foreground">다크 모드</span>
              </div>
              <Switch
                  checked={settings.darkMode}
                  onCheckedChange={() => handleSettingToggle('darkMode')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 섹션 */}
        <Card className="mb-6 gap-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-lg font-bold">데이터 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
              <DialogTrigger asChild>
                <Button
                    onClick={handleDataReset}
                    className="w-full bg-rose-600"
                >
                  <Trash2 className="h-4 w-4 mr-2"/>
                  데이터 초기화
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="mb-2">정말 모든 데이터를 삭제할까요?</DialogTitle>
                  <DialogDescription>
                    <p>이 작업은 되돌릴 수 없습니다.</p>
                    <p>앱의 모든 설정 및 저장된 정보가 삭제됩니다. </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end gap-2">
                  <Button
                      size="sm"
                      className="shadow-sm border-zinc-800 bg-white text-zinc-600"
                      onClick={() => setOpenResetDialog(false)}>
                    취소
                  </Button>
                  <Button
                      size="sm"
                      className="shadow-sm bg-rose-600 text-white"
                      onClick={confirmDataReset}>
                    삭제
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 기타 섹션 */}
        <Card className="mb-6 gap-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-lg font-bold">기타</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-2">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-foreground">도움말</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Button>

            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-foreground">개인정보처리방침</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Button>
          </CardContent>
        </Card>
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">Examate v1.0.0</p>
          <p className="text-xs text-muted-foreground">by mademee </p>
        </div>
      </div>
  );
} 