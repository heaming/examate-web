import { NativeAPIBase } from './base';
import { StudyHistory } from '@/lib/native';

export interface NativeHomePageData {
  totalSolved: number;
  totalCorrect: number;
  studyStreak: number;
  accuracy: number;
  recentQuestions: StudyHistory[];
  todaySolved: number;
  todayCorrect: number;
  todayBookmarks: number;
}

export class HomeAPI extends NativeAPIBase {
  private static instance: HomeAPI;

  static getInstance() {
    if (!this.instance) {
      this.instance = new HomeAPI();
    }
    return this.instance;
  }

  async getHomeData(): Promise<NativeHomePageData> {
    return this.sendMessage<NativeHomePageData>('GET_HOME_PAGE_DATA');
  }
}

// 편의 함수
export const getHomeData = () => HomeAPI.getInstance().getHomeData();