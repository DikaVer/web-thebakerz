import React from 'react';

const mainColor = '#730C6F';
const blackColor = '#030303';

function IconCart({
                                className,
                                ...props
                            }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '29px',
        height: '24px',
    };

    return (
        <svg
            style={styles}
            viewBox="0 0 576 512"
            className={className}
            {...props}
        >
            <path
                d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"/>
        </svg>
    );
}

function IconMenu({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: '#030303',
        fill: '#030303',
        width: '28px',
        height: '24px',
    };

    return (
        <svg
            style={styles}
            viewBox="0 0 448 512"
            className={`${className} hover:fill-current`}
            {...props}
        >
            <path
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/>
        </svg>
    );
}

function IconStar({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: mainColor,
        fill: mainColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
            </path>
        </svg>
    );
}

function IconPlus({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className}`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z">
            </path>
        </svg>
    );
}

function IconLocation({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: mainColor,
        fill: mainColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z">
            </path>
        </svg>
    );
}

function IconThreeDots({
                          className,
                          ...props
                      }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '30px',
        height: '30px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
            </path>
        </svg>
    );
}

function IconChevronDown({
                           className,
                           ...props
                       }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0V0z" fill="none">
            </path>
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
        </svg>
    );
}

function IconOrder({
                           className,
                           ...props
                       }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '28px',
        height: '28px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z">
            </path>
        </svg>
    );
}

function IconSupport({
                           className,
                           ...props
                       }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '28px',
        height: '28px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z">
            </path>
            <path d="M9 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM15 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2z">
            </path>
            <path
                d="M18 11.03A6.04 6.04 0 0 0 12.05 6c-3.03 0-6.29 2.51-6.03 6.45a8.075 8.075 0 0 0 4.86-5.89c1.31 2.63 4 4.44 7.12 4.47z">
            </path>
        </svg>
    );
}

function IconPayment({
                         className,
                         ...props
                     }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '28px',
        height: '28px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z">
            </path>
        </svg>
    );
}

function IconAvatar({
                        className,
                        ...props
                    }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '60px',
        height: '60px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z">
            </path>
        </svg>
    );
}

function IconTrash({
                     className,
                     ...props
                 }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className}`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
            </path>
        </svg>
    );
}

function IconMinus({
                       className,
                       ...props
                   }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className}`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M19 13H5v-2h14v2z">
            </path>
        </svg>
    );
}

function IconCross({
                       className,
                       ...props
                   }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className}`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
            </path>
        </svg>
    );
}


export {
    IconCart,
    IconMenu,
    IconStar,
    IconLocation,
    IconThreeDots,
    IconChevronDown,
    IconPlus,
    IconOrder,
    IconSupport,
    IconPayment,
    IconAvatar,
    IconTrash,
    IconMinus,
    IconCross
};