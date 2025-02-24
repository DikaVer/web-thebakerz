import React, {SVGProps} from 'react';


const colors = {
    primary: '#730C6F', //'#730C6F'
    secondary: '#faf4d1', //'#F8CE87'
    black: '#1f2937',
    heart: '#ce2751',
    white: '#ffffff',
};

type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
};

interface IconProps extends React.ComponentProps<'svg'> {
    className?: string;
}


function IconHeart({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       state = "full",
                       ...props
                   }: React.ComponentProps<'svg'> & {
                       color?: 'primary' | 'secondary' | 'black' | 'heart'
                       state?: "full" | "empty"
                   },
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

const IconBadgeCheck: React.FC<IconProps> = ({className = '', ...props}) => (
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
        <path
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);


const IconHeartCrack: React.FC<IconProps> = ({className = '', ...props}) => (
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
        <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        <path d="m12 13-1-1 2-2-3-3 2-2"/>
    </svg>
);

const IconBadgeInfo: React.FC<IconProps> = ({className = '', ...props}) => (
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
        <path
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
);

const IconBadge: React.FC<IconProps> = ({className = '', ...props}) => (
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
        <path
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
    </svg>
);

const IconMail: React.FC<IconProps> = ({className = '', ...props}) => (
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

const IconLocation: React.FC<IconSvgProps> = ({primaryColor, secondaryColor, size = 400, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <g fill="none" strokeWidth="1.5">
            <path strokeLinecap="round" stroke={secondaryColor}
                  d="M5.875 12.573C5.308 11.25 5 9.84 5 8.515C5 4.917 8.134 2 12 2s7 2.917 7 6.515c0 3.57-2.234 7.735-5.72 9.225a3.28 3.28 0 0 1-2.56 0c-1.113-.476-2.099-1.225-2.925-2.14"/>
            <path d="M14 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z" stroke={primaryColor}/>
            <path strokeLinecap="round" stroke={primaryColor}
                  d="M20.96 15.5c.666.602 1.04 1.282 1.04 2c0 .925-.62 1.785-1.684 2.5M3.04 15.5c-.666.602-1.04 1.282-1.04 2C2 19.985 6.477 22 12 22c1.653 0 3.212-.18 4.586-.5"/>
        </g>
    </svg>
);

const IconPhone: React.FC<IconSvgProps> = ({primaryColor, secondaryColor, size = 400, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <g fill="none">
            <path stroke={primaryColor} strokeLinecap="round" strokeWidth="1.5"
                  d="M13.5 2s2.334.212 5.303 3.182c2.97 2.97 3.182 5.303 3.182 5.303m-7.778-4.949s.99.282 2.475 1.767s1.768 2.475 1.768 2.475"/>
            <path fill={secondaryColor}
                  d="m15.1 15.027l.545.517zm.456-.48l-.544-.516zm2.417-.335l-.374.65zm1.91 1.1l-.374.65zm.539 3.446l.543.517zm-1.42 1.496l-.545-.517zm-1.326.71l.074.745zm-9.86-4.489l.543-.516zm-4.064-9.55a.75.75 0 1 0-1.498.081zm5.439 1.88l.544.517zm.287-.302l.543.517zm.156-2.81l.613-.433zM8.374 3.91l-.613.433zm-3.656-.818a.75.75 0 0 0 1.087 1.033zm6.345 9.964l.544-.517zm-.399 6.756a.75.75 0 1 0 .798-1.27zm4.449.246a.75.75 0 0 0-.307 1.469zm.532-4.514l.455-.48l-1.088-1.033l-.455.48zm1.954-.682l1.91 1.1l.749-1.3l-1.911-1.1zm2.279 3.38l-1.42 1.495l1.087 1.034l1.42-1.496zM8.359 15.959c-3.876-4.081-4.526-7.523-4.607-9.033l-1.498.08c.1 1.85.884 5.634 5.018 9.986zm1.376-6.637l.286-.302l-1.087-1.033l-.287.302zm.512-4.062L8.986 3.477l-1.225.866l1.26 1.783zM9.19 8.805a38 38 0 0 0-.545-.515l-.002.002l-.003.003l-.05.058a1.6 1.6 0 0 0-.23.427c-.098.275-.15.639-.084 1.093c.13.892.715 2.091 2.242 3.7l1.088-1.034c-1.428-1.503-1.78-2.428-1.846-2.884c-.032-.22 0-.335.013-.372l.008-.019l-.028.037l-.018.02zm1.328 4.767c1.523 1.604 2.673 2.234 3.55 2.377c.451.073.816.014 1.092-.095a1.5 1.5 0 0 0 .422-.25l.035-.034l.014-.014l.007-.006l.003-.003l.001-.002s.002-.001-.542-.518c-.544-.516-.543-.517-.543-.518l.002-.001l.002-.003l.006-.005l.047-.042q.014-.008-.005.001c-.02.008-.11.04-.3.009c-.402-.066-1.27-.42-2.703-1.929zM8.986 3.477C7.972 2.043 5.944 1.8 4.718 3.092l1.087 1.033c.523-.55 1.444-.507 1.956.218zm9.471 16.26c-.279.294-.57.452-.854.48l.147 1.492c.747-.073 1.352-.472 1.795-.939zM10.021 9.02c.968-1.019 1.036-2.613.226-3.76l-1.225.866c.422.597.357 1.392-.088 1.86zm9.488 6.942c.821.473.982 1.635.369 2.28l1.087 1.033c1.305-1.374.925-3.673-.707-4.613zm-3.409-.898c.385-.406.986-.497 1.499-.202l.748-1.3c-1.099-.632-2.46-.45-3.335.47zm-4.638 3.478c-.983-.618-2.03-1.454-3.103-2.583l-1.087 1.033c1.154 1.215 2.297 2.132 3.392 2.82zm6.14 1.675a8.3 8.3 0 0 1-2.489-.159l-.307 1.469a9.8 9.8 0 0 0 2.944.182z"/>
        </g>
    </svg>
);

const IconCopy: React.FC<IconSvgProps> = ({primaryColor, secondaryColor, size = 400, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path strokeDasharray="16" stroke={secondaryColor} strokeDashoffset="16" d="M12 3h7v8">
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0" />
            </path>
            <path strokeDasharray="12" stroke={secondaryColor} strokeDashoffset="12" strokeWidth="1" d="M14.5 3.5v3h-5v-3">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="12;0" />
            </path>
            <path strokeDasharray="48" stroke={secondaryColor} strokeDashoffset="48" d="M19 17v4h-14v-18h7">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.6s" values="48;0" />
            </path>
            <path strokeDasharray="10" stroke={primaryColor} strokeDashoffset="10" d="M21 14h-8.5">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" values="10;0" />
            </path>
            <path strokeDasharray="6" stroke={primaryColor} strokeDashoffset="6" d="M12 14l3 3M12 14l3 -3">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.3s" dur="0.2s" values="6;0" />
            </path>
        </g>
    </svg>
);

const IconDots: React.FC<IconSvgProps> = ({primaryColor, secondaryColor, size = 400, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <g fill="none" stroke={primaryColor} strokeWidth="0.7">
            <path strokeLinecap="round" d="M5 14a2 2 0 1 0-2-2"/>
            <circle cx="12" cy="12" r="2"/>
            <path strokeLinecap="round" d="M21 12a2 2 0 1 1-2-2"/>
        </g>
    </svg>
);


const IconClose: React.FC<IconSvgProps> = ({primaryColor, secondaryColor, size = 400, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <rect width={size} height={size} fill="none" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path strokeDasharray="64" stroke={secondaryColor} strokeDashoffset="64" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" />
            </path>
            <path strokeDasharray="8" stroke={primaryColor} strokeDashoffset="8" d="M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0" />
            </path>
        </g>
    </svg>
);



export {
    IconClose,
    IconLoadingCircle,
    IconHeartCrack,
    IconBadge,
    IconBadgeInfo,
    IconBadgeCheck,
    IconLocation,
    IconPhone,
    IconDots,
    IconHeart,
    IconSuccess,
    IconCopy,
    IconMail,
};