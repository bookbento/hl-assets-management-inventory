"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
  },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-theme-toggle]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme"
        className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-sm"
      >
        <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
      </button>
    );
  }

  const activeTheme = theme === "system" ? resolvedTheme ?? "system" : theme;
  const ActiveIcon = activeTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" data-theme-toggle>
      <button
        type="button"
        aria-label="Theme menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--surface-muted)]"
      >
        <ActiveIcon className="h-4 w-4" />
        <span className="hidden sm:inline capitalize">
          {theme === "system" ? "System" : theme}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-40 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const selected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-primary/10 text-primary"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
