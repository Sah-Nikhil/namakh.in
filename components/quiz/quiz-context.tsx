"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import QuizModal from "@/components/quiz-modal";

/**
 * The "Find Your Blend" quiz, available on every storefront page. The root
 * layout mounts this once, so the navbar, the mobile dock and the landing
 * page's quiz CTA all open the same modal in place instead of each page
 * owning its own copy. Like the cart drawer, the modal is not rendered under
 * /admin.
 */
type QuizContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // The provider outlives page changes, so a back/forward navigation would
  // otherwise carry an open quiz onto the next page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  const isAdmin = pathname?.startsWith("/admin");

  return (
    <QuizContext.Provider value={value}>
      {children}
      {!isAdmin && <QuizModal isOpen={isOpen} onClose={close} />}
    </QuizContext.Provider>
  );
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}
