"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Atom,
  Cpu,
  Landmark,
  Film,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  Info,
  Layers,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuizConfig } from "@/lib/quiz/types";

export type CategoryType = "Science" | "Technology" | "History" | "Entertainment";
export type DifficultyType = "Easy" | "Medium" | "Hard";
export type QuestionCountType = 5 | 10 | 15 | 20;

interface QuizConfigPanelProps {
  onStartQuiz?: (config: QuizConfig) => void;
  initialConfig?: QuizConfig;
}

interface CategoryOption {
  id: CategoryType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "Science",
    title: "Science",
    description: "Physics, biology, chemistry & natural systems",
    icon: Atom,
    badge: "Empirical",
  },
  {
    id: "Technology",
    title: "Technology",
    description: "Computing, algorithms, software & engineering",
    icon: Cpu,
    badge: "Applied",
  },
  {
    id: "History",
    title: "History",
    description: "Civilizations, pivotal eras & world affairs",
    icon: Landmark,
    badge: "Chronicles",
  },
  {
    id: "Entertainment",
    title: "Entertainment",
    description: "Cinema, music, literature & media culture",
    icon: Film,
    badge: "Culture",
  },
];

interface DifficultyOption {
  id: DifficultyType;
  label: string;
  subtext: string;
}

const DIFFICULTIES: DifficultyOption[] = [
  { id: "Easy", label: "Easy", subtext: "Core concepts & direct recall" },
  { id: "Medium", label: "Medium", subtext: "Analytical & applied questions" },
  { id: "Hard", label: "Hard", subtext: "Deep synthesis & multi-step nuances" },
];

const QUESTION_COUNTS: { count: QuestionCountType; timeEst: string }[] = [
  { count: 5, timeEst: "3 min" },
  { count: 10, timeEst: "6 min" },
  { count: 15, timeEst: "10 min" },
  { count: 20, timeEst: "15 min" },
];

