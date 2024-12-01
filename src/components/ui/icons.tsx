import React, {useState} from 'react';

const colors = {
    primary: '#730C6F', //'#730C6F'
    secondary: '#F8CE87', //'#F8CE87'
    black: '#1f2937',
    heart: '#ce2751',
    white: '#ffffff',
};



// @ts-ignore
const MoonIcon = (props) => (
    <svg
        aria-hidden="true"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
            fill="currentColor"
        />
    </svg>
);

// @ts-ignore
const SunIcon = (props) => (
    <svg
        aria-hidden="true"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <g fill="currentColor">
            <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
            <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
        </g>
    </svg>
);

interface IconProps extends React.ComponentProps<'svg'> {
    className?: string;
}

const IconCart: React.FC<IconProps> = ({
                                               className = '',
                                               viewBox = "0 0 576 512",
                                               ...props
                                           }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            {...props}
        >
            <path
                d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"
            />
        </svg>
    );
};

interface RadioProps {
    checked: boolean;
    onChange: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
    Container: {
        cursor: 'pointer',
        width: '20px',
        height: '20px',
        display: 'block',
        position: 'relative',
        pointerEvents: 'auto',
        borderRadius: '9999px',
        boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.08)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        border: '3px solid rgba(93, 93, 91, 1)',
    },
    Check: {
        display: 'none',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 'calc(100% - 8px)',
        height: 'calc(100% - 8px)',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.3s ease',
        borderRadius: '9995px',
        backgroundColor: 'rgba(93, 93, 91, 1)',
    },
    Input: {
        position: 'absolute',
        opacity: 0,
        visibility: 'hidden',
        width: '1px',
        height: '1px',
        pointerEvents: 'none',
    },
};

const Radio: React.FC<RadioProps> = ({ checked, onChange }) => {
    return (
        <div style={styles.Container} onClick={onChange}>
            <div
                style={{
                    ...styles.Check,
                    display: checked ? 'block' : 'none',
                }}
            />
            <input type="radio" style={styles.Input} checked={checked} onChange={onChange} />
        </div>
    );
};


const IconCalendar: React.FC<IconProps> = ({
                                                       className = '',
                                                       viewBox = "0 0 24 24",
                                                       ...props
                                                   }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
};


const IconMenu: React.FC<IconProps> = ({
                                               className = '',
                                               viewBox = "0 0 448 512",
                                               ...props
                                           }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
            />
        </svg>
    );
};

interface IconStarProps extends IconProps {
    state?: 'full' | 'half' | 'empty';
}

