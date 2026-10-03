export interface Word { id: number; word: string; phonetic: string; meaning: string; partOfSpeech: string; example: string; exampleTranslation: string }
export interface Progress { wordId: number; learned: boolean; correctCount: number; wrongCount: number; lastAnsweredAt: string; lastResult: 'correct' | 'wrong'; inWrongBook: boolean; lastWrongAt?: string; lastChoice?: string; lastQuestion?: Question }
export interface AppState { key: 'main'; lastStudyIndex: number }
export interface Question { wordId: number; options: string[]; correctIndex: number }
export interface Answer { choice: number; answeredAt: string }
export interface ExamSession { id: string; createdAt: string; questions: Question[]; answers: Record<number, Answer>; currentIndex: number; finished: boolean }
export interface ExamHistory { id: string; date: string; total: number; correct: number; wrong: number; accuracy: number; questions: Question[]; answers: Record<number, Answer> }