export function QuizConfigPanel({ onStartQuiz, initialConfig }: QuizConfigPanelProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  const [category, setCategory] = React.useState<CategoryType>(
    initialConfig?.category ?? "Science"
  );
  const [difficulty, setDifficulty] = React.useState<DifficultyType>(
    initialConfig?.difficulty ?? "Medium"
  );
  const [questionCount, setQuestionCount] = React.useState<QuestionCountType>(
    initialConfig?.questionCount ?? 10
  );
  const [validationResponse, setValidationResponse] = React.useState<{
    category: CategoryType;
    difficulty: DifficultyType;
    questionCount: QuestionCountType;
    estimatedMinutes: string;
  } | null>(null);

  const selectedCountObj = QUESTION_COUNTS.find((q) => q.count === questionCount) ?? QUESTION_COUNTS[1];

  const handleStartQuiz = () => {
    if (!category || !difficulty || !questionCount) return;

    if (onStartQuiz) {
      onStartQuiz({
        category,
        difficulty,
        questionCount,
      });
      return;
    }

    setValidationResponse({
      category,
      difficulty,
      questionCount,
      estimatedMinutes: selectedCountObj.timeEst,
    });
  };

  return (
    <Card className="w-full border-border/80 bg-card/85 shadow-md backdrop-blur-md transition-shadow duration-200">
      <CardHeader className="border-b border-border/60 pb-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <SlidersHorizontal className="size-4" />
              </span>
              <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                Configure Your Assessment
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Select your subject domain, difficulty tier, and session duration to begin active recall.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit self-start border-border/80 font-mono text-xs text-muted-foreground sm:self-auto"
          >
            Session Studio
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Section 1: Categories */}
        <section aria-labelledby="category-label" className="space-y-3">
          <div className="flex items-center justify-between">
            <label id="category-label" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <Layers className="size-4 text-primary" />
              1. Select Domain
            </label>
            <span className="font-mono text-xs text-muted-foreground">
              Active: <strong className="text-foreground">{category}</strong>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-labelledby="category-label"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              const Icon = cat.icon;

              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
                  onClick={() => {
                    setCategory(cat.id);
                    setValidationResponse(null);
                  }}
                  className={cn(
                    "group relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-accent/35 shadow-xs ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {cat.badge}
                      </span>
                      {isSelected ? (
                        <motion.span
                          initial={shouldReduceMotion ? false : { scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 450, damping: 25 }}
                          className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check className="size-3 stroke-[2.5]" />
                        </motion.span>
                      ) : (
                        <span className="size-5 rounded-full border border-border group-hover:border-foreground/40" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Difficulty Tier */}
        <section aria-labelledby="difficulty-label" className="space-y-3">
          <div className="flex items-center justify-between">
            <label id="difficulty-label" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <Gauge className="size-4 text-primary" />
              2. Challenge Tier
            </label>
            <span className="font-mono text-xs text-muted-foreground">
              Tier: <strong className="text-foreground">{difficulty}</strong>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-labelledby="difficulty-label"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
          >
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficulty === diff.id;
              return (
                <motion.button
                  key={diff.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.15 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
                  onClick={() => {
                    setDifficulty(diff.id);
                    setValidationResponse(null);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 text-foreground"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-sm">{diff.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      >
                        <Check className="size-3.5 stroke-[2.5]" />
                      </motion.div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs leading-normal",
                      isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                    )}
                  >
                    {diff.subtext}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Question Count */}
        <section aria-labelledby="count-label" className="space-y-3">
          <div className="flex items-center justify-between">
            <label id="count-label" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <Clock className="size-4 text-primary" />
              3. Session Length
            </label>
            <span className="font-mono text-xs text-muted-foreground">
              Estimated: ~{selectedCountObj.timeEst}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-labelledby="count-label"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
          >
            {QUESTION_COUNTS.map((item) => {
              const isSelected = questionCount === item.count;
              return (
                <motion.button
                  key={item.count}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.15 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
                  onClick={() => {
                    setQuestionCount(item.count);
                    setValidationResponse(null);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border py-3 px-2 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-accent/40 font-semibold text-accent-foreground ring-1 ring-primary shadow-xs"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 text-foreground"
                  )}
                >
                  <span className="font-mono text-lg font-bold">
                    {item.count}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Questions (~{item.timeEst})
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Live Configuration Summary & Action */}
        <div className="space-y-4 pt-2 border-t border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-muted/40 p-3.5 border border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0 text-primary" />
              <span>
                Configured: <strong className="text-foreground">{category}</strong> •{" "}
                <strong className="text-foreground">{difficulty}</strong> •{" "}
                <strong className="text-foreground">{questionCount} Qs</strong> (~{selectedCountObj.timeEst})
              </span>
            </div>
            <span className="font-mono text-[11px] text-accent-foreground bg-accent px-2 py-0.5 rounded-full w-fit">
              Ready to initialize
            </span>
          </div>

          {/* Start Quiz Action */}
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.008 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              type="button"
              size="lg"
              onClick={handleStartQuiz}
              className="w-full text-base font-semibold py-6 shadow-md gap-2.5"
            >
              <span>Start Quiz Assessment</span>
              <ArrowRight className="size-5" />
            </Button>
          </motion.div>

          {/* Sensible Validation Response / Milestone Notification */}
          <AnimatePresence>
            {validationResponse && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-primary/40 bg-accent/20 p-4.5 text-foreground dark:bg-accent/15">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground">
                          Configuration Validated & Locked
                        </h4>
                        <Badge
                          variant="outline"
                          className="border-primary/40 text-primary font-mono text-[11px]"
                        >
                          Milestone Preview
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your assessment parameters for{" "}
                        <strong className="text-foreground">{validationResponse.category}</strong> (
                        {validationResponse.difficulty} difficulty,{" "}
                        {validationResponse.questionCount} questions, ~
                        {validationResponse.estimatedMinutes}) have been confirmed.
                      </p>
                      <div className="pt-1.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setValidationResponse(null)}
                          className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                        >
                          Change settings
                        </button>
                        <span className="text-muted-foreground/60 text-xs">•</span>
                        <span className="text-xs text-muted-foreground">
                          All selectors operational
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
