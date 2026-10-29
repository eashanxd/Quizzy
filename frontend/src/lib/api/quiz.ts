const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

import type { QuizConfig, QuizResult } from "@/lib/quiz/types";

export interface FetchQuestionsResponse {
  quiz_id: string;
  questions: {
    id: string;
    category: string;
    difficulty: string;
    question: string;
    options: [string, string, string, string];
  }[];
  total: number;
}

export interface SubmitQuizResponse extends QuizResult {
  quiz_id: string;
}

export async function fetchQuestions(
  config: QuizConfig,
): Promise<FetchQuestionsResponse> {
  const params = new URLSearchParams({
    category: config.category,
    difficulty: config.difficulty,
    amount: String(config.questionCount),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/questions?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch questions (${response.status})`);
  }

  return response.json();
}

export async function submitQuiz(
  quizId: string,
  answers: Record<number, number>,
): Promise<SubmitQuizResponse> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quiz_id: quizId,
      answers,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.error ?? `Quiz submission failed (${response.status})`,
    );
  }

  return response.json();
}
