"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconShoppingCart, IconDroplet, IconQuestionMark } from "@tabler/icons-react";
import { useQuiz } from "@/components/quiz/quiz-context";

// FloatingDock only renders links, so the quiz item gets a real fallback href
// (the landing page's quiz CTA) and the click is intercepted below to open the
// quiz in place instead.
const QUIZ_HREF = "/#blends";

export default function MobileNav() {
    const quiz = useQuiz();

    const navItems = [
        {
            title: "Home",
            icon: <IconHome className="h-full w-full text-neutral-200" />,
            href: "/",
        },
        {
            title: "Shop",
            icon: <IconDroplet className="h-full w-full text-neutral-200" />,
            href: "/shop",
        },
        {
            title: "Find Your Blend",
            icon: <IconQuestionMark className="h-full w-full text-neutral-200" />,
            href: QUIZ_HREF,
        },
        {
            title: "Cart",
            icon: <IconShoppingCart className="h-full w-full text-neutral-200" />,
            href: "/cart",
        },
    ];

    // Captured on the wrapper so the whole round dock button counts, not just
    // the small icon inside it.
    const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
        const link = (e.target as HTMLElement).closest("a");
        if (link?.getAttribute("href") === QUIZ_HREF) {
            e.preventDefault();
            quiz.open();
        }
    };

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] md:hidden"
            onClickCapture={handleClickCapture}
        >
            <FloatingDock
                items={navItems}
                mobileClassName="bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-2xl"
            />
        </div>
    );
}
