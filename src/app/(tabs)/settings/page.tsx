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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">앱 설정을 관리하세요</p>
      </div>

      {/* 프로필 섹션 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <User size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">프로필</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileUpdate('name', e.target.value)}
              disabled={!isEditingProfile}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              disabled={!isEditingProfile}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표 시험</label>
            <select
              value={profile.targetExam}
              onChange={(e) => handleProfileUpdate('targetExam', e.target.value)}
              disabled={!isEditingProfile}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="정보처리기사">정보처리기사</option>
              <option value="정보처리산업기사">정보처리산업기사</option>
              <option value="컴퓨터활용능력">컴퓨터활용능력</option>
              <option value="사무자동화산업기사">사무자동화산업기사</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표 날짜</label>
            <input
              type="date"
              value={profile.targetDate}
              onChange={(e) => handleProfileUpdate('targetDate', e.target.value)}
              disabled={!isEditingProfile}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일일 목표 (문제 수)</label>
            <input
              type="number"
              value={profile.dailyGoal}
              onChange={(e) => handleProfileUpdate('dailyGoal', parseInt(e.target.value))}
              disabled={!isEditingProfile}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditingProfile ? '저장' : '편집'}
            </button>
          </div>
        </div>
      </div>

      {/* 앱 설정 섹션 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Target size={20} className="text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">앱 설정</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">알림</span>
            </div>
            <button
              onClick={() => handleSettingToggle('notifications')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">다크 모드</span>
            </div>
            <button
              onClick={() => handleSettingToggle('darkMode')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Upload size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">자동 저장</span>
            </div>
            <button
              onClick={() => handleSettingToggle('autoSave')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">효과음</span>
            </div>
            <button
              onClick={() => handleSettingToggle('soundEffects')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.soundEffects ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 데이터 관리 섹션 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Download size={20} className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">데이터 관리</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDataExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download size={16} />
            <span>데이터 내보내기</span>
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleDataImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload size={16} />
              <span>데이터 가져오기</span>
            </button>
          </div>

          <button
            onClick={handleDataReset}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span>데이터 초기화</span>
          </button>
        </div>
      </div>

      {/* 기타 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Info size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">기타</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <HelpCircle size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">도움말</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Shield size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">개인정보처리방침</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500">ExaMate v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
} 