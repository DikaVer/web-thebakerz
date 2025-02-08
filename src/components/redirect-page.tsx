'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/react';
import { Button } from '@/components/ui/button';
import {IconLoadingCircle} from "@/components/ui/icons";

interface SuccessRedirectProps {
    redirectPage: string;
    text: string;
}

const SuccessRedirect: React.FC<SuccessRedirectProps> = ({ redirectPage, text }) => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (countdown <= 0) {
            router.replace(redirectPage);
        }
    }, [countdown, redirectPage, router]);

    return (
        <Card className='w-full max-w-xl'>
            <CardBody className='w-full max-w-xl flex flex-col items-center gap-4'>
                <h1 className="text-xl font-semibold">Success!</h1>
                <p className="text-center">{text}</p>
                <IconLoadingCircle strokeWidth={3} className="text-grayText w-20 h-20" />
                <div className="text-3xl font-bold pulsate-bck-normal">
                    {countdown} seconds
                </div>
                <p>Hold tight or click the button below to go now:</p>
                <Button onClick={() => router.replace(redirectPage)} className="rounded-xl">
                    Redirect Now
                </Button>
            </CardBody>
        </Card>
    );
};

export default SuccessRedirect;
