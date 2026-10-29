export type CategoryType =
  | "Science"
  | "Technology"
  | "History"
  | "Entertainment";

export type DifficultyType = "Easy" | "Medium" | "Hard";

export type QuestionCountType = 5 | 10 | 15 | 20;

export interface QuizConfig {
  category: CategoryType;
  difficulty: DifficultyType;
  questionCount: QuestionCountType;
}

/**
 * Public question data shown while the quiz is in progress.
 * Correct answers are intentionally excluded.
 */
export interface QuizQuestion {
  id: string;
  category: CategoryType;
  difficulty: DifficultyType;
  question: string;
  options: [string, string, string, string];
}

/**
 * Question data available after the quiz has been submitted.
 * The answer key is only exposed in the review response.
 */
export interface ReviewQuestion extends QuizQuestion {
  correctAnswerIndex: number;
  explanation?: string;
}

export interface QuestionReviewItem {
  question: ReviewQuestion;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface QuizResult {
  config: QuizConfig;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  performanceTier:
    | "Mastery"
    | "Proficient"
    | "Developing"
    | "Needs Review";
  reviewItems: QuestionReviewItem[];
}
