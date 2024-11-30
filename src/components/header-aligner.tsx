import React, { ReactNode } from "react";

export const HeaderAligner = ({ children }: { children: ReactNode }) => {
    return (
        <div className={'flex flex-row'}>
            <span className={`w-[18rem] min-h-screen hidden desktop:flex`} />
            <div className={'w-full flex-1'}>
                {children}
            </div>
        </div>
    );
};