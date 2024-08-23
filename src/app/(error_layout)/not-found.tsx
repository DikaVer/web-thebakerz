import { ExternalLink } from '@/components/external-link'

export default function NotFound() {
    return (
                <main className="z-10 flex-grow container mx-auto text-center">
                    <div className="flex flex-col min-h-screen">
                        <p className={"text-3xl my-10"}>Sorry, this page isn&apos;t available.</p>
                        <p>
                            The link you followed may be broken, or the page may have been removed.
                        </p>
                        <ExternalLink href="/">
                            Go back to TheBakerz
                        </ExternalLink>
                    </div>
                </main>
    );
}