"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
  Atom,
  Cpu,
  Landmark,
  Film,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizConfig, QuizQuestion } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

interface QuizViewProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
  onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
  onFinishQuiz: () => void;
  onExitQuiz: () => void;
}

const CATEGORY_ICONS = {
  Science: Atom,
  Technology: Cpu,
  History: Landmark,
  Entertainment: Film,
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuizView({
  config,
  questions,
  userAnswers,
  onSelectAnswer,
  onFinishQuiz,
  onExitQuiz,
}: QuizViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedOptionIndex = userAnswers[currentIndex] ?? -1;
  const hasSelectedAnswer = selectedOptionIndex !== -1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const CategoryIcon = CATEGORY_ICONS[config.category] ?? HelpCircle;

  // Keyboard navigation shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        onSelectAnswer(currentIndex, optionIdx);
      } else if (["a", "b", "c", "d"].includes(e.key.toLowerCase())) {
        const optionIdx = e.key.toLowerCase().charCodeAt(0) - 97;
        onSelectAnswer(currentIndex, optionIdx);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (hasSelectedAnswer) {
          if (isLast) {
            onFinishQuiz();
          } else {
            setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (!isFirst) {
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (e.key === "Escape") {
        setShowExitConfirm((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, hasSelectedAnswer, isFirst, isLast, onFinishQuiz, onSelectAnswer, totalQuestions]);

  const handleNext = () => {
    if (!hasSelectedAnswer) return;
    if (isLast) {
      onFinishQuiz();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    }
  };

  const handlePrevious = () => {
    if (isFirst) return;
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Quiz Header & Top Status Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/85 p-4 shadow-xs backdrop-blur-md sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <CategoryIcon className="size-4.5" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {config.category}
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/40 font-mono text-[10px] text-primary"
                >
                  {config.difficulty}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline-block">
              {progressPercent}% Completed
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowExitConfirm(true)}
              className="text-xs text-muted-foreground hover:text-destructive"
              title="Exit current session"
            >
              <X className="size-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <Progress value={progressPercent} className="w-full h-2" />
        </div>
      </div>

      {/* Exit Confirmation Dialog Banner */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-foreground dark:bg-destructive/15">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Abandon Quiz Session?</h4>
                  <p className="text-xs text-muted-foreground">
                    Your current answers will not be recorded and you will return to the configuration panel.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExitConfirm(false)}
                    className="text-xs"
                  >
                    Continue Quiz
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onExitQuiz}
                    className="text-xs"
                  >
                    Confirm Exit
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Question Card with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="border-border/80 bg-card/90 shadow-sm backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  Concept Assessment #{currentIndex + 1}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  Select 1 of 4 options
                </span>
              </div>
              <CardTitle className="pt-2 text-xl font-bold leading-relaxed sm:text-2xl text-foreground">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-2 pb-6">
              {/* Answer Options */}
              <div
                role="radiogroup"
                aria-label={`Options for Question ${currentIndex + 1}`}
                className="space-y-2.5"
              >
                {currentQuestion.options.map((optionText, optIndex) => {
                  const isSelected = selectedOptionIndex === optIndex;
                  const label = OPTION_LABELS[optIndex];

                  return (
                    <motion.button
                      key={optIndex}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.15 } }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.995, transition: { duration: 0.1 } }}
                      onClick={() => onSelectAnswer(currentIndex, optIndex)}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary dark:bg-primary/20 text-foreground"
                          : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "border border-border/80 bg-muted text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-sm font-medium leading-relaxed sm:text-base">
                          {optionText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden font-mono text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground sm:inline-block">
                          [{optIndex + 1}]
                        </span>
                        {isSelected ? (
                          <motion.span
                            initial={shouldReduceMotion ? false : { scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs"
                          >
                            <Check className="size-3.5 stroke-[2.5]" />
                          </motion.span>
                        ) : (
                          <span className="size-5 rounded-full border border-border group-hover:border-foreground/40" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Selection Prompt / Helper */}
              {!hasSelectedAnswer && (
                <p className="pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="size-3.5 text-primary" />
                  Select an answer above to enable forward navigation.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handlePrevious}
          disabled={isFirst}
          className="gap-2 px-4"
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          {/* Question Index Pills for Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {questions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== -1;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "size-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCurrent
                      ? "w-6 bg-primary"
                      : isAnswered
                      ? "bg-chart-1"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                  aria-label={`Jump to question ${idx + 1}`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>

          <motion.div
            whileHover={shouldReduceMotion || !hasSelectedAnswer ? undefined : { scale: 1.015 }}
            whileTap={shouldReduceMotion || !hasSelectedAnswer ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleNext}
              disabled={!hasSelectedAnswer}
              className="gap-2 px-5 font-semibold"
            >
              {isLast ? (
                <>
                  <span>Complete Assessment</span>
                  <CheckCircle2 className="size-4" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
