import React, {SVGProps} from 'react';

type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};


const colors = {
    primary: '#730C6F', //'#730C6F'
    secondary: '#faf4d1', //'#F8CE87'
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


const IconStar: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        className={`lucide lucide-star ${className}`}
        {...props}
    >
        <desc>Star 1 Streamline Icon: https://streamlinehq.com</desc>
        <g id="star-1--reward-rating-rate-social-star-media-favorite-like-stars">
            <path
                id="Union"
                fill="currentColor"
                fillRule="evenodd"
                d="M12 0.475c-0.34 0-0.673 0.097-0.96 0.281-0.283 0.181-0.509 0.438-0.652 0.741L7.666 6.991c-0.005 0.011-0.01 0.022-0.015 0.033a0.152 0.152 0 0 1-0.014 0.008c-0.002 0.001-0.003 0.002-0.005 0.007a0.109 0.109 0 0 1-0.005 0.007c-0.002 0.001-0.005 0.003-0.008 0.003a0.34 0.34 0 0 1-0.031 0.004L1.595 7.92c-0.331 0.032-0.647 0.157-0.912 0.359a1.63 1.63 0 0 0-0.596 0.819c-0.115 0.325-0.134 0.676-0.054 1.012a1.704 1.704 0 0 0 0.503 0.875l4.387 4.232a0.12 0.12 0 0 0 0.014 0.021c0.003 0.007 0.005 0.015 0.002 0.025l-1.045 6.117c-0.057 0.332-0.021 0.673 0.106 0.984 0.127 0.312 0.339 0.583 0.611 0.78 0.273 0.198 0.596 0.315 0.932 0.338a1.81 1.81 0 0 0 0.968-0.205l5.399-2.853a0.08 0.08 0 0 1 0.061 0l5.399 2.853c0.298 0.158 0.633 0.229 0.969 0.205 0.336-0.023 0.659-0.14 0.932-0.338 0.273-0.198 0.484-0.468 0.611-0.78 0.126-0.311 0.163-0.652 0.106-0.984l-1.045-6.117a0.12 0.12 0 0 0 0.003-0.026c0.007-0.007 0.014-0.014 0.02-0.02l4.386-4.232a1.63 1.63 0 0 0 0.503-0.875c0.08-0.335 0.061-0.686-0.054-1.012a1.63 1.63 0 0 0-0.596-0.819c-0.264-0.202-0.58-0.326-0.911-0.359l-5.992-0.888c-0.01-0.001-0.02-0.002-0.031-0.004a0.109 0.109 0 0 1-0.008-0.003c-0.002-0.001-0.004-0.003-0.005-0.007a0.152 0.152 0 0 1-0.014-0.008c-0.005-0.011-0.01-0.022-0.015-0.033L13.612 1.496a1.63 1.63 0 0 0-0.653-0.741A1.495 1.495 0 0 0 12 0.475z"
                clipRule="evenodd"
            />
        </g>
    </svg>
);


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

const IconSuccess: React.FC<IconProps> = ({
                                                     className = '',
                                                     color = 'primary',
                                                     viewBox = "0 0 20 20",
                                                     ...props
                                                 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="currentColor"
        className={`${className} text-${color}`}
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
        />
    </svg>
);

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

interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
    fill?: string;
    filled?: boolean;
    size?: number;
    height?: number;
    width?: number;
    label?: string;
}