const IconStar: React.FC<IconStarProps> = ({
                                               className = '',
                                               viewBox = "0 0 24 24",
                                               state = 'full',
                                               ...props
                                           }) => {
    // Determine additional classes based on the state
    const stateClasses = {
        full: "fill-current text-current stroke-current",
        half: "fill-current text-current",
        empty: "fill-none stroke-current text-primary",
    };

    return (
        <svg
            viewBox={viewBox}
            className={`${stateClasses[state]} ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            {state === 'half' ? (
                <>
                    <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <clipPath id="half-star">
                        <rect x="0" y="0" width="12" height="24" />
                    </clipPath>
                    <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        clipPath="url(#half-star)"
                        fill="currentColor"
                    />
                </>
            ) : (
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            )}
        </svg>
    );
};

const IconPlus: React.FC<IconProps> = ({
                                               className = '',
                                               viewBox = "0 0 24 24",
                                               ...props
                                           }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
    );
};

const IconLocation: React.FC<IconProps> = ({
                                                       className = '',
                                                       viewBox = "0 0 22 22",
                                                       ...props
                                                   }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
            />
        </svg>
    );
};

const IconThreeDots: React.FC<IconProps> = ({
                                                         className = '',
                                                         viewBox = "0 0 24 24",
                                                         ...props
                                                     }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
    );
};

const IconChevronDown: React.FC<IconProps> = ({
                                                             className = '',
                                                             viewBox = "0 0 24 24",
                                                             ...props
                                                         }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
    );
};

const IconBill: React.FC<IconProps> = ({
                                               className = '',
                                               viewBox = "0 0 24 24",
                                               ...props
                                           }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
        </svg>
    );
};

const IconSupport: React.FC<IconProps> = ({
                                                     className = '',
                                                     viewBox = "0 0 24 24",
                                                     ...props
                                                 }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
                d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z"
            />
            <path d="M9 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM15 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2z" />
            <path
                d="M18 11.03A6.04 6.04 0 0 0 12.05 6c-3.03 0-6.29 2.51-6.03 6.45a8.075 8.075 0 0 0 4.86-5.89c1.31 2.63 4 4.44 7.12 4.47z"
            />
        </svg>
    );
};

const IconPayment: React.FC<IconProps> = ({
                                                     className = '',
                                                     viewBox = "0 0 24 24",
                                                     ...props
                                                 }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z">
            </path>
        </svg>
    );
};

const IconAvatar: React.FC<IconProps> = ({
                                             className = '',
                                                   viewBox = "0 0 24 24",
                                                   ...props
                                               }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z"
            />
        </svg>
    );
};

const IconTrash: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
    );
};

const IconMinus: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 13H5v-2h14v2z" />
        </svg>
    );
};

const IconShare: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
                d="m16 5-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6a2 2 0 0 1-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3a2 2 0 0 1 2 2z"
            />
        </svg>
    );
};


const IconCross: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
};




const IconEdit: React.FC<IconProps> = ({
                                               className = '',
                                               viewBox = "0 0 24 24",
                                               ...props
                                           }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
        </svg>
    );
};

const IconClock: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
            />
            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
    );
};

const IconArrow: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="m9 19 1.41-1.41L5.83 13H22v-2H5.83l4.59-4.59L9 5l-7 7 7 7z" />
        </svg>
    );
};

const IconStore: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 576 512", // Updated to match the SVG's original viewBox
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path
                d="M495.5 223.2C491.6 223.7 487.6 224 483.4 224C457.4 224 434.2 212.6 418.3 195C402.4 212.6 379.2 224 353.1 224C327 224 303.8 212.6 287.9 195C272 212.6 248.9 224 222.7 224C196.7 224 173.5 212.6 157.6 195C141.7 212.6 118.5 224 92.36 224C88.3 224 84.21 223.7 80.24 223.2C24.92 215.8-1.255 150.6 28.33 103.8L85.66 13.13C90.76 4.979 99.87 0 109.6 0H466.4C476.1 0 485.2 4.978 490.3 13.13L547.6 103.8C577.3 150.7 551 215.8 495.5 223.2H495.5zM499.7 254.9C503.1 254.4 508 253.6 512 252.6V448C512 483.3 483.3 512 448 512H128C92.66 512 64 483.3 64 448V252.6C67.87 253.6 71.86 254.4 75.97 254.9L76.09 254.9C81.35 255.6 86.83 256 92.36 256C104.8 256 116.8 254.1 128 250.6V384H448V250.7C459.2 254.1 471.1 256 483.4 256C489 256 494.4 255.6 499.7 254.9L499.7 254.9z"
            />
        </svg>
    );
};

const IconHome: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
            <path d="M2 7h20" />
            <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
        </svg>
    );
};

const IconOrder: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 384 512", // Updated to match the SVG's original viewBox
                                                 ...props
                                             }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path
                d="M336 64h-53.88C268.9 26.8 233.7 0 192 0S115.1 26.8 101.9 64H48C21.5 64 0 85.48 0 112v352C0 490.5 21.5 512 48 512h288c26.5 0 48-21.48 48-48v-352C384 85.48 362.5 64 336 64zM96 392c-13.25 0-24-10.75-24-24S82.75 344 96 344s24 10.75 24 24S109.3 392 96 392zM96 296c-13.25 0-24-10.75-24-24S82.75 248 96 248S120 258.8 120 272S109.3 296 96 296zM192 64c17.67 0 32 14.33 32 32c0 17.67-14.33 32-32 32S160 113.7 160 96C160 78.33 174.3 64 192 64zM304 384h-128C167.2 384 160 376.8 160 368C160 359.2 167.2 352 176 352h128c8.801 0 16 7.199 16 16C320 376.8 312.8 384 304 384zM304 288h-128C167.2 288 160 280.8 160 272C160 263.2 167.2 256 176 256h128C312.8 256 320 263.2 320 272C320 280.8 312.8 288 304 288z">
            </path>
        </svg>
    );
};

const IconMessage: React.FC<IconProps> = ({
                                              className = '',
                                              viewBox = "0 0 24 24",
                                              ...props
                                          }) => {
    return (
        <svg
            viewBox={viewBox}
            className={`fill-current text-current ${className}`}
            aria-hidden="true"
            focusable="false"
            role="presentation"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none"/>
            <path
                d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"
            />
        </svg>
    );
};

function IconHeart({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       state = "full",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' | 'heart'
                   state?: "full" | "empty"},
) {
    let styles = {
        color: colors[color],
        fill: colors[color],
    };


    //"0 0 512 512"
    return (
        <div className={`${className}`}>
            <svg style={styles}
                 viewBox={viewBox}
                 strokeWidth="50"
                 {...props}
            >
                <path
                    d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z">
                </path>
            </svg>
        </div>
    );
}

interface IconHeartFavouritesProps extends React.ComponentProps<'svg'> {
    className?: string;
    state?: 'full' | 'empty';
}

const IconHeartFavourites: React.FC<IconHeartFavouritesProps> = ({
                                                                     className = '',
                                                                     viewBox = "0 0 24 24",
                                                                     state = "full",
                                                                     ...props
                                                                 }) => {
    // Determine classes based on the 'state' prop
    const stateClasses = state === 'full'
        ? 'fill-current stroke-none'    // Filled heart
        : 'fill-none stroke-current';  // Outlined heart

    return (
        <svg
            viewBox={viewBox}
            className={`${stateClasses} ${className}`}
            strokeWidth="3"
            stroke="currentColor"  // Ensures stroke uses current text color
            {...props}
        >
            <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42
           22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
        </svg>
    );
};

function IconSuccess({
                         className,
                         color = 'black', // default color
                         viewBox = "0 0 20 20",
                         ...props
                     }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' | 'heart' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    //"0 0 512 512"
    return (
        <div>
            <svg style={styles}
                 viewBox={viewBox}
                 className={`${className}`}
                 {...props}
            >
            <path fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"></path>
            </svg>
        </div>
    );
}

const IconTruck: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
        </svg>
    );
};

const IconEggOff: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-egg-off ${className}`}
        {...props}
    >
        <path d="M6.399 6.399C5.362 8.157 4.65 10.189 4.5 12c-.37 4.43 1.27 9.95 7.5 10 3.256-.026 5.259-1.547 6.375-3.625" />
        <path d="M19.532 13.875A14.07 14.07 0 0 0 19.5 12c-.36-4.34-3.95-9.96-7.5-10-1.04.012-2.082.502-3.046 1.297" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
);


const IconEgg: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-egg ${className}`}
        {...props}
    >
        <path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z" />
    </svg>
);

const IconMeet: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-beef ${className}`}
        {...props}
    >
        <circle cx="12.5" cy="8.5" r="2.5" />
        <path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z" />
        <path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5" />
    </svg>
);


