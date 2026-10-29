"use client";

import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <BookOpen className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-foreground">
                Quizzy
              </span>
              <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
                v0.1
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Active Recall & Spaced Repetition
            </span>
          </div>
        </Link>

        {/* Center / Academic Tag */}
        <div className="hidden md:flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-border/60 bg-muted/40 font-mono text-xs text-muted-foreground"
          >
            <Sparkles className="size-3 text-chart-1 mr-1" />
            Adaptive Learning Engine
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
