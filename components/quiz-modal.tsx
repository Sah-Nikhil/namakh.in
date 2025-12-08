"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

interface QuizOption {
  label: string;
  value: string;
  score: { hydration: number; sports: number };
}

interface Question {
  id: number;
  question: string;
  options: QuizOption[];
  multiSelect?: boolean;
}

const questions: Question[] = [
  {
    id: 1,
    question: "How active are you on most days?",
    options: [
      { label: "🧘 I mostly walk, do yoga, or light workouts.", value: "light", score: { hydration: 2, sports: 0 } },
      { label: "🚴 I train moderately 3–5 times a week.", value: "moderate", score: { hydration: 1, sports: 1 } },
      { label: "🏋 I do intense workouts or sports daily.", value: "intense", score: { hydration: 0, sports: 2 } },
      { label: "😅 I work outdoors or sweat a lot even without workouts.", value: "sweat", score: { hydration: 0, sports: 2 } },
    ],
  },
  {
    id: 2,
    question: "What do you usually want from your drink?",
    multiSelect: true,
    options: [
      { label: "⚡ More energy during workouts", value: "energy", score: { hydration: 0, sports: 2 } },
      { label: "💧 Better daily hydration", value: "daily", score: { hydration: 2, sports: 0 } },
      { label: "😌 Faster recovery and less cramps", value: "recovery", score: { hydration: 1, sports: 1 } },
      { label: "🧠 Clearer focus and mood", value: "focus", score: { hydration: 2, sports: 0 } },
      { label: "🍋 Something to replace sugary drinks", value: "replace", score: { hydration: 2, sports: 0 } },
    ],
  },
  {
    id: 3,
    question: "When do you usually take your electrolytes?",
    options: [
      { label: "☀ Morning / throughout the day", value: "morning", score: { hydration: 2, sports: 0 } },
      { label: "🏃 Before or during workouts", value: "workout", score: { hydration: 0, sports: 2 } },
      { label: "💤 After training / before bed", value: "night", score: { hydration: 1, sports: 1 } },
    ],
  },
  {
    id: 4,
    question: "How much do you sweat or train in the heat?",
    options: [
      { label: "🧊 Not much — I’m mostly indoors.", value: "low", score: { hydration: 2, sports: 0 } },
      { label: "☀ Moderate — I sweat but not heavily.", value: "medium", score: { hydration: 1, sports: 0 } },
      { label: "🔥 A lot — I train in heat or outdoors often.", value: "high", score: { hydration: 0, sports: 2 } },
    ],
  },
  {
    id: 5,
    question: "Do you prefer your drink to have a slight energy boost (natural sugar)?",
    options: [
      { label: "✅ Yes — I don’t mind a little glucose for better performance.", value: "yes", score: { hydration: 0, sports: 2 } },
      { label: "🚫 No — I prefer completely sugar-free.", value: "no", score: { hydration: 2, sports: 0 } },
    ],
  },
  {
    id: 6,
    question: "What best describes your goal right now?",
    options: [
      { label: "💪 Peak athletic performance", value: "performance", score: { hydration: 0, sports: 2 } },
      { label: "🧘 Balanced hydration & wellness", value: "wellness", score: { hydration: 2, sports: 0 } },
      { label: "🌞 Stay hydrated in hot weather", value: "heat", score: { hydration: 2, sports: 0 } },
      { label: "🏃 Improve recovery and endurance", value: "endurance", score: { hydration: 0, sports: 2 } },
    ],
  },
];

