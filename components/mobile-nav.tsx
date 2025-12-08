"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconShoppingCart, IconDroplet, IconQuestionMark } from "@tabler/icons-react";

interface MobileNavProps {
    onQuizClick?: () => void;
}

export default function MobileNav({ onQuizClick }: MobileNavProps) {
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
            href: "#",
        },
        {
            title: "Cart",
            icon: <IconShoppingCart className="h-full w-full text-neutral-200" />,
            href: "/cart",
        },
    ];

    const handleClick = (e: React.MouseEvent, title: string) => {
        if (title === "Find Your Blend" && onQuizClick) {
            e.preventDefault();
            onQuizClick();
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] md:hidden">
            <FloatingDock
                items={navItems.map((item) => ({
                    ...item,
                    icon: (
                        <div onClick={(e) => handleClick(e, item.title)}>
                            {item.icon}
                        </div>
                    ),
                }))}
                mobileClassName="bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-2xl"
            />
        </div>
    );
}
