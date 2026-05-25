/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string; // e.g., 'a' or 'b'
}

export interface StudentInfo {
  name: string;
  passportUrl: string | null;
  matricNo: string;
  level: string;
  score: number;
  stateOfOrigin: string;
  admissionDate: string;
}

export type PlatformType = 'Facebook' | 'TikTok' | 'Instagram' | null;