export default function QuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [result, setResult] = useState<"hydration" | "sports" | null>(null);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    let hydrationScore = 0;
    let sportsScore = 0;

    questions.forEach((q) => {
      const selectedValues = answers[q.id] || [];
      selectedValues.forEach((val) => {
        const option = q.options.find((o) => o.value === val);
        if (option) {
          hydrationScore += option.score.hydration;
          sportsScore += option.score.sports;
        }
      });
    });

    setResult(sportsScore > hydrationScore ? "sports" : "hydration");
  };

  const handleOptionSelect = (qId: number, val: string, multi: boolean) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (multi) {
        if (current.includes(val)) return { ...prev, [qId]: current.filter((v) => v !== val) };
        return { ...prev, [qId]: [...current, val] };
      }
      return { ...prev, [qId]: [val] };
    });

    if (!multi) {
        setTimeout(() => {
            // Need to check currentStep again or rely on closure? Closure is fine since we don't depend on stale state for next step calc here, but accessing currentStep state inside timeout might be stale if it changed quickly?
            // Actually, best to just call handleNext();
            // But handleNext uses currentStep state.
            // Let's us functional update on setCurrentStep if possible, or just trust the closure capture is "current enough" since user can't click fast.
            // A clearer way:
            setCurrentStep((prevStep) => {
                if (prevStep < questions.length - 1) {
                    return prevStep + 1;
                } else {
                    // This is side effect inside setState, strictly discouraged but might work.
                    // Better:
                    return prevStep;
                }
            });
            // Actually, we can just check if we are at the end.
            if (currentStep === questions.length - 1) {
                 calculateResult(); // This might use stale 'answers' if setAnswers hasn't flushed?
                 // React batching usually handles this in event handlers, but timeout breaks batching in React 17-, fine in 18.
                 // To be safe, calculateResult relies on 'answers'.
            } else {
                setCurrentStep(c => c + 1);
            }
        }, 200);

        // Wait, if I use functional update for setAnswers, 'answers' variable in scope is STALE.
        // calculateResult uses 'answers' state.
        // If I call calculateResult inside timeout, it uses 'answers' from closure (STALE).
        // So for the last question, auto-advance is tricky if it triggers result.
        // Let's keep it simple: check if it's the last question.
        if (qId === 6) { // Hardcoded or check index
             // Just let user click next for the last one? Or force update?
             // Or use a useEffect to listen to answers change?
        }
    }
  };

  // Refined auto-advance logic to avoid stale state issues:
  // We'll use a useEffect to detect answer changes for single-select questions and advance.
  // But wait, we want a delay.

  // Let's rewrite handleOptionSelect to be simpler and trust React 18 auto-batching or just accept small race condition is unlikely for single user click.
  // Actually, for the last question, we must ensure answers are updated.

  const handleOptionSelectSimple = (qId: number, val: string, multi: boolean) => {
      let newAnswers = {...answers};
      if (multi) {
          const current = newAnswers[qId] || [];
          if (current.includes(val)) {
              newAnswers[qId] = current.filter(v => v !== val);
          } else {
              newAnswers[qId] = [...current, val];
          }
          setAnswers(newAnswers);
      } else {
          newAnswers = { ...newAnswers, [qId]: [val] };
          setAnswers(newAnswers);

          setTimeout(() => {
             if (currentStep < questions.length - 1) {
                 setCurrentStep(c => c + 1);
             } else {
                 // For last step, we need to calculate result using the NEW answers.
                 // We can pass the new answers to calculateResult
                 calculateResultWithAnswers(newAnswers);
             }
          }, 250);
      }
  };

  const calculateResultWithAnswers = (currentAnswers: Record<number, string[]>) => {
    let hydrationScore = 0;
    let sportsScore = 0;

    questions.forEach((q) => {
      const selectedValues = currentAnswers[q.id] || [];
      selectedValues.forEach((val) => {
        const option = q.options.find((o) => o.value === val);
        if (option) {
          hydrationScore += option.score.hydration;
          sportsScore += option.score.sports;
        }
      });
    });

    setResult(sportsScore > hydrationScore ? "sports" : "hydration");
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  // Reset quiz when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white border border-black/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/10 flex justify-between items-center bg-white/50">
           {!result && (
              <div className="flex items-center gap-4">
                {currentStep > 0 && (
                  <button onClick={handleBack} className="p-1 hover:bg-black/5 rounded-full transition-colors" title="Back">
                    <ChevronRight className="w-4 h-4 rotate-180 text-zinc-500" />
                  </button>
                )}
                <div className="text-sm font-semibold text-zinc-500">
                  Question {currentStep + 1}/{questions.length}
                </div>
              </div>
           )}
           {result && (
               <div className="text-sm font-semibold text-emerald-400">Match Found!</div>
           )}
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-black">{questions[currentStep].question}</h2>
                <div className="grid gap-3">
                  {questions[currentStep].options.map((opt) => {
                    const isSelected = (answers[questions[currentStep].id] || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionSelectSimple(questions[currentStep].id, opt.value, !!questions[currentStep].multiSelect)}
                        className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-black/5 border-black/10 text-zinc-700 hover:bg-black/10"
                        }`}
                      >
                        <span className="font-medium text-lg">{opt.label}</span>
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <ResultView result={result} onClose={onClose} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer (Navigation) */}
        {!result && (
          <div className="p-6 border-t border-black/10 bg-white/50 flex justify-end">
            {questions[currentStep].multiSelect && (
                <button
                onClick={() => handleNext()}
                disabled={!(answers[questions[currentStep].id] && answers[questions[currentStep].id].length > 0)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                {currentStep === questions.length - 1 ? "Get Results" : "Next"}
                <ChevronRight className="w-5 h-5" />
                </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ResultView({ result, onClose }: { result: "hydration" | "sports"; onClose: () => void }) {
  const isSports = result === "sports";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-4"
    >
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-black/20 to-transparent flex items-center justify-center text-5xl">
        {isSports ? "⚡" : "💧"}
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">
          {isSports ? "You train hard — your hydration should too." : "You’re all about balance."}
        </h2>
        <p className="text-xl text-zinc-600">
          We recommend the <span className={`font-bold ${isSports ? "text-red-400" : "text-blue-400"}`}>
            {isSports ? "Sports Blend" : "Hydration Blend"}
          </span>
        </p>
      </div>

      <div className="p-6 bg-black/5 rounded-2xl border border-black/10 text-left space-y-4">
        <p className="text-zinc-700">
          {isSports
            ? "The Namakh Sports Blend fuels your toughest sessions with electrolytes and clean energy. Designed for endurance, athletes, and anyone who sweats a lot."
            : "The Namakh Hydration Blend keeps you energized and clear-headed every day — without sugar or heaviness. Perfect for light training, travel, or just better hydration in hot climates."
          }
        </p>
        <ul className="space-y-2">
           {isSports ? (
             <>
                <li className="flex gap-2 text-sm text-zinc-600"><Check className="w-4 h-4 text-emerald-500"/> 1000 mg Sodium</li>
                <li className="flex gap-2 text-sm text-zinc-600"><Check className="w-4 h-4 text-emerald-500"/> 3g Dextrose for Energy</li>
             </>
           ) : (
             <>
                <li className="flex gap-2 text-sm text-zinc-600"><Check className="w-4 h-4 text-emerald-500"/> 600 mg Sodium</li>
                <li className="flex gap-2 text-sm text-zinc-600"><Check className="w-4 h-4 text-emerald-500"/> Zero Sugar</li>
             </>
           )}
        </ul>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Link
            href={isSports ? "/shop/sports-blend" : "/shop/hydration-blend"}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-colors"
            onClick={onClose}
        >
          Shop {isSports ? "Sports Blend" : "Hydration Blend"}
        </Link>
        <button
            onClick={onClose}
            className="text-zinc-500 text-sm hover:text-black transition-colors"
        >
            Maybe later
        </button>
      </div>
    </motion.div>
  );
}