const IconVegan: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-vegan ${className}`}
        {...props}
    >
        <path d="M16 8q6 0 6-6-6 0-6 6" />
        <path d="M17.41 3.59a10 10 0 1 0 3 3" />
        <path d="M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14" />
    </svg>
);


const IconGluten: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-wheat ${className}`}
        {...props}
    >
        <path d="M2 22 16 8" />
        <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
        <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    </svg>
);


const IconGlutenFree: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-wheat-off ${className}`}
        {...props}
    >
        <path d="m2 22 10-10" />
        <path d="m16 8-1.17 1.17" />
        <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97" />
        <path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62" />
        <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
        <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        <path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98" />
        <path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const IconNuts: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-nut ${className}`}
        {...props}
    >
        <path d="M12 4V2" />
        <path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4" />
        <path d="M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z" />
    </svg>
);


const IconNutsFree: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-nut-off ${className}`}
        {...props}
    >
        <path d="M12 4V2" />
        <path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592a7.01 7.01 0 0 0 4.125-2.939" />
        <path d="M19 10v3.343" />
        <path d="M12 12c-1.349-.573-1.905-1.005-2.5-2-.546.902-1.048 1.353-2.5 2-1.018-.644-1.46-1.08-2-2-1.028.71-1.69.918-3 1 1.081-1.048 1.757-2.03 2-3 .194-.776.84-1.551 1.79-2.21m11.654 5.997c.887-.457 1.28-.891 1.556-1.787 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4-.74 0-1.461.068-2.15.192" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
);



const IconCircleAlert: React.FC<IconProps> = ({className = '', ...props}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-circle-alert ${className}`}
        {...props}
    >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);


