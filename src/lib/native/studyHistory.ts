import {NativeAPIBase} from "@/lib/native/base";

export interface StudyHistory {
  id: number;
  year: number;
  round: number;
  questionId: string;
  solvedAt?: string;
  isCorrect?: boolean | null;
  userAnswer?: number | null;
  correctAnswer: number;
  createdAt: string;
}

export class StudyHistoryAPI extends NativeAPIBase {
  private static instance: StudyHistoryAPI;

  static getInstance() {
    if (!this.instance) {
      this.instance = new StudyHistoryAPI();
    }
    return this.instance;
  }

  async saveStudyHistories(data: StudyHistory[]): Promise<StudyHistory[]> {
    return this.sendMessage<StudyHistory[]>('SAVE_STUDY_HISTORIES', data);
  }

  async getStudyHistories(year: number, round: number): Promise<StudyHistory[]> {
    return this.sendMessage<StudyHistory[]>('GET_STUDY_HISTORIES', {year, round});
  }
}

export const getStudyHistories = (year: number, round: number) => StudyHistoryAPI.getInstance().getStudyHistories(year, round);
export const saveStudyHistories = (request: StudyHistory[]) => StudyHistoryAPI.getInstance().saveStudyHistories(request);