const IconBadgeCheck: React.FC<IconProps> = ({ className = '', ...props }) => (
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
        className={`lucide lucide-badge-check ${className}`}
        {...props}
    >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const HeartIcon: React.FC<HeartIconProps> = ({
                                                 fill = 'currentColor',
                                                 filled,
                                                 size,
                                                 height,
                                                 width,
                                                 label,
                                                 ...props
                                             }) => {
    return (
        <svg
            width={size || width || 24}
            height={size || height || 24}
            viewBox="0 0 24 24"
            fill={filled ? fill : 'none'}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
                stroke={fill}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const IconSend: React.FC<IconProps> = ({ className = '', ...props }) => (
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
        className={`lucide lucide-send ${className}`}
        {...props}
    >
        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
        <path d="m21.854 2.147-10.94 10.939" />
    </svg>
);

const IconHeartCrack: React.FC<IconProps> = ({ className = '', ...props }) => (
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
        className={`lucide lucide-heart-crack ${className}`}
        {...props}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="m12 13-1-1 2-2-3-3 2-2" />
    </svg>
);

const IconBadgeInfo: React.FC<IconProps> = ({ className = '', ...props }) => (
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
        className={`lucide lucide-badge-info ${className}`}
        {...props}
    >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const IconBadge: React.FC<IconProps> = ({ className = '', ...props }) => (
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
        className={`lucide lucide-badge ${className}`}
        {...props}
    >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    </svg>
);

const IconMail: React.FC<IconProps> = ({ className = '', ...props }) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        className={className}
        {...props}
    >
        <path
            d="M17 3.5H7C4 3.5 2 5 2 8.5V15.5C2 19 4 20.5 7 20.5H17C20 20.5 22 19 22 15.5V8.5C22 5 20 3.5 17 3.5ZM17.47 9.59L14.34 12.09C13.68 12.62 12.84 12.88 12 12.88C11.16 12.88 10.31 12.62 9.66 12.09L6.53 9.59C6.21 9.33 6.16 8.85 6.41 8.53C6.67 8.21 7.14 8.15 7.46 8.41L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.41C16.85 8.15 17.33 8.2 17.58 8.53C17.84 8.85 17.79 9.33 17.47 9.59Z"
            fill="currentColor"
        />
    </svg>
);

const ArrowUpIcon = (props: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 12 12"
        width="1em"
        {...props}
    >
        <path
            d="M3 7.5L6 4.5L9 7.5"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
        />
    </svg>
);

const ArrowDownIcon = (props: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 12 12"
        width="1em"
        {...props}
    >
        <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
        />
    </svg>
);

const DeleteFilledIcon = (props: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 18 19"
        width="1em"
        {...props}
    >
        <path
            d="M15.75 4.98487C13.2525 4.73737 10.74 4.60986 8.235 4.60986C6.75 4.60986 5.265 4.68486 3.78 4.83486L2.25 4.98487"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
        />
        <path
            d="M6.375 4.2275L6.54001 3.245C6.66 2.53249 6.75 2 8.0175 2H9.98246C11.25 2 11.3475 2.5625 11.46 3.25249L11.625 4.2275"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
        />
        <path
            d="M14.1376 7.35498L13.6501 14.9075C13.5675 16.0849 13.5 17 11.4075 17H6.59255C4.50005 17 4.43255 16.0849 4.35004 14.9075L3.86255 7.35498"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
        />
        <path
            d="M7.74756 12.875H10.245"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
        />
        <path
            d="M7.125 9.875H10.875"
            stroke="#71717A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
        />
    </svg>
);

const EditLinearIcon = (props: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 20 20"
        width="1em"
        {...props}
    >
        <path
            d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={1.5}
        />
        <path
            d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={1.5}
        />
        <path
            d="M2.5 18.3333H17.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={1.5}
        />
    </svg>
);

const EyeFilledIcon = (props: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
            fill="currentColor"
        />
        <path
            d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
            fill="currentColor"
        />
    </svg>
);

interface IconLoadingProps extends React.SVGProps<SVGSVGElement> {
    strokeWidth?: number;
    className?: string;
}

const IconLoadingCircle: React.FC<IconLoadingProps> = ({
                                                     className = '',
                                                     strokeWidth = 4.5,
                                                     ...props
                                                 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={className}
        {...props}
    >
        <g stroke="currentColor">
            <circle
                cx="12"
                cy="12"
                r="9.5"
                fill="none"
                strokeLinecap="round"
                strokeWidth={strokeWidth}
            >
                <animate
                    attributeName="stroke-dasharray"
                    calcMode="spline"
                    dur="1.5s"
                    keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                    keyTimes="0;0.475;0.95;1"
                    repeatCount="indefinite"
                    values="0 150;42 150;42 150;42 150"
                />
                <animate
                    attributeName="stroke-dashoffset"
                    calcMode="spline"
                    dur="1.5s"
                    keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                    keyTimes="0;0.475;0.95;1"
                    repeatCount="indefinite"
                    values="0;-16;-59;-59"
                />
            </circle>
            <animateTransform
                attributeName="transform"
                dur="2s"
                repeatCount="indefinite"
                type="rotate"
                values="0 12 12;360 12 12"
            />
        </g>
    </svg>
);




export {
    IconLoadingCircle,
    EyeFilledIcon,
    EditLinearIcon,
    DeleteFilledIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    IconHeartCrack,
    IconBadge,
    IconCart,
    IconBadgeInfo,
    IconCalendar,
    IconMenu,
    IconBadgeCheck,
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
    IconMail,
    IconEggOff,
    IconNuts,
    IconNutsFree,
    IconNotebookPen,
    IconCirclePlus,
    HeartIcon,
    IconSend
};