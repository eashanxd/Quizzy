"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Header } from "@/components/header";
import { AnimatedBackground } from "@/components/animated-background";
import { QuizConfigPanel } from "@/components/quiz-config-panel";
import { QuizView } from "@/components/quiz/quiz-view";
import { QuizResults } from "@/components/quiz/quiz-results";
import { Badge } from "@/components/ui/badge";
import { QuizConfig, QuizQuestion, QuizResult } from "@/lib/quiz/types";
import { fetchQuestions, submitQuiz } from "@/lib/api/quiz";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  reducedFadeVariants,
} from "@/lib/motion";
import {
  Sparkles,
  BrainCircuit,
  Target,
  BarChart3,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

type PageView = "config" | "quiz" | "results";

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [view, setView] = React.useState<PageView>("config");
  const [config, setConfig] = React.useState<QuizConfig>({
    category: "Science",
    difficulty: "Medium",
    questionCount: 10,
  });
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = React.useState<Record<number, number>>({});
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [quizId, setQuizId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Start Quiz Handler
  const handleStartQuiz = async (newConfig: QuizConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchQuestions(newConfig);

      setConfig(newConfig);
      setQuizId(data.quiz_id);
      setQuestions(data.questions as QuizQuestion[]);
      setUserAnswers({});
      setResult(null);
      setView("quiz");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load questions. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Answer selection handler
  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleFinishQuiz = async () => {
    if (!quizId) {
      setError("Quiz session not found. Please start a new quiz.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalResult = await submitQuiz(quizId, userAnswers);

      setResult(finalResult);
      setView("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your quiz. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Retry same quiz with same questions
  const handleRetryQuiz = () => {
    setUserAnswers({});
    setResult(null);
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Return to configuration dashboard
  const handleReturnToConfig = () => {
    setView("config");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = shouldReduceMotion
    ? reducedFadeVariants
    : staggerContainerVariants;

  const itemVariants = shouldReduceMotion
    ? reducedFadeVariants
    : fadeInUpVariants;

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150">
      {/* Animated Flowing Gradient Background */}
      <AnimatedBackground />

      {/* Platform Header */}
      <Header />

      {/* Main Content Stage with Smooth Transitions */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {view === "config" && (
              <motion.div
                key="config-view"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12 sm:space-y-16"
              >
                {/* Hero Section */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mx-auto max-w-3xl text-center space-y-4"
                >

                  <motion.h1
                    variants={itemVariants}
                    className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
                  >
                    Master Any Subject Through{" "}
                    <span className="text-primary underline decoration-chart-1 decoration-wavy decoration-from-font">
                      Targeted Recall
                    </span>
                    .
                  </motion.h1>
                </motion.div>

                {/* Quiz Configuration Panel */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-3xl"
                >
                  {error && (
                    <p role="alert" className="mb-4 text-center text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <QuizConfigPanel
                    onStartQuiz={handleStartQuiz}
                    initialConfig={config}
                  />
                </motion.div>

                {/* Platform Feature Pillars */}
                <div className="border-t border-border/60 pt-14 sm:pt-16">
                  <div className="text-center space-y-2 mb-10">
                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                      Scholarly Methodology
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                      Engineered for Lasting Retention
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                      Built on cognitive science principles to optimize memory consolidation and concept mastery.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <motion.div
                      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                      className="rounded-xl border border-border/80 bg-card/85 p-6 shadow-2xs backdrop-blur-xs space-y-3 transition-colors"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BrainCircuit className="size-5" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        1. Adaptive Retrieval
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Targeted questions stimulate neural retrieval paths, reinforcing synaptic strength far more effectively than passive reading.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                      className="rounded-xl border border-border/80 bg-card/85 p-6 shadow-2xs backdrop-blur-xs space-y-3 transition-colors"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Target className="size-5" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        2. Calibrated Difficulty
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Progress from foundational definitions to multi-step analytical problem solving without cognitive fatigue.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                      className="rounded-xl border border-border/80 bg-card/85 p-6 shadow-2xs backdrop-blur-xs space-y-3 transition-colors"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                        <BarChart3 className="size-5" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        3. Rapid Rationale
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Immediate conceptual explanations resolve misconceptions at the point of recall, preventing error entrenchment.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "quiz" && questions.length > 0 && (
              <motion.div
                key="quiz-view"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuizView
                  config={config}
                  questions={questions}
                  userAnswers={userAnswers}
                  onSelectAnswer={handleSelectAnswer}
                  onFinishQuiz={handleFinishQuiz}
                  onExitQuiz={handleReturnToConfig}
                />
              </motion.div>
            )}

            {view === "results" && result && (
              <motion.div
                key="results-view"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuizResults
                  result={result}
                  onRetryQuiz={handleRetryQuiz}
                  onNewQuiz={handleReturnToConfig}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-border/80 bg-card/50 py-8 backdrop-blur-sm transition-colors duration-150">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">Quizzy</span>
            <span className="text-xs text-muted-foreground">
              — Academic Quiz & Learning Platform
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
