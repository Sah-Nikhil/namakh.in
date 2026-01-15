import Image from "next/image";
import { motion } from "framer-motion";

export default function RootedSection() {
    const audienceItems = [
    { icon: "🏃‍♂", label: "Athletes\n& Lifters" },
    { icon: "🌞", label: "Heat & Humid\nClimates" },
    { icon: "🧘", label: "Everyday\nWellness" },
    { icon: "💼", label: "Work\n& Travel" },
];
    function Flag() {
        return (
            <span className="md:hidden" role="img" aria-label="India Flag">
                🇮🇳
            </span>
            );
    }

    return (
        <section className="w-full py-6 px-4 bg-neutral-100/25 dark:bg-neutral-900 relative">
            <div className="absolute inset-0 bg-[url('/assets/grain.png')] opacity-10 pointer-events-none mix-blend-multiply"></div>
            {/* <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                {/* Desktop Image - hidden on mobile
                <div className="relative h-[25rem] w-full rounded-3xl overflow-hidden hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/40 to-indigo-900/40 dark:from-orange-400/20 dark:to-indigo-400/20" />
                    <Image
                        src="/assets/namakh_logo_droplet.png"
                        alt="Namakh Roots"
                        fill
                        className="object-contain opacity-80"
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-semibold tracking-[0.3em] text-orange-400 dark:text-orange-300 uppercase">Rooted in India {Flag()}. Made for the World.</h2>
                    <h3 className="text-4xl md:text-6xl font-bold dark:text-white">
                        Salt. The essence of balance.
                    </h3>

                    {/* Mobile Image - shown only on mobile, between title and paragraph
                    <div className="relative h-[25rem] w-full rounded-3xl overflow-hidden md:hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/40 to-indigo-900/40 dark:from-orange-400/20 dark:to-indigo-400/20" />
                        <Image
                            src="/assets/namakh_logo_droplet.png"
                            alt="Namakh Roots"
                            fill
                            className="object-contain opacity-80"
                        />
                    </div>

                    <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        Our name comes from the Hindi word &ldquo;Namakh&rdquo;.
                        <br/>
                        We&apos;re bringing India&apos;s ancient wisdom and modern performance science together in every scoop.
                    </p>
                </div>
            </div> */}
            <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-2 pt-12"
                >
                    <h1 className="text-[1.4rem] font-semibold tracking-[0.3em] text-blue-400 uppercase">Who is Namakh for?</h1>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                    {audienceItems.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                            <span className="text-4xl">{item.icon}</span>
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 whitespace-pre-line">{item.label}</span>
                        </div>
                    ))}
                </div>
                </div>
        </section>
    );
}