const IconCopy: React.FC<IconProps> = ({className = '', ...props}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-files ${className}`}
        {...props}
    >
        <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
        <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
        <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
    </svg>
);

const IconChefHat: React.FC<IconProps> = ({
                                                     className = '',
                                                     viewBox = "0 0 24 24",
                                                     ...props
                                                 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
            <path d="M6 17h12" />
        </svg>
    );
};

const IconAboutUs: React.FC<IconProps> = ({
                                                 className = '',
                                                 viewBox = "0 0 24 24",
                                                 ...props
                                             }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
};

const IconNotification: React.FC<IconProps> = ({

                                                                      height,
                                                                      width,
                                                                      className = '',
                                                                      ...props
                                                                  }) => {
    return (
        <svg
            fill="none"
            height={ height || 24}
            width={ width || 24}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={`stroke-current text-current ${className}`}
            {...props}
        >
            <path
                clipRule="evenodd"
                d="M18.707 8.796c0 1.256.332 1.997 1.063 2.85.553.628.73 1.435.73 2.31 0 .874-.287 1.704-.863 2.378a4.537 4.537 0 01-2.9 1.413c-1.571.134-3.143.247-4.736.247-1.595 0-3.166-.068-4.737-.247a4.532 4.532 0 01-2.9-1.413 3.616 3.616 0 01-.864-2.378c0-.875.178-1.682.73-2.31.754-.854 1.064-1.594 1.064-2.85V8.37c0-1.682.42-2.781 1.283-3.858C7.861 2.942 9.919 2 11.956 2h.09c2.08 0 4.204.987 5.466 2.625.82 1.054 1.195 2.108 1.195 3.745v.426zM9.074 20.061c0-.504.462-.734.89-.833.5-.106 3.545-.106 4.045 0 .428.099.89.33.89.833-.025.48-.306.904-.695 1.174a3.635 3.635 0 01-1.713.731 3.795 3.795 0 01-1.008 0 3.618 3.618 0 01-1.714-.732c-.39-.269-.67-.694-.695-1.173z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    );
};

const IconNotebookPen: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-notebook-pen ${className}`}
        {...props}
    >
        <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
        <path d="M2 6h4" />
        <path d="M2 10h4" />
        <path d="M2 14h4" />
        <path d="M2 18h4" />
        <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
    </svg>
);



const IconSearch: React.FC<IconProps> = ({
                                                   className = '',
                                                   viewBox = "0 0 24 24",
                                                   ...props
                                               }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={`stroke-current text-current ${className}`}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            role="img"
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
};

const IconCirclePlus: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-circle-plus ${className}`}
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
    </svg>
);



export {
    IconCart,
    IconCalendar,
    IconMenu,
    IconStar,
    IconLocation,
    IconThreeDots,
    IconChevronDown,
    IconPlus,
    IconBill,
    IconSupport,
    IconPayment,
    IconAvatar,
    IconTrash,
    IconMinus,
    IconCross,
    IconEdit,
    IconClock,
    IconArrow,
    IconStore,
    IconOrder,
    IconMessage,
    IconHeart,
    IconSuccess,
    IconCopy,
    IconShare,
    IconHeartFavourites,
    Radio,
    MoonIcon,
    SunIcon,
    IconTruck,
    IconHome,
    IconChefHat,
    IconAboutUs,
    IconSearch,
    IconNotification,
    IconCircleAlert,
    IconGlutenFree,
    IconGluten,
    IconVegan,
    IconMeet,
    IconEgg,
    IconEggOff,
    IconNuts,
    IconNutsFree,
    IconNotebookPen,
    IconCirclePlus
};