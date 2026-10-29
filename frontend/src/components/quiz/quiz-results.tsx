"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  Award,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QuizResult } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  result: QuizResult;
  onRetryQuiz: () => void;
  onNewQuiz: () => void;
}

type FilterOption = "all" | "incorrect" | "correct";

export function QuizResults({ result, onRetryQuiz, onNewQuiz }: QuizResultsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [filter, setFilter] = React.useState<FilterOption>("all");

  const { config, totalQuestions, correctCount, scorePercentage, performanceTier, reviewItems } =
    result;

  const incorrectCount = totalQuestions - correctCount;

  const filteredItems = React.useMemo(() => {
    if (filter === "correct") {
      return reviewItems.filter((item) => item.isCorrect);
    }
    if (filter === "incorrect") {
      return reviewItems.filter((item) => !item.isCorrect);
    }
    return reviewItems;
  }, [filter, reviewItems]);

  const OPTION_LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Hero Score & Performance Card */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="overflow-hidden border-border/80 bg-card/90 shadow-md backdrop-blur-md">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                  <Award className="size-4" />
                </span>
                <span className="font-semibold text-sm text-foreground">
                  Assessment Summary & Diagnostic
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span>{config.category}</span>
                <span>•</span>
                <Badge variant="outline" className="border-border text-foreground text-[10px]">
                  {config.difficulty} Tier
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
              {/* Score Metric Circle/Block */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-accent/25 p-6 text-center sm:col-span-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Accuracy Score
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                    {scorePercentage}
                  </span>
                  <span className="font-mono text-2xl font-bold text-primary">%</span>
                </div>
                <Badge
                  variant="default"
                  className="mt-3 font-mono text-xs px-3 py-1 shadow-xs"
                >
                  {performanceTier}
                </Badge>
                <span className="mt-2 text-xs text-muted-foreground font-mono">
                  {correctCount} of {totalQuestions} answered correctly
                </span>
              </div>

              {/* Performance Analysis & Actions */}
              <div className="space-y-5 sm:col-span-7 sm:pl-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {scorePercentage >= 90
                      ? "Exceptional Mastery Demonstrated"
                      : scorePercentage >= 70
                      ? "Proficient Understanding Confirmed"
                      : scorePercentage >= 50
                      ? "Developing Conceptual Recall"
                      : "Review Recommended"}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {scorePercentage >= 90
                      ? "You exhibited high diagnostic precision across these questions. Excellent conceptual consolidation and retrieval strength."
                      : scorePercentage >= 70
                      ? "Strong performance with a solid grasp of core tenets. Review the explanations below to resolve remaining nuances."
                      : scorePercentage >= 50
                      ? "Good foundation. Focusing on the rationales of missed questions will significantly bolster your long-term memory trace."
                      : "Active recall is most effective when confronting challenges. Review each rationale below to target your knowledge gaps."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  >
                    <Button
                      type="button"
                      variant="default"
                      onClick={onRetryQuiz}
                      className="gap-2 shadow-xs"
                    >
                      <RotateCcw className="size-4" />
                      <span>Retry This Assessment</span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onNewQuiz}
                      className="gap-2"
                    >
                      <SlidersHorizontal className="size-4" />
                      <span>New Configuration</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Answer Review & Explanations Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Comprehensive Answer Review & Explanations
            </h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                filter === "all"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilter("incorrect")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                filter === "incorrect"
                  ? "bg-card text-destructive shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-destructive"
              )}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("correct")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                filter === "correct"
                  ? "bg-card text-primary shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              Correct ({correctCount})
            </button>
          </div>
        </div>

        {/* Filtered Question Review List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-border/80 bg-card p-8 text-center text-muted-foreground">
              <p className="text-sm">No questions match the current filter selection.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const { question, selectedOptionIndex, isCorrect } = item;
                const originalIndex = reviewItems.findIndex((r) => r.question.id === question.id);

                return (
                  <motion.div
                    key={question.id}
                    layout={!shouldReduceMotion}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card
                      className={cn(
                        "border backdrop-blur-xs transition-colors duration-150",
                        isCorrect
                          ? "border-primary/30 bg-card/90"
                          : "border-destructive/30 bg-card/90"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full text-xs font-bold font-mono",
                                isCorrect
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                              )}
                            >
                              {originalIndex + 1}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {question.category} • {question.difficulty}
                            </span>
                          </div>

                          <Badge
                            variant={isCorrect ? "default" : "destructive"}
                            className="gap-1 font-mono text-[11px]"
                          >
                            {isCorrect ? (
                              <>
                                <Check className="size-3" />
                                Correct
                              </>
                            ) : (
                              <>
                                <X className="size-3" />
                                Incorrect
                              </>
                            )}
                          </Badge>
                        </div>

                        <CardTitle className="pt-2 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
                          {question.question}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-5">
                        {/* User Selection & Correct Answer Contrast */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                          {/* Your Answer */}
                          <div
                            className={cn(
                              "rounded-lg border p-3 flex flex-col gap-1",
                              isCorrect
                                ? "border-primary/40 bg-accent/20"
                                : "border-destructive/40 bg-destructive/10"
                            )}
                          >
                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5 font-mono">
                              {isCorrect ? (
                                <Check className="size-3.5 text-primary" />
                              ) : (
                                <X className="size-3.5 text-destructive" />
                              )}
                              Your Answer:
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedOptionIndex >= 0
                                ? `${OPTION_LETTERS[selectedOptionIndex]}. ${question.options[selectedOptionIndex]}`
                                : "No answer selected"}
                            </span>
                          </div>

                          {/* Correct Answer */}
                          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 flex flex-col gap-1 dark:bg-primary/15">
                            <span className="font-semibold text-primary flex items-center gap-1.5 font-mono">
                              <CheckCircle2 className="size-3.5" />
                              Correct Answer:
                            </span>
                            <span className="font-medium text-foreground">
                              {OPTION_LETTERS[question.correctAnswerIndex]}.{" "}
                              {question.options[question.correctAnswerIndex]}
                            </span>
                          </div>
                        </div>

                        {/* Academic Rationale / Explanation Box */}
                        <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <BookOpen className="size-3.5 text-primary" />
                            <span>Academic Rationale</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {question.explanation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          onClick={onNewQuiz}
          className="gap-2"
        >
          <SlidersHorizontal className="size-4" />
          <span>Return to Dashboard</span>
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={onRetryQuiz}
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          <span>Retry Assessment</span>
        </Button>
      </div>
    </div>
  );
}
