import type { Metadata } from 'next';
import Image from 'next/image';
import { pacifico } from '@/components/fonts';

export const metadata: Metadata = {
    title: 'Thank You · TheBakerz',
    description: 'TheBakerz has closed its doors. Thank you to every baker and customer who was part of the journey.',
    robots: { index: false, follow: false },
    alternates: { canonical: 'https://www.thebakerz.com/closing' },
};

// Inline (Heroicons-style) SVG icons — kept local so the page renders fully on
// the server with no client JS or external icon fetch.
const iconPaths: Record<string, string> = {
    shop: 'M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z',
    cake: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513m-9-4.871v-1.5m6 1.5v-1.5m6 9.621-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12',
    heart: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
    bag: 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z',
};

const Icon = ({ name, className = '', size = 36 }: { name: string; className?: string; size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d={iconPaths[name]} />
    </svg>
);

const highlights = [
    { icon: 'shop', label: 'Local bakeries' },
    { icon: 'cake', label: 'Handmade cakes' },
    { icon: 'heart', label: 'A community of bakers' },
    { icon: 'bag', label: 'Thousands of orders' },
];

export default function ClosingPage() {
    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#f7f6f5]">
            {/* Soft background image, faded */}
            <div className="pointer-events-none absolute inset-0">
                <Image
                    src="/landing/landingImage.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#f7f6f5]/70 via-[#f7f6f5]/85 to-[#f7f6f5]" />
            </div>

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[hsl(302,81%,35%)]/15 blur-3xl" />

            <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center px-5 py-16 text-center md:py-24">
                {/* Logo */}
                <Image
                    src="/images/TheBakerzLogo.svg"
                    alt="TheBakerz"
                    width={84}
                    height={84}
                    className="closing-fade mb-6 h-20 w-20 drop-shadow-sm md:h-24 md:w-24"
                    style={{ animationDelay: '0ms' }}
                    priority
                />

                <h1
                    className={`closing-fade ${pacifico.className} mb-4 text-5xl text-[#0E0205] drop-shadow-sm sm:text-6xl`}
                    style={{ animationDelay: '80ms' }}
                >
                    TheBakerz
                </h1>

                <p
                    className="closing-fade mb-3 text-2xl font-semibold text-[#0E0205] sm:text-3xl"
                    style={{ animationDelay: '160ms' }}
                >
                    Thank you for everything.
                </p>

                <p
                    className="closing-fade max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg"
                    style={{ animationDelay: '240ms' }}
                >
                    After an unforgettable journey, TheBakerz has closed its doors for good.
                    We&apos;re endlessly grateful to the bakers who shared their craft and to every
                    customer who tasted something made with love. This chapter is over — but the
                    memories, and the crumbs, were worth every moment.
                </p>

                {/* Video */}
                <div className="closing-fade mt-12 w-full max-w-3xl" style={{ animationDelay: '320ms' }}>
                    <div className="relative rounded-3xl bg-white/40 p-3 shadow-xl backdrop-blur-sm md:p-5">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/2hlFLVs1oMk?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0&color=white&theme=dark"
                                title="TheBakerz — Thank you"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                className="absolute inset-0 h-full w-full border-0"
                            />
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/10" />
                        </div>
                    </div>
                </div>



                {/* Sign-off */}
                <div className="closing-fade mt-16 flex flex-col items-center gap-2 text-gray-500" style={{ animationDelay: '480ms' }}>
                    <div className="flex items-center gap-2 text-base font-medium text-[#0E0205]">
                        Made with
                        <Icon name="heart" size={20} className="fill-primary text-primary" />
                        by TheBakerz team
                    </div>
                    <p className="text-sm">© 2026 TheBakerz. All good things come to an end.</p>
                </div>
            </div>
        </main>
    );
}
