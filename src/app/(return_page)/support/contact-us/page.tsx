import ContactUsComponent from "@/components/support/contact-us-component";

export default async function Page() {


    return (
        <div className={'flex flex-col w-full justify-center items-center'}>
            <div
                className={'flex flex-col items-center justify-center w-full max-w-xl text-center py-12 px-4'}
            >
                <h2
                    className={`font-medium`}
                >
                    Support
                </h2>
                <h1
                    className={`text-3xl font-medium tracking-tight lg:text-5xl`}
                >
                    Contact Us
                </h1>
                <h2
                    className={`mt-2 text-medium text-default-500 lg:mt-4 lg:text-large`}
                >
                    We are here to assist you during our business hours. Please feel free to contact us for any questions or issues you may have.
                </h2>
            </div>
            <ContactUsComponent/>
        </div>
    );
}