'use client';

import { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  name: string;
  email: string;
  targetExam: string;
  targetDate: string;
  dailyGoal: number;
}

interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  soundEffects: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '김철수',
    email: 'kim@example.com',
    targetExam: '정보처리기사',
    targetDate: '2024-12-15',
    dailyGoal: 20
  });

  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: false,
    autoSave: true,
    soundEffects: false
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleProfileUpdate = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingToggle = (field: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
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
    if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 데이터 초기화 로직
      console.log('Data reset');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">설정</h1>
        <p className="text-muted-foreground">앱 설정을 관리하세요</p>
      </div>

      {/* 프로필 섹션 */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold ml-2">프로필</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">이름</label>
            <Input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileUpdate('name', e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">이메일</label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">목표 시험</label>
            <Select
              value={profile.targetExam}
              onValueChange={(value) => handleProfileUpdate('targetExam', value)}
              disabled={!isEditingProfile}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="정보처리기사">정보처리기사</SelectItem>
                <SelectItem value="정보처리산업기사">정보처리산업기사</SelectItem>
                <SelectItem value="컴퓨터활용능력">컴퓨터활용능력</SelectItem>
                <SelectItem value="사무자동화산업기사">사무자동화산업기사</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">목표 날짜</label>
            <Input
              type="date"
              value={profile.targetDate}
              onChange={(e) => handleProfileUpdate('targetDate', e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">일일 목표 (문제 수)</label>
            <Input
              type="number"
              value={profile.dailyGoal}
              onChange={(e) => handleProfileUpdate('dailyGoal', parseInt(e.target.value))}
              disabled={!isEditingProfile}
              min="1"
              max="100"
            />
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-full"
            >
              {isEditingProfile ? '저장' : '편집'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 앱 설정 섹션 */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Target className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg font-semibold ml-2">앱 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">알림</span>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={() => handleSettingToggle('notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">다크 모드</span>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={() => handleSettingToggle('darkMode')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">자동 저장</span>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={() => handleSettingToggle('autoSave')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">효과음</span>
            </div>
            <Switch
              checked={settings.soundEffects}
              onCheckedChange={() => handleSettingToggle('soundEffects')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 섹션 */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Download className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold ml-2">데이터 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleDataExport}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            데이터 내보내기
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleDataImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button className="w-full" variant="secondary">
              <Upload className="h-4 w-4 mr-2" />
              데이터 가져오기
            </Button>
          </div>

          <Button
            onClick={handleDataReset}
            className="w-full"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            데이터 초기화
          </Button>
        </CardContent>
      </Card>

      {/* 기타 섹션 */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold ml-2">기타</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">도움말</span>
            </div>
            <span className="text-muted-foreground">→</span>
          </Button>

          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">개인정보처리방침</span>
            </div>
            <span className="text-muted-foreground">→</span>
          </Button>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">ExaMate v1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 