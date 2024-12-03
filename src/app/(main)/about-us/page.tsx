import {Image} from "@nextui-org/react";
import VerticalStepsAboutUs from "@/components/ui/vertical-steps-about-us";

export default async function Page() {

    return (
        <div className="flex flex-col min-h-screen">
            <main className="z-10 grid container mx-auto py-6 gap-y-3">
                <p className={`text-2xl font-bold`}>
                    Our Journey
                </p>
                <VerticalStepsAboutUs
                    currentStep={3}
                    steps={[
                        {
                            title: "April 2024",
                            description: "TheBakerz emerged from extensive consultations with artisan bakers across multiple countries. These discussions shaped our understanding of the industry’s needs and set our development direction.",
                        },
                        {
                            title: "August 2024",
                            description: "August marked our official registration with the Dutch Chamber of Commerce (KVK) and our entry into the prestigious Brightlands Startup Challenge",
                        },
                        {
                            title: "September 2024",
                            description: "In September, we joined the Ondernemersklankbord (OKB) mentorship program, connecting with experienced business advisors who guide our strategic growth.",
                        },
                        {
                            title: "November 2024",
                            description: "By November, TheBakerz achieved recognition as one of the top 40 startups in the Brightlands Startup Challenge and submitted our application for LIOF’s InnovatieProject funding.",
                        },
                        {
                            title: "December 2024",
                            description: "December brought an exclusive invitation to participate in the Philips Innovation Award competition, which we proudly accepted.",
                        },
                    ]}
                />
                <p className={`text-2xl font-bold`}>
                    Our Forecast
                </p>
                <VerticalStepsAboutUs
                    currentStep={-1}
                    plusRange={5}
                    steps={[
                        {
                            title: "April 2025",
                            description: "Launch of our web platform",
                        },
                        {
                            title: "June 2025",
                            description: "Initial onboarding phase with 10 artisan bakers",
                        },
                        {
                            title: "July 2025",
                            description: "Mobile platform release",
                        },
                        {
                            title: "September 2025",
                            description: "Expansion to 30 bakers",
                        },
                        {
                            title: "January 2026",
                            description: "Complete integration of AI capabilities",
                        },
                    ]}
                />
                <p className={`ml-10`}>
                    This timeline represents the beginning of our journey, with many more milestones ahead as we continue to innovate and grow.
                </p>

                <p className={`text-2xl font-bold`}>
                    Our Story
                </p>
                <p className={`ml-10`}>
                    In a world where special moments deserve extraordinary desserts, TheBakerz emerged from a simple yet
                    powerful observation: the artisanal bakery industry is in urgent need of digital transformation.
                    While
                    the Netherlands has seen a remarkable 85% surge in self-employment and a 20% growth in bakery
                    establishments, we noticed that some talented bakers were spending more time managing spreadsheets
                    than
                    creating magical desserts.
                </p>

                <p className={`text-2xl font-bold`}>
                    Our Purpose
                </p>
                <p className={`ml-10`}>
                    We believe that every celebration, every gathering, and every precious moment deserves its perfect
                    sweet
                    companion. More importantly, we believe that talented bakers should be free to focus on what they do
                    best - crafting exceptional desserts that make these moments unforgettable.
                </p>

                <p className={`text-2xl font-bold`}>
                    Our Community
                </p>
                <p className={`text-xl font-semibold ml-5`}>
                    For Artisanal Professionals
                </p>
                <p className={`ml-10`}>
                    We unite passionate bakers across the spectrum - from established pastry shops to emerging home
                    bakers -
                    in a vibrant digital ecosystem where craft meets innovation. By handling the complexities of
                    business
                    management through our AI-powered tools, we empower baking professionals to grow their businesses
                    while
                    staying true to their artistry.
                </p>


                <p className={`text-xl font-semibold ml-5`}>
                    For Dessert Enthusiasts
                </p>
                <p className={`ml-10`}>
                    Finding the perfect dessert for your special occasion shouldn&apos;t be a challenge. Our platform
                    connects
                    you with talented local bakers who can bring your sweet dreams to life, whether you&apos;re seeking
                    traditional favorites or specialized dietary options.
                </p>

                <p className={`text-2xl font-bold`}>
                    Our Vision
                </p>
                <p className={`ml-5`}>
                    We&apos;re building more than just a platform - we&apos;re nurturing a revolution in artisanal baking.
                    Starting
                    from our home in Limburg, we&apos;re creating a future where:
                </p>

                <p className={`ml-10`}>
                    <p>
                        • Talented bakers can thrive by focusing on their craft
                    </p>

                    <p>
                        • Every special occasion finds its perfect dessert match
                    </p>

                    <p>
                        • Local communities grow stronger through the shared love of artisanal baking
                    </p>
                </p>


                <p className={`ml-5`}>
                    Join us in transforming the world of artisanal baking, one celebration at a time. Because at
                    TheBakerz,
                    we believe that when bakers succeed, celebrations become sweeter, and communities grow stronger
                    together.
                </p>
                <div className={`w-full flex justify-center`}>
                    <Image
                        src={'/images/TheBakerzBack4K.svg'}
                        alt={'TheBakerz background image'}
                    />
                </div>
            </main>
        </div>
    );
}