import Image from "next/image";

export default function RootedSection() {
    return (
        <section className="w-full py-6 px-4 bg-neutral-100/25 relative">
            <div className="absolute inset-0 bg-[url('/assets/grain.png')] opacity-10 pointer-events-none mix-blend-multiply"></div>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                {/* Desktop Image - hidden on mobile */}
                <div className="relative h-[25rem] w-full rounded-3xl overflow-hidden hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/40 to-indigo-900/40" />
                    <Image
                        src="/assets/namakh_logo_droplet.png"
                        alt="Namakh Roots"
                        fill
                        className="object-contain opacity-80"
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-semibold tracking-[0.3em] text-orange-400 uppercase">Rooted in India 🇮🇳. Made for the World.</h2>
                    <h3 className="text-4xl md:text-6xl font-bold">
                        Salt. The essence of balance.
                    </h3>

                    {/* Mobile Image - shown only on mobile, between title and paragraph */}
                    <div className="relative h-[25rem] w-full rounded-3xl overflow-hidden md:hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/40 to-indigo-900/40" />
                        <Image
                            src="/assets/namakh_logo_droplet.png"
                            alt="Namakh Roots"
                            fill
                            className="object-contain opacity-80"
                        />
                    </div>

                    <p className="text-lg text-neutral-600 leading-relaxed">
                        Our name comes from the Hindi word &ldquo;Namakh&rdquo;.
                        <br/>
                        We&apos;re bringing India&apos;s ancient wisdom and modern performance science together in every scoop.
                    </p>
                </div>
            </div>
        </section>
    );
}
